import { useRef, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../toggle/ThemeToggle";
import "../../styles/components/navbar.css";

const NAV_ITEMS = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/projects", label: "Projects" },
  { path: "/contact", label: "Contact" },
];

// Variantes de animación para el contenedor y los items del menú móvil
const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -12,
    scaleY: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
      when: "afterChildren",
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    scaleY: 1,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

function Navbar() {
  const location = useLocation();
  const linksRef = useRef({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({
    transform: "translateX(0px)",
    opacity: 0,
  });

  // Detección de Scroll para el Header Fixed
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cierra el menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Manejo de la tecla ESC y bloqueo de scroll al abrir el menú
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };

    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen]);

  // Indicador deslizante (solo Desktop)
  useEffect(() => {
    const updateIndicator = () => {
      const activeLink = linksRef.current[location.pathname];
      if (activeLink) {
        const linkLeft = activeLink.offsetLeft;
        const linkWidth = activeLink.offsetWidth;
        const dotWidth = 6;
        const xPosition = linkLeft + linkWidth / 2 - dotWidth / 2;

        setIndicatorStyle({
          transform: `translateX(${xPosition}px)`,
          opacity: 1,
        });
      } else {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [location.pathname]);

  return (
    <header className={`navbarHeader ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbarContainer">
        <nav className="navbar" aria-label="Navegación principal">
          {/* Logo */}
          <NavLink
            to="/"
            className="navbarLogo"
            onClick={() => setIsMobileOpen(false)}
          >
            <span className="logoIcon">&lt;/&gt;</span>
            <span className="logoText">Felipe</span>
          </NavLink>

          {/* Menú Desktop */}
          <div className="desktopNavGroup">
            <div className="navbarLinks">
              <span
                className="slidingIndicator"
                style={{
                  transform: indicatorStyle.transform,
                  opacity: indicatorStyle.opacity,
                }}
              />

              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  ref={(el) => (linksRef.current[item.path] = el)}
                  className={({ isActive }) =>
                    isActive ? "navLink active" : "navLink"
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <ThemeToggle />
          </div>

          {/* Acciones Móvil (Toggle Tema + Hamburguesa) */}
          <div className="mobileControls">
            <ThemeToggle />
            <button
              className={`mobileMenuBtn ${isMobileOpen ? "open" : ""}`}
              onClick={() => setIsMobileOpen((prev) => !prev)}
              aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Menú Desplegable Móvil con Framer Motion */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Overlay para cerrar al hacer clic afuera */}
            <motion.div
              className="mobileBackdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Contenedor Flotante del Menú */}
            <motion.div
              className="mobileDropdown"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="mobileLinksList">
                {NAV_ITEMS.map((item) => (
                  <motion.div key={item.path} variants={itemVariants}>
                    <NavLink
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        isActive ? "mobileNavLink active" : "mobileNavLink"
                      }
                    >
                      <span className="mobileNavLabel">{item.label}</span>
                      <span className="activeIndicatorDot" />
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;