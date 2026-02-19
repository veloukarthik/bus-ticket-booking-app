"use client";
import { useEffect, useState } from "react";
import AdminGuard from "@/app/components/AdminGuard";

export default function AdminTrips() {
  const [trips, setTrips] = useState<any[]>([]);
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [price, setPrice] = useState(300);
  const [vehicles, setVehicles] = useState<any[]>([]);

  async function load(){
    const token = localStorage.getItem('token');
    const vRes = await fetch('/api/admin/vehicles', { headers: { Authorization: `Bearer ${token}` } });
    const vData = await vRes.json();
    setVehicles(vData.vehicles || []);
    const tRes = await fetch('/api/admin/trips', { headers: { Authorization: `Bearer ${token}` } });
    const tData = await tRes.json();
    setTrips(tData.trips || []);
  }

  useEffect(()=>{ load(); }, []);

  async function create(){
    const token = localStorage.getItem('token');
    await fetch('/api/admin/trips', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicleId, source, destination, departure, arrival, price }) });
    setSource(''); setDestination(''); setDeparture(''); setArrival(''); setPrice(300); load();
  }

  return (
    <AdminGuard>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-2xl font-bold">Trips</h1>
        <div className="mt-4 grid gap-4">
          {trips.map(t => <div key={t.id} className="p-3 border">{t.source} → {t.destination} — ₹{t.price}</div>)}
        </div>

        <div className="mt-6">
          <h2 className="font-semibold">Create trip</h2>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <select value={vehicleId ?? ''} onChange={e=>setVehicleId(Number(e.target.value)||null)} className="border p-2">
              <option value="">Select vehicle</option>
              {vehicles.map(v=> <option value={v.id} key={v.id}>{v.name} ({v.number})</option>)}
            </select>
            <input value={source} onChange={e=>setSource(e.target.value)} placeholder="Source" className="border p-2" />
            <input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Destination" className="border p-2" />
            <input value={departure} onChange={e=>setDeparture(e.target.value)} placeholder="Departure ISO" className="border p-2" />
            <input value={arrival} onChange={e=>setArrival(e.target.value)} placeholder="Arrival ISO" className="border p-2" />
            <input value={price} onChange={e=>setPrice(Number(e.target.value))} placeholder="Price" type="number" className="border p-2" />
            <div className="col-span-2 text-right">
              <button onClick={create} className="rounded bg-sky-600 px-4 py-2 text-white">Create trip</button>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
