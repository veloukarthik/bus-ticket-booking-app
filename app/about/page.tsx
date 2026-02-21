import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import About from "../components/About";

export const metadata: Metadata = {
  title: "About — LetsGo",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-6">
        <About />
      </main>
      <Footer />
    </>
  );
}
