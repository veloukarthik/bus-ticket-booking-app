"use client";
import { useState, useEffect } from "react";

export default function SeatSelector({ 
  onConfirmAction, 
  capacity = 40,
  bookedSeats = [] 
}: { 
  onConfirmAction: (seats: string[]) => void; 
  capacity?: number;
  bookedSeats?: string[];
}) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setSelected((prev) => prev.filter((s) => !bookedSeats.includes(s)));
  }, [bookedSeats]);

  function toggle(seat: string) {
    if (bookedSeats.includes(seat)) return;
    setSelected((s) => s.includes(seat) ? s.filter(x => x !== seat) : [...s, seat]);
  }

  const seats = Array.from({ length: Math.min(capacity, 40) }, (_, i) => `${Math.floor(i/4)+1}${String.fromCharCode(65 + (i%4))}`);

  return (
    <div className="grid grid-cols-8 gap-2">
      {seats.map(s => {
        const isBooked = bookedSeats.includes(s);
        const isSelected = selected.includes(s);
        return (
        <button 
          key={s} 
          onClick={() => toggle(s)} 
          disabled={isBooked}
          className={`p-2 rounded ${isBooked ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}
        >
          {s}
        </button>
      )})}
      <div className="col-span-8 mt-2">
        <button onClick={() => onConfirmAction(selected)} className="rounded bg-sky-600 px-4 py-2 text-white">Confirm seats ({selected.length})</button>
      </div>
    </div>
  );
}
