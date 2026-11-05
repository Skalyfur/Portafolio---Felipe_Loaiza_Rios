import { Mail, MapPin, ArrowRight } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";

const iconMap = {
  Mail: <Mail size={18} />,
  Github: <FaGithub size={18} />,
  Linkedin: <FaLinkedin size={18} />,
  MapPin: <MapPin size={18} />
};

function ContactItem({ icon, title, value, link, accent = "purple" }) {
  return (
    <a
      href={link}
      target={link.startsWith("http") ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className="contactItemCard"
    >
      <div className={`contactItemIcon ${accent}`}>
        {iconMap[icon] || <Mail size={18} />}
      </div>
      
      <div className="contactItemDetails">
        <span className="contactItemTitle">{title}</span>
        <span className="contactItemValue">{value}</span>
      </div>

      <ArrowRight size={16} className="contactItemArrow" />
    </a>
  );
}

export default ContactItem;