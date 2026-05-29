import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import NewsSection from "@/components/NewsSection";
import AboutMission from "@/components/AboutMission";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <NewsSection />
      <AboutMission />
      <Footer />
    </div>
  );
};

export default Index;
