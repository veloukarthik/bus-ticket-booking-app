"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/app/components/AdminGuard";

export default function AdminPage() {
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(()=>{ (async ()=>{
    const res = await fetch('/api/trips/search', { method: 'POST', body: JSON.stringify({ source: '', destination: '', date: new Date().toISOString().slice(0,10) }), headers: { 'Content-Type': 'application/json' } });
    const data = await res.json();
    setTrips(data.trips || []);
  })(); }, []);

  return (
    <AdminGuard>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <p className="mt-4 text-slate-600">Manage vehicles, trips and view bookings (stub).</p>
        <div className="mt-6 grid gap-4">
          {trips.map(t=> (
            <div key={t.id} className="rounded border p-4">{t.source} → {t.destination} — ₹{t.price}</div>
          ))}
        </div>
      </div>
    </AdminGuard>
  );
}
