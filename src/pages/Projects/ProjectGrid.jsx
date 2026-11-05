import { useState } from "react";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";

function ProjectGrid({ projects }) {
  const [selectedProject, setSelectedProject] = useState(null);

  if (projects.length === 0) {
    return (
      <div className="noProjects">
        No projects found in this category.
      </div>
    );
  }

  return (
    <>
      <div className="projectsGrid">

        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={setSelectedProject}
          />
        ))}

      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}

export default ProjectGrid;