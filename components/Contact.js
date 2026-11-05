import { contact, profile } from "@/data/content";

export default function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="container contact-inner">
        <p className="eyebrow eyebrow-dark">Contact</p>
        <h2 className="contact-title">Let&apos;s make something great together.</h2>
        <a href={`mailto:${contact.email}`} className="contact-email">
          {contact.email}
        </a>
        <ul className="social">
          {contact.links.map((link) => (
            <li key={link.label}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>
        <p className="footer-note">
          © {new Date().getFullYear()} {profile.name}. Designed and built with care.
        </p>
      </div>
    </section>
  );
}
