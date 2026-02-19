"use client";
import { useEffect, useState } from "react";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingPayment, setLoadingPayment] = useState<number | null>(null);

  useEffect(()=>{ (async ()=>{
    const token = localStorage.getItem('token');
    const res = await fetch('/api/bookings?token='+token);
    const data = await res.json();
    setBookings(data.bookings || []);
  })(); }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold">My bookings</h1>
      <div className="mt-6 grid gap-4">
        {bookings.map(b=> (
          <div key={b.id} className="rounded border p-4">
            <div className="font-semibold">{b.trip.source} → {b.trip.destination}</div>
            <div className="text-sm text-slate-600">Seats: {b.seats}</div>
            <div className="text-sm text-slate-600">Total: ₹{b.totalPrice}</div>
            <div className="mt-3">
              {b.isPaid ? (
                <span className="text-green-600 font-medium">Paid</span>
              ) : (
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    disabled={loadingPayment === b.id}
                    onClick={async () => {
                      setLoadingPayment(b.id);
                      try {
                        const res = await fetch('/api/payments/initiate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ bookingId: b.id }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data?.error || 'Failed to initiate payment');

                        const params = data.params || {};
                        const paytmUrl = data.paytmUrl || (process.env.NEXT_PUBLIC_PAYTM_PROCESS_URL) || 'https://securegw-stage.paytm.in/order/process';

                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = paytmUrl;
                        for (const key of Object.keys(params)) {
                          const input = document.createElement('input');
                          input.type = 'hidden';
                          input.name = key;
                          input.value = String(params[key]);
                          form.appendChild(input);
                        }
                        document.body.appendChild(form);
                        form.submit();
                      } catch (err: any) {
                        console.error('payment initiate error', err);
                        alert(err?.message || String(err));
                      } finally {
                        setLoadingPayment(null);
                      }
                    }}
                  >
                    {loadingPayment === b.id ? 'Starting...' : 'Pay (Paytm)'}
                  </button>

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
        ))}
      </div>
    </div>
  );
}
