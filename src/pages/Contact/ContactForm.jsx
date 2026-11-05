import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";

function ContactForm() {
  const [status, setStatus] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus("Sending...");

    try {
      const response = await fetch(
        "https://formspree.io/f/mjygywrb",
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json"
          }
        }
      );

      if (response.ok) {
        setStatus("Message sent successfully!");
        form.reset();
      } else {
        setStatus("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setStatus("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="contactCard formCard">
      <div className="formBadge">
        <MessageSquare size={16} />
        SEND A MESSAGE
      </div>

      <h2 className="formTitle">
        Drop me a line
      </h2>

      <p className="formSubtitle">
        Fill out the form below and I'll get back to you as soon as possible.
      </p>

      <form
        onSubmit={handleSubmit}
        className="contactForm"
      >
        <div className="formRow">

          <div className="inputGroup">
            <label htmlFor="name">
              Name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder="Your name"
              required
            />
          </div>

          <div className="inputGroup">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              required
            />
          </div>

        </div>

        <div className="inputGroup">
          <label htmlFor="subject">
            Subject
          </label>

          <input
            id="subject"
            type="text"
            name="subject"
            placeholder="What's this about?"
            required
          />
        </div>

        <div className="inputGroup">
          <label htmlFor="message">
            Message
          </label>

          <textarea
            id="message"
            name="message"
            rows="4"
            placeholder="Type your message here..."
            required
          />
        </div>

        <button
          type="submit"
          className="submitBtn"
        >
          <Send size={16} />
          Send Message
        </button>

        {status && (
          <p className="formStatus">
            {status}
          </p>
        )}
      </form>
    </div>
  );
}

export default ContactForm;