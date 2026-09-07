import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ExploreGrid from "@/components/ExploreGrid";
import MemberGrid from "@/components/MemberGrid";
import Releases from "@/components/Releases";
import BackgroundEffects from "@/components/BackgroundEffects";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10">
        <Hero />

        <ExploreGrid />

        <MemberGrid />

        <Releases />
      </main>

      <Footer />
    </>
  );
}