import { profile } from "@/data/content";

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero-shapes" aria-hidden="true">
        <span className="shape shape-circle" />
        <span className="shape shape-square" />
        <span className="shape shape-pill" />
      </div>
      <div className="container hero-inner">
        {profile.available && (
          <p className="badge">
            <span className="dot" /> Open to new opportunities
          </p>
        )}
        <h1 className="hero-title">
          Hi, I&apos;m {profile.name}.
          <br />
          <span className="highlight">{profile.headline}</span>
        </h1>
        <p className="hero-sub">
          {profile.title} based in {profile.location}
        </p>
        <div className="hero-actions">
          <a href="#work" className="btn btn-primary">
            See my work
          </a>
          <a href="#contact" className="btn btn-outline">
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
}
