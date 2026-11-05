import Image from "next/image";
import { projects } from "@/data/content";

export default function Projects() {
  return (
    <section id="work" className="section">
      <div className="container">
        <p className="eyebrow">Selected work</p>
        <h2 className="section-title">Projects</h2>
        <div className="project-grid">
          {projects.map((project, i) => (
            <a
              key={project.title + i}
              href={project.link}
              className={`project-card card-${project.color}`}
            >
              <div className="project-visual">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 800px) 100vw, 50vw"
                  />
                ) : (
                  <div className="project-placeholder" aria-hidden="true">
                    <span className="ph-number">0{i + 1}</span>
                    <span className="ph-circle" />
                    <span className="ph-bar" />
                  </div>
                )}
              </div>
              <div className="project-body">
                <div className="project-meta">
                  <span>{project.role}</span>
                  <span>{project.year}</span>
                </div>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-summary">{project.summary}</p>
                <p className="project-outcome">{project.outcome}</p>
                <ul className="tags">
                  {project.tools.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
                <span className="project-link">View case study →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
