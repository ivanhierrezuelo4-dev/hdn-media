// Biblioteca de looks v2 (17-nov-2026). Funciones puras: todo recibe `f` (frame) para animarse,
// así se pueden usar en Remotion (f = useCurrentFrame()) y en el catálogo estático.
export const INK = '#15142b';
export const CREAM = '#fffaf0';
export const CORAL = '#f2694a';
export const GOLD = '#ffd25a';
export const TEAL = '#5fe0c0';
export const W = 1080;
export const H = 1920;
export const HORIZON = 1250; // misma línea de suelo que los escenarios v1

export const st = {stroke: INK, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
export const stT = (w: number) => ({stroke: INK, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const});

// azar determinista (mismo resultado en cada render)
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const TAU = Math.PI * 2;
export const wave = (f: number, period: number, phase = 0) => Math.sin((f / period) * TAU + phase);
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const loop = (f: number, period: number) => ((f % period) + period) % period / period;
