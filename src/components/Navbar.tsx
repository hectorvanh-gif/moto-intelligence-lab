import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-primary flex items-center justify-center neon-glow">
              <span className="font-display text-primary text-xs lg:text-sm font-bold">ML</span>
            </div>
            <span className="font-display text-foreground text-sm lg:text-base tracking-widest hidden sm:block">
              MOTO LAB <span className="text-primary">09/24</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("feed")}
              className="font-display text-xs tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              FEED
            </button>
            <button
              onClick={() => scrollToSection("mission")}
              className="font-display text-xs tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              MISIÓN
            </button>
            <Button
              variant="nav"
              size="sm"
              onClick={() => scrollToSection("hero")}
            >
              SUSCRIBIRSE
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-slide-up">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("feed")}
                className="font-display text-sm tracking-widest text-muted-foreground hover:text-primary transition-colors text-left py-2"
              >
                FEED
              </button>
              <button
                onClick={() => scrollToSection("mission")}
                className="font-display text-sm tracking-widest text-muted-foreground hover:text-primary transition-colors text-left py-2"
              >
                MISIÓN
              </button>
              <Button
                variant="nav"
                size="sm"
                onClick={() => scrollToSection("hero")}
                className="w-fit"
              >
                SUSCRIBIRSE
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
