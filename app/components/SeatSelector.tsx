"use client";
import { useState, useEffect } from "react";

type PassengerInput = {
  seat: string;
  name?: string;
  age?: number | null;
  mobile?: string;
  gender?: string;
}

export default function SeatSelector({
  onConfirmAction,
  rows = 12,
  bookedPassengers = [],
  driverPosition = 'left',
  driverAlign = 'center'
}: {
  onConfirmAction: (passengers: PassengerInput[]) => void;
  rows?: number;
  bookedPassengers?: { seat: string; gender?: string; name?: string }[];
  driverPosition?: 'left' | 'right';
  driverAlign?: 'center' | 'front' | 'rear';
}) {
  const [selected, setSelected] = useState<PassengerInput[]>([]);
  // persisted UI settings (driver position & icon size)
  const [pos, setPos] = useState<'left'|'right'>(driverPosition);
  const [align, setAlign] = useState<'center'|'front'|'rear'>(driverAlign);
  const [iconSize, setIconSize] = useState<'sm'|'md'|'lg'>('md');

  useEffect(() => {
    // filter out any selected seats that became booked
    setSelected((prev) => prev.filter(p => !bookedPassengers.find(b => b.seat === p.seat)));
  }, [bookedPassengers]);

  // load persisted settings from localStorage (if any)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('seatSelector.settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.driverPosition) setPos(parsed.driverPosition);
        if (parsed.driverAlign) setAlign(parsed.driverAlign);
        if (parsed.iconSize) setIconSize(parsed.iconSize);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // persist whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem('seatSelector.settings', JSON.stringify({ driverPosition: pos, driverAlign: align, iconSize }));
    } catch (e) {}
  }, [pos, align, iconSize]);

  function seatId(row: number, pos: 'A'|'B'|'C') {
    return `${row}${pos}`;
  }

  function isBooked(seat: string) {
    return bookedPassengers.some((b: any) => {
      if (!b) return false;
      if (typeof b === 'string') return b === seat;
      return b.seat === seat;
    });
  }

  function partnerSeat(seat: string) {
    const last = seat.slice(-1).toUpperCase();
    if (last === 'B') return seat.slice(0, -1) + 'C';
    if (last === 'C') return seat.slice(0, -1) + 'B';
    return '';
  }

  function handleSelect(seat: string) {
    if (isBooked(seat)) return;

    // check existing booked partner
    const partner = partnerSeat(seat);
    const partnerBooked = bookedPassengers.find(b => b.seat === partner);
    if (partnerBooked && partnerBooked.gender && partnerBooked.gender.toLowerCase() === 'female') {
      // if partner is female, do not allow male selection here; but we don't know gender until input, so allow selecting and validate on submit
    }

    setSelected(prev => prev.find(p => p.seat === seat) ? prev.filter(p => p.seat !== seat) : [...prev, { seat }] );
  }

  function updatePassenger(seat: string, patch: Partial<PassengerInput>) {
    setSelected(prev => prev.map(p => p.seat === seat ? { ...p, ...patch } : p));
  }

  function removeSeat(seat: string) {
    setSelected(prev => prev.filter(p => p.seat !== seat));
  }

  function confirm() {
    // validate adjacency rule: if partner seat is booked by female, disallow male
    for (const p of selected) {
      const partner = partnerSeat(p.seat);
      const partnerBooked = bookedPassengers.find(b => b.seat === partner);
      if (partnerBooked && partnerBooked.gender && partnerBooked.gender.toLowerCase() === 'female') {
        if (p.gender && p.gender.toLowerCase() === 'male') {
          alert(`Cannot book seat ${p.seat} as male because adjacent seat ${partner} is booked by female.`);
          return;
        }
      }
      // intra-request check
      const partnerInRequest = selected.find(x => x.seat === partner);
      if (partnerInRequest && partnerInRequest.gender && p.gender) {
        if (partnerInRequest.gender.toLowerCase() === 'female' && p.gender.toLowerCase() === 'male') {
          alert(`Cannot book seat ${p.seat} as male because adjacent seat ${partner} in same booking is booked by female.`);
          return;
        }
      }
    }

    onConfirmAction(selected);
  }

  // Build vertical layout: columns represent rows and seats stack vertically (A top, B, C below)
  const cols = Array.from({ length: rows }, (_, i) => i + 1);

  const sizeClass = iconSize === 'sm' ? 'w-6 h-6' : iconSize === 'lg' ? 'w-12 h-12' : 'w-8 h-8';

  const driverContent = (
    <div className={`flex items-center ${pos === 'right' ? 'flex-row-reverse' : ''}`}>
      <div className={`flex items-center justify-center ${sizeClass} rounded-full bg-slate-100`}> 
        {/* steering wheel svg */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`${sizeClass} text-gray-700`}>
          <path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 017.938 7H15a3 3 0 00-3-3V4zm-2 0v5a3 3 0 00-3 3H4.062A8 8 0 0110 4zM4 12a8 8 0 014.062 6H9a3 3 0 003-3v-3H4zm8 9a8 8 0 01-7.938-6H9a3 3 0 003 3v3z" />
        </svg>
      </div>
      <div className="text-lg font-semibold ml-2">Driver</div>
    </div>
  );

  const columns = (
    <div className="overflow-x-auto">
      <div className="flex space-x-4 items-start">
        {cols.map(c => (
          <div key={c} className="flex flex-col items-center space-y-2">
              {/* seat A (single) */}
              {(() => {
                const id = seatId(c, 'A');
                const bookedRaw = bookedPassengers.find((b: any) => (typeof b === 'string' ? b === id : b?.seat === id));
                const bookedGender = bookedRaw && typeof bookedRaw === 'object' ? bookedRaw.gender : undefined;
                const sel = selected.find(s => s.seat === id);
                const bg = bookedRaw ? (bookedGender && bookedGender.toString().toLowerCase() === 'female' ? 'bg-pink-300' : 'bg-blue-500') : (sel ? 'bg-[var(--theme-primary)] text-white' : 'bg-slate-100 hover:bg-slate-200');
                return (
                  <button key={id} onClick={() => handleSelect(id)} disabled={!!bookedRaw} aria-pressed={!!sel} aria-label={`Seat ${id} ${bookedRaw ? 'booked' : sel ? 'selected' : 'available'}`} className={`w-16 h-12 rounded ${bg} flex items-center justify-center`}>{id}</button>
                )
              })()}

              {/* aisle space label */}
              <div className="text-xs text-slate-500">aisle</div>

              {/* seats B and C stacked */}
              {['B','C'].map(pos => {
                const id = seatId(c, pos as any);
                const bookedRaw = bookedPassengers.find((b: any) => (typeof b === 'string' ? b === id : b?.seat === id));
                const bookedGender = bookedRaw && typeof bookedRaw === 'object' ? bookedRaw.gender : undefined;
                const sel = selected.find(s => s.seat === id);
                const bg = bookedRaw ? (bookedGender && bookedGender.toString().toLowerCase() === 'female' ? 'bg-pink-300' : 'bg-red-500') : (sel ? 'bg-[var(--theme-primary)] text-white' : 'bg-slate-100 hover:bg-slate-200');
                return (
                  <button key={id} onClick={() => handleSelect(id)} disabled={!!bookedRaw} aria-pressed={!!sel} aria-label={`Seat ${id} ${bookedRaw ? 'booked' : sel ? 'selected' : 'available'}`} className={`w-16 h-12 rounded ${bg} flex items-center justify-center`}>{id}</button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    );

  // Compose layout depending on driverAlign
    const layoutJsx = (() => {
      if (align === 'front') {
        return (
          <div>
            <div className="mb-4">{driverContent}</div>
            {columns}
          </div>
        );
      }
      if (align === 'rear') {
        return (
          <div>
            {columns}
            <div className="mt-4">{driverContent}</div>
          </div>
        );
      }
      // center (default): driver vertically centered alongside columns
      return (
        <div className={`flex ${pos === 'right' ? 'flex-row-reverse' : ''} items-center mb-4`}>
          <div className={pos === 'right' ? 'ml-4' : 'mr-4'}>{driverContent}</div>
          {columns}
        </div>
      );
    })();

    // Mobile: stack driver above columns on small screens
    return (
      <div>
        {/* settings control (small) */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <label className="text-sm text-slate-600">Driver position</label>
            <select value={pos} onChange={(e) => setPos(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>

            <label className="text-sm text-slate-600">Icon</label>
            <select value={iconSize} onChange={(e) => setIconSize(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>
          <div className="text-sm text-slate-500">Saved preference: <span className="font-medium">{pos}/{iconSize}</span></div>
        </div>

        {/* mobile stacked driver */}
        <div className="sm:hidden mb-4 flex justify-center">{driverContent}</div>

        {/* desktop layout */}
        <div className="hidden sm:block">{layoutJsx}</div>

        {/* legend */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-pink-300 rounded" />
            <div className="text-sm">Female (booked)</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded" />
            <div className="text-sm">Booked (male/other)</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[var(--theme-primary)] rounded" />
            <div className="text-sm">Selected</div>
          </div>
        </div>

        {selected.length > 0 && (
          <div className="mt-4 border p-3 rounded">
          <h3 className="font-semibold mb-2">Passenger details</h3>
          <div className="space-y-3">
            {selected.map(p => (
              <div key={p.seat} className="flex items-center space-x-2">
                <div className="w-16">{p.seat}</div>
                <input className="border rounded px-2 py-1 flex-1" placeholder="Name" value={p.name || ''} onChange={(e) => updatePassenger(p.seat, { name: e.target.value })} />
                <input className="w-16 border rounded px-2 py-1" placeholder="Age" value={p.age ?? ''} onChange={(e) => updatePassenger(p.seat, { age: e.target.value ? Number(e.target.value) : null })} />
                <input className="w-32 border rounded px-2 py-1" placeholder="Mobile" value={p.mobile || ''} onChange={(e) => updatePassenger(p.seat, { mobile: e.target.value })} />
                <select className="border rounded px-2 py-1" value={p.gender || ''} onChange={(e) => updatePassenger(p.seat, { gender: e.target.value })}>
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <button className="text-sm text-red-600" onClick={() => removeSeat(p.seat)}>Remove</button>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <button onClick={confirm} className="rounded bg-[var(--theme-primary)] px-4 py-2 text-white">Confirm booking ({selected.length})</button>
          </div>
        </div>
      )}
    </div>
  );
}
