"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/app/components/AdminGuard";

export default function AdminPage() {
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(()=>{ (async ()=>{
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin/trips', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setTrips(data.trips || []);
  })(); }, []);

  return (
    <AdminGuard>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-2xl font-bold">Owner dashboard</h1>
        <p className="mt-4 text-slate-600">Manage your vehicles, rides, and bookings.</p>
        <div className="mt-6 grid gap-4">
          {trips.map(t=> (
            <div key={t.id} className="rounded border p-4">{t.source} → {t.destination} — ₹{t.price}</div>
          ))}
        </div>
      </div>
    </AdminGuard>
  );
}
