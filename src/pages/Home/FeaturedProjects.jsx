import { projects } from "../../data/projects";
import { FiFolder, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useHasVisited } from "../../hooks/useHasVisited";

function FeaturedProjects() {
  const hasVisited = useHasVisited("home");
  return (
    <motion.article
      className="home-card"
      initial={hasVisited ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="card-icon purple">
        <FiFolder />
      </div>

      <h2>Featured Projects</h2>
      <p className="card-description">Some of my recent work</p>

      <div className="featured-projects">
        {projects.slice(0, 3).map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
            whileHover={{ x: 5 }}
          >
            <Link to={`/projects/${project.id}`} className="featured-project">
              <div>
                <h3>{project.title}</h3>
                <span>{project.tech}</span>
              </div>
              <FiArrowRight />
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.article>
  );
}

export default FeaturedProjects;