"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const router = useRouter();

  async function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    // navigate to search page with query params
    const params = new URLSearchParams({ source, destination, date });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-r from-sky-50 to-white">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900">
          Travel better with premium comfort
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-[var(--muted)]">
          Book premium, safe and comfortable bus journeys. Compare schedules, pick seats, and pay securely.
        </p>

        <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="card p-4 fade-in-up">
            <div className="font-semibold">Wide selection</div>
            <div className="text-sm text-[var(--muted)] mt-2">Hundreds of buses across cities and operators.</div>
          </div>
          <div className="card p-4 fade-in-up">
            <div className="font-semibold">Easy seat selection</div>
            <div className="text-sm text-[var(--muted)] mt-2">Visual seat maps with clear availability and rules.</div>
          </div>
          <div className="card p-4 fade-in-up">
            <div className="font-semibold">Secure payments</div>
            <div className="text-sm text-[var(--muted)] mt-2">Pay with Stripe or Paytm and get instant confirmations.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
