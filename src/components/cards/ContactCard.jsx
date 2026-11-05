function ContactCard({ icon, title, value, link }) {
  return (
    <a href={link}>
      <span>{icon}</span>

      <div>
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    </a>
  );
}

export default ContactCard;