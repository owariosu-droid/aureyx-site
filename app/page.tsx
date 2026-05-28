// app/page.tsx

import Hero from "@/components/Hero";
import Archive from "@/components/Archive";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import BackgroundEffects from "@/components/BackgroundEffects";

export default function Home() {
  return (
    <main className="scanlines relative overflow-hidden">

      {/* Film grain */}
      <div className="grain" />

      {/* Ambient background */}
      <BackgroundEffects />

      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <Hero />

      {/* Archive */}
      <Archive />

      {/* Footer */}
      <Footer />

    </main>
  );
}