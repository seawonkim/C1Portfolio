// A big friendly spider that lives in the top-right corner.
// It walks over to grab whichever project you touch, then goes home.

const INK = "#1e1c24";

// Leg layout, relative to where the spider faces (radians).
// hip: where the leg joins the head; foot: where the foot rests; rest: how far out (share of reach).
const LEGS = [
  { hip: 0.35, foot: 0.45, rest: 0.62 },
  { hip: 0.95, foot: 1.1, rest: 0.56 },
  { hip: 1.6, foot: 1.85, rest: 0.55 },
  { hip: 2.3, foot: 2.6, rest: 0.58 },
];

const STEP_TIME = 0.12;
const BODY_SPRING = 0.06;
const BODY_DAMPING = 0.78;

const angleDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function createSpider() {
  const s = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    facing: 2.3,
    R: 70,
    headR: 44,
    L1: 140,
    L2: 160,
    W: 0,
    H: 0,
    home: { x: 0, y: 0 },
    legs: [],
    grabIndex: -1,
    grabLeg: -1,
    holding: false,
    holdPoint: null,
    time: 0,
    nextBlink: 2.5,
    blinkUntil: 0,
    look: { x: 0, y: 0 },
    started: false,
  };

  for (const side of [1, -1]) {
    LEGS.forEach((cfg) => {
      s.legs.push({ ...cfg, side, x: 0, y: 0, from: null, to: null, t: -1 });
    });
  }

  const reach = () => s.L1 + s.L2;

  function idealFoot(leg) {
    const a = s.facing + leg.side * leg.foot;
    const d = reach() * leg.rest;
    return { x: s.x + Math.cos(a) * d, y: s.y + Math.sin(a) * d };
  }

  function hip(leg) {
    const a = s.facing + leg.side * leg.hip;
    return { x: s.x + Math.cos(a) * s.headR * 0.8, y: s.y + Math.sin(a) * s.headR * 0.8 };
  }

  function resize(W, H) {
    const narrow = W < 700;
    s.W = W;
    s.H = H;
    s.R = narrow ? 40 : 70;
    s.headR = s.R * 0.62;
    s.L1 = s.R * 1.0;
    s.L2 = s.R * 1.15;
    s.home = { x: W - s.R * 0.9, y: s.R * (narrow ? 1.6 : 1.3) };
    if (!s.started) {
      s.x = s.home.x;
      s.y = -s.R * 5;
      s.legs.forEach((leg) => Object.assign(leg, idealFoot(leg)));
    }
  }

  // target: { x, y, index } of a project to grab, or null to go home.
  // lookAt: point the eyes should follow.
  function update(dt, { active, target, lookAt }) {
    s.time += dt;
    if (active) s.started = true;

    // ---- Where should the body go? ----
    let goal = active ? { ...s.home } : { x: s.home.x, y: -s.R * 5 };
    let faceTo = { x: s.W * 0.4, y: s.H * 0.65 };

    if (target && active) {
      if (target.index !== s.grabIndex) {
        s.grabIndex = target.index;
        s.holding = false;
        s.holdPoint = null;
        // Use whichever front leg is closer to the project.
        const right = idealFoot(s.legs[0]);
        const left = idealFoot(s.legs[4]);
        const dr = Math.hypot(right.x - target.x, right.y - target.y);
        const dl = Math.hypot(left.x - target.x, left.y - target.y);
        s.grabLeg = dr < dl ? 0 : 4;
        s.legs[s.grabLeg].t = -1;
      }
      const dx = s.x - target.x;
      const dy = s.y - target.y;
      const d = Math.hypot(dx, dy) || 1;
      const comfy = reach() * 0.62;
      goal = d > reach() * 0.75 || d < reach() * 0.3 ? { x: target.x + (dx / d) * comfy, y: target.y + (dy / d) * comfy } : { x: s.x, y: s.y };
      faceTo = target;
    } else if (s.grabIndex !== -1) {
      s.grabIndex = -1;
      s.grabLeg = -1;
      s.holding = false;
      s.holdPoint = null;
    }

    goal.x = Math.min(s.W - s.R * 0.5, Math.max(s.R, goal.x));
    goal.y = Math.min(s.H - s.R, Math.max(-s.R * 5, goal.y));

    s.vx = (s.vx + (goal.x - s.x) * BODY_SPRING) * BODY_DAMPING;
    s.vy = (s.vy + (goal.y - s.y) * BODY_SPRING) * BODY_DAMPING;
    s.x += s.vx;
    s.y += s.vy;

    const wantFacing = Math.atan2(faceTo.y - s.y, faceTo.x - s.x);
    s.facing += angleDiff(s.facing, wantFacing) * 0.08;

    // ---- Legs ----
    const stepping = s.legs.filter((l) => l.t >= 0).length;
    s.legs.forEach((leg, i) => {
      if (i === s.grabLeg && target) {
        let aim = target;
        if (s.holding) {
          if (!s.holdPoint) {
            // Give the project a little tug toward the spider.
            const dx = s.x - target.x;
            const dy = s.y - target.y;
            const d = Math.hypot(dx, dy) || 1;
            s.holdPoint = { x: target.x + (dx / d) * 30, y: target.y + (dy / d) * 30 - 8 };
          }
          aim = s.holdPoint;
        }
        leg.x += (aim.x - leg.x) * 0.22;
        leg.y += (aim.y - leg.y) * 0.22;
        if (!s.holding && Math.hypot(leg.x - target.x, leg.y - target.y) < 14) s.holding = true;
        return;
      }

      if (leg.t >= 0) {
        leg.t += dt / STEP_TIME;
        const k = easeInOut(Math.min(1, leg.t));
        leg.x = leg.from.x + (leg.to.x - leg.from.x) * k;
        leg.y = leg.from.y + (leg.to.y - leg.from.y) * k;
        if (leg.t >= 1) leg.t = -1;
        return;
      }

      const ideal = idealFoot(leg);
      const off = Math.hypot(leg.x - ideal.x, leg.y - ideal.y);
      const neighbor = s.legs[(i + 1) % 4 === 0 ? i - 3 : i + 1];
      if (off > reach() * 0.2 && stepping < 4 && neighbor.t < 0) {
        leg.from = { x: leg.x, y: leg.y };
        leg.to = { x: ideal.x + s.vx * 6, y: ideal.y + s.vy * 6 };
        leg.t = 0;
      }
    });

    // ---- Eyes ----
    const look = lookAt || faceTo;
    s.look.x += (look.x - s.look.x) * 0.15;
    s.look.y += (look.y - s.look.y) * 0.15;
    if (s.time > s.nextBlink) {
      s.blinkUntil = s.time + 0.13;
      s.nextBlink = s.time + 2.5 + Math.random() * 3;
    }

    return {
      holding: s.holding && s.grabIndex !== -1,
      index: s.grabIndex,
      foot: s.grabLeg >= 0 ? { x: s.legs[s.grabLeg].x, y: s.legs[s.grabLeg].y } : null,
    };
  }

  function knee(h, f, side) {
    const dx = f.x - h.x;
    const dy = f.y - h.y;
    const d = Math.min(Math.hypot(dx, dy), reach() * 0.999);
    const base = Math.atan2(dy, dx);
    const cos = (s.L1 * s.L1 + d * d - s.L2 * s.L2) / (2 * s.L1 * d || 1);
    const a = Math.acos(Math.max(-1, Math.min(1, cos)));
    const k1 = { x: h.x + Math.cos(base + a) * s.L1, y: h.y + Math.sin(base + a) * s.L1 };
    const k2 = { x: h.x + Math.cos(base - a) * s.L1, y: h.y + Math.sin(base - a) * s.L1 };
    // Bend each knee out toward its own side of the body so legs never cross.
    const lx = Math.cos(s.facing + side * Math.PI / 2);
    const ly = Math.sin(s.facing + side * Math.PI / 2);
    const d1 = (k1.x - h.x) * lx + (k1.y - h.y) * ly;
    const d2 = (k2.x - h.x) * lx + (k2.y - h.y) * ly;
    return d1 > d2 ? k1 : k2;
  }

  function draw(ctx) {
    if (!s.started && s.y < -s.R * 4) return;
    const scale = s.R / 70;
    const fx = Math.cos(s.facing);
    const fy = Math.sin(s.facing);
    const abdomen = { x: s.x - fx * (s.headR + s.R * 0.8), y: s.y - fy * (s.headR + s.R * 0.8) };

    // Silk line it hangs from
    ctx.beginPath();
    ctx.moveTo(s.home.x + s.R * 0.4, -10);
    ctx.lineTo(abdomen.x, abdomen.y);
    ctx.strokeStyle = "rgba(30, 28, 36, 0.5)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Legs
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = INK;
    s.legs.forEach((leg) => {
      const h = hip(leg);
      const k = knee(h, leg, leg.side);
      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.lineTo(k.x, k.y);
      ctx.lineWidth = 15 * scale;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(k.x, k.y);
      ctx.lineTo(leg.x, leg.y);
      ctx.lineWidth = 11 * scale;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(k.x, k.y, 8 * scale, 0, Math.PI * 2);
      ctx.fillStyle = INK;
      ctx.fill();
    });

    // Body
    const breathe = 1 + Math.sin(s.time * 2.2) * 0.02;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(abdomen.x, abdomen.y, s.R * breathe, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.headR, 0, Math.PI * 2);
    ctx.fill();

    // Little shine on the abdomen
    ctx.beginPath();
    ctx.arc(abdomen.x - s.R * 0.35, abdomen.y - s.R * 0.35, s.R * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fill();

    // Eyes
    const px = -fy;
    const py = fx;
    const er = s.headR * 0.34;
    const blinking = s.time < s.blinkUntil;
    [1, -1].forEach((side) => {
      const ex = s.x + fx * s.headR * 0.3 + px * side * s.headR * 0.42;
      const ey = s.y + fy * s.headR * 0.3 + py * side * s.headR * 0.42;

      if (s.holding) {
        // Happy ^ ^ eyes while holding a project
        ctx.beginPath();
        ctx.moveTo(ex - er * 0.7, ey + er * 0.35);
        ctx.lineTo(ex, ey - er * 0.45);
        ctx.lineTo(ex + er * 0.7, ey + er * 0.35);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3.5 * scale;
        ctx.stroke();
        return;
      }

      ctx.save();
      ctx.translate(ex, ey);
      if (blinking) ctx.scale(1, 0.12);
      ctx.beginPath();
      ctx.arc(0, 0, er, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      if (!blinking) {
        const lx = s.look.x - ex;
        const ly = s.look.y - ey;
        const ld = Math.hypot(lx, ly) || 1;
        const off = Math.min(er * 0.45, ld);
        ctx.beginPath();
        ctx.arc((lx / ld) * off, (ly / ld) * off, er * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = INK;
        ctx.fill();
      }
      ctx.restore();
    });
  }

  return { resize, update, draw };
}
