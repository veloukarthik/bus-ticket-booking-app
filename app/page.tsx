import Header from "./components/Header";
import Hero from "./components/Hero";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <main className="mx-auto max-w-6xl px-6">
        <Hero />
      </main>

      <Footer />
    </div>
  );
}
