import AboutIntro from "./AboutIntro";
import Experience from "./Experience";
import Education from "./Education";
import KeySkills from "./KeySkills";
import Languages from "./Languages";
import "../../styles/pages/about.css";

function About() {
  return (
    <section className="aboutSection">
      <div className="aboutContainer">
        {/* Columna Izquierda: Presentación y tecnologías principales */}
        <div className="aboutLeftColumn">
          <AboutIntro />
        </div>

        {/* Columna Derecha: Trayectoria, estudios, habilidades e idiomas */}
        <div className="aboutRightColumn">
          <Experience />
          <Education />
          <div className="aboutBottomGrid">
            <KeySkills />
            <Languages />
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;