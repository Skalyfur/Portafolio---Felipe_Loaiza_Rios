import { skills } from "../../data/skills";
import SkillCard from "../../components/cards/SkillCard";
import { FiCode } from "react-icons/fi";
import { motion } from "framer-motion";
import { useHasVisited } from "../../hooks/useHasVisited";

function SkillsPreview() {
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
        <FiCode />
      </div>

      <h2>Skills</h2>
      <p className="card-description">Technologies I work with</p>

      <div className="skills-list">
        {skills.map((skill, index) => (
          <motion.div
            key={skill.id}
            initial={hasVisited ? false : { opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <SkillCard skill={skill} />
          </motion.div>
        ))}
      </div>
    </motion.article>
  );
}

export default SkillsPreview;