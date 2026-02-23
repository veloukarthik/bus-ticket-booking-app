"use client";
import { useEffect, useMemo, useState } from "react";

type PassengerInput = {
  seat: string;
  name?: string;
  age?: number | null;
  mobile?: string;
  gender?: string;
};

type BookedPassenger = {
  seat: string;
  gender?: string;
  name?: string;
};

type Variant = {
  name: string;
  rowPattern: number[];
};

function resolveVariant(seatCount: number, vehicleLabel?: string): Variant {
  const label = (vehicleLabel || "").toLowerCase();

  const isTraveller = /tempo|traveller|traveler|van|minibus/.test(label);
  const isSuv = /suv|innova|ertiga|xuv|scorpio|fortuner/.test(label);
  const isHatch = /hatch|swift|i10|i20|alto|polo/.test(label);
  const isSedan = /sedan|etios|dzire|city|verna|amaze/.test(label);

  if (isTraveller || seatCount >= 8) {
    if (seatCount >= 10) return { name: "Traveller (10 Seater)", rowPattern: [2, 4, 4] };
    if (seatCount === 9) return { name: "Traveller (9 Seater)", rowPattern: [2, 3, 4] };
    return { name: "Traveller", rowPattern: [2, 3, 3] };
  }

  if (seatCount === 7 || isSuv) return { name: "SUV (7 Seater)", rowPattern: [2, 3, 2] };
  if (seatCount === 6) return { name: "SUV (6 Seater)", rowPattern: [2, 2, 2] };
  if (seatCount === 5) return { name: "Compact SUV (5 Seater)", rowPattern: [2, 3] };
  if (isHatch || seatCount <= 4) return { name: "Hatchback (4 Seater)", rowPattern: [2, 2] };
  if (isSedan) return { name: "Sedan (4 Seater)", rowPattern: [2, 2] };

  return { name: `Car (${seatCount} Seater)`, rowPattern: [2, 3] };
}

function fillPattern(pattern: number[], totalSeats: number) {
  const rows: number[] = [];
  let assigned = 0;

  for (const count of pattern) {
    if (assigned >= totalSeats) break;
    const take = Math.min(count, totalSeats - assigned);
    rows.push(take);
    assigned += take;
  }

  let idx = 0;
  while (assigned < totalSeats) {
    const base = pattern[Math.min(idx, pattern.length - 1)] || 3;
    const take = Math.min(base, totalSeats - assigned);
    rows.push(take);
    assigned += take;
    idx += 1;
  }

  return rows;
}

function buildSeatRows(totalSeats: number, vehicleLabel?: string) {
  const variant = resolveVariant(totalSeats, vehicleLabel);
  const rowCounts = fillPattern(variant.rowPattern, totalSeats);
  const rows: string[][] = [];

  let assigned = 0;
  for (let rowIdx = 0; rowIdx < rowCounts.length; rowIdx++) {
    const count = rowCounts[rowIdx];
    const rowNumber = rowIdx + 1;
    const row: string[] = [];

    for (let i = 0; i < count; i++) {
      const letter = String.fromCharCode(65 + i);
      row.push(`${rowNumber}${letter}`);
      assigned += 1;
      if (assigned >= totalSeats) break;
    }

    rows.push(row);
  }

  return { rows, variantName: variant.name };
}

export default function SeatSelector({
  onConfirmAction,
  rows = 12,
  totalSeats,
  vehicleLabel,
  bookedPassengers = [],
  passengerSuggestions = [],
  driverPosition = "left",
}: {
  onConfirmAction: (passengers: PassengerInput[]) => void | Promise<void>;
  rows?: number;
  totalSeats?: number;
  vehicleLabel?: string;
  bookedPassengers?: BookedPassenger[];
  passengerSuggestions?: { name: string; mobile: string; gender: string; age: number | null }[];
  driverPosition?: "left" | "right";
}) {
  const [selected, setSelected] = useState<PassengerInput[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    setSelected((prev) => prev.filter((p) => !bookedPassengers.find((b) => b.seat === p.seat)));
  }, [bookedPassengers]);

  const seatCount = useMemo(() => {
    if (typeof totalSeats === "number" && Number.isFinite(totalSeats)) {
      return Math.max(1, Math.floor(totalSeats));
    }
    return Math.max(1, rows * 3);
  }, [rows, totalSeats]);

  const { rows: seatRows, variantName } = useMemo(
    () => buildSeatRows(seatCount, vehicleLabel),
    [seatCount, vehicleLabel]
  );

  const seatIds = useMemo(() => seatRows.flat(), [seatRows]);

  function seatSerial(id: string) {
    const index = seatIds.indexOf(id);
    return index >= 0 ? index + 1 : null;
  }

  function isBooked(seat: string) {
    return bookedPassengers.some((b) => b.seat === seat);
  }

  function partnerSeat(seat: string) {
    const row = seatRows.find((r) => r.includes(seat));
    if (!row) return "";

    if (row.length === 2) {
      return row[0] === seat ? row[1] : row[0];
    }

    if (row.length === 3) {
      if (row[1] === seat) return row[2] || "";
      if (row[2] === seat) return row[1] || "";
      return "";
    }

    if (row.length >= 4) {
      if (row[2] === seat) return row[3] || "";
      if (row[3] === seat) return row[2] || "";
      return "";
    }

    return "";
  }

  function handleSelect(seat: string) {
    if (isBooked(seat)) return;
    setSelected((prev) =>
      prev.find((p) => p.seat === seat)
        ? prev.filter((p) => p.seat !== seat)
        : [...prev, { seat }]
    );
  }

  function updatePassenger(seat: string, patch: Partial<PassengerInput>) {
    setSelected((prev) => prev.map((p) => (p.seat === seat ? { ...p, ...patch } : p)));
  }

  function removeSeat(seat: string) {
    setSelected((prev) => prev.filter((p) => p.seat !== seat));
  }

  function applySuggestion(seat: string, suggestionIdx: number) {
    const suggestion = passengerSuggestions[suggestionIdx];
    if (!suggestion) return;
    updatePassenger(seat, {
      name: suggestion.name || "",
      mobile: suggestion.mobile || "",
      gender: suggestion.gender || "",
      age: suggestion.age ?? null,
    });
  }

  async function confirm() {
    if (isConfirming) return;

    for (const p of selected) {
      const partner = partnerSeat(p.seat);
      const partnerBooked = bookedPassengers.find((b) => b.seat === partner);
      if (partnerBooked?.gender?.toLowerCase() === "female" && p.gender?.toLowerCase() === "male") {
        alert(`Cannot book seat ${p.seat} as male because adjacent seat ${partner} is booked by female.`);
        return;
      }
      const partnerInRequest = selected.find((x) => x.seat === partner);
      if (partnerInRequest?.gender && p.gender) {
        if (partnerInRequest.gender.toLowerCase() === "female" && p.gender.toLowerCase() === "male") {
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

  function renderSeatButton(id: string | null) {
    if (!id) {
      return <div className="h-16 w-full rounded-2xl border border-transparent bg-slate-100/40" />;
    }

    const booked = bookedPassengers.find((b) => b.seat === id);
    const bookedGender = booked?.gender;
    const sel = selected.find((s) => s.seat === id);

    const bg = booked
      ? bookedGender?.toLowerCase() === "female"
        ? "bg-pink-200 text-pink-900 border-pink-300"
        : "bg-rose-500 text-white border-rose-500"
      : sel
        ? "bg-[var(--theme-primary)] text-white border-[var(--theme-primary)]"
        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100";

    const serial = seatSerial(id);

    return (
      <button
        key={id}
        onClick={() => handleSelect(id)}
        disabled={!!booked}
        aria-pressed={!!sel}
        aria-label={`Seat ${id} ${booked ? "booked" : sel ? "selected" : "available"}`}
        className={`h-16 w-full rounded-2xl border ${bg} px-1 transition-transform duration-150 hover:scale-[1.02] disabled:opacity-90`}
      >
        <div className="mx-auto mt-1 h-1.5 w-8 rounded-full bg-black/10" />
        <div className="mt-1 text-[10px] font-medium opacity-80">Seat #{serial}</div>
        <div className="text-sm font-semibold">{id}</div>
      </button>
    );
  }

  const driverAlignClass = driverPosition === "right" ? "justify-end" : "justify-start";

  return (
    <div>
      {selected.length > 0 && (
        <div className="mb-3 rounded-xl border border-sky-100 bg-sky-50/70 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium text-slate-700">Selected seats ({selected.length})</div>
            <button
              type="button"
              onClick={clearAllSelected}
              className="text-xs text-red-600 hover:underline"
            >
              Clear all
            </button>
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

      <div className="rounded-[30px] border border-slate-300 bg-gradient-to-b from-slate-50 to-white p-4 sm:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div className="mx-auto mb-3 w-40 rounded-b-full bg-sky-100 px-3 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-sky-700">
          Windshield
        </div>

        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            {variantName}
          </span>
          <span className="text-xs text-slate-500">{seatCount} seats</span>
        </div>

        <div className={`mb-3 flex ${driverAlignClass}`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5">
            <span className="h-7 w-7 rounded-full border border-slate-300 bg-slate-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-slate-700">
                <path
                  fill="currentColor"
                  d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 017.938 7H15a3 3 0 00-3-3V4zm-2 0v5a3 3 0 00-3 3H4.062A8 8 0 0110 4zM4 12a8 8 0 014.062 6H9a3 3 0 003-3v-3H4zm8 9a8 8 0 01-7.938-6H9a3 3 0 003 3v3z"
                />
              </svg>
            </span>
            <span className="text-xs font-semibold text-slate-700">Driver</span>
          </div>
        </div>

        <div className="space-y-3">
          {seatRows.map((row, rowIdx) => {
            const isFrontRow = rowIdx === 0;
            return (
              <div key={`row-${rowIdx + 1}`} className="flex items-start gap-2">
                <div className="mt-1 h-7 w-10 rounded-md bg-slate-200 text-[10px] font-semibold text-slate-700 flex items-center justify-center">
                  {isFrontRow ? "FRONT" : `R${rowIdx + 1}`}
                </div>
                <div className="flex-1">
                  {row.length === 1 && (
                    <div className="grid grid-cols-3 gap-2">
                      <div />
                      {renderSeatButton(row[0] || null)}
                      <div />
                    </div>
                  )}

                  {row.length === 2 && (
                    <div className="grid grid-cols-[1fr_20px_1fr] gap-2 items-center">
                      {renderSeatButton(row[0] || null)}
                      <div className={`h-14 rounded-full ${isFrontRow ? "bg-slate-300/60" : "bg-slate-200/60"}`} />
                      {renderSeatButton(row[1] || null)}
                    </div>
                  )}

                  {row.length === 3 && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-2">
                      <div className="grid grid-cols-3 gap-2">
                        {row.map((id, idx) => (
                          <div key={`seat-${rowIdx}-${idx}`}>{renderSeatButton(id)}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {row.length >= 4 && (
                    <div className="grid grid-cols-[1fr_1fr_20px_1fr_1fr] gap-2 items-center">
                      {renderSeatButton(row[0] || null)}
                      {renderSeatButton(row[1] || null)}
                      <div className="h-14 rounded-full bg-slate-200/60" />
                      {renderSeatButton(row[2] || null)}
                      {renderSeatButton(row[3] || null)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-4 w-24 rounded-t-full bg-slate-200 px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          Trunk
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-pink-200 rounded border border-pink-300" />
          <div className="text-sm">Female (booked)</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-rose-500 rounded" />
          <div className="text-sm">Booked</div>
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
            {selected.map((p) => (
              <div key={p.seat} className="rounded-lg border border-slate-200 p-3 bg-slate-50/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center rounded-full bg-white border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    Seat {p.seat}
                  </div>
                  <button
                    type="button"
                    className="text-sm text-red-600"
                    onClick={() => removeSeat(p.seat)}
                  >
                    Remove
                  </button>
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
                          {s.name}
                          {s.mobile ? ` (${s.mobile})` : ""}
                        </option>
                      ))}
                    </select>
                  )}

                  <input
                    className="w-full border rounded px-2 py-2 text-sm bg-white"
                    placeholder="Name"
                    value={p.name || ""}
                    onChange={(e) => updatePassenger(p.seat, { name: e.target.value })}
                  />
                  <input
                    className="w-full border rounded px-2 py-2 text-sm bg-white"
                    placeholder="Mobile"
                    value={p.mobile || ""}
                    onChange={(e) => updatePassenger(p.seat, { mobile: e.target.value })}
                  />
                  <input
                    className="w-full border rounded px-2 py-2 text-sm bg-white"
                    placeholder="Age"
                    value={p.age ?? ""}
                    onChange={(e) =>
                      updatePassenger(p.seat, {
                        age: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  />
                  <select
                    className="w-full border rounded px-2 py-2 text-sm bg-white"
                    value={p.gender || ""}
                    onChange={(e) => updatePassenger(p.seat, { gender: e.target.value })}
                  >
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
