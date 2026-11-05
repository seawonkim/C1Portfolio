"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { site, webProjects } from "@/data/projects";
import styles from "./SpiderWeb.module.css";
import { createSpider } from "./spider";
import CardImage from "./CardImage";

// ---- Web shape ----
const SPOKES = 14;
const SPIDER_ARRIVES = 1.1; // seconds into the intro
const RINGS = 9;

// ---- Physics ----
const ITERATIONS = 8;
const STIFFNESS = 0.6;
const WEB_GRAVITY = 0.012;
const WEB_DAMPING = 0.96;
const CARD_GRAVITY = 0.45;
const CARD_DAMPING = 0.985;
const CARD_INV_MASS = 0.35; // lower = heavier card, pulls the web down more
const PLUCK_RADIUS = 70;

// ---- Intro timing (seconds) ----
const SPOKE_TIME = 1.0;
const RING_START = 0.45;
const RING_GAP = 0.11;
const RING_TIME = 0.35;
const FRAME_START = 0.8;
const FRAME_TIME = 0.5;
const DROP_START = 1.7;
const DROP_GAP = 0.13;
const DROP_TIME = 0.55;

// Where each project tries to hang, as fractions of the screen,
// plus thread length in px.
const LAYOUT_WIDE = [
  { x: 0.18, y: 0.2, len: 40 },
  { x: 0.5, y: 0.18, len: 30 },
  { x: 0.82, y: 0.2, len: 40 },
  { x: 0.18, y: 0.5, len: 40 },
  { x: 0.5, y: 0.52, len: 40 },
  { x: 0.82, y: 0.5, len: 40 },
];
const LAYOUT_NARROW = [
  { x: 0.27, y: 0.19, len: 30 },
  { x: 0.73, y: 0.26, len: 30 },
  { x: 0.27, y: 0.41, len: 30 },
  { x: 0.73, y: 0.48, len: 30 },
  { x: 0.27, y: 0.63, len: 30 },
  { x: 0.73, y: 0.7, len: 30 },
];

const INK = "30, 28, 36";
const ACCENT = "#ff5a36";

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// Small seeded random so the web looks hand-made but stays the same on every load.
function seeded(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function SpiderWeb() {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const spiderCanvasRef = useRef(null);
  const cardRefs = useRef([]);
  const hoverRef = useRef(-1);
  const [ready, setReady] = useState(false);
  const [touchMode, setTouchMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const spiderCanvas = spiderCanvasRef.current;
    const sctx = spiderCanvas.getContext("2d");
    const spider = createSpider();
    let grab = { holding: false, index: -1, foot: null };
    const canHover = window.matchMedia("(hover: hover)").matches;
    setTouchMode(!canHover);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let cx = 0;
    let cy = 0;
    let maxR = 0;
    let nodes = [];
    let links = [];
    let frames = []; // outer node -> pinned edge point
    let cards = [];
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let startTime = performance.now();
    let introDone = reduceMotion;
    let readyShown = false;

    const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, inside: false };
    let drag = null;

    const ringIndex = (ring, spoke) => 1 + (ring - 1) * SPOKES + spoke;

    function makeNode(x, y, extra = {}) {
      return { x, y, px: x, py: y, inv: 1, ...extra };
    }

    function build() {
      const rect = stage.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spiderCanvas.width = canvas.width;
      spiderCanvas.height = canvas.height;
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spider.resize(W, H);

      const narrow = W < 700;
      cx = W / 2;
      cy = H * (narrow ? 0.44 : 0.46);
      maxR = narrow ? Math.min(W * 0.62, H * 0.5) : Math.min(W * 0.46, H * 0.62);
      // Cards scale with the screen so they stay big but never crowd each other.
      const cardW = narrow ? Math.min(150, W * 0.36) : Math.min(300, W * (W < 1100 ? 0.22 : 0.19), H * 0.3);
      stage.style.setProperty("--card-w", `${Math.round(cardW)}px`);

      const rand = seeded(7);
      nodes = [makeNode(cx, cy, { r: 0, ring: 0 })];
      links = [];
      frames = [];

      const angles = [];
      for (let s = 0; s < SPOKES; s++) {
        angles.push((s / SPOKES) * Math.PI * 2 - Math.PI / 2 + (rand() - 0.5) * 0.12);
      }

      for (let i = 1; i <= RINGS; i++) {
        const base = maxR * Math.pow(i / RINGS, 1.12);
        for (let s = 0; s < SPOKES; s++) {
          const r = base * (1 + (rand() - 0.5) * 0.06);
          const a = angles[s];
          nodes.push(makeNode(cx + Math.cos(a) * r, cy + Math.sin(a) * r, { r, ring: i, spoke: s }));
        }
      }

      const link = (a, b) => {
        const A = nodes[a];
        const B = nodes[b];
        links.push({ a, b, rest: Math.hypot(A.x - B.x, A.y - B.y) * 0.97 });
      };

      // Spokes
      for (let s = 0; s < SPOKES; s++) {
        link(0, ringIndex(1, s));
        for (let i = 1; i < RINGS; i++) link(ringIndex(i, s), ringIndex(i + 1, s));
      }
      // Rings
      for (let i = 1; i <= RINGS; i++) {
        for (let s = 0; s < SPOKES; s++) link(ringIndex(i, s), ringIndex(i, (s + 1) % SPOKES));
      }
      // Frame threads: from the outer ring out to the edge of the screen
      for (let s = 0; s < SPOKES; s++) {
        const outer = ringIndex(RINGS, s);
        const dx = Math.cos(angles[s]);
        const dy = Math.sin(angles[s]);
        const pad = 30;
        const tx = dx > 0 ? (W + pad - cx) / dx : dx < 0 ? (-pad - cx) / dx : Infinity;
        const ty = dy > 0 ? (H + pad - cy) / dy : dy < 0 ? (-pad - cy) / dy : Infinity;
        const t = Math.min(tx, ty);
        nodes.push(makeNode(cx + dx * t, cy + dy * t, { inv: 0, pin: true }));
        const pin = nodes.length - 1;
        link(outer, pin);
        frames.push({ outer, pin });
      }

      // Pick a web node for each project to hang from.
      const layout = narrow ? LAYOUT_NARROW : LAYOUT_WIDE;
      const used = new Set();
      cards = webProjects.map((_, k) => {
        const target = layout[k % layout.length];
        const tx = target.x * W;
        const ty = target.y * H;
        let best = -1;
        let bestD = Infinity;
        nodes.forEach((n, idx) => {
          if (n.pin || n.ring < 2 || n.ring > RINGS - 1 || used.has(idx)) return;
          const d = (n.x - tx) ** 2 + (n.y - ty) ** 2;
          if (d < bestD) {
            bestD = d;
            best = idx;
          }
        });
        used.add(best);
        const a = nodes[best];
        const len = target.len;
        const live = introDone;
        const y = live ? a.y + len : a.y;
        return {
          anchor: best,
          x: a.x,
          y,
          px: a.x,
          py: y,
          len: live ? len : 0,
          finalLen: len,
          live,
          dropAt: DROP_START + k * DROP_GAP,
        };
      });
    }

    function solveLink(A, B, rest) {
      const dx = B.x - A.x;
      const dy = B.y - A.y;
      const d = Math.hypot(dx, dy) || 0.0001;
      const sum = A.inv + B.inv;
      if (!sum) return;
      const diff = ((d - rest) / d) * STIFFNESS;
      A.x += dx * diff * (A.inv / sum);
      A.y += dy * diff * (A.inv / sum);
      B.x -= dx * diff * (B.inv / sum);
      B.y -= dy * diff * (B.inv / sum);
    }

    function step(t) {
      if (pendingRelease && hoverRef.current >= 0) {
        const c = cards[hoverRef.current];
        const reach = parseFloat(stage.style.getPropertyValue("--card-w")) || 150;
        if (!pointer.inside || Math.hypot(pointer.x - c.x, pointer.y - (c.y + reach * 0.5)) > reach) {
          hoverRef.current = -1;
          pendingRelease = false;
        }
      }

      // The spider goes after whichever project is being touched (not while it is being dragged).
      const want = drag ? -1 : hoverRef.current;
      const wanted = want >= 0 && cards[want] && cards[want].live ? cards[want] : null;
      grab = spider.update(1 / 60, {
        active: t > SPIDER_ARRIVES,
        target: wanted ? { x: wanted.x, y: wanted.y, index: want } : null,
        lookAt: drag ? cards[drag.index] : pointer.inside ? pointer : null,
      });

      for (const n of nodes) {
        if (n.pin) continue;
        const vx = (n.x - n.px) * WEB_DAMPING;
        const vy = (n.y - n.py) * WEB_DAMPING;
        n.px = n.x;
        n.py = n.y;
        n.x += vx;
        n.y += vy + WEB_GRAVITY;
      }

      cards.forEach((c, k) => {
        if (!c.live) {
          if (t >= c.dropAt) c.live = true;
          else {
            const a = nodes[c.anchor];
            c.x = c.px = a.x;
            c.y = c.py = a.y;
            return;
          }
        }
        if (c.len < c.finalLen) c.len = c.finalLen * easeOut(clamp01((t - c.dropAt) / DROP_TIME));
        if (drag && drag.index === k) return;
        const vx = (c.x - c.px) * CARD_DAMPING;
        const vy = (c.y - c.py) * CARD_DAMPING;
        c.px = c.x;
        c.py = c.y;
        c.x += vx;
        c.y += vy + CARD_GRAVITY;
        if (grab.holding && grab.index === k && grab.foot) {
          c.x += (grab.foot.x - c.x) * 0.3;
          c.y += (grab.foot.y - c.y) * 0.3;
        }
      });

      // Moving the pointer through the web plucks the strands.
      if (pointer.inside && !drag) {
        const speed = Math.hypot(pointer.vx, pointer.vy);
        if (speed > 0.2) {
          for (const n of nodes) {
            if (n.pin) continue;
            const d = Math.hypot(n.x - pointer.x, n.y - pointer.y);
            if (d < PLUCK_RADIUS) {
              const f = (1 - d / PLUCK_RADIUS) * 0.35;
              n.x += pointer.vx * f;
              n.y += pointer.vy * f;
            }
          }
        }
        pointer.vx *= 0.5;
        pointer.vy *= 0.5;
      }

      for (let it = 0; it < ITERATIONS; it++) {
        for (const l of links) solveLink(nodes[l.a], nodes[l.b], l.rest);
        cards.forEach((c, k) => {
          if (!c.live) return;
          const a = nodes[c.anchor];
          const dx = c.x - a.x;
          const dy = c.y - a.y;
          const d = Math.hypot(dx, dy) || 0.0001;
          if (d <= c.len) return; // thread is slack
          const cInv = drag && drag.index === k ? 0 : CARD_INV_MASS;
          const sum = a.inv + cInv;
          const diff = (d - c.len) / d;
          a.x += dx * diff * (a.inv / sum);
          a.y += dy * diff * (a.inv / sum);
          c.x -= dx * diff * (cInv / sum);
          c.y -= dy * diff * (cInv / sum);
        });
      }
    }

    function lineTo(A, B, f = 1) {
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(A.x + (B.x - A.x) * f, A.y + (B.y - A.y) * f);
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";

      // Frame threads (lighter)
      const fp = easeOut(clamp01((t - FRAME_START) / FRAME_TIME));
      if (fp > 0) {
        ctx.beginPath();
        for (const f of frames) lineTo(nodes[f.outer], nodes[f.pin], fp);
        ctx.strokeStyle = `rgba(${INK}, 0.18)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.beginPath();
      // Spokes grow out from the center
      const reach = easeOut(clamp01(t / SPOKE_TIME)) * maxR * 1.02;
      for (let s = 0; s < SPOKES; s++) {
        let prev = nodes[0];
        for (let i = 1; i <= RINGS; i++) {
          const n = nodes[ringIndex(i, s)];
          if (reach >= n.r) lineTo(prev, n);
          else {
            if (reach > prev.r) lineTo(prev, n, (reach - prev.r) / (n.r - prev.r));
            break;
          }
          prev = n;
        }
      }
      // Rings wrap around one after another
      for (let i = 1; i <= RINGS; i++) {
        const p = easeOut(clamp01((t - RING_START - (i - 1) * RING_GAP) / RING_TIME)) * SPOKES;
        if (p <= 0) continue;
        const full = Math.floor(p);
        for (let s = 0; s < full; s++) lineTo(nodes[ringIndex(i, s)], nodes[ringIndex(i, (s + 1) % SPOKES)]);
        if (full < SPOKES) lineTo(nodes[ringIndex(i, full)], nodes[ringIndex(i, (full + 1) % SPOKES)], p - full);
      }
      ctx.strokeStyle = `rgba(${INK}, 0.42)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Project threads
      cards.forEach((c, k) => {
        if (!c.live) return;
        const a = nodes[c.anchor];
        const hovered = hoverRef.current === k;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(c.x, c.y);
        ctx.strokeStyle = hovered ? ACCENT : `rgba(${INK}, 0.75)`;
        ctx.lineWidth = hovered ? 1.6 : 1.2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(a.x, a.y, hovered ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = hovered ? ACCENT : `rgb(${INK})`;
        ctx.fill();
      });
    }

    function placeCards() {
      cards.forEach((c, k) => {
        const el = cardRefs.current[k];
        if (!el) return;
        if (!c.live) {
          el.style.opacity = "0";
          return;
        }
        const a = nodes[c.anchor];
        // Tilt with the thread, but never flip upside-down when lifted above it.
        const angle = Math.max(-1, Math.min(1, Math.atan2(c.x - a.x, c.y - a.y)));
        el.style.opacity = "1";
        el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) translateX(-50%) rotate(${-angle}rad)`;
      });
    }

    function frame(now) {
      const dt = Math.min(now - last, 100);
      last = now;
      const t = introDone ? 99 : (now - startTime) / 1000;
      if (!introDone && t > DROP_START + webProjects.length * DROP_GAP + DROP_TIME + 0.5) introDone = true;
      if (!readyShown && t > DROP_START) {
        readyShown = true;
        setReady(true);
      }

      acc += dt;
      let steps = 0;
      while (acc >= 1000 / 60 && steps < 4) {
        step(t);
        acc -= 1000 / 60;
        steps++;
      }
      draw(t);
      sctx.clearRect(0, 0, W, H);
      spider.draw(sctx);
      placeCards();
      raf = requestAnimationFrame(frame);
    }

    // ---- Pointer handling ----
    function toLocal(e) {
      const r = stage.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function onMove(e) {
      const p = toLocal(e);
      if (pointer.inside) {
        pointer.vx = p.x - pointer.x;
        pointer.vy = p.y - pointer.y;
      }
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.inside = true;

      if (drag) {
        const c = cards[drag.index];
        const nx = p.x - drag.offX;
        const ny = p.y - drag.offY;
        c.px = c.x;
        c.py = c.y;
        c.x = nx;
        c.y = ny;
        if (Math.hypot(p.x - drag.startX, p.y - drag.startY) > 6) drag.moved = true;
      }
    }

    function onLeave() {
      pointer.inside = false;
    }

    function onCardDown(e) {
      const index = Number(e.currentTarget.dataset.index);
      const c = cards[index];
      if (!c || !c.live) return;
      const p = toLocal(e);
      drag = { index, offX: p.x - c.x, offY: p.y - c.y, startX: p.x, startY: p.y, moved: false, time: performance.now() };
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.classList.add(styles.dragging);
    }

    function onCardUp(e) {
      if (!drag) return;
      const { index, moved, time } = drag;
      e.currentTarget.classList.remove(styles.dragging);
      drag = null;
      if (moved || performance.now() - time >= 500) return;
      // On touch screens the first tap lets the spider fetch the project, the second opens it.
      if (e.pointerType !== "mouse" && hoverRef.current !== index) {
        hoverRef.current = index;
        return;
      }
      const { link } = webProjects[index];
      if (!link) return;
      // Pages on this site open in place; outside links open in a new tab.
      if (link.startsWith("/")) router.push(link);
      else window.open(link, "_blank", "noopener,noreferrer");
    }

    // The spider tugs the card, which can slide it out from under the cursor,
    // so it only lets go once the cursor has really moved away (checked in step).
    let pendingRelease = false;

    function onCardEnter(e) {
      if (e.type !== "focus" && e.pointerType !== "mouse") return;
      pendingRelease = false;
      hoverRef.current = Number(e.currentTarget.dataset.index);
    }

    function onCardLeave(e) {
      if (e.type !== "blur" && e.pointerType !== "mouse") return;
      if (e.type === "blur") hoverRef.current = -1;
      else pendingRelease = true;
    }

    // Tapping empty space sends the spider home.
    function onStageDown(e) {
      if (!e.target.closest("a")) hoverRef.current = -1;
    }

    // Mouse/touch clicks are handled on pointerup; keyboard "Enter" still follows the link.
    function onCardClick(e) {
      if (e.detail !== 0) e.preventDefault();
    }

    build();
    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => build());
    ro.observe(stage);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("pointerdown", onStageDown);
    const cardEls = cardRefs.current.filter(Boolean);
    cardEls.forEach((el) => {
      el.addEventListener("pointerdown", onCardDown);
      el.addEventListener("pointerup", onCardUp);
      el.addEventListener("pointercancel", onCardUp);
      el.addEventListener("pointerenter", onCardEnter);
      el.addEventListener("pointerleave", onCardLeave);
      el.addEventListener("click", onCardClick);
      el.addEventListener("focus", onCardEnter);
      el.addEventListener("blur", onCardLeave);
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
    stage.removeEventListener("pointerdown", onStageDown);
      cardEls.forEach((el) => {
        el.removeEventListener("pointerdown", onCardDown);
        el.removeEventListener("pointerup", onCardUp);
        el.removeEventListener("pointercancel", onCardUp);
        el.removeEventListener("pointerenter", onCardEnter);
        el.removeEventListener("pointerleave", onCardLeave);
        el.removeEventListener("click", onCardClick);
        el.removeEventListener("focus", onCardEnter);
        el.removeEventListener("blur", onCardLeave);
      });
    };
  }, [router]);

  return (
    <section ref={stageRef} className={styles.stage}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.identity}>
          <div>
            <h1 className={styles.name}>{site.name}</h1>
            <p className={styles.tagline}>{site.tagline}</p>
          </div>
        </div>
        <nav className={styles.nav}>
          <a href={`mailto:${site.email}`}>Email</a>
          <a href={`https://www.instagram.com/${site.instagram}/`} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </nav>
      </header>

      {webProjects.map((project, i) => (
        <a
          key={project.title}
          ref={(el) => (cardRefs.current[i] = el)}
          data-index={i}
          href={project.link || undefined}
          {...(project.link && !project.link.startsWith("/") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={styles.card}
          aria-label={`${project.title}, ${project.tag}`}
        >
          <span className={styles.knot} aria-hidden="true" />
          <span className={styles.frame}>
            <CardImage project={project} index={i} />
          </span>
          <span className={styles.title}>{project.title}</span>
          <span className={styles.tag}>{project.tag}</span>
        </a>
      ))}

      <canvas ref={spiderCanvasRef} className={styles.spiderCanvas} aria-hidden="true" />

      <p className={`${styles.hint} ${ready ? styles.hintShown : ""}`}>
        {touchMode
          ? "Tap a project and the spider fetches it · Tap again to open"
          : "Hover a project and the spider grabs it · Drag to swing · Click to open"}
      </p>
    </section>
  );
}
