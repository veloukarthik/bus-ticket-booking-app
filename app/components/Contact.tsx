export default function Contact() {
  return (
    <section id="contact" className="py-16 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-bold text-slate-900">Get in touch</h2>
        <p className="mt-2 text-slate-600 max-w-2xl">Fill in the form or email us to schedule a demo.</p>

        <form className="mt-6 max-w-2xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input className="w-full rounded border border-slate-200 px-3 py-2" placeholder="Name" />
            <input className="w-full rounded border border-slate-200 px-3 py-2" placeholder="Email" />
          </div>
          <textarea className="mt-4 w-full rounded border border-slate-200 px-3 py-2" rows={4} placeholder="Message" />
          <div className="mt-4">
            <button className="rounded bg-sky-600 px-4 py-2 text-white">Send</button>
          </div>
        </form>
      </div>
    </section>
  );
}
