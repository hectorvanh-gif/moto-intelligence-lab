import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FrontPage from "@/components/FrontPage";
import MostVoted from "@/components/MostVoted";
import CategoryRow from "@/components/CategoryRow";
import NewsletterBand from "@/components/NewsletterBand";
import AboutMission from "@/components/AboutMission";
import Footer from "@/components/Footer";
import { homeCategories } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";
import { useMeta } from "@/hooks/useMeta";

const Index = () => {
  const { hash } = useLocation();
  const categories = homeCategories();

  useMeta({
    title: "Noticias de motos en México | Moto Lab 249",
    description:
      "Lo que pasó hoy en el motociclismo: MotoGP, motos eléctricas, doble propósito y lanzamientos. Resumido y al punto, para México.",
    canonical: SITE_URL,
  });

  // El boton SUSCRIBIRSE del navbar apunta a /#suscribete. Si se llega desde
  // otra pagina, react-router no hace el scroll solo.
  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <>
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <FrontPage />

      {/* Se pinta sola cuando hay votos; con cero no aparece. */}
      <MostVoted />

      {/* Las filas de categoria van seguidas: antes el formulario de
          suscripcion se metia entre la primera y las demas, y cortaba el
          impulso de bajar justo cuando estaba funcionando. */}
      {categories.map((cat) => (
        <CategoryRow key={cat.slug} category={cat} />
      ))}

      <AboutMission />
      <NewsletterBand />
      <Footer />
    </div>
    </>
  );
};

export default Index;
