const services = [
  { title: "Ride Booking", desc: "Seamless ride reservations with secure online payments." },
  { title: "Owner Console", desc: "Vehicle owners can publish vehicles, schedules, and fares." },
  { title: "Demand Insights", desc: "Track route demand and optimize pricing for better occupancy." },
];

export default function Services() {
  return (
    <section id="services" className="py-16 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-bold text-slate-900">What we offer</h2>
        <p className="mt-2 text-slate-600 max-w-2xl">Everything owners and passengers need for reliable intercity car ride booking.</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.title} className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-slate-900">{s.title}</h3>
              <p className="mt-2 text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
