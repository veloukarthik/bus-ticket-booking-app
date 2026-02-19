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
    <section className="py-20 sm:py-28 bg-gradient-to-r from-sky-50 to-white">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900">
          Book bus tickets quickly — anywhere, anytime
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
          Find buses by route and date, choose seats and checkout in a few clicks.
        </p>

        <form onSubmit={onSearch} className="mt-8 mx-auto max-w-3xl bg-white shadow rounded-lg p-4 flex gap-2 items-center">
          <input value={source} onChange={e=>setSource(e.target.value)} placeholder="From (city)" className="flex-1 border p-2 rounded" />
          <input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="To (city)" className="flex-1 border p-2 rounded" />
          <input value={date} onChange={e=>setDate(e.target.value)} type="date" className="border p-2 rounded" />
          <button type="submit" className="rounded bg-sky-600 px-4 py-2 text-white">Search buses</button>
        </form>
      </div>
    </section>
  );
}
