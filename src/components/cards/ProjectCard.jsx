import Badge from "../common/Badge";

function ProjectCard({ project }) {
  return (
    <article>
      <img src={project.image} alt={project.title} />

      <h3>{project.title}</h3>

      <p>{project.description}</p>

      <div>
        {project.technologies.map((technology) => (
          <Badge key={technology}>{technology}</Badge>
        ))}
      </div>

      <a href={project.github} target="_blank" rel="noreferrer">
        GitHub
      </a>
    </article>
  );
}

export default ProjectCard;