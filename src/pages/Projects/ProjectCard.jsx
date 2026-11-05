import {
  Code,
  Smartphone,
  Terminal,
  Globe,
  Shield,
  Briefcase,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

const iconMap = {
  Code: <Code size={20} />,
  Smartphone: <Smartphone size={20} />,
  Terminal: <Terminal size={20} />,
  Globe: <Globe size={20} />,
  Shield: <Shield size={20} />,
  Briefcase: <Briefcase size={20} />,
};

function ProjectCard({ project, onClick }) {
  if (!project) return null;

  const {
    title,
    description,
    tags = [],
    icon,
    accent = "purple",
    link,
    image,
  } = project;

  const handleExternalClick = (event) => {
    event.stopPropagation();
  };

  return (
    <div
      className={`projectCard ${accent}`}
      onClick={() => onClick && onClick(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick && onClick(project);
        }
      }}
    >
      {/* Barra superior de acento con gradiente */}
      <div className={`cardAccentBar ${accent}`} />

      {/* Previsualización de Imagen */}
      {image && (
        <div className="projectImageContainer">
          <img
            src={image}
            alt={`Vista previa de ${title}`}
            className="projectImage"
          />
          <div className="projectImageOverlay" />

          {/* Ícono de categoría flotante */}
          <div className={`iconBox ${accent}`}>
            {iconMap[icon] || <Code size={20} />}
          </div>
        </div>
      )}

      {/* Contenido de la Tarjeta */}
      <div className="cardBody">
        <div className="cardHeader">
          <h3 className="cardTitle">{title}</h3>

          {link && link !== "#" && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="externalLinkBtn"
              onClick={handleExternalClick}
              aria-label={`Abrir enlace externo de ${title}`}
              title="Visitar sitio"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        <p className="cardDescription">{description}</p>

        {tags.length > 0 && (
          <div className="tagsList">
            {tags.map((tag, idx) => (
              <span key={`${tag}-${idx}`} className="tagBadge">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Pie de tarjeta / Acción */}
      <div className="cardFooter">
        <span className={`viewProjectLink ${accent}`}>
          <span>Ver detalles</span>
          <ArrowRight size={16} className="arrowIcon" />
        </span>
      </div>
    </div>
  );
}

export default ProjectCard;