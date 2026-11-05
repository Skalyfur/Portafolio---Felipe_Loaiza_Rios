import { useEffect, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import "../../styles/components/projectModal.css";

function ProjectModal({ project, onClose }) {
  const [currentImage, setCurrentImage] = useState(0);

  const images = project?.images?.length
    ? project.images
    : project?.image
    ? [project.image]
    : [];

  const tags = project?.tags || [];

  // Bloquear el scroll del fondo mientras el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    setCurrentImage(0);
  }, [project]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") nextImage();
      if (event.key === "ArrowLeft") previousImage();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentImage, images.length]);

  function nextImage() {
    if (images.length <= 1) return;
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  function previousImage() {
    if (images.length <= 1) return;
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  if (!project) return null;

  return (
    <div
      className="projectModalOverlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="projectModal"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="modalHeader">
          <div className="modalHeaderInfo">
            {project.category && (
              <span className={`modalCategory ${project.accent || "purple"}`}>
                {project.category}
              </span>
            )}
            <h2 id="modal-title">{project.title}</h2>
          </div>

          <button
            className="modalClose"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Galería principal */}
        {images.length > 0 && (
          <div className="modalImageWrapper">
            <div className="modalImageContainer">
              <img
                src={images[currentImage]}
                alt={`${project.title} - captura ${currentImage + 1}`}
                className="modalMainImage"
              />

              {/* Contador Flotante sobre la imagen */}
              {images.length > 1 && (
                <div className="galleryCounterPill">
                  <span>{currentImage + 1}</span> / <span>{images.length}</span>
                </div>
              )}

              {/* Controles de navegación */}
              {images.length > 1 && (
                <>
                  <button
                    className="galleryArrow galleryArrowLeft"
                    onClick={previousImage}
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <button
                    className="galleryArrow galleryArrowRight"
                    onClick={nextImage}
                    aria-label="Siguiente imagen"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Miniaturas (Solo si hay más de 1 imagen) */}
            {images.length > 1 && (
              <div className="galleryThumbnails">
                {images.map((image, index) => (
                  <button
                    key={image + index}
                    className={`galleryThumbnail ${
                      currentImage === index ? "active" : ""
                    }`}
                    onClick={() => setCurrentImage(index)}
                    aria-label={`Ver imagen ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`Miniatura ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contenido / Información */}
        <div className="modalContent">
          {project.description && (
            <p className="modalDescription">{project.description}</p>
          )}

          {tags.length > 0 && (
            <div className="modalTags">
              {tags.map((tag) => (
                <span key={tag} className="modalTag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {project.link && project.link !== "#" && (
            <div className="modalFooter">
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`modalProjectLink ${project.accent || "purple"}`}
              >
                <span>Ver proyecto</span>
                <ExternalLink size={16} className="linkIcon" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectModal;