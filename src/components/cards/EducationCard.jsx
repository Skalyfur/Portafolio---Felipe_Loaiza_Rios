function EducationCard({ education }) {
  return (
    <article>
      <h3>{education.title}</h3>
      <p>{education.institution}</p>
      <span>{education.date}</span>
    </article>
  );
}

export default EducationCard;