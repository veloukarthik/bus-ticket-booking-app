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
  passengerSuggestions = [],
  driverPosition = 'left',
  driverAlign = 'center'
}: {
  onConfirmAction: (passengers: PassengerInput[]) => void | Promise<void>;
  rows?: number;
  bookedPassengers?: { seat: string; gender?: string; name?: string }[];
  passengerSuggestions?: { name: string; mobile: string; gender: string; age: number | null }[];
  driverPosition?: 'left' | 'right';
  driverAlign?: 'center' | 'front' | 'rear';
}) {
  const [selected, setSelected] = useState<PassengerInput[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
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

  function applySuggestion(seat: string, suggestionIdx: number) {
    const suggestion = passengerSuggestions[suggestionIdx];
    if (!suggestion) return;
    updatePassenger(seat, {
      name: suggestion.name || '',
      mobile: suggestion.mobile || '',
      gender: suggestion.gender || '',
      age: suggestion.age ?? null,
    });
  }

  async function confirm() {
    if (isConfirming) return;
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

    setIsConfirming(true);
    try {
      await Promise.resolve(onConfirmAction(selected));
    } finally {
      setIsConfirming(false);
    }
  }

  function clearAllSelected() {
    setSelected([]);
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
                  <button
                    key={id}
                    onClick={() => handleSelect(id)}
                    disabled={!!bookedRaw}
                    aria-pressed={!!sel}
                    aria-label={`Seat ${id} ${bookedRaw ? 'booked' : sel ? 'selected' : 'available'}`}
                    className={`w-14 h-11 sm:w-16 sm:h-12 rounded-lg ${bg} flex items-center justify-center transition-transform duration-150 hover:scale-[1.03] disabled:opacity-90`}
                  >
                    {id}
                  </button>
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
                  <button
                    key={id}
                    onClick={() => handleSelect(id)}
                    disabled={!!bookedRaw}
                    aria-pressed={!!sel}
                    aria-label={`Seat ${id} ${bookedRaw ? 'booked' : sel ? 'selected' : 'available'}`}
                    className={`w-14 h-11 sm:w-16 sm:h-12 rounded-lg ${bg} flex items-center justify-center transition-transform duration-150 hover:scale-[1.03] disabled:opacity-90`}
                  >
                    {id}
                  </button>
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
        <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Driver position</label>
              <select value={pos} onChange={(e) => setPos(e.target.value as any)} className="border rounded-lg px-2 py-1.5 text-sm bg-white">
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Icon size</label>
              <select value={iconSize} onChange={(e) => setIconSize(e.target.value as any)} className="border rounded-lg px-2 py-1.5 text-sm bg-white">
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
            <div className="text-xs text-slate-500 sm:text-right">
              Saved: <span className="font-medium">{pos}/{iconSize}</span>
            </div>
          </div>
        </div>

        {selected.length > 0 && (
          <div className="mb-3 rounded-xl border border-sky-100 bg-sky-50/70 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium text-slate-700">Selected seats ({selected.length})</div>
              <button type="button" onClick={clearAllSelected} className="text-xs text-red-600 hover:underline">Clear all</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selected.map((p) => (
                <button
                  key={`chip-${p.seat}`}
                  type="button"
                  onClick={() => removeSeat(p.seat)}
                  className="rounded-full bg-white border border-sky-200 px-3 py-1 text-xs font-medium text-sky-700"
                  aria-label={`Remove seat ${p.seat}`}
                >
                  {p.seat} ✕
                </button>
              ))}
            </div>
          </div>
        )}

        {/* mobile stacked driver */}
        <div className="sm:hidden mb-4 flex justify-center">{driverContent}</div>

        {/* desktop layout */}
        <div className="hidden sm:block">{layoutJsx}</div>

        {/* legend */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
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
          <div className="mt-4 border border-slate-200 p-3 rounded-xl bg-white">
          <h3 className="font-semibold mb-2">Passenger details</h3>
          <div className="space-y-3">
            {selected.map(p => (
              <div key={p.seat} className="rounded-lg border border-slate-200 p-3 bg-slate-50/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center rounded-full bg-white border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    Seat {p.seat}
                  </div>
                  <button type="button" className="text-sm text-red-600" onClick={() => removeSeat(p.seat)}>Remove</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {passengerSuggestions.length > 0 && (
                    <select
                      className="w-full border rounded px-2 py-2 text-sm bg-white sm:col-span-2"
                      defaultValue=""
                      onChange={(e) => {
                        const idx = Number(e.target.value);
                        if (!Number.isNaN(idx)) applySuggestion(p.seat, idx);
                      }}
                    >
                      <option value="">Use saved passenger</option>
                      {passengerSuggestions.map((s, idx) => (
                        <option key={`${s.name}-${s.mobile}-${idx}`} value={idx}>
                          {s.name}{s.mobile ? ` (${s.mobile})` : ''}
                        </option>
                      ))}
                    </select>
                  )}

                  <input className="w-full border rounded px-2 py-2 text-sm bg-white" placeholder="Name" value={p.name || ''} onChange={(e) => updatePassenger(p.seat, { name: e.target.value })} />
                  <input className="w-full border rounded px-2 py-2 text-sm bg-white" placeholder="Mobile" value={p.mobile || ''} onChange={(e) => updatePassenger(p.seat, { mobile: e.target.value })} />
                  <input className="w-full border rounded px-2 py-2 text-sm bg-white" placeholder="Age" value={p.age ?? ''} onChange={(e) => updatePassenger(p.seat, { age: e.target.value ? Number(e.target.value) : null })} />
                  <select className="w-full border rounded px-2 py-2 text-sm bg-white" value={p.gender || ''} onChange={(e) => updatePassenger(p.seat, { gender: e.target.value })}>
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <button
              onClick={confirm}
              disabled={isConfirming}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] px-4 py-2 text-white font-medium shadow-[0_10px_24px_rgba(14,165,233,0.24)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isConfirming ? "Allocating seats..." : `Confirm booking (${selected.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
