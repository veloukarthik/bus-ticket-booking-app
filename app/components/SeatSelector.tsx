"use client";
import { useState } from "react";

export default function SeatSelector({ onConfirmAction, capacity = 40 }: { onConfirmAction: (seats: string[]) => void; capacity?: number }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(seat: string) {
    setSelected((s) => s.includes(seat) ? s.filter(x => x !== seat) : [...s, seat]);
  }

  const seats = Array.from({ length: Math.min(capacity, 40) }, (_, i) => `${Math.floor(i/4)+1}${String.fromCharCode(65 + (i%4))}`);

  return (
    <div className="grid grid-cols-8 gap-2">
      {seats.map(s => (
        <button key={s} onClick={() => toggle(s)} className={`p-2 rounded ${selected.includes(s) ? 'bg-sky-600 text-white' : 'bg-slate-100'}`}>
          {s}
        </button>
      ))}
      <div className="col-span-8 mt-2">
        <button onClick={() => onConfirmAction(selected)} className="rounded bg-sky-600 px-4 py-2 text-white">Confirm seats ({selected.length})</button>
      </div>
    </div>
  );
}
