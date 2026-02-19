const services = [
  { title: "Online Booking", desc: "Seamless web and mobile bookings with secure payments." },
  { title: "Fleet Management", desc: "Real-time tracking and schedule management." },
  { title: "Analytics", desc: "Actionable reports to increase occupancy and revenue." },
];

export default function Services() {
  return (
    <section id="services" className="py-16 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-bold text-slate-900">What we offer</h2>
        <p className="mt-2 text-slate-600 max-w-2xl">Everything an operator needs to sell more seats and run efficiently.</p>

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
