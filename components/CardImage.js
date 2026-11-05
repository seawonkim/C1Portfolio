"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CardImage.module.css";

const SLIDE_MS = 2800;

// Shows the project image, or a striped placeholder if there is none yet (or the file is missing).
// Projects with extra images play them as a crossfading slideshow.
export default function CardImage({ project, index }) {
  const [failed, setFailed] = useState(false);
  const [broken, setBroken] = useState([]);
  const [current, setCurrent] = useState(0);
  const seen = useRef(1);
  const imgRef = useRef(null);
  const images = project.image ? [project.image, ...(project.more || [])].filter((src) => !broken.includes(src)) : [];
  const count = images.length;

  // The image can fail before React is listening, so check once after mounting too.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  useEffect(() => {
    // Plays for everyone (even with "reduce motion" on): it's a slow, gentle crossfade.
    if (count < 2) return;
    let timer = 0;
    // Stagger the cards so they don't all change at the same moment.
    const delay = setTimeout(() => {
      timer = setInterval(() => setCurrent((c) => (c + 1) % count), SLIDE_MS);
    }, 2500 + index * 600);
    return () => {
      clearTimeout(delay);
      clearInterval(timer);
    };
  }, [count, index]);

  if (!count || failed) return <span className={styles.placeholder}>{project.title}</span>;

  if (project.video) {
    return (
      <video
        src={project.video}
        poster={project.image}
        className={styles.image}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
    );
  }

  // Only load a slide when it is about to be shown.
  const active = current % count;
  seen.current = Math.min(count, Math.max(seen.current, active + 2));

  return (
    <>
      {images.slice(0, seen.current).map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          ref={i === 0 ? imgRef : undefined}
          src={src}
          alt=""
          draggable={false}
          className={`${styles.image} ${styles.slide} ${i === active ? styles.active : ""}`}
          onError={() => (i === 0 ? setFailed(true) : setBroken((b) => [...b, src]))}
        />
      ))}
      {count > 1 && (
        <span className={styles.dots} aria-hidden="true">
          {images.map((src, i) => (
            <span key={src} className={i === active ? styles.dotOn : styles.dot} />
          ))}
        </span>
      )}
    </>
  );
}
