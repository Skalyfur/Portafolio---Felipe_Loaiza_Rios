import Hero from "./Hero";
import HeroImage from "./HeroImage";
import SkillsPreview from "./SkillsPreview";
import FeaturedProjects from "./FeaturedProjects";
import ContactPreview from "./ContactPreview";
import { motion } from "framer-motion";

import "../../styles/pages/home.css";

function Home() {
  return (
    <motion.section
      className="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="home-top-grid">
        <Hero />
        <HeroImage />
      </div>

      <div className="home-bottom-grid">
        <SkillsPreview />
        <FeaturedProjects />
        <ContactPreview />
      </div>
    </motion.section>
  );
}

export default Home;