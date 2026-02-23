"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SeatSelector = dynamic(() => import("../components/SeatSelector"), { ssr: false });

function SearchContent() {
  const today = new Date().toISOString().slice(0,10);
  const searchParams = useSearchParams();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(today);
  const [trips, setTrips] = useState<any[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [passengerSuggestions, setPassengerSuggestions] = useState<{ name: string; mobile: string; gender: string; age: number | null }[]>([]);
  const router = useRouter();

  function validateSearchInputs(s: string, d: string, dt: string) {
    if (!s || !d) return "Source and destination are required";
    if (s.trim().toLowerCase() === d.trim().toLowerCase()) return "Source and destination cannot be the same";
    if (dt < today) return "Past dates are not allowed";

    const sourceValid = sources.length === 0 || sources.some((x) => x.trim().toLowerCase() === s.trim().toLowerCase());
    const destinationValid = destinations.length === 0 || destinations.some((x) => x.trim().toLowerCase() === d.trim().toLowerCase());
    if (!sourceValid || !destinationValid) return "Please choose source and destination from available cities";
    return "";
  }

  async function doSearch(formEvent?: React.FormEvent, opts?: { source?: string; destination?: string; date?: string; skipUrlSync?: boolean }) {
    if (formEvent) formEvent.preventDefault();
    const s = (opts?.source ?? source).trim();
    const d = (opts?.destination ?? destination).trim();
    const dt = opts?.date ?? date;
    const validationError = validateSearchInputs(s, d, dt);
    if (validationError) {
      setTrips([]);
      setFormError(validationError);
      return;
    }
    setFormError('');
    setLoading(true);
    try {
      const res = await fetch('/api/trips/search', { method: 'POST', body: JSON.stringify({ source: s, destination: d, date: dt }), headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      if (!res.ok) {
        setTrips([]);
        setFormError(data?.error || "Search failed");
      } else {
        setTrips(data.trips || []);
      }
      if (!opts?.skipUrlSync) {
        const params = new URLSearchParams({ source: s, destination: d, date: dt });
        router.replace(`/search?${params.toString()}`);
      }
    } catch (e) {
      console.error(e);
      setTrips([]);
      setFormError("Search failed");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    let mounted = true;
    fetch('/api/trips/locations')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setSources(Array.isArray(data?.sources) ? data.sources : []);
        setDestinations(Array.isArray(data?.destinations) ? data.destinations : []);
      })
      .catch(() => {
        setSources([]);
        setDestinations([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

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
      doSearch(undefined, { source: s, destination: d, date: dt ?? new Date().toISOString().slice(0,10), skipUrlSync: true });
    }
  }, [searchParams?.toString()]);

  const [selectingTrip, setSelectingTrip] = useState<number | null>(null);
  const [bookedPassengers, setBookedPassengers] = useState<any[]>([]);

  useEffect(() => {
    if (selectingTrip) {
      setBookedPassengers([]);
      const token = localStorage.getItem('token');

      fetch(`/api/trips/${selectingTrip}/booked-seats`)
        .then(res => res.json())
        .then(data => {
          if (data.bookedPassengers) {
            // map to simplified bookedPassengers for SeatSelector
            const b = data.bookedPassengers.map((p: any) => ({ seat: p.seat, gender: p.gender }));
            setBookedPassengers(b as any);
          } else if (data.bookedSeats) {
            const b = data.bookedSeats.map((s: string) => ({ seat: s }));
            setBookedPassengers(b as any);
          }
        })
        .catch(err => console.error("Failed to fetch booked seats", err));

      if (token) {
        fetch('/api/passengers/suggestions', { headers: { Authorization: `Bearer ${token}` } })
          .then((res) => res.json())
          .then((data) => {
            const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];
            setPassengerSuggestions(suggestions);
          })
          .catch(() => setPassengerSuggestions([]));
      } else {
        setPassengerSuggestions([]);
      }
    }
  }, [selectingTrip]);

  async function createBooking(tripId: number, passengers: any[]) {
    try {
      const token = localStorage.getItem('token');
      const seats = Array.isArray(passengers) ? passengers.map(p => p.seat) : [];
      const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ tripId, seats, passengers }) });

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
                const b = refreshData.bookedSeats.map((s: string) => ({ seat: s }));
                setBookedPassengers(b as any);
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
      <h1 className="text-3xl font-bold text-[var(--theme-ink)]">Search trips</h1>
      <p className="mt-1 text-sm text-slate-600">Pick a route and date to view premium buses and fares.</p>

      <form onSubmit={doSearch} role="search" aria-label="Search trips" className="premium-panel mt-5 flex flex-col sm:flex-row gap-3 p-4">
        <select aria-label="From" value={source} onChange={e=>setSource(e.target.value)} className="flex-1 border border-slate-200 bg-white px-3 py-2 rounded-xl outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-sky-100">
          <option value="">From</option>
          {sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select aria-label="To" value={destination} onChange={e=>setDestination(e.target.value)} className="flex-1 border border-slate-200 bg-white px-3 py-2 rounded-xl outline-none focus:border-[var(--theme-accent)] focus:ring-2 focus:ring-emerald-100">
          <option value="">To</option>
          {destinations
            .filter((d) => !source || d.trim().toLowerCase() !== source.trim().toLowerCase())
            .map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
        </select>
        <input aria-label="Date" min={today} type="date" value={date} onChange={e=>setDate(e.target.value)} className="border border-slate-200 bg-white px-3 py-2 rounded-xl outline-none focus:border-[var(--theme-highlight)] focus:ring-2 focus:ring-amber-100" />
        <button className="rounded-xl bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] px-5 py-2 text-white font-medium shadow-[0_10px_24px_rgba(14,165,233,0.24)] hover:brightness-95 disabled:opacity-60" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
      </form>
      {formError && (
        <div className="error-panel mt-3 px-4 py-3 text-sm font-medium" role="alert" aria-live="polite">
          {formError}
        </div>
      )}

      <div className="mt-6 grid gap-4">
        {trips.map(t=> (
          <div key={t.id} className="premium-panel p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="font-semibold text-[var(--theme-ink)]">{t.source} → {t.destination}</div>
              <div className="text-sm text-slate-600">Departs: {new Date(t.departure).toLocaleString()}</div>
            </div>
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <div className="font-semibold text-[var(--theme-ink)]">₹{t.price}</div>
              <button onClick={()=>setSelectingTrip(t.id)} className="rounded-xl bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] px-4 py-1.5 text-white font-medium shadow-[0_10px_24px_rgba(14,165,233,0.24)]" aria-label={`Book trip ${t.id}`}>Book</button>
            </div>
          </div>
        ))}
      </div>

      {selectingTrip && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white p-4 sm:p-6 rounded-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
            <h3 className="font-semibold text-lg">Select seats</h3>
            <SeatSelector
              onConfirmAction={(passengers: any[]) => createBooking(selectingTrip, passengers)}
              bookedPassengers={bookedPassengers as any}
              passengerSuggestions={passengerSuggestions}
            />
            <div className="mt-4 text-right">
              <button onClick={()=>setSelectingTrip(null)} className="rounded-lg border border-slate-200 px-3 py-1.5">Cancel</button>
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
