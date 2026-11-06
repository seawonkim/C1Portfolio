"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { site, webProjects } from "@/data/projects";
import CardImage from "./CardImage";
import styles from "./Desk.module.css";

const NAME = ["SEAWON", "KIM"];
const SKILLS = ["Branding", "Packaging", "Campaigns", "Social & Digital", "Illustration", "Motion", "Game Art"];

// Where each piece lands on the desk ("mess"), as fractions of the screen, plus a tilt in degrees.
const MESS_WIDE = [
  { x: 0.015, y: 0.08, r: -6 },
  { x: 0.775, y: 0.07, r: 5 },
  { x: 0.02, y: 0.57, r: 4 },
  { x: 0.265, y: 0.6, r: -4 },
  { x: 0.51, y: 0.57, r: 5 },
  { x: 0.765, y: 0.555, r: -5 },
];
const MESS_NARROW = [
  { x: 0.03, y: 0.34, r: -5 },
  { x: 0.53, y: 0.33, r: 4 },
  { x: 0.05, y: 0.5, r: 3 },
  { x: 0.51, y: 0.49, r: -4 },
  { x: 0.03, y: 0.655, r: 3 },
  { x: 0.53, y: 0.65, r: -3 },
];

// Washi tape colors, angles and positions, one per piece (repeats if there are more pieces)
const TAPES = [
  { color: "rgba(255, 214, 64, 0.8)", rot: -4, x: -6 },
  { color: "rgba(255, 128, 170, 0.75)", rot: 3, x: 8 },
  { color: "rgba(96, 160, 255, 0.7)", rot: -2, x: 0 },
  { color: "rgba(110, 214, 170, 0.75)", rot: 5, x: -10 },
  { color: "rgba(255, 150, 80, 0.75)", rot: -6, x: 6 },
  { color: "rgba(176, 140, 255, 0.72)", rot: 2, x: -4 },
  { color: "rgba(166, 210, 80, 0.78)", rot: -3, x: 10 },
];

const TIDY_TILT = [-2, 1.5, -1, 2, -1.5, 1];

const FRICTION = 0.92;
const SPRING = 0.12;
const TICKER_H = 44;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export default function Desk() {
  const deskRef = useRef(null);
  const letterRefs = useRef([]);
  const cardRefs = useRef([]);
  // Start neat so every project is visible at first glance; "Make a mess" is the playful extra.
  const modeRef = useRef("tidy");
  const [mode, setMode] = useState("tidy");
  const router = useRouter();

  useEffect(() => {
    const desk = deskRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let narrow = false;
    let raf = 0;
    let zTop = 10;
    const start = performance.now();
    const pointer = { x: -9999, y: -9999, active: false };
    let drag = null;

    // ---- Pieces of work on the desk ----
    const items = webProjects.map((_, i) => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: 0,
      vr: 0,
      w: 0,
      h: 0,
      scale: 1,
      target: null, // { x, y, r, scale } while gliding into place
      el: null,
      i,
    }));

    function layout(first) {
      const rect = desk.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      narrow = W < 700;
      const cardW = narrow ? Math.min(180, W * 0.44) : Math.min(310, W * (W < 1100 ? 0.27 : 0.2), H * 0.34);
      desk.style.setProperty("--card-w", `${Math.round(cardW)}px`);
      items.forEach((it, i) => {
        it.el = cardRefs.current[i];
        if (it.el) {
          it.w = it.el.offsetWidth;
          it.h = it.el.offsetHeight;
        }
      });
      const targets = modeRef.current === "tidy" ? tidyTargets() : messTargets();
      items.forEach((it, i) => {
        if (first) {
          // Drop in from above the screen, one after another
          it.x = targets[i].x;
          it.y = -it.h - 80 - i * 60;
          it.r = targets[i].r * 3;
          it.target = { ...targets[i], delay: reduceMotion ? 0 : 80 + i * 55 };
          if (reduceMotion) Object.assign(it, targets[i], { target: null });
        } else {
          it.target = { ...targets[i] };
        }
      });
    }

    function messTargets() {
      const spots = narrow ? MESS_NARROW : MESS_WIDE;
      // Where the name + description end, so the lower cards never cover the text
      const role = desk.querySelector(`.${styles.role}`);
      const textBottom = role ? role.getBoundingClientRect().bottom - desk.getBoundingClientRect().top + 16 : H * 0.5;
      const lowerSpots = spots.filter((s) => s.y > 0.25);
      const firstLower = Math.min(...lowerSpots.map((s) => s.y));
      return items.map((it, i) => {
        const s = spots[i % spots.length];
        let y = s.y * H;
        if (s.y > 0.25) {
          // Keep the same staggering, but start the lower rows below the text
          y = Math.max(y, textBottom + (s.y - firstLower) * H);
          // Stay above the ticker, but never move back up over the text
          y = Math.max(textBottom, Math.min(y, H - TICKER_H - it.h - 12));
        } else {
          y = clamp(y, 60, H - TICKER_H - it.h - 12);
        }
        return { x: clamp(s.x * W, 8, W - it.w - 8), y, r: s.r, scale: 1 };
      });
    }

    function tidyTargets() {
      const n = items.length;
      const maxCols = narrow ? 2 : 3;
      // Split the pieces into evenly sized rows (7 -> 3 + 4, never 3 + 3 + 1),
      // with the shorter rows first so nothing is left alone at the end.
      const rowCount = Math.ceil(n / maxCols);
      const small = Math.floor(n / rowCount);
      const bigRows = n % rowCount;
      const rowSizes = Array.from({ length: rowCount }, (_, r) => (r < rowCount - bigRows ? small : small + 1));
      const cols = Math.max(...rowSizes);

      const head = desk.querySelector(`.${styles.intro}`);
      const top = head ? head.getBoundingClientRect().bottom - desk.getBoundingClientRect().top + (narrow ? 22 : 30) : H * 0.4;
      // On wide screens the grid sits between the side buttons, so it can use that height too
      const bottom = H - TICKER_H - (narrow ? 70 : W >= 1100 ? 18 : 76);
      const gap = narrow ? 12 : 20;
      const cellW = (W - gap * (cols + 1)) / cols;
      const cellH = (bottom - top - gap * (rowCount - 1)) / rowCount;
      const base = items[0];
      const scale = Math.min(1.6, cellW / base.w, cellH / base.h);
      const cardW = base.w * scale;
      const cardH = base.h * scale;

      const spots = [];
      rowSizes.forEach((size, row) => {
        const rowW = size * cardW + (size - 1) * gap;
        const left = (W - rowW) / 2; // each row is centred on its own
        for (let c = 0; c < size; c++) {
          spots.push({ cx: left + c * (cardW + gap) + cardW / 2, cy: top + row * (cardH + gap) + cardH / 2 });
        }
      });
      // Positions are for the unscaled card; scaling happens around the card's centre.
      // A slight hand-placed tilt so the neat layout still feels like prints on a desk
      return items.map((it, i) => ({ x: spots[i].cx - it.w / 2, y: spots[i].cy - it.h / 2, r: TIDY_TILT[i % TIDY_TILT.length], scale }));
    }

    // ---- Kinetic name ----
    const letters = letterRefs.current.filter(Boolean).map((el) => ({ el, wght: 520, wdth: 58 }));

    function animateLetters(t) {
      const radius = Math.max(220, W * 0.32);
      letters.forEach((L, i) => {
        const rect = L.el.getBoundingClientRect();
        const deskRect = desk.getBoundingClientRect();
        const cx = rect.left + rect.width / 2 - deskRect.left;
        const cy = rect.top + rect.height / 2 - deskRect.top;
        let f;
        if (pointer.active) {
          const d = Math.hypot(pointer.x - cx, pointer.y - cy);
          f = Math.max(0, 1 - d / radius);
          f = f * f * (3 - 2 * f);
        } else {
          // Thin and narrow at rest so the cards never cover it, with a faint ripple
          f = reduceMotion ? 0 : 0.05 + 0.05 * Math.sin(t * 1.4 - i * 0.55);
        }
        const wght = 520 + 380 * f;
        const wdth = 58 + 82 * f;
        L.wght += (wght - L.wght) * 0.14;
        L.wdth += (wdth - L.wdth) * 0.14;
        L.el.style.fontVariationSettings = `"wght" ${L.wght.toFixed(0)}, "wdth" ${clamp(L.wdth, 50, 150).toFixed(1)}`;
        L.el.classList.toggle(styles.hot, pointer.active && f > 0.62);
      });
    }

    // ---- Physics ----
    function step(now) {
      items.forEach((it) => {
        if (drag && drag.item === it) return;
        if (it.target) {
          if (it.target.delay && now - start < it.target.delay) return;
          const T = it.target;
          it.vx = (it.vx + (T.x - it.x) * SPRING) * 0.72;
          it.vy = (it.vy + (T.y - it.y) * SPRING) * 0.72;
          it.vr = (it.vr + (T.r - it.r) * SPRING) * 0.72;
          it.x += it.vx;
          it.y += it.vy;
          it.r += it.vr;
          it.scale += ((T.scale ?? 1) - it.scale) * 0.15;
          if (Math.abs(T.x - it.x) < 0.5 && Math.abs(T.y - it.y) < 0.5 && Math.abs(it.vx) + Math.abs(it.vy) < 0.3) {
            Object.assign(it, { x: T.x, y: T.y, r: T.r, scale: T.scale ?? 1, vx: 0, vy: 0, vr: 0, target: null });
          }
          return;
        }
        // Tossed: slide to a stop and bounce off the edges of the desk
        it.x += it.vx;
        it.y += it.vy;
        it.r += it.vr;
        it.vx *= FRICTION;
        it.vy *= FRICTION;
        it.vr *= 0.9;
        const maxX = W - it.w * 0.35;
        const minX = -it.w * 0.65;
        const minY = 48;
        const maxY = H - TICKER_H - it.h * 0.4;
        if (it.x < minX || it.x > maxX) {
          it.x = clamp(it.x, minX, maxX);
          it.vx *= -0.5;
        }
        if (it.y < minY || it.y > maxY) {
          it.y = clamp(it.y, minY, maxY);
          it.vy *= -0.5;
        }
      });
    }

    function render() {
      items.forEach((it) => {
        if (!it.el) return;
        it.el.style.transform = `translate3d(${it.x}px, ${it.y}px, 0) rotate(${it.r}deg) scale(${it.scale})`;
      });
    }

    function frame(now) {
      const t = (now - start) / 1000;
      step(now);
      render();
      animateLetters(t);
      raf = requestAnimationFrame(frame);
    }

    // ---- Pointer ----
    const local = (e) => {
      const r = desk.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    function onMove(e) {
      const p = local(e);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.active = e.pointerType === "mouse" || !!drag;
      if (!drag) return;
      const it = drag.item;
      const nx = p.x - drag.offX;
      const ny = p.y - drag.offY;
      it.vx = it.vx * 0.5 + (nx - it.x) * 0.5;
      it.vy = it.vy * 0.5 + (ny - it.y) * 0.5;
      it.x = nx;
      it.y = ny;
      it.r += (clamp(it.vx * 0.6, -14, 14) - it.r) * 0.2;
      if (Math.hypot(p.x - drag.sx, p.y - drag.sy) > 6) drag.moved = true;
    }

    function onLeave() {
      pointer.active = false;
    }

    function onCardDown(e) {
      const i = Number(e.currentTarget.dataset.index);
      const it = items[i];
      const p = local(e);
      it.target = null;
      drag = { item: it, offX: p.x - it.x, offY: p.y - it.y, sx: p.x, sy: p.y, moved: false, time: performance.now() };
      it.el.style.zIndex = String(++zTop);
      it.el.classList.add(styles.lifted);
      e.currentTarget.setPointerCapture(e.pointerId);
      if (modeRef.current === "tidy") {
        modeRef.current = "mess";
        setMode("mess");
      }
    }

    function onCardUp(e) {
      if (!drag) return;
      const { item, moved, time } = drag;
      item.el.classList.remove(styles.lifted);
      // Cap the throw so a fast flick slides the piece instead of flinging it off the desk
      item.vx = clamp(item.vx, -32, 32);
      item.vy = clamp(item.vy, -32, 32);
      item.vr = clamp(item.vx * 0.4, -10, 10);
      drag = null;
      if (!moved && performance.now() - time < 400) {
        item.vx = item.vy = item.vr = 0;
        router.push(webProjects[item.i].link);
      }
    }

    // Mouse/touch clicks are handled on pointerup; keyboard Enter still follows the link.
    function onCardClick(e) {
      if (e.detail !== 0) e.preventDefault();
    }

    // The "Tidy up" button tells the desk which arrangement to glide to.
    function onArrange(e) {
      modeRef.current = e.detail;
      const targets = e.detail === "tidy" ? tidyTargets() : messTargets();
      items.forEach((it, i) => {
        it.target = { ...targets[i] };
      });
    }

    layout(true);
    raf = requestAnimationFrame(frame);
    // Re-measure once the fonts have loaded (the name's height can change)
    document.fonts?.ready.then(() => layout(false));
    const ro = new ResizeObserver(() => layout(false));
    ro.observe(desk);
    desk.addEventListener("pointermove", onMove);
    desk.addEventListener("pointerleave", onLeave);
    desk.addEventListener("arrange", onArrange);
    const cards = cardRefs.current.filter(Boolean);
    cards.forEach((el) => {
      el.addEventListener("pointerdown", onCardDown);
      el.addEventListener("pointerup", onCardUp);
      el.addEventListener("pointercancel", onCardUp);
      el.addEventListener("click", onCardClick);
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      desk.removeEventListener("pointermove", onMove);
      desk.removeEventListener("pointerleave", onLeave);
      desk.removeEventListener("arrange", onArrange);
      cards.forEach((el) => {
        el.removeEventListener("pointerdown", onCardDown);
        el.removeEventListener("pointerup", onCardUp);
        el.removeEventListener("pointercancel", onCardUp);
        el.removeEventListener("click", onCardClick);
      });
    };
  }, [router]);

  function toggleMode() {
    const next = modeRef.current === "tidy" ? "mess" : "tidy";
    modeRef.current = next;
    setMode(next);
    deskRef.current.dispatchEvent(new CustomEvent("arrange", { detail: next }));
  }

  let letterIndex = 0;

  return (
    <section ref={deskRef} className={styles.desk}>
      <header className={styles.top}>
        <Link href="/" className={styles.mark}>
          <span>{site.name}</span>
        </Link>
        <nav className={styles.nav}>
          <a href={`mailto:${site.email}`}>Email</a>
          <a href={`https://www.instagram.com/${site.instagram}/`} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </nav>
      </header>

      <div className={styles.intro}>
        <h1 className={styles.name} aria-label={NAME.join(" ")}>
          {NAME.map((word) => (
            <span key={word} className={styles.word} aria-hidden="true">
              {word.split("").map((ch) => {
                const k = letterIndex++;
                return (
                  <span key={k} ref={(el) => (letterRefs.current[k] = el)} className={styles.letter}>
                    {ch}
                  </span>
                );
              })}
            </span>
          ))}
        </h1>
        <p className={styles.role}>
          <strong>Graphic Designer & Marketer</strong>
          <span>Brand identities, packaging and campaigns that people want to pick up.</span>
        </p>
      </div>

      {webProjects.map((project, i) => (
        <a
          key={project.title}
          ref={(el) => (cardRefs.current[i] = el)}
          data-index={i}
          href={project.link}
          className={styles.card}
          style={{
            "--tape": TAPES[i % TAPES.length].color,
            "--tape-rot": `${TAPES[i % TAPES.length].rot}deg`,
            "--tape-x": `${TAPES[i % TAPES.length].x}%`,
          }}
          aria-label={`${project.title}, ${project.tag}`}
          draggable={false}
        >
          <span className={styles.lift}>
            <span className={styles.tape} aria-hidden="true" />
            <span className={styles.frame}>
              <CardImage project={project} index={i} />
            </span>
            <span className={styles.label}>
              <span className={styles.title}>{project.title}</span>
              <span className={styles.tag}>{project.tag}</span>
            </span>
          </span>
        </a>
      ))}

      <div className={styles.controls}>
        <span className={styles.left}>
          <a href="#work" className={styles.scrollCue}>
            See projects <span aria-hidden="true">↓</span>
          </a>
        </span>
        <button type="button" className={styles.tidy} onClick={toggleMode} aria-pressed={mode === "tidy"}>
          {mode === "tidy" ? "Make a mess ✺" : "Tidy up ▦"}
        </button>
      </div>

      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.track}>
          {[0, 1].map((copy) => (
            <span key={copy} className={styles.run}>
              {SKILLS.map((s) => (
                <span key={s}>
                  {s} <b>✦</b>{" "}
                </span>
              ))}
              {SKILLS.map((s) => (
                <span key={`${s}-2`}>
                  {s} <b>✦</b>{" "}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
