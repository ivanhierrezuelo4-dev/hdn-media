import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, SPR, clamp, rnd, sp} from './kit';

export const FONT = "'Lilita One', sans-serif";
export const FONT_T = "'Nunito', sans-serif";
export const MONO = "'JetBrains Mono', monospace";

export const Bg: React.FC<{top: string; bottom: string; banded?: boolean; style?: React.CSSProperties}> = ({
  top,
  bottom,
  banded,
  style,
}) => {
  let bg = `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`;
  if (banded) {
    const n = 6;
    const stops: string[] = [];
    for (let i = 0; i < n; i++) {
      const col = `color-mix(in srgb, ${bottom} ${Math.round((i / (n - 1)) * 100)}%, ${top})`;
      stops.push(`${col} ${(i / n) * 100}%`, `${col} ${((i + 1) / n) * 100}%`);
    }
    bg = `linear-gradient(180deg, ${stops.join(',')})`;
  }
  return <AbsoluteFill style={{background: bg, ...style}} />;
};

export const Stars: React.FC<{n?: number; h?: number; seed?: number; w?: number}> = ({n = 40, h = 1300, seed = 1, w = 1080}) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const x = rnd(i * 3 + seed) * w;
        const y = rnd(i * 7 + seed * 5) * h;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(f / (9 + rnd(i) * 14) + i));
        return i % 5 === 0 ? (
          <path key={i} d={`M${x - 10},${y} L${x + 10},${y} M${x},${y - 10} L${x},${y + 10}`} stroke="#fff" strokeWidth={3} opacity={0.4 * tw} />
        ) : (
          <circle key={i} cx={x} cy={y} r={2 + rnd(i * 11) * 2.5} fill="#fff" opacity={0.55 * tw} />
        );
      })}
    </g>
  );
};

export const Ground: React.FC<{y: number; color?: string; w?: number; x0?: number; glyphs?: boolean}> = ({
  y,
  color = '#141a33',
  w = 1080,
  x0 = 0,
  glyphs = true,
}) => {
  const f = useCurrentFrame();
  let d = `M${x0},${y}`;
  for (let x = x0; x <= x0 + w; x += 40) d += ` L${x},${y + Math.sin(x / 90 + f / 25) * 7}`;
  d += ` L${x0 + w},2000 L${x0},2000 Z`;
  return (
    <g>
      <path d={d} fill={color} />
      <path d={d.split(' L' + (x0 + w) + ',2000')[0]} stroke="#9fb5ff" strokeOpacity={0.45} strokeWidth={4} fill="none" />
      {glyphs &&
        ['{ }', '01', '</>', '=>', '//', ';'].map((g, i) => (
          <text
            key={i}
            x={x0 + 80 + ((i * 197) % (w - 160))}
            y={y + 170 + (i % 3) * 110}
            fill="#fff"
            opacity={0.08}
            fontFamily={MONO}
            fontSize={58}
          >
            {g}
          </text>
        ))}
    </g>
  );
};

export const TitleCard: React.FC<{pops: number[]}> = ({pops}) => {
  const f = useCurrentFrame();
  let k = 0;
  for (const p of pops) if (f >= p) k += Math.exp(-(f - p) / 5) * Math.sin((f - p) / 2.2);
  return (
    <div
      style={{
        position: 'absolute',
        left: 56,
        right: 56,
        top: 70,
        height: 132,
        background: C.cream,
        border: `7px solid ${C.ink}`,
        borderRadius: 34,
        boxShadow: `0 10px 0 ${C.ink}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT_T,
        fontWeight: 900,
        fontSize: 58,
        color: C.ink,
        transform: `scale(${1 + 0.035 * k}) rotate(${k * 0.6}deg)`,
      }}
    >
      Así se ve&nbsp;<span style={{color: C.coral}}>Nodo 2.0</span>
    </div>
  );
};

export const Handle: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      top: 222,
      width: '100%',
      textAlign: 'center',
      fontFamily: MONO,
      fontSize: 30,
      color: '#7fe9cf',
      opacity: 0.8,
    }}
  >
    @hechodenada
  </div>
);

export const Tag: React.FC<{
  x: number;
  y: number;
  at: number;
  out?: number;
  text: string;
  bg?: string;
  color?: string;
  size?: number;
  rot?: number;
}> = ({x, y, at, out = 99999, text, bg = C.coral, color = C.ink, size = 54, rot = -4}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = sp(f, at, SPR.pop) * (f > out ? 1 - sp(f, out, SPR.snappy) : 1);
  if (s <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%,-50%) rotate(${rot + (1 - s) * 14}deg) scale(${s})`,
        background: bg,
        color,
        border: `6px solid ${C.ink}`,
        borderRadius: 22,
        padding: `${size * 0.16}px ${size * 0.42}px`,
        fontFamily: FONT,
        fontSize: size,
        whiteSpace: 'nowrap',
        boxShadow: `0 8px 0 ${C.ink}`,
        letterSpacing: 1,
      }}
    >
      {text}
    </div>
  );
};

export type KW = {w: string; at: number};

// Subtítulos karaoke: la palabra se enciende y salta justo cuando "suena"
export const Karaoke: React.FC<{lines: KW[][]; y: number; size?: number; from?: number; out?: number; rot?: number}> = ({
  lines,
  y,
  size = 92,
  from,
  out = 99999,
  rot = -2,
}) => {
  const f = useCurrentFrame();
  const start = from ?? lines[0][0].at - 6;
  if (f < start) return null;
  const inS = sp(f, start, SPR.pop);
  const outS = f > out ? 1 - sp(f, out, SPR.snappy) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `rotate(${rot}deg) scale(${inS * outS})`,
        opacity: clamp(outS * 2, 0, 1),
      }}
    >
      {lines.map((line, li) => (
        <div key={li} style={{display: 'flex', gap: size * 0.28, lineHeight: 1.12}}>
          {line.map((wd, i) => {
            const on = f >= wd.at;
            const next = line[i + 1]?.at ?? lines[li + 1]?.[0]?.at ?? 99999;
            const current = on && f < next;
            const pop = on ? 1 + 0.22 * Math.exp(-(f - wd.at) / 4) * Math.cos((f - wd.at) / 2.5) : 1;
            return (
              <span
                key={i}
                style={{
                  fontFamily: FONT,
                  fontSize: size,
                  color: current ? C.coral : on ? '#fff' : 'rgba(255,255,255,0.38)',
                  WebkitTextStroke: `${size * 0.11}px ${C.ink}`,
                  paintOrder: 'stroke fill',
                  display: 'inline-block',
                  transform: `scale(${pop}) translateY(${on ? 0 : 6}px)`,
                  textShadow: `0 ${size * 0.08}px 0 ${C.ink}`,
                }}
              >
                {wd.w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Grano: 4 PNG rotando (más barato que un filtro SVG)
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.16}) => {
  const f = useCurrentFrame();
  const i = Math.floor(f / 2) % 4;
  return (
    <AbsoluteFill style={{mixBlendMode: 'overlay', opacity, pointerEvents: 'none'}}>
      <Img src={staticFile(`grain${i}.png`)} style={{width: '100%', height: '100%', imageRendering: 'auto'}} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)'}} />
);

export const Sparks: React.FC<{x: number; y: number; at: number; n?: number; r?: number; color?: string}> = ({
  x,
  y,
  at,
  n = 8,
  r = 160,
  color = C.gold,
}) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0 || t > 22) return null;
  const k = sp(f, at, SPR.snappy);
  return (
    <g opacity={1 - t / 22}>
      {Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.3;
        const d = r * k;
        const cx = x + Math.cos(a) * d;
        const cy = y + Math.sin(a) * d;
        return i % 2 ? (
          <circle key={i} cx={cx} cy={cy} r={9} fill={color} stroke={C.ink} strokeWidth={4} />
        ) : (
          <path
            key={i}
            d={`M${cx - 14},${cy} L${cx + 14},${cy} M${cx},${cy - 14} L${cx},${cy + 14}`}
            stroke={color}
            strokeWidth={7}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};
