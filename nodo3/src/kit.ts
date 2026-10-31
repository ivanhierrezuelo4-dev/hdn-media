import {Easing, interpolate, spring} from 'remotion';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const C = {
  ink: '#15142b',
  coral: '#f2694a',
  cream: '#f6efe0',
  teal: '#5fe0c0',
  tealD: '#239a80',
  tealL: '#b4f8e4',
  gold: '#ffd25a',
  grey: '#8b8aa3',
};

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export const ease = (
  f: number,
  a: number,
  b: number,
  from: number,
  to: number,
  e: (t: number) => number = Easing.inOut(Easing.cubic),
) => interpolate(f, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

export const lin = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

// Presets de resorte por rol (informe §1)
export const SPR = {
  pop: {damping: 9, stiffness: 190, mass: 0.6},
  settle: {damping: 14, stiffness: 120, mass: 1},
  heavy: {damping: 18, stiffness: 80, mass: 1.4},
  snappy: {damping: 22, stiffness: 260, mass: 0.5},
  wobble: {damping: 6, stiffness: 200, mass: 0.6},
};

export const sp = (f: number, start: number, cfg = SPR.settle, from = 0, to = 1) =>
  spring({frame: f - start, fps: FPS, config: cfg, from, to});

// Salto con anticipación + estirar/aplastar. sq<1 aplasta, sq>1 estira.
export function hop(f: number, start: number, h = 160, air = 18) {
  const t = f - start;
  const ant = 7;
  if (t < 0) return {dy: 0, sq: 1, air: 0};
  if (t < ant) {
    const k = Math.sin(((t + 1) / ant) * (Math.PI / 2));
    return {dy: 0, sq: 1 - 0.22 * k, air: 0};
  }
  const ta = t - ant;
  if (ta < air) {
    const p = ta / air;
    const v = 1 - 2 * p;
    return {dy: -h * 4 * p * (1 - p), sq: 1 + 0.2 * Math.abs(v) ** 1.6, air: 4 * p * (1 - p)};
  }
  return {dy: 0, sq: sp(ta - air, 0, SPR.wobble, 0.7, 1), air: 0};
}

// La misma acción, pero como antes: lineal, sin anticipación ni deformación
export function hopFlat(f: number, start: number, h = 160, air = 18) {
  const t = f - start - 7;
  if (t < 0 || t > air) return {dy: 0, sq: 1, air: 0};
  const p = t / air;
  return {dy: -h * (1 - Math.abs(2 * p - 1)), sq: 1, air: 0};
}

// Movimiento con anticipación (retrocede antes de ir) y llegada con rebote
export function move(f: number, start: number, from: number, to: number, dur = 16) {
  const back = (from - to) * 0.08;
  const a = ease(f, start, start + 7, 0, back, Easing.out(Easing.quad));
  if (f < start + 7) return from + a;
  const s = sp(f, start + 7, {damping: 13, stiffness: 170, mass: 0.7});
  return from + back + (to - from - back) * s * (dur > 0 ? 1 : 1);
}

// Antena / apéndices con retraso: resorte amortiguado empujado por la aceleración del cuerpo
export function lag(f: number, xAt: (f: number) => number, gain = 1.4, k = 0.14, c = 0.16, win = 90) {
  let p = 0;
  let v = 0;
  const s = Math.max(2, f - win);
  for (let i = s; i <= f; i++) {
    const acc = xAt(i) - 2 * xAt(i - 1) + xAt(i - 2);
    v += -k * p - c * v - acc * gain;
    p += v;
  }
  return p;
}

// Parpadeo determinista (cada 2-4 s)
export function blink(f: number, seed = 0) {
  let t = 18 + seed * 13;
  let i = 0;
  while (t < f - 8) {
    i++;
    t += 62 + ((i * 37 + seed * 17) % 50);
  }
  const d = f - t;
  if (d < 0 || d > 7) return 0;
  return d < 2 ? d / 2 : d < 4 ? 1 : 1 - (d - 4) / 3;
}

// Ruido suave para respiración / balanceo
export const wob = (f: number, seed = 0) =>
  Math.sin(f / 17 + seed) * 0.6 + Math.sin(f / 7.3 + seed * 2.1) * 0.25 + Math.sin(f / 29 + seed * 0.7) * 0.15;

export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
