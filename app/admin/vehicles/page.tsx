"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/app/components/AdminGuard";

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [capacity, setCapacity] = useState(40);

  async function load(){
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin/vehicles', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setVehicles(data.vehicles || []);
  }

  useEffect(()=>{ load(); }, []);

  async function create(){
    const token = localStorage.getItem('token');
    await fetch('/api/admin/vehicles', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name, number, capacity }) });
    setName(''); setNumber(''); setCapacity(40); load();
  }

  return (
    <AdminGuard>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <div className="mt-4 grid gap-4">
          {vehicles.map(v => <div key={v.id} className="p-3 border">{v.name} — {v.number} — {v.capacity}</div>)}
        </div>

        <div className="mt-6">
          <h2 className="font-semibold">Create vehicle</h2>
          <div className="flex gap-2 mt-2">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="border p-2" />
            <input value={number} onChange={e=>setNumber(e.target.value)} placeholder="Number" className="border p-2" />
            <input value={capacity} onChange={e=>setCapacity(Number(e.target.value))} placeholder="Capacity" type="number" className="border p-2 w-24" />
            <button onClick={create} className="rounded bg-[var(--theme-primary)] px-4 py-2 text-white">Create</button>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
