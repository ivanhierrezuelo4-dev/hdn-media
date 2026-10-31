// Actuación automática de Nodo (informe §2-§4): se calcula SOLO a partir de las funciones de
// posición que ya tiene el intérprete (posX/posY por fotograma). Ningún JSON cambia.
import {interpolate} from 'remotion';
import {noise2D} from '@remotion/noise';
import {clamp} from './motion';

export type PosFn = (frame: number) => number;

export type Acting = {
  sx: number; // escala X (conserva volumen)
  sy: number; // escala Y (>1 estira, <1 aplasta) — pivote en los pies
  lean: number; // grados, se inclina contra el movimiento
  antenna: number; // grados de la antena (retraso + vibración amortiguada)
  blink: number; // 0 abierto .. 1 cerrado
  swayX: number; // px de deriva orgánica (sumar a x)
  breathe: number; // escala extra de respiración (multiplicar)
  lookX: number; // -1..1 mirada que se va un poco
  shadowK: number; // 1 en el suelo .. 0.4 muy alto (sombra de contacto)
};

const speed = (x: PosFn, y: PosFn, f: number) => Math.hypot(x(f) - x(f - 1), y(f) - y(f - 1));

/** Fotogramas desde que se detuvo (0 = el fotograma en que paró). Infinity si no paró hace poco. */
export function framesSinceStop(x: PosFn, y: PosFn, f: number, thr = 2.5, win = 20) {
  for (let i = 0; i < win; i++) {
    if (speed(x, y, f - i) > thr) return i === 0 ? Infinity : i - 1;
  }
  return Infinity;
}

/** Antena: resorte amortiguado empujado por la aceleración del cuerpo (sin estado, mira hacia atrás). */
export function lag(x: PosFn, f: number, gain = 1.4, k = 0.14, c = 0.16, win = 90) {
  let p = 0;
  let v = 0;
  for (let i = Math.max(2, f - win); i <= f; i++) {
    const acc = x(i) - 2 * x(i - 1) + x(i - 2);
    v += -k * p - c * v - acc * gain;
    p += v;
  }
  return p;
}

/** Parpadeo cada ~3,1 s, a veces doble; determinista por semilla. */
export function blinkAt(f: number, fps: number, seed = 0) {
  const P = Math.round(fps * 3.1);
  const i = Math.floor((f + seed) / P);
  const l = (((f + seed) % P) + P) % P;
  const curve = [0, 0.7, 1, 0.6, 0];
  if (l < 5) return curve[l];
  if (noise2D('b2', i, seed) > 0.5 && l >= 7 && l < 12) return curve[l - 7];
  return 0;
}

export function acting(opts: {
  frame: number;
  fps: number;
  posX: PosFn;
  posY: PosFn; // y de los pies (crece hacia abajo)
  groundY: number;
  seed?: number;
  still?: boolean; // "still" del JSON: sin deriva ni respiración
}): Acting {
  const {frame: f, fps, posX, posY, groundY, seed = 0, still = false} = opts;
  const t = f / fps;
  const v = speed(posX, posY, f);
  const stretch = interpolate(v, [0, 40], [0, 0.18], {extrapolateRight: 'clamp'});
  const since = framesSinceStop(posX, posY, f);
  const impact = since === Infinity ? 0 : clamp(speed(posX, posY, f - since - 1) / 30, 0.3, 1);
  const squash = since < 6 ? interpolate(since, [0, 2, 5], [0.2, 0.1, 0]) * impact : 0;
  const sy = 1 + stretch - squash;
  const sx = 1 / Math.sqrt(sy);
  const lean = clamp((posX(f) - posX(f - 3)) * -0.6, -14, 14);
  const wob = since === Infinity ? 0 : Math.sin(since * 0.9) * Math.exp(-since / 9) * 10 * impact;
  const antenna = clamp(lag(posX, f) * 0.8 + wob, -35, 35);
  const lift = Math.max(0, groundY - posY(f));
  return {
    sx,
    sy,
    lean,
    antenna,
    blink: blinkAt(f, fps, seed),
    swayX: still ? 0 : noise2D('nodo-x' + seed, t * 0.35, 0) * 6,
    breathe: still ? 1 : 1 + 0.015 * Math.sin((t * 2 * Math.PI) / 3.2),
    lookX: still ? 0 : noise2D('nodo-look' + seed, t * 0.5, 1) * 0.25,
    shadowK: interpolate(lift, [0, 220], [1, 0.4], {extrapolateRight: 'clamp'}),
  };
}

/** Transform SVG con pivote en los pies: <g transform={feetTransform(x, y, a, H)}>. H = alto del cuerpo. */
export const feetTransform = (x: number, y: number, a: Acting, scale = 1) =>
  `translate(${x + a.swayX} ${y}) scale(${scale * a.sx * a.breathe} ${scale * a.sy * a.breathe}) rotate(${a.lean})`;
