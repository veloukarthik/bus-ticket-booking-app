"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BannerSearch() {
  const today = new Date().toISOString().slice(0,10);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(today);
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
    if (date < today) {
      setFormError('Past dates are not allowed');
      return;
    }
    if (!source || !destination) {
      setFormError('Source and destination are required');
      return;
    }
    // validate source/destination not same
    if (source && destination) {
      const a = source.trim().toLowerCase();
      const b = destination.trim().toLowerCase();
      if (a === b) {
        setFormError('Source and destination cannot be the same');
        return;
      }

      const sourceValid = sources.length === 0 || sources.some((s) => s.trim().toLowerCase() === a);
      const destinationValid = destinations.length === 0 || destinations.some((d) => d.trim().toLowerCase() === b);
      if (!sourceValid || !destinationValid) {
        setFormError('Please choose source and destination from available cities');
        return;
      }
    }
    setFormError('');
    const params = new URLSearchParams({ source, destination, date });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-4xl fade-in-up">
      <form
        onSubmit={onSearch}
        role="search"
        aria-label="Search buses"
        className="premium-panel p-4 sm:p-5 flex flex-col sm:flex-row gap-2 sm:gap-3 items-center"
      >
        {/* Source select (falls back to text input if no locations) */}
        {loadingLocations ? (
          <div className="flex-1 border border-slate-200 px-3 py-2 rounded-xl text-sm text-slate-500">Loading...</div>
        ) : (sources.length > 0 ? (
          <select aria-label="From city" value={source} onChange={e=>setSource(e.target.value)} className="flex-1 border border-slate-200 bg-white px-3 py-2 rounded-xl outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-sky-100">
            <option value="">From (city)</option>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        ) : (
          <input aria-label="From city" value={source} onChange={e=>setSource(e.target.value)} placeholder="From (city)" className="flex-1 border border-slate-200 bg-white px-3 py-2 rounded-xl outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-sky-100" />
        ))}

        {/* Destination select */}
        {loadingLocations ? (
          <div className="flex-1 border border-slate-200 px-3 py-2 rounded-xl text-sm text-slate-500">Loading...</div>
        ) : (destinations.length > 0 ? (
          // filter out the selected source from destination options
          <select aria-label="To city" value={destination} onChange={e=>setDestination(e.target.value)} className="flex-1 border border-slate-200 bg-white px-3 py-2 rounded-xl outline-none focus:border-[var(--theme-accent)] focus:ring-2 focus:ring-emerald-100">
            <option value="">To (city)</option>
            {destinations
              .filter(d => {
                if (!source) return true;
                return d.trim().toLowerCase() !== source.trim().toLowerCase();
              })
              .map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        ) : (
          <input aria-label="To city" value={destination} onChange={e=>setDestination(e.target.value)} placeholder="To (city)" className="flex-1 border border-slate-200 bg-white px-3 py-2 rounded-xl outline-none focus:border-[var(--theme-accent)] focus:ring-2 focus:ring-emerald-100" />
        ))}

      <input aria-label="Date" value={date} min={today} onChange={e=>setDate(e.target.value)} type="date" className="border border-slate-200 bg-white px-3 py-2 rounded-xl outline-none focus:border-[var(--theme-highlight)] focus:ring-2 focus:ring-amber-100" />
        <button type="submit" className="rounded-xl bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] px-5 py-2 text-white font-medium shadow-[0_10px_24px_rgba(14,165,233,0.24)] hover:brightness-95">Search buses</button>
      </form>
      {formError && (
        <div className="error-panel mt-3 px-4 py-3 text-sm font-medium" role="alert" aria-live="polite">
          {formError}
        </div>
      )}
    </div>
  );
}
