import ContactInfo from "./ContactInfo";
import ContactForm from "./ContactForm";
import "../../styles/pages/contact.css";

function Contact() {
  return (
    <section className="contactSection">
      <div className="contactGrid">
        <ContactInfo />
        <ContactForm />
      </div>
    </section>
  );
}

export default Contact;