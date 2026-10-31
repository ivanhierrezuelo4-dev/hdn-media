// Movimiento con personalidad (informe animación pro §1).
// Todo es función pura del número de fotograma: determinista y apto para render por escenas.
import {Easing, interpolate, spring, SpringConfig} from 'remotion';

export const SP = {
  snappy: {damping: 18, stiffness: 220, mass: 0.6}, // subtítulos, etiquetas
  bouncy: {damping: 9, stiffness: 160, mass: 0.7}, // Nodo, pops de utilería
  heavy: {damping: 22, stiffness: 90, mass: 1.4}, // objetos grandes, cámara
  gentle: {damping: 30, stiffness: 60, mass: 1.0}, // fondos, parallax
  wobble: {damping: 6, stiffness: 200, mass: 0.6}, // rebote al aterrizar
} satisfies Record<string, Partial<SpringConfig>>;
export type SpName = keyof typeof SP;

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
};

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Resorte por rol. `at` = fotograma de inicio. */
export const sp = (frame: number, fps: number, at: number, k: SpName = 'bouncy', from = 0, to = 1) =>
  spring({frame: frame - at, fps, config: SP[k], from, to});

/** Rol por defecto según qué se anima (para el campo opcional "ease" del JSON). */
export const roleFor = (what: 'nodo' | 'prop' | 'caption' | 'cam' | 'bg'): SpName =>
  ({nodo: 'bouncy', prop: 'bouncy', caption: 'snappy', cam: 'heavy', bg: 'gentle'} as const)[what];

/**
 * Anticipación: 6 fotogramas antes de un movimiento retrocede un 12 % en sentido contrario.
 * Devuelve un desplazamiento para SUMAR a la posición que ya calcula el intérprete.
 */
export const anticipation = (frame: number, at: number, delta: number, amount = 0.12, lead = 6) =>
  interpolate(frame, [at - lead, at - 1, at + 2], [0, -amount * delta, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE.inOut,
  });

/** Suma la anticipación de todos los fotogramas clave de una lista [{at, v}] (v = valor destino). */
export const anticipateKeys = (frame: number, keys: {at: number; v: number}[], amount = 0.12) => {
  let o = 0;
  for (let i = 1; i < keys.length; i++) {
    const d = keys[i].v - keys[i - 1].v;
    if (d !== 0) o += anticipation(frame, keys[i].at, d, amount);
  }
  return o;
};

/** Salto con anticipación + estirar/aplastar (sq<1 aplasta, sq>1 estira). */
export function hop(frame: number, fps: number, start: number, h = 160, air = 18) {
  const t = frame - start;
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
  return {dy: 0, sq: sp(ta - air, fps, 0, 'wobble', 0.7, 1), air: 0};
}
