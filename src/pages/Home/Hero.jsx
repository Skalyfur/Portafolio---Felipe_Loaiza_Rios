import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { useHasVisited } from "../../hooks/useHasVisited"; // <-- Importar Hook

function Hero() {
  const hasVisited = useHasVisited("home"); // Key única para la sección o página

  return (
    <motion.article
      className="hero-card"
      // Si ya visitó la página en esta sesión, initial es false (sin animación).
      initial={hasVisited ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="hero-content">
        <motion.span
          className="hero-label"
          initial={hasVisited ? false : { opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          HI, I'M
        </motion.span>

        <motion.h1
          initial={hasVisited ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Felipe
        </motion.h1>

        <motion.h2
          initial={hasVisited ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span>Backend</span> Developer
        </motion.h2>

        <motion.p
          className="hero-description"
          initial={hasVisited ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          I build efficient and scalable web solutions with modern technologies. Always learning, always improving.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={hasVisited ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link to="/projects" className="hero-button">
              View my projects
              <FiArrowRight />
            </Link>
          </motion.div>

          <motion.div whileHover={{ x: 4 }}>
            <Link to="/about" className="about-link">
              About me
              <FiArrowRight />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.article>
  );
}

export default Hero;