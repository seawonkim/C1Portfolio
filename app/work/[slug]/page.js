import Link from "next/link";
import { notFound } from "next/navigation";
import { getWork, work } from "@/data/work";
import { site } from "@/data/projects";
import styles from "./work.module.css";

// Only the slugs listed in data/work.js exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return work.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getWork(slug);
  if (!project) return {};
  return {
    title: `${project.title} — ${site.name}`,
    description: project.intro[0],
  };
}

// 12-point sticker shape for the "next project" button.
const BURST = Array.from({ length: 24 }, (_, i) => {
  const r = i % 2 ? 38 : 48;
  const a = (i / 24) * Math.PI * 2;
  return `${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)}`;
}).join(" L");

function Burst({ color }) {
  return (
    <svg viewBox="0 0 100 100" className={styles.burst} aria-hidden="true">
      <path
        fill={color}
        d={`M${BURST} Z`}
      />
      <path d="M38 62l24-24M44 38h18v18" fill="none" stroke="#1e1c24" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// One row of a gallery: a full-width image, images side by side, a centred image, small sprites, or a video.
function Row({ row }) {
  if (row.type === "video") {
    return (
      <figure className={`${styles.full} ${styles.video}`}>
        <video src={row.src} poster={row.poster} controls playsInline preload="none" />
      </figure>
    );
  }
  if (row.type === "smalls") {
    return (
      <div className={`${styles.smalls} ${row.pixel ? styles.pixel : ""}`}>
        {row.items.map((item) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={item.src} src={item.src} alt={item.alt} loading="lazy" />
        ))}
      </div>
    );
  }
  if (row.type === "cols") {
    return (
      <div className={styles.cols} style={{ "--cols": row.items.length }}>
        {row.items.map((item) => (
          <figure key={item.src} className={styles.frame}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.src} alt={item.alt} loading="lazy" />
          </figure>
        ))}
      </div>
    );
  }
  return (
    <figure className={`${styles.full} ${row.type === "center" ? styles.center : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={row.src} alt={row.alt} loading="lazy" />
    </figure>
  );
}

export default async function WorkPage({ params }) {
  const { slug } = await params;
  const project = getWork(slug);
  if (!project) notFound();
  const next = getWork(project.next);

  return (
    <div className={styles.page} style={{ "--project": project.color, "--accent": project.accent }}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.home}>
          {site.name}
        </Link>
        <Link href="/" className={styles.back}>
          ← Back to the web
        </Link>
      </header>

      <main className={styles.main}>
        <div className={`${styles.hero} ${project.hero.fit === "contain" ? styles.heroContain : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.hero.src} alt={project.hero.alt || `${project.title} cover`} />
        </div>

        {project.afterHero && (
          <div className={styles.afterHero}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.afterHero.src} alt={project.afterHero.alt || ""} />
          </div>
        )}

        <section className={styles.info}>
          <h1 className={styles.title}>{project.title}</h1>
          <p className={styles.subtitle}>{project.subtitle}</p>

          <dl className={styles.meta}>
            {project.meta.map((m) => (
              <div key={m.label}>
                <dt>{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>

          <ul className={styles.tags}>
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>

          <div className={styles.intro}>
            {project.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {project.links && (
            <div className={styles.links}>
              {project.links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}
        </section>

        {project.sections.map((section, i) => (
          <section key={section.title} className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.number}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                {[].concat(section.text || []).map((p, j) => (
                  <p key={j} className={styles.sectionText}>
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className={styles.bullets}>
                    {section.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {section.rows && (
              <div className={styles.gallery}>
                {section.rows.map((row, j) => (
                  <Row key={j} row={row} />
                ))}
              </div>
            )}
          </section>
        ))}

        {next && (
          <Link href={`/work/${next.slug}`} className={styles.next} style={{ "--next": next.accent }}>
            <span className={styles.nextLabel}>Next project</span>
            <span className={styles.nextTitle}>{next.title}</span>
            <Burst color={next.color} />
          </Link>
        )}
      </main>
    </div>
  );
}
