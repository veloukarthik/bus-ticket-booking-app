"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BannerSearch() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const router = useRouter();

  async function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams({ source, destination, date });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={onSearch} role="search" aria-label="Search buses" className="mx-auto max-w-3xl bg-white/90 backdrop-blur-sm rounded-lg p-4 flex gap-2 items-center shadow-md fade-in-up">
      <input aria-label="From city" value={source} onChange={e=>setSource(e.target.value)} placeholder="From (city)" className="flex-1 border p-2 rounded" />
      <input aria-label="To city" value={destination} onChange={e=>setDestination(e.target.value)} placeholder="To (city)" className="flex-1 border p-2 rounded" />
      <input aria-label="Date" value={date} onChange={e=>setDate(e.target.value)} type="date" className="border p-2 rounded" />
      <button type="submit" className="rounded bg-[var(--theme-primary)] px-4 py-2 text-white">Search buses</button>
    </form>
  );
}
