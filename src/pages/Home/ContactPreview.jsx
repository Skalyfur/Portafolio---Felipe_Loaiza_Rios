import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { motion } from "framer-motion";
import { useHasVisited } from "../../hooks/useHasVisited";

function ContactPreview() {
  const hasVisited = useHasVisited("home");

  return (
    <motion.article
      className="home-card"
      initial={hasVisited ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="card-icon cyan">
        <FiMail />
      </div>

      <h2>Get in touch</h2>

      <p className="card-description">
        Let's build something together
      </p>

      <div className="contact-preview-list">
        <motion.a
          href="mailto:felipeloaizarios@gmail.com"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <FiMail />
          <span>felipeloaizarios@gmail.com</span>
        </motion.a>

        <motion.a
          href="https://github.com/Skalyfur"
          target="_blank"
          rel="noreferrer"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <FiGithub />
          <span>github.com/Skalyfur</span>
        </motion.a>

        <motion.a
          href="https://www.linkedin.com/in/felipe-loaiza-rios-093b90270/"
          target="_blank"
          rel="noreferrer"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <FiLinkedin />
          <span>linkedin.com/in/felipe-loaiza-rios-093b90270/</span>
        </motion.a>
      </div>
    </motion.article>
  );
}

export default ContactPreview;