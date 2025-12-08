import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import IntelligenceFeed from "@/components/IntelligenceFeed";
import AboutMission from "@/components/AboutMission";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <IntelligenceFeed />
      <AboutMission />
      <Footer />
    </div>
  );
};

export default Index;
