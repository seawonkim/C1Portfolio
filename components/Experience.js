import { experience, education, skills, resumeUrl } from "@/data/content";

export default function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container">
        <p className="eyebrow">Background</p>
        <div className="experience-head">
          <h2 className="section-title">Experience</h2>
          <a href={resumeUrl} className="btn btn-primary" download>
            Download resume
          </a>
        </div>

        <div className="experience-grid">
          <ol className="timeline">
            {experience.map((job, i) => (
              <li key={i} className="timeline-item">
                <p className="timeline-dates">{job.dates}</p>
                <h3 className="timeline-role">{job.role}</h3>
                <p className="timeline-company">{job.company}</p>
                <ul className="timeline-highlights">
                  {job.highlights.map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <aside className="side-panels">
            <div className="panel panel-yellow">
              <h3 className="panel-title">Education</h3>
              {education.map((ed, i) => (
                <div key={i} className="panel-item">
                  <p className="panel-strong">{ed.degree}</p>
                  <p>{ed.school}</p>
                  <p className="panel-muted">{ed.dates}</p>
                </div>
              ))}
            </div>
            <div className="panel panel-blue">
              <h3 className="panel-title">Skills</h3>
              <ul className="tags tags-light">
                {skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
