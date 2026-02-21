export default function About() {
  return (
    <section id="about" className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-bold text-slate-900">About LetsGo</h2>

        <p className="mt-4 text-slate-600 max-w-3xl">LetsGo was created with one simple goal — to make bus travel easy, affordable, and accessible for everyone.</p>

        <div className="mt-6 space-y-6 max-w-4xl">
          <p className="text-slate-700">We connect travelers with trusted bus operators across multiple cities, offering a smooth online booking experience with real-time availability, secure payments, and instant confirmation.</p>
          <p className="text-slate-700">Whether you’re planning a weekend getaway or a long-distance journey, LetsGo helps you travel smarter.</p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Our Mission</h3>
            <p className="mt-2 text-slate-600">To simplify bus ticket booking through technology and provide reliable travel experiences.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">Our Vision</h3>
            <p className="mt-2 text-slate-600">To become India’s most trusted online bus booking platform.</p>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold text-slate-900">What We Offer</h3>
          <ul className="mt-3 list-inside list-disc space-y-2 text-slate-600">
            <li>Fast &amp; simple ticket booking</li>
            <li>Verified bus operators</li>
            <li>Best fare options</li>
            <li>Secure online payments</li>
            <li>24/7 customer support</li>
          </ul>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold text-slate-900">FAQ</h3>
          <div className="mt-4 space-y-3 text-slate-700">
            <div>
              <p className="font-medium">How do I book a ticket on LetsGo?</p>
              <p className="mt-1 text-slate-600">Enter your From, To, travel date, select your bus, choose seats, and complete payment.</p>
            </div>

            <div>
              <p className="font-medium">Will I get instant confirmation?</p>
              <p className="mt-1 text-slate-600">Yes. Once payment is successful, your ticket is confirmed immediately.</p>
            </div>

            <div>
              <p className="font-medium">Can I cancel my ticket?</p>
              <p className="mt-1 text-slate-600">Yes. Cancellation depends on the operator’s policy. Refunds are processed as per terms.</p>
            </div>

            <div>
              <p className="font-medium">What payment methods are supported?</p>
              <p className="mt-1 text-slate-600">UPI, Debit Cards, Credit Cards, and Net Banking.</p>
            </div>

            <div>
              <p className="font-medium">Is my payment secure?</p>
              <p className="mt-1 text-slate-600">Absolutely. We use encrypted payment gateways to protect your data.</p>
            </div>

            <div>
              <p className="font-medium">How do I contact support?</p>
              <p className="mt-1 text-slate-600">Email: <a className="text-indigo-600 hover:underline" href="mailto:support@letsgo.com">support@letsgo.com</a> | Phone: +91 XXXXX XXXXX</p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold text-slate-900">Privacy Policy (Short Version)</h3>
          <p className="mt-2 text-slate-600">At LetsGo, your privacy matters. We collect only necessary information such as name, mobile number, and booking details to provide our services. We do NOT sell your personal data to third parties. All payments are processed securely through certified payment partners. For any privacy concerns, contact: <a className="text-indigo-600 hover:underline" href="mailto:privacy@letsgo.com">privacy@letsgo.com</a></p>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold text-slate-900">Terms &amp; Conditions (Short)</h3>
          <p className="mt-2 text-slate-600">Tickets are subject to operator availability. Cancellation &amp; refund policies vary by operator. LetsGo acts as a booking platform, not a transport provider. Users must provide accurate booking information.</p>
        </div>

        <div className="mt-10 pb-6">
          <h3 className="text-lg font-semibold text-slate-900">Contact Us</h3>
          <p className="mt-2 text-slate-600">Have questions or need assistance? Email: <a className="text-indigo-600 hover:underline" href="mailto:support@letsgo.com">support@letsgo.com</a> | Phone: +91 XXXXX XXXXX — 24/7 Support Available</p>
        </div>
      </div>
    </section>
  );
}
