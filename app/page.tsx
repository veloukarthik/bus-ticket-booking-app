import Header from "./components/Header";
import Footer from "./components/Footer";
import BannerSearch from "./components/BannerSearch";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ background: 'linear-gradient(180deg, rgba(14,165,233,0.03), rgba(47,191,113,0.02))' }}>
      <Header />

      <main className="mx-auto max-w-6xl px-6">
        {/* banner with overlayed search */}
        <div className="w-full mb-6 relative rounded-lg overflow-hidden">
          <img src="/banner.png" srcSet="/banner.png" alt="Banner" className="w-full h-64 sm:h-72 object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full px-4">
              <BannerSearch />
            </div>
          </div>
        </div>

        {/* Why Choose LetsGo */}
        <section className="mb-8 px-2" aria-labelledby="why-choose">
          <h2 id="why-choose" className="text-2xl font-semibold mb-4">Why Choose LetsGo?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded shadow-sm">
              <h3 className="font-semibold">Simple & Fast Booking</h3>
              <p className="mt-2 text-sm text-slate-600">Book tickets in under a minute with our easy-to-use platform.</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm">
              <h3 className="font-semibold">Best Price Guarantee</h3>
              <p className="mt-2 text-sm text-slate-600">Compare multiple operators and get the most affordable fares.</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm">
              <h3 className="font-semibold">Safe & Reliable</h3>
              <p className="mt-2 text-sm text-slate-600">Travel with verified buses and professional drivers.</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm">
              <h3 className="font-semibold">Secure Payments</h3>
              <p className="mt-2 text-sm text-slate-600">Multiple payment options with complete data protection.</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm">
              <h3 className="font-semibold">Real-Time Availability</h3>
              <p className="mt-2 text-sm text-slate-600">Live seat availability and instant confirmation.</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm">
              <h3 className="font-semibold">24/7 Support</h3>
              <p className="mt-2 text-sm text-slate-600">Our team is ready to assist you anytime.</p>
            </div>
          </div>
        </section>

        {/* Popular Routes */}
        <section className="mb-8 px-2" aria-labelledby="popular-routes">
          <h2 id="popular-routes" className="text-2xl font-semibold mb-4">Popular Routes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'Chennai → Bangalore',
              'Bangalore → Hyderabad',
              'Chennai → Coimbatore',
              'Hyderabad → Vijayawada',
              'Bangalore → Kochi'
            ].map((r) => (
              <div key={r} className="p-3 bg-white rounded shadow-sm">{r}</div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-8 px-2" aria-labelledby="testimonials">
          <h2 id="testimonials" className="text-2xl font-semibold mb-4">What Our Customers Say</h2>
          <div className="space-y-4">
            <blockquote className="p-4 bg-white rounded shadow-sm">“Super easy booking experience and great prices!” — <span className="font-semibold">Arun</span></blockquote>
            <blockquote className="p-4 bg-white rounded shadow-sm">“Clean buses and instant confirmation. Loved LetsGo.” — <span className="font-semibold">Priya</span></blockquote>
            <blockquote className="p-4 bg-white rounded shadow-sm">“Best platform for last-minute travel.” — <span className="font-semibold">Karthik</span></blockquote>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-8 px-2" aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="text-2xl font-semibold mb-4">How It Works</h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li>Enter your source and destination</li>
            <li>Choose travel date</li>
            <li>Select your preferred bus & seat</li>
            <li>Pay securely</li>
            <li>Get instant confirmation</li>
          </ol>
        </section>

        {/* Contact / Support block (simple) */}
        <section className="mb-12 px-2" aria-labelledby="support">
          <h2 id="support" className="text-2xl font-semibold mb-3">Need Help?</h2>
          <p className="text-slate-700">Our support team is available 24/7 to assist you with bookings, cancellations, and travel queries.</p>
          <div className="mt-3 text-sm text-slate-600">
            <div>📧 support@letsgo.com</div>
            <div>📞 +91 XXXXX XXXXX</div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
