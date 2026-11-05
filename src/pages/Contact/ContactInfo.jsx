import { socialLinks } from "../../data/socialLinks";
import ContactItem from "./ContactItem";

function ContactInfo() {
  return (
    <div className="contactCard infoCard">
      <div className="sectionBadge">
        <span className="badgeLine" /> GET IN TOUCH
      </div>

      <h1 className="contactTitle">
        Let's <span className="gradientText">Connect</span>
      </h1>

      <p className="contactDescription">
        Have a project in mind, a question or just want to say hi? I'll be happy to get back to you.
      </p>

      <div className="contactItemsList">
        {socialLinks.map((item) => (
          <ContactItem
            key={item.id}
            icon={item.icon}
            title={item.title}
            value={item.value}
            link={item.link}
            accent={item.accent}
          />
        ))}
      </div>
    </div>
  );
}

export default ContactInfo;