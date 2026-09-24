import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FrontPage from "@/components/FrontPage";
import CategoryRow from "@/components/CategoryRow";
import NewsletterBand from "@/components/NewsletterBand";
import AboutMission from "@/components/AboutMission";
import Footer from "@/components/Footer";
import { homeCategories } from "@/lib/categories";

const Index = () => {
  const { hash } = useLocation();
  const categories = homeCategories();

  // El boton SUSCRIBIRSE del navbar apunta a /#suscribete. Si se llega desde
  // otra pagina, react-router no hace el scroll solo.
  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <FrontPage />

      {categories[0] && <CategoryRow category={categories[0]} />}

      <NewsletterBand />

      {categories.slice(1).map((cat) => (
        <CategoryRow key={cat.slug} category={cat} />
      ))}

      <AboutMission />
      <Footer />
    </div>
  );
};

export default Index;
