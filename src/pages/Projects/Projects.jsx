import { useState } from "react";
import ProjectFilters from "./ProjectFilters";
import ProjectGrid from "./ProjectGrid";
import { projects } from "../../data/projects";
import "../../styles/pages/projects.css";

function Projects() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredProjects = activeFilter === "All"
    ? projects
    : projects.filter((project) => project.category.toLowerCase() === activeFilter.toLowerCase());

  return (
    <section className="projectsSection">
      {/* Encabezado con título a la izquierda y filtros a la derecha */}
      <div className="projectsHeader">
        <div className="headerLeft">
          <div className="sectionBadge">
            <span className="badgeLine" /> MY PROJECTS
          </div>

          <h1 className="projectsTitle">
            Featured <br />
            <span className="gradientText">Projects</span>
          </h1>

          <p className="projectsDescription">
            A selection of projects I've built, from web applications
            to backend APIs and personal experiments.
          </p>
        </div>

        <div className="headerRight">
          <ProjectFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>
      </div>

      {/* Grilla de proyectos */}
      <ProjectGrid projects={filteredProjects} />
    </section>
  );
}

export default Projects;