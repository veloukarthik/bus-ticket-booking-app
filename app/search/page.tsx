"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SeatSelector = dynamic(() => import("../components/SeatSelector"), { ssr: false });

function SearchContent() {
  const searchParams = useSearchParams();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function doSearch(formEvent?: React.FormEvent, opts?: { source?: string; destination?: string; date?: string }) {
    if (formEvent) formEvent.preventDefault();
    const s = opts?.source ?? source;
    const d = opts?.destination ?? destination;
    const dt = opts?.date ?? date;
    setLoading(true);
    try {
      const res = await fetch('/api/trips/search', { method: 'POST', body: JSON.stringify({ source: s, destination: d, date: dt }), headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      setTrips(data.trips || []);
    } catch (e) {
      console.error(e);
      setTrips([]);
    } finally { setLoading(false); }
  }

  // read query params and auto-run search when they change
  useEffect(()=>{
    const s = searchParams.get('source');
    const d = searchParams.get('destination');
    const dt = searchParams.get('date');
    if (s) setSource(s);
    if (d) setDestination(d);
    if (dt) setDate(dt);
    if (s && d) {
      // run search with provided params
      doSearch(undefined, { source: s, destination: d, date: dt ?? new Date().toISOString().slice(0,10) });
    }
  }, [searchParams?.toString()]);

  const [selectingTrip, setSelectingTrip] = useState<number | null>(null);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);

  useEffect(() => {
    if (selectingTrip) {
      setBookedSeats([]);
      fetch(`/api/trips/${selectingTrip}/booked-seats`)
        .then(res => res.json())
        .then(data => {
          if (data.bookedSeats) {
            setBookedSeats(data.bookedSeats);
          }
        })
        .catch(err => console.error("Failed to fetch booked seats", err));
    }
  }, [selectingTrip]);

  async function createBooking(tripId: number, seats: string[]) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ tripId, seats }) });

      // try to parse JSON, but handle empty/non-JSON responses
      let data: any = null;
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = { error: text || 'No response' }; }
      }

      if (res.status === 401) {
        // redirect to login when token is invalid or missing
        router.push('/login');
        return;
      }

      if (res.ok && data && data.booking) {
        // created booking, now initiate payment
        const booking = data.booking;
        try {
          const stripeRes = await fetch('/api/payments/stripe/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: booking.id }),
          });
          const stripeData = await stripeRes.json();
          if (stripeRes.ok && stripeData.url) {
            window.location.href = stripeData.url;
          } else {
            alert(stripeData.error || 'Failed to initiate Stripe payment');
            return;
          }
        } catch (e) {
          console.error('payment init error', e);
          alert('Failed to initiate payment');
          return;
        }
      } else {
        if (res.status === 409) {
          const refresh = await fetch(`/api/trips/${tripId}/booked-seats`);
          if (refresh.ok) {
            const refreshData = await refresh.json();
            if (refreshData.bookedSeats) {
              setBookedSeats(refreshData.bookedSeats);
            }
          }
          return;
        }
        const msg = (data && data.error) || `Request failed (${res.status})`;
        alert(msg);
      }
    } catch (err: any) {
      console.error('createBooking error', err);
      alert(err?.message || 'Failed to create booking');
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Search trips</h1>
      <form onSubmit={doSearch} className="mt-4 flex gap-2">
        <input value={source} onChange={e=>setSource(e.target.value)} className="border p-2" placeholder="From" />
        <input value={destination} onChange={e=>setDestination(e.target.value)} className="border p-2" placeholder="To" />
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border p-2" />
        <button className="rounded bg-sky-600 px-4 text-white" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
      </form>

      <div className="mt-6 grid gap-4">
        {trips.map(t=> (
          <div key={t.id} className="rounded border p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{t.source} → {t.destination}</div>
              <div className="text-sm text-slate-600">Departs: {new Date(t.departure).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-medium">₹{t.price}</div>
              <button onClick={()=>setSelectingTrip(t.id)} className="rounded bg-sky-600 px-3 py-1 text-white">Book</button>
            </div>
          </div>
        ))}
      </div>

      {selectingTrip && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded max-w-2xl w-full">
            <h3 className="font-semibold">Select seats</h3>
            <SeatSelector onConfirmAction={(seats: string[]) => createBooking(selectingTrip, seats)} bookedSeats={bookedSeats} />
            <div className="mt-4 text-right">
              <button onClick={()=>setSelectingTrip(null)} className="mr-2">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-4xl px-6 py-12 w-full">
        <Suspense fallback={<div>Loading search...</div>}>
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
