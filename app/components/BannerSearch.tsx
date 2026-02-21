"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BannerSearch() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [sources, setSources] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [formError, setFormError] = useState('');

  // When source changes, remove the same value from destination options and
  // clear destination if it matches the selected source (better UX).
  useEffect(() => {
    if (!source) return;
    const a = source.trim().toLowerCase();
    if (!a) return;
    if (destination && destination.trim().toLowerCase() === a) {
      setDestination('');
    }
  }, [source]);

  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    setLoadingLocations(true);
    fetch('/api/trips/locations')
      .then(r => r.json())
      .then(data => {
        if (!mounted) return;
        if (data?.sources) setSources(data.sources as string[]);
        if (data?.destinations) setDestinations(data.destinations as string[]);
      })
      .catch(() => {
        setSources([]);
        setDestinations([]);
      })
      .finally(() => mounted && setLoadingLocations(false));

    return () => { mounted = false; };
  }, []);

  async function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    // validate source/destination not same
    if (source && destination) {
      const a = source.trim().toLowerCase();
      const b = destination.trim().toLowerCase();
      if (a === b) {
        setFormError('Source and destination cannot be the same');
        return;
      }
    }
    setFormError('');
    const params = new URLSearchParams({ source, destination, date });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={onSearch} role="search" aria-label="Search buses" className="mx-auto max-w-3xl bg-white/90 backdrop-blur-sm rounded-lg p-4 flex flex-col sm:flex-row gap-2 items-center shadow-md fade-in-up">
      {/* Source select (falls back to text input if no locations) */}
      {loadingLocations ? (
        <div className="flex-1 border p-2 rounded text-sm text-slate-500">Loading...</div>
      ) : (sources.length > 0 ? (
        <select aria-label="From city" value={source} onChange={e=>setSource(e.target.value)} className="flex-1 border p-2 rounded">
          <option value="">From (city)</option>
          {sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      ) : (
        <input aria-label="From city" value={source} onChange={e=>setSource(e.target.value)} placeholder="From (city)" className="flex-1 border p-2 rounded" />
      ))}

      {/* Destination select */}
      {loadingLocations ? (
        <div className="flex-1 border p-2 rounded text-sm text-slate-500">Loading...</div>
      ) : (destinations.length > 0 ? (
        // filter out the selected source from destination options
        <select aria-label="To city" value={destination} onChange={e=>setDestination(e.target.value)} className="flex-1 border p-2 rounded">
          <option value="">To (city)</option>
          {destinations
            .filter(d => {
              if (!source) return true;
              return d.trim().toLowerCase() !== source.trim().toLowerCase();
            })
            .map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      ) : (
        <input aria-label="To city" value={destination} onChange={e=>setDestination(e.target.value)} placeholder="To (city)" className="flex-1 border p-2 rounded" />
      ))}

      <input aria-label="Date" value={date} onChange={e=>setDate(e.target.value)} type="date" className="border p-2 rounded" />
      <button type="submit" className="rounded bg-[var(--theme-primary)] px-4 py-2 text-white">Search buses</button>
      {formError && <div className="w-full text-sm text-red-600 mt-2">{formError}</div>}
    </form>
  );
}
