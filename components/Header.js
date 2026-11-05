import { profile } from "@/data/content";

const links = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <a href="#top" className="logo" aria-label="Back to top">
          {profile.initials}
        </a>
        <nav className="nav">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
