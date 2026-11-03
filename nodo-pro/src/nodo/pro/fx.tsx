// Capa de acabado (informe §5, §8, §9): grano, viñeta, cámara en planos, sacudida, transiciones.
import React from 'react';
import {AbsoluteFill, Img, interpolate, interpolateColors, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {EASE, sp} from './motion';

/** Grano de película: 4 PNG (public/fx/grain0..3.png) que cambian cada 2 fotogramas. También quita el banding. */
export const Grain: React.FC<{opacity?: number; dir?: string}> = ({opacity = 0.06, dir = 'fx'}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{mixBlendMode: 'overlay', opacity, pointerEvents: 'none'}}>
      <Img src={staticFile(`${dir}/grain${Math.floor(f / 2) % 4}.png`)} style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.35}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse 80% 70% at 50% 45%, transparent 55%, rgba(0,0,0,${strength}))`,
    }}
  />
);

export type Shake = {x: number; y: number; r: number};

/** Sacudida con ruido que se apaga sola. `hits` = fotogramas de impacto (p. ej. sfx "impact"). */
export const shakeAt = (frame: number, hits: number[], power = 1): Shake => {
  let e = 0;
  for (const h of hits) if (frame >= h) e = Math.max(e, Math.exp(-(frame - h) / 6));
  e *= power;
  return {
    x: noise2D('sx', frame * 0.8, 0) * 14 * e,
    y: noise2D('sy', frame * 0.8, 0) * 10 * e,
    r: noise2D('sr', frame * 0.8, 0) * 1.2 * e,
  };
};

export type Cam = {x: number; y: number; zoom: number};

/**
 * Un plano de profundidad. depth: 0.15 cielo, 0.5 escenario, 1 Nodo+utilería. La UI va fuera (no se mueve).
 * push: micro-empuje 1,00→1,04 a lo largo de la escena para que ningún plano se vea congelado.
 */
export const CamLayer: React.FC<{
  depth: number;
  cam: Cam;
  shake?: Shake;
  sceneDur: number;
  push?: number;
  children: React.ReactNode;
}> = ({depth: d, cam, shake = {x: 0, y: 0, r: 0}, sceneDur, push = 0.04, children}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, Math.max(1, sceneDur)], [1, 1 + push], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE.inOut,
  });
  const z = 1 + (cam.zoom * p - 1) * d;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${(-cam.x + shake.x) * d}px, ${(-cam.y + shake.y) * d}px) scale(${z}) rotate(${shake.r * d}deg)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Fundido de color de fondo en 10 fotogramas en vez de corte seco (para bgTo). */
export const blendColor = (frame: number, at: number, a: string, b: string, dur = 10) =>
  interpolateColors(frame, [at, at + dur], [a, b]);

/** Entrada "iris": la escena nueva se abre en círculo desde (x, y), p. ej. la posición de Nodo. */
export const Iris: React.FC<{at?: number; x: number; y: number; children: React.ReactNode}> = ({at = 0, x, y, children}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const r = sp(f, fps, at, 'heavy') * 2300;
  return <AbsoluteFill style={{clipPath: `circle(${r}px at ${x}px ${y}px)`}}>{children}</AbsoluteFill>;
};

/** Smear de dibujo animado para "whip": estira 1-2 fotogramas en la dirección del movimiento. CSS transform. */
export const smear = (dx: number, dy: number) => {
  const v = Math.hypot(dx, dy);
  if (v <= 45) return '';
  const s = interpolate(v, [45, 120], [1.2, 1.8], {extrapolateRight: 'clamp'});
  const a = (Math.atan2(dy, dx) * 180) / Math.PI;
  return `rotate(${a}deg) scale(${s}, ${1 / s}) rotate(${-a}deg)`;
};

/** Sombra de contacto para Nodo y utilería que toque el suelo. k = Acting.shadowK. */
export const ContactShadow: React.FC<{x: number; y: number; k: number; rx?: number}> = ({x, y, k, rx = 70}) => (
  <ellipse cx={x} cy={y + 6} rx={rx * k} ry={13 * k} fill="#000" opacity={0.3 * k} />
);
