"use client";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingPayment, setLoadingPayment] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  useEffect(()=>{ (async ()=>{
    const token = localStorage.getItem('token');
    const res = await fetch('/api/bookings?token='+token);
    const data = await res.json();
    setBookings(data.bookings || []);
  })(); }, []);

  const filteredBookings = bookings.filter((b) => {
    const isCancelled = b.status === 'CANCELLED' || b.status === 'cancelled';
    if (activeTab === 'cancelled') return isCancelled;
    if (isCancelled) return false; // Don't show cancelled in upcoming/completed

    const tripDate = new Date(b.tripDate || b.trip.departure);
    const now = new Date();

    if (activeTab === 'upcoming') {
      return tripDate >= now;
    }
    if (activeTab === 'completed') {
      return tripDate < now;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-4xl px-6 py-12 w-full">
      <h1 className="text-2xl font-bold">My bookings</h1>

      <div className="flex border-b border-slate-200 mt-6">
        {['upcoming', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        {filteredBookings.length === 0 ? (
          <p className="text-slate-500 py-4">No {activeTab} bookings found.</p>
        ) : filteredBookings.map(b=> {
          const tripDate = new Date(b.tripDate || b.trip.departure);
          const isPast = tripDate < new Date();
          const displayStatus = (b.status === 'CANCELLED' || b.status === 'cancelled') 
            ? 'CANCELLED' 
            : (isPast ? 'COMPLETED' : 'UPCOMING');
          return (
          <div key={b.id} className="rounded border p-4">
            <div className="font-semibold">{b.trip.source} → {b.trip.destination}</div>
            <div className="text-sm text-slate-500 mt-1">
              {tripDate.toLocaleDateString()} at {tripDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-slate-600">Total: ₹{b.totalPrice}</div>
            <div className="mt-2">
              <div className="text-sm font-medium">Passengers</div>
              {b.passengers && b.passengers.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {b.passengers.map((p: any) => (
                    <li key={p.id} className="text-sm text-slate-700 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.name || '—'}</div>
                        <div className="text-xs text-slate-500">{p.gender || ''} • {p.age ?? ''} yrs • {p.mobile || ''}</div>
                      </div>
                      <div className="ml-4 px-2 py-1 rounded text-sm font-medium bg-slate-100">{p.seat}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-600">Seats: {(() => { try { return JSON.parse(b.seats).join(', '); } catch { return b.seats; } })()}</div>
              )}
            </div>
            <div className="text-sm text-slate-600">Status: <span className={`font-medium uppercase ${displayStatus === 'CANCELLED' ? 'text-red-600' : displayStatus === 'COMPLETED' ? 'text-slate-500' : 'text-green-600'}`}>{displayStatus}</span></div>
            <div className="mt-3">
              {b.isPaid ? (
                <span className="text-green-600 font-medium">Paid</span>
              ) : (
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 bg-indigo-600 text-white rounded"
                    disabled={loadingPayment === b.id}
                    onClick={async () => {
                      setLoadingPayment(b.id);
                      try {
                        const res = await fetch('/api/payments/stripe/session', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ bookingId: b.id }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data?.error || 'Failed to create Stripe session');
                        if (data.url) {
                          window.location.href = data.url;
                        }
                      } catch (err: any) {
                        console.error('stripe session error', err);
                        alert(err?.message || String(err));
                      } finally { setLoadingPayment(null); }
                    }}
                  >Pay with Stripe</button>
                </div>
              )}
            </div>
          </div>
        )})}
      </div>
      </main>
      <Footer />
    </div>
  );
}
