import Link from "next/link";
import { getWork } from "@/data/work";
import { site } from "@/data/projects";
import styles from "./Featured.module.css";

// The projects previewed when you scroll down the home page, in order.
// "image" or "video" overrides the project's cover just for this preview.
const FEATURED = [
  { slug: "ratronics" },
  { slug: "experience-in-space", image: "/work/experience-in-space/color-room.jpg" },
  { slug: "lg-wonder-box", video: "/projects/lg-wonder-box.mp4" },
  { slug: "saligia", image: "/work/saligia/greed.gif" },
  { slug: "memory-bubble-store", image: "/work/memory-bubble-store/mbs_image4.jpg" },
];

// A taste of what's on Instagram: each tile opens its post ("href") or the profile.
const POSTS = [
  { video: "/work/itp-camp/making-of.mp4", poster: "/work/itp-camp/painted.jpg", label: "3D printing" },
  { video: "/work/itp-camp/moth.mp4", label: "Character sculpts" },
  { video: "/work/reel-3d-printing.mp4", href: "https://www.instagram.com/reel/DdxhZ1jA_5S/", label: "Reels" },
  { video: "/work/itp-camp/alien.mp4", label: "3D renders" },
];

export default function Featured() {
  const projects = FEATURED.map((f) => ({ ...f, project: getWork(f.slug) })).filter((f) => f.project);

  return (
    <>
      <section id="work" className={styles.section}>
        <div className={styles.head}>
          <h2 className={styles.heading}>Projects</h2>
          <p className={styles.lede}>A few projects I&apos;m proud of — brand systems, campaigns and stories people can hold.</p>
        </div>

        <ol className={styles.list}>
          {projects.map(({ project, image, video }, i) => (
            <li
              key={project.slug}
              className={`${styles.item} ${i % 2 ? styles.flip : ""}`}
              style={{ "--project": project.color, "--accent": project.accent }}
            >
              <Link href={`/work/${project.slug}`} className={styles.media} aria-label={`View ${project.title}`}>
                {video ? (
                  <video src={video} poster={project.hero.src} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image || project.hero.src} alt="" loading="lazy" />
                )}
              </Link>

              <div className={styles.text}>
                <span className={styles.number}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className={styles.title}>{project.title}</h3>
                <p className={styles.subtitle}>{project.subtitle}</p>
                <p className={styles.intro}>{project.intro[0]}</p>
                <ul className={styles.tags}>
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <Link href={`/work/${project.slug}`} className={styles.button}>
                  View project <span aria-hidden="true">→</span>
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.insta} aria-labelledby="insta-heading">
        <div className={styles.head}>
          <h2 id="insta-heading" className={styles.heading}>Lately</h2>
          <p className={styles.lede}>
            Reels, 3D printing projects and more —{" "}
            <a href={`https://www.instagram.com/${site.instagram}/`} target="_blank" rel="noopener noreferrer">
              follow along on Instagram
            </a>
            .
          </p>
        </div>
        <ul className={styles.posts}>
          {POSTS.map((post) => (
            <li key={post.video}>
              <a href={post.href || `https://www.instagram.com/${site.instagram}/`} target="_blank" rel="noopener noreferrer" className={styles.post}>
                <video src={post.video} poster={post.poster} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
                <span className={styles.postLabel}>{post.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <a href={`https://www.instagram.com/${site.instagram}/`} target="_blank" rel="noopener noreferrer" className={styles.handle}>
          @{site.instagram} <span aria-hidden="true">↗</span>
        </a>
      </section>

      <footer className={styles.footer}>
        <p className={styles.cta}>Let&apos;s make something people remember.</p>
        <div className={styles.contact}>
          <a href={`mailto:${site.email}`} className={styles.contactPrimary}>
            Email me
          </a>
          <a href={`https://www.instagram.com/${site.instagram}/`} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </div>
        <p className={styles.small}>© {new Date().getFullYear()} {site.name}</p>
      </footer>
    </>
  );
}
