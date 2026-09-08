import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import CuratedCorridors from "@/components/home/CuratedCorridors";
import LiveSentinel from "@/components/home/LiveSentinel";
import CTABanner from "@/components/home/CTABanner";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <CuratedCorridors />
        <LiveSentinel />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
