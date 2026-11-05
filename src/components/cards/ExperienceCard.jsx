function ExperienceCard({ experience }) {
  return (
    <article>
      <h3>{experience.title}</h3>
      <p>{experience.description}</p>
      <span>{experience.date}</span>
    </article>
  );
}

export default ExperienceCard;