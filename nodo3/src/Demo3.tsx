import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, interpolateColors, staticFile, useCurrentFrame} from 'remotion';
import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import {C, SPR, clamp, ease, hop, lag, lin, blink, wob, sp, rnd} from './kit';
import {Nodo} from './Nodo';
import {FACES, Face, HandP, Nodo3, mixFace} from './Nodo3';
import {Bg, FONT, FONT_T, Ground, Karaoke, MONO, Sparks, Stars, Tag, Grain, Vignette} from './ui';
import SPEECH from './speech.json';

export const TOTAL = 2100;
const BEAT = 15;

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
    {children}
  </svg>
);

// ---------- utilidades de actuación ----------
type FK = {at: number; face: Face};
const faceAt = (f: number, keys: FK[]) => {
  let i = 0;
  while (i + 1 < keys.length && f >= keys[i + 1].at) i++;
  if (i === 0) return keys[0].face;
  const t = sp(f, keys[i].at, {damping: 11, stiffness: 170, mass: 0.6});
  return mixFace(keys[i - 1].face, keys[i].face, t);
};

const Chip: React.FC<{n: string; t: string; at?: number; out?: number}> = ({n, t, at = 6, out = 9999}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = sp(f, at, SPR.pop) * (f > out ? 1 - sp(f, out, SPR.snappy) : 1);
  return (
    <div style={{position: 'absolute', top: 92, width: '100%', display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          transform: `scale(${s}) rotate(${(1 - s) * -10 - 1.5}deg)`,
          background: C.cream,
          border: `7px solid ${C.ink}`,
          borderRadius: 30,
          boxShadow: `0 10px 0 ${C.ink}`,
          padding: '14px 34px',
          fontFamily: FONT_T,
          fontWeight: 900,
          fontSize: 50,
          color: C.ink,
          display: 'flex',
          gap: 18,
          alignItems: 'center',
        }}
      >
        <span style={{background: C.coral, color: C.cream, borderRadius: 16, padding: '0 14px', fontFamily: MONO}}>{n}</span>
        {t}
      </div>
    </div>
  );
};

// texto grande palabra por palabra; *palabra* va en coral
const Big: React.FC<{text: string; at: number; y: number; size?: number; out?: number; step?: number; rot?: number}> = ({
  text,
  at,
  y,
  size = 130,
  out = 99999,
  step = 4,
  rot = -3,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const o = f > out ? 1 - sp(f, out, SPR.snappy) : 1;
  if (o <= 0.01) return null;
  const lines = text.split('|');
  let k = 0;
  return (
    <div style={{position: 'absolute', top: y, width: '100%', textAlign: 'center', transform: `rotate(${rot}deg) scale(${o})`}}>
      {lines.map((ln, li) => (
        <div key={li} style={{display: 'flex', justifyContent: 'center', gap: size * 0.25, lineHeight: 1.05}}>
          {ln.split(' ').map((w, i) => {
            const a = at + step * k++;
            const s = f < a ? 0 : sp(f, a, SPR.pop);
            const acc = w.startsWith('*');
            return (
              <span
                key={i}
                style={{
                  fontFamily: FONT,
                  fontSize: size,
                  color: acc ? C.coral : C.cream,
                  WebkitTextStroke: `${size * 0.12}px ${C.ink}`,
                  paintOrder: 'stroke fill',
                  display: 'inline-block',
                  transform: `translateY(${(1 - s) * 80 + Math.sin(f / 10 + k) * 4}px) scale(${s}) rotate(${(1 - s) * 20}deg)`,
                  textShadow: `0 ${size * 0.08}px 0 ${C.ink}`,
                }}
              >
                {w.replace(/\*/g, '')}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// cámara: empuje suave + temblor en impactos
const Cam: React.FC<{children: React.ReactNode; push?: number; hits?: number[]; ox?: number; oy?: number}> = ({children, push = 0.04, hits = [], ox = 540, oy = 1200}) => {
  const f = useCurrentFrame();
  const z = 1 + push * (f / 240);
  let sx = 0;
  let sy = 0;
  for (const h of hits) {
    const d = f - h;
    if (d >= 0 && d < 12) {
      const a = 16 * Math.exp(-d / 3.5);
      sx += Math.sin(d * 2.7) * a;
      sy += Math.cos(d * 3.1) * a * 0.7;
    }
  }
  return (
    <AbsoluteFill style={{transform: `translate(${sx}px,${sy}px) scale(${z})`, transformOrigin: `${ox}px ${oy}px`}}>{children}</AbsoluteFill>
  );
};

// ========== 1. Intro: el equipo llega ==========
const ICONS = [
  {n: 'DIBUJO', col: '#ffd25a', d: 'M-30,30 L20,-20 L30,-10 L-20,40 Z M20,-20 L30,-30 L40,-20 L30,-10 Z M-30,30 L-36,46 L-20,40'},
  {n: 'ANIMACIÓN', col: '#7fd8ff', d: 'M-34,-26 H34 V30 H-34 Z M-34,-10 H34 M-20,-26 L-10,-10 M0,-26 L10,-10 M20,-26 L30,-10'},
  {n: 'SONIDO', col: '#ff8a6a', d: 'M-34,-12 H-16 L8,-32 V32 L-16,12 H-34 Z M18,-14 Q30,0 18,14 M26,-26 Q46,0 26,26'},
  {n: 'MÚSICA', col: '#c79bff', d: 'M-14,24 V-28 L30,-36 V16 M-14,24 a12,10 0 1,1 -1,-1 M30,16 a12,10 0 1,1 -1,-1'},
];

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const reveal = 150;
  const spot = ease(f, 0, 24, 0, 1);
  const flash = f >= reveal - 2 && f < reveal + 10 ? 1 - (f - reveal + 2) / 12 : 0;
  const h = hop(f, reveal + 4, 220, 18);
  const dyAt = (i: number) => hop(i, reveal + 4, 220, 18).dy;
  const face = faceAt(f, [
    {at: 0, face: FACES.sorpresa},
    {at: reveal + 30, face: FACES.feliz},
  ]);
  return (
    <AbsoluteFill>
      <Bg top={interpolateColors(f, [reveal - 1, reveal], ['#0d0c1c', '#2d3184'])} bottom={interpolateColors(f, [reveal - 1, reveal], ['#06060d', '#111430'])} />
      <Svg>
        {f >= reveal && <Stars n={50} />}
        <Ground y={1360} color={f < reveal ? '#0a0a16' : '#141a33'} glyphs={f >= reveal} />
        {f < reveal && (
          <g opacity={spot}>
            <path d="M440,-20 L640,-20 L860,1380 L220,1380 Z" fill="#fff6d8" opacity={0.08 + 0.02 * Math.sin(f / 5)} />
            <ellipse cx={540} cy={1372} rx={330} ry={46} fill="#fff6d8" opacity={0.12} />
            <Nodo id="old" x={540} y={1360} s={1.35} flat expr="plano" blink={blink(f, 3)} look={f > 60 ? [-0.6, 0.4] : [0, 0]} sq={1 + wob(f) * 0.006} />
          </g>
        )}
        {/* el equipo: 4 íconos que orbitan y se funden en Nodo */}
        {f >= 92 &&
          f < reveal &&
          ICONS.map((ic, i) => {
            const at = 92 + i * 8;
            const inK = f < at ? 0 : sp(f, at, SPR.pop);
            const conv = ease(f, 132, reveal - 2, 0, 1, Easing.in(Easing.cubic));
            const a = (i / 4) * Math.PI * 2 + f / 14;
            const R = 330 * (1 - conv);
            const x = 540 + Math.cos(a) * R;
            const y = 1100 + Math.sin(a) * R * 0.75;
            return (
              <g key={i} transform={`translate(${x},${y}) scale(${inK * (1 - conv * 0.6)}) rotate(${Math.sin(f / 6 + i) * 10})`}>
                <circle r={74} fill={ic.col} stroke={C.ink} strokeWidth={8} />
                <path d={ic.d} fill="none" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
                <text y={122} textAnchor="middle" fontFamily={FONT} fontSize={40} fill={C.cream} stroke={C.ink} strokeWidth={10} paintOrder="stroke">
                  {ic.n}
                </text>
              </g>
            );
          })}
        {f >= reveal && (
          <>
            <Sparks x={540} y={1150} at={reveal} n={14} r={420} />
            <Sparks x={540} y={1360} at={reveal + 29} n={10} r={260} color={C.teal} />
            <Nodo3
              id="i3"
              x={540}
              y={1360}
              s={1.5}
              dy={h.dy}
              sq={h.sq}
              airK={h.air}
              face={face}
              antDyn={clamp(lag(f, dyAt, 0.5) * 0.9, -60, 60)}
              blink={blink(f, 2)}
              look={h.dy < -40 ? [0, -1] : [0.1, 0.2]}
              hands={
                f > reveal + 34
                  ? {
                      l: {x: -190, y: -150 - Math.sin(f / 4) * 10, r: -20 + Math.sin(f / 3) * 22, pose: 'wave', s: sp(f, reveal + 34, SPR.pop)},
                      r: {x: 185, y: -110, r: 14, pose: 'thumb', s: sp(f, reveal + 40, SPR.pop)},
                    }
                  : undefined
              }
            />
          </>
        )}
      </Svg>
      {f < reveal && <Big text="Nodo era… |un poco *plano." at={14} y={330} size={120} step={6} out={86} />}
      {f < reveal && <Big text="Llegó un *equipo |de expertos" at={96} y={330} size={116} step={5} out={140} />}
      {f >= reveal && <Big text="NODO *3.0" at={reveal + 22} y={300} size={210} step={6} rot={-4} />}
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};

// ========== 2. Antena ==========
const MOODS: {at: number; k: keyof typeof FACES; t: string}[] = [
  {at: 0, k: 'calma', t: ''},
  {at: 90, k: 'curioso', t: 'CURIOSO'},
  {at: 135, k: 'feliz', t: 'FELIZ'},
  {at: 180, k: 'triste', t: 'TRISTE'},
  {at: 225, k: 'enojado', t: 'ENOJADO'},
  {at: 262, k: 'sorpresa', t: 'SORPRESA'},
];
const Antena: React.FC = () => {
  const f = useCurrentFrame();
  const hops = [22, 140, 155, 268];
  const hh = [170, 70, 70, 110];
  const dyAt = (i: number) => hops.reduce((a, h, j) => a + hop(i, h, hh[j], 14).dy, 0);
  const cur = hops.map((h, j) => hop(f, h, hh[j], 14));
  const dy = cur.reduce((a, c) => a + c.dy, 0);
  const sq = cur.reduce((a, c) => a * c.sq, 1);
  const air = Math.max(...cur.map((c) => c.air));
  const face = faceAt(f, MOODS.map((m) => ({at: m.at, face: FACES[m.k]})));
  const sink = f > 180 && f < 230 ? ease(f, 180, 196, 0, 1) * 0.06 : 0;
  const shake = f > 225 && f < 262 ? Math.sin(f * 2.1) * 6 : 0;
  const vib = f > 225 && f < 262 ? 1.5 : f >= 262 ? 3 * Math.exp(-(f - 262) / 14) : 0;
  const mood = [...MOODS].reverse().find((m) => f >= m.at)!;
  const bg = interpolateColors(
    f,
    [0, 90, 135, 180, 225, 262],
    ['#3b2a86', '#1f4f86', '#7a4bb0', '#262c5c', '#6e1f3a', '#3b2a86'],
  );
  return (
    <AbsoluteFill>
      <Bg top={bg} bottom="#100f26" />
      <Svg>
        <Stars n={40} seed={4} />
        <Ground y={1380} />
        {f >= 225 && f < 262 && Math.floor(f / 3) % 2 === 0 && (
          <path d={`M${560 + rnd(f) * 60},700 l-40,90 l40,-10 l-30,100`} stroke={C.gold} strokeWidth={10} fill="none" strokeLinejoin="round" />
        )}
        <Nodo3
          id="a3"
          x={540 + shake}
          y={1380}
          s={1.7}
          dy={dy}
          sq={sq * (1 - sink) * (1 + wob(f, 1) * 0.01)}
          airK={air}
          face={face}
          antDyn={clamp(lag(f, dyAt, 0.5) * 0.9, -70, 70)}
          antVib={vib}
          blink={blink(f, 5)}
          look={f < 90 ? [0.2, -0.6] : f < 180 ? [0.4, -0.3] : f < 225 ? [-0.3, 0.7] : [0, 0]}
          lean={f > 90 && f < 135 ? 6 : 0}
          showRig={f > 6 && f < 86}
        />
        {f < 86 && (
          <g opacity={clamp((f - 14) / 8, 0, 1) * clamp((86 - f) / 6, 0, 1)}>
            <rect x={60} y={560} width={250} height={330} rx={26} fill="#0f0e22" stroke={C.ink} strokeWidth={6} />
            <Nodo id="ao" x={185} y={860} s={0.48} flat expr="plano" />
            <path d="M90,600 L280,860 M280,600 L90,860" stroke={C.coral} strokeWidth={14} strokeLinecap="round" opacity={f > 30 ? 1 : 0} />
            <text x={185} y={936} textAnchor="middle" fontFamily={FONT} fontSize={44} fill={C.cream} stroke={C.ink} strokeWidth={9} paintOrder="stroke">
              ANTES: PALO
            </text>
          </g>
        )}
      </Svg>
      <Chip n="01" t="ANTENA CON ALMA" />
      <Big text="La antena ya |no es un *palo" at={8} y={300} size={118} out={84} />
      {f > 30 && f < 86 && <Tag x={790} y={720} at={30} text="4 huesos con retraso" size={42} bg={C.gold} rot={4} />}
      {MOODS.slice(1).map((m, i) => (
        <Tag key={m.k} x={540} y={420} at={m.at + 2} out={(MOODS[i + 2]?.at ?? 999) - 3} text={m.t} size={96} bg={i % 2 ? C.coral : C.gold} rot={-3 + (i % 2) * 6} />
      ))}
      {f >= 262 && <Tag x={540} y={560} at={272} text="la única vez que va recta" size={44} bg={C.cream} rot={2} />}
      <Tag x={540} y={1700} at={96} out={262} text={`forma de antena = emoción`} size={46} bg={C.teal} rot={-2} />
    </AbsoluteFill>
  );
};

// ========== 3. Volumen y luz ==========
const Luz: React.FC = () => {
  const f = useCurrentFrame();
  const shade = ease(f, 40, 70, 0, 1);
  const ang = -125 + ease(f, 80, 236, 0, 1, Easing.inOut(Easing.sin)) * 290;
  const r = (ang * Math.PI) / 180;
  const ox = 540 + Math.cos(r) * 420;
  const oy = 1000 + Math.sin(r) * 380;
  const lamp = f >= 76 ? sp(f, 76, SPR.pop) : 0;
  const lookV: [number, number] = f >= 76 ? [Math.cos(r), Math.sin(r) * 0.8] : [0, 0];
  const warm = interpolateColors(Math.cos(r), [-1, 1], ['#7fd8ff', '#ffb36b']);
  return (
    <AbsoluteFill>
      <Bg top="#14204a" bottom="#07081a" />
      <Svg>
        <Stars n={30} seed={9} />
        <Ground y={1380} color="#0e1430" />
        {lamp > 0 && <ellipse cx={540 + Math.cos(r) * -140} cy={1392} rx={260} ry={26} fill="#000" opacity={0.3} />}
        <Nodo3
          id="l3"
          x={540}
          y={1380}
          s={1.75}
          face={f < 76 ? FACES.calma : FACES.curioso}
          shade={shade}
          light={f >= 76 ? ang : -125}
          rim={warm}
          look={lookV}
          turn={f >= 76 ? Math.cos(r) * 0.6 : 0}
          blink={blink(f, 7)}
          sq={1 + wob(f, 3) * 0.01}
          lean={f >= 76 ? Math.cos(r) * 4 : 0}
        />
        {lamp > 0 && (
          <g transform={`translate(${ox},${oy}) scale(${lamp})`}>
            <circle r={150} fill={warm} opacity={0.18} />
            <circle r={80} fill={warm} opacity={0.3} />
            <circle r={44} fill="#fffbe8" stroke={C.ink} strokeWidth={7} />
            {Array.from({length: 8}).map((_, i) => {
              const a = (i / 8) * Math.PI * 2 + f / 20;
              return <line key={i} x1={Math.cos(a) * 58} y1={Math.sin(a) * 58} x2={Math.cos(a) * 80} y2={Math.sin(a) * 80} stroke="#fffbe8" strokeWidth={8} strokeLinecap="round" />;
            })}
          </g>
        )}
      </Svg>
      <Chip n="02" t="VOLUMEN Y LUZ" />
      <Big text="De *plano |a redondo" at={8} y={300} size={124} out={76} />
      <div style={{position: 'absolute', top: 1500, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div style={{width: 640, height: 34, borderRadius: 17, background: '#0f0e22', border: `6px solid ${C.ink}`, position: 'relative', opacity: f < 80 ? 1 : clamp((90 - f) / 10, 0, 1)}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${shade * 100}%`, background: C.teal, borderRadius: 14}} />
          <div style={{position: 'absolute', left: -20, top: -64, fontFamily: FONT, fontSize: 40, color: C.cream}}>PLANO</div>
          <div style={{position: 'absolute', right: -20, top: -64, fontFamily: FONT, fontSize: 40, color: C.teal}}>VOLUMEN</div>
        </div>
      </div>
      <Tag x={260} y={1560} at={96} text="sombra propia" size={42} bg={C.cream} rot={-4} />
      <Tag x={800} y={1560} at={112} text="luz de borde" size={42} bg={warm} rot={3} />
      <Tag x={290} y={1680} at={128} text="brillo que sigue la luz" size={42} bg={C.gold} rot={2} />
      <Tag x={760} y={1690} at={144} text="ojos que miran" size={42} bg={C.teal} rot={-3} />
      <Big text="la luz *manda" at={150} y={330} size={110} />
    </AbsoluteFill>
  );
};

// ========== 4. Caras ==========
const CARAS: {k: keyof typeof FACES; t: string; bg: string}[] = [
  {k: 'feliz', t: 'FELIZ', bg: '#7a4bb0'},
  {k: 'curioso', t: 'CURIOSO', bg: '#1f4f86'},
  {k: 'enojado', t: 'ENOJADO', bg: '#6e1f3a'},
  {k: 'triste', t: 'TRISTE', bg: '#262c5c'},
  {k: 'sorpresa', t: '¡SORPRESA!', bg: '#7a3a1f'},
  {k: 'picaro', t: 'PÍCARO', bg: '#6a2a6e'},
  {k: 'decidido', t: 'DECIDIDO', bg: '#1e5a4a'},
  {k: 'calma', t: 'EN CALMA', bg: '#2d3184'},
];
const Caras: React.FC = () => {
  const f = useCurrentFrame();
  const STEP = 45;
  const idx = clamp(Math.floor(f / STEP), 0, CARAS.length - 1);
  const keys = CARAS.map((c, i) => ({at: i * STEP, face: FACES[c.k]}));
  const face = faceAt(f, keys);
  const lt = f - idx * STEP;
  const c = CARAS[idx];
  const bg = interpolateColors(f, CARAS.map((_, i) => i * STEP), CARAS.map((x) => x.bg));
  // reacción corporal por emoción
  let dy = 0, sq = 1, lean = 0, x = 540, turn = 0, air = 0;
  const hops = [0, 4 * STEP];
  const dyAt = (i: number) => hops.reduce((a, h, j) => a + hop(i, h, j ? 200 : 110, 15).dy, 0) + (i > 2 * STEP && i < 3 * STEP ? Math.sin(i * 2.1) * 4 : 0);
  for (const [j, h] of hops.entries()) {
    const r = hop(f, h, j ? 200 : 110, 15);
    dy += r.dy;
    sq *= r.sq;
    air = Math.max(air, r.air);
  }
  if (c.k === 'curioso') lean = ease(lt, 0, 12, 0, 9);
  if (c.k === 'enojado') x += Math.sin(f * 2.2) * 5 * clamp((30 - lt) / 30, 0.2, 1);
  if (c.k === 'triste') sq *= 1 - ease(lt, 0, 16, 0, 0.07);
  if (c.k === 'picaro') {
    lean = -6;
    turn = 0.5;
  }
  if (c.k === 'decidido') sq *= 1 + ease(lt, 0, 10, 0, 0.04);
  const tilts: Record<string, [number, number]> = {feliz: [0, -0.2], curioso: [0.6, -0.5], enojado: [0, 0.1], triste: [-0.3, 0.8], sorpresa: [0, -0.2], picaro: [0.8, 0], decidido: [0.3, 0], calma: [0, 0]};
  return (
    <AbsoluteFill>
      <Bg top={bg} bottom="#0f0e22" />
      <Svg>
        <Stars n={36} seed={12} />
        <Ground y={1400} />
        {c.k === 'sorpresa' && <Sparks x={540} y={900} at={4 * STEP + 2} n={12} r={330} color={C.cream} />}
        {c.k === 'feliz' && <Sparks x={540} y={1000} at={20} n={10} r={300} />}
        <Nodo3
          id="c3"
          x={x}
          y={1400}
          s={1.85}
          dy={dy}
          sq={sq}
          lean={lean}
          turn={turn}
          airK={air}
          face={face}
          antDyn={clamp(lag(f, dyAt, 0.5) * 0.9, -70, 70)}
          antVib={c.k === 'sorpresa' ? 3 * Math.exp(-lt / 12) : c.k === 'enojado' ? 1 : 0}
          blink={c.k === 'sorpresa' ? 0 : blink(f, 11)}
          look={tilts[c.k]}
          rim={interpolateColors(0.5, [0, 1], [bg, '#ffffff'])}
        />
      </Svg>
      <Chip n="03" t="CARAS QUE ACTÚAN" />
      {CARAS.map((cc, i) => (
        <Tag key={cc.k} x={540} y={400} at={i * STEP + 2} out={(i + 1) * STEP - 3} text={cc.t} size={120} bg={i % 2 ? C.coral : C.gold} rot={(i % 2 ? 4 : -4)} />
      ))}
      <div style={{position: 'absolute', top: 1560, width: '100%', textAlign: 'center', fontFamily: MONO, fontSize: 36, color: C.cream, opacity: 0.85}}>
        cejas · párpados · boca · mejillas · antena
      </div>
    </AbsoluteFill>
  );
};

// ========== 5. Manos ==========
const Manos: React.FC = () => {
  const f = useCurrentFrame();
  const pin = (at: number) => (f < at ? 0 : sp(f, at, SPR.pop));
  const ph = f < 90 ? 'wave' : f < 150 ? 'point' : f < 200 ? 'thumb' : 'shrug';
  let l: HandP, r: HandP;
  const bob = Math.sin(f / 8) * 8;
  if (ph === 'wave') {
    const w = Math.sin(f / 3.2);
    l = {x: -200, y: -260 + bob, r: -15 + w * 26, pose: 'wave', s: pin(10) * 1.15};
    r = {x: 190, y: -70 - bob, r: 10, pose: 'fist', s: pin(16) * 1.15};
  } else if (ph === 'point') {
    const k = sp(f, 90, SPR.snappy);
    l = {x: -190, y: -80 + bob, r: -10, pose: 'fist', s: 1.15};
    r = {x: 190 + 30 * k, y: -230 - 60 * k, r: 20 + 10 * k, pose: 'point', s: 1.15};
  } else if (ph === 'thumb') {
    const k = sp(f, 150, SPR.pop);
    l = {x: -180, y: -100 + bob, r: -8, pose: 'fist', s: 1.15};
    r = {x: 200, y: -140 - 30 * k, r: 0, pose: 'thumb', s: 1.15 * (0.8 + 0.2 * k)};
  } else {
    const k = sp(f, 200, SPR.pop);
    l = {x: -210 - 20 * k, y: -150 - 30 * k, r: -60 * k, pose: 'open', s: 1.15};
    r = {x: 210 + 20 * k, y: -150 - 30 * k, r: 60 * k, pose: 'open', s: 1.15};
  }
  const face = faceAt(f, [
    {at: 0, face: FACES.feliz},
    {at: 90, face: FACES.decidido},
    {at: 150, face: FACES.picaro},
    {at: 200, face: FACES.curioso},
  ]);
  const h = hop(f, 150, 80, 12);
  const dyAt = (i: number) => hop(i, 150, 80, 12).dy + (i > 200 ? -ease(i, 200, 210, 0, 30) : 0);
  return (
    <AbsoluteFill>
      <Bg top="#1e5a4a" bottom="#0c1a22" />
      <Svg>
        <Stars n={30} seed={21} />
        <Ground y={1400} />
        <Nodo3
          id="m3"
          x={540}
          y={1400}
          s={1.7}
          face={face}
          dy={h.dy - (f > 200 ? ease(f, 200, 210, 0, 30) : 0)}
          sq={h.sq}
          airK={h.air}
          hands={{l, r}}
          blink={blink(f, 13)}
          look={ph === 'point' ? [0.8, -0.8] : [0, 0]}
          antDyn={clamp(lag(f, dyAt, 0.5) * 0.9, -60, 60)}
          lean={ph === 'point' ? 5 : ph === 'shrug' ? -3 : 0}
          turn={ph === 'point' ? 0.4 : 0}
        />
        {ph === 'point' && <Sparks x={900} y={560} at={100} n={8} r={120} />}
      </Svg>
      <Chip n="04" t="MANOS FLOTANTES" />
      <Big text="¡Ahora |*saluda!" at={10} y={300} size={124} out={86} />
      {ph === 'point' && <Tag x={800} y={560} at={96} out={146} text="¡MIRA ESTO!" size={70} bg={C.gold} rot={6} />}
      {ph === 'thumb' && <Big text="*señala, aprueba…" at={152} y={330} size={96} out={196} step={3} />}
      {ph === 'shrug' && <Big text="…y duda" at={202} y={330} size={120} />}
    </AbsoluteFill>
  );
};

// ========== 6. Habla (boca sincronizada + ducking) ==========
type Syl = {f: number; d: number; v: 'a' | 'e' | 'i' | 'o' | 'u'};
const SYL = SPEECH.syl as Syl[];
const OFF6 = 1380;
const talkAt = (gf: number) => {
  let o = 0;
  let v: Syl['v'] = 'a';
  for (const s of SYL) {
    const d = gf - s.f;
    if (d >= -1 && d < s.d + 3) {
      const k = d < 1 ? (d + 1) / 2 : d < s.d ? 1 : 1 - (d - s.d) / 3;
      if (k > o) {
        o = k;
        v = s.v;
      }
    }
  }
  return {o, v};
};
// mismo cálculo que el mezclador: -9 dB mientras habla
export const duckAt = (gf: number) => {
  let near = 99;
  for (const s of SYL) {
    if (gf >= s.f - 2 && gf <= s.f + s.d) near = 0;
    else near = Math.min(near, Math.abs(gf - s.f), Math.abs(gf - s.f - s.d));
  }
  return near === 0 ? 1 : clamp(1 - (near - 0) / 8, 0, 1);
};
const Habla: React.FC = () => {
  const f = useCurrentFrame();
  const gf = f + OFF6;
  const t = talkAt(gf);
  const lines = (SPEECH.lines as {w: string; at: number}[][]).map((ln) => ln.map((w) => ({w: w.w, at: w.at - OFF6})));
  const face = faceAt(f, [
    {at: 0, face: FACES.calma},
    {at: 16, face: FACES.feliz},
    {at: 70, face: FACES.picaro},
    {at: 118, face: FACES.decidido},
    {at: 146, face: FACES.feliz},
  ]);
  // la música se agacha
  let duck = 0;
  for (let i = 0; i < 6; i++) duck = Math.max(duck, duckAt(gf - i) * (1 - i / 8));
  const level = 1 - duck * 0.65;
  const bounce = t.o * 0.03;
  return (
    <AbsoluteFill>
      <Bg top="#4a2a7a" bottom="#120f2a" />
      <Svg>
        <Stars n={30} seed={33} />
        <Ground y={1300} />
        <Nodo3
          id="h3"
          x={500}
          y={1300}
          s={1.7}
          face={face}
          talk={t.o}
          vowel={t.v}
          sq={1 + bounce + wob(f, 4) * 0.01}
          blink={blink(f, 17)}
          look={[0.15, 0.1]}
          antDyn={t.o * 8 * Math.sin(gf / 2)}
          hands={{
            l: {x: -190, y: -120 + Math.sin(f / 7) * 12 - t.o * 20, r: -20 + t.o * 15, pose: f > 118 && f < 146 ? 'fist' : 'open', s: 1.1},
            r: {x: 190, y: -100 + Math.cos(f / 6) * 10 - t.o * 14, r: 15, pose: f > 70 && f < 118 ? 'point' : 'open', s: 1.1},
          }}
        />
        {/* bocadillo de pitidos */}
        {t.o > 0.2 && (
          <g opacity={t.o}>
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M${790 + i * 30},${690 - i * 34} q24,-16 0,-34`} stroke={C.cream} strokeWidth={9} fill="none" strokeLinecap="round" opacity={1 - i * 0.25} />
            ))}
          </g>
        )}
      </Svg>
      <Chip n="05" t="VOZ Y BOCA" />
      <Karaoke lines={lines} y={1410} size={84} from={10} />
      {/* medidor de música (ducking) */}
      <div style={{position: 'absolute', right: 60, top: 380, width: 120, height: 460, background: '#0f0e22', border: `6px solid ${C.ink}`, borderRadius: 26, overflow: 'hidden'}}>
        <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: `${level * 100}%`, background: `linear-gradient(0deg, ${C.teal}, ${C.gold})`}} />
      </div>
      <div style={{position: 'absolute', right: 30, top: 856, width: 180, textAlign: 'center', fontFamily: FONT, fontSize: 36, color: C.cream, lineHeight: 1.05}}>
        MÚSICA
      </div>
      <Tag x={640} y={1760} at={60} text="la música se agacha cuando habla" size={40} bg={C.gold} rot={-2} />
      <Big text="Boca *sincronizada" at={4} y={300} size={100} />
    </AbsoluteFill>
  );
};

// ========== 7. Música por código ==========
const Bars: React.FC<{gf: number}> = ({gf}) => {
  const data = useAudioData(staticFile('mix.wav'));
  if (!data) return null;
  const v = visualizeAudio({fps: 30, frame: gf, audioData: data, numberOfSamples: 32});
  return (
    <g>
      {v.slice(0, 24).map((a, i) => {
        const h = clamp(Math.pow(a, 0.55) * 900, 10, 380);
        return <rect key={i} x={60 + i * 40} y={1840 - h} width={30} height={h} rx={10} fill={i % 3 === 0 ? C.coral : i % 3 === 1 ? C.teal : C.gold} stroke={C.ink} strokeWidth={4} />;
      })}
    </g>
  );
};
const OFF7 = 1620;
const Musica: React.FC = () => {
  const f = useCurrentFrame();
  const gf = f + OFF7;
  const beatT = (gf % BEAT) / BEAT;
  const onBeat = Math.exp(-((gf % BEAT) / 3));
  const bar = Math.floor(gf / 30) % 2;
  const h = hop(f % 30, 0, 60, 12);
  const dyAt = (i: number) => hop(((i % 30) + 30) % 30, 0, 60, 12).dy;
  const pan = -f * 2.2;
  const face = faceAt(f, [
    {at: 0, face: FACES.picaro},
    {at: 120, face: FACES.feliz},
  ]);
  const flash = f >= 120 && f < 126 ? 1 - (f - 120) / 6 : 0;
  return (
    <AbsoluteFill>
      <Bg top={f >= 120 ? '#ff6f61' : '#5a2d91'} bottom={f >= 120 ? '#3a1458' : '#120a2a'} />
      <Svg>
        {/* luces de escenario al ritmo */}
        {[160, 540, 920].map((lx, i) => (
          <path key={i} d={`M${lx - 40},0 L${lx + 40},0 L${lx + 260 * Math.sin(gf / 20 + i * 2)},1500 L${lx - 260 + 260 * Math.sin(gf / 20 + i * 2)},1500 Z`} fill={[C.gold, C.teal, C.coral][i]} opacity={0.08 + 0.12 * onBeat} />
        ))}
        {/* multiplano: lejos (lento, desaturado) → cerca (rápido, contraste) */}
        <g transform={`translate(${(pan * 0.2) % 540},0)`} opacity={0.5}>
          {Array.from({length: 6}).map((_, i) => (
            <path key={i} d={`M${i * 540 - 540},1200 q270,-260 540,0 Z`} fill="#3a2a6e" />
          ))}
        </g>
        <g transform={`translate(${(pan * 0.5) % 360},0)`}>
          {Array.from({length: 8}).map((_, i) => {
            const hh = 180 + rnd(i) * 220;
            return (
              <g key={i}>
                <rect x={i * 180 - 360} y={1260 - hh} width={130} height={hh} rx={14} fill="#241a4a" stroke={C.ink} strokeWidth={5} />
                {Array.from({length: Math.floor(hh / 60)}).map((_, j) => (
                  <rect key={j} x={i * 180 - 340} y={1280 - hh + j * 56} width={90} height={14} rx={7} fill={j % 2 ? C.teal : C.gold} opacity={0.25 + 0.5 * (Math.floor(gf / BEAT + i + j) % 3 === 0 ? 1 : 0)} />
                ))}
              </g>
            );
          })}
        </g>
        <Ground y={1300} color="#120f2a" />
        <Nodo3
          id="d3"
          x={540}
          y={1300}
          s={1.55}
          dy={h.dy}
          sq={h.sq}
          airK={h.air}
          lean={bar ? 7 : -7}
          face={face}
          wear="auriculares"
          antDyn={clamp(lag(f, dyAt, 0.6) * 0.9, -70, 70)}
          blink={blink(f, 19)}
          look={[bar ? 0.5 : -0.5, -0.2]}
          rim={f >= 120 ? '#ffd25a' : '#c79bff'}
          hands={{
            l: {x: -200, y: -200 + Math.sin(gf / 4.77) * 60, r: -20, pose: f >= 120 ? 'point' : 'fist', s: 1.1},
            r: {x: 200, y: -200 - Math.sin(gf / 4.77) * 60, r: 20, pose: f >= 120 ? 'point' : 'fist', s: 1.1},
          }}
        />
        {/* primer plano que pasa rápido (profundidad) */}
        <g transform={`translate(${((pan * 1.8) % 1400) + 1400},0)`}>
          <path d="M-200,1920 Q-120,1500 -60,1520 Q0,1540 40,1920 Z" fill="#0a0716" />
          <path d="M-700,1920 Q-640,1600 -560,1620 Q-500,1650 -480,1920 Z" fill="#0a0716" />
        </g>
        <Bars gf={gf} />
        {beatT < 0.2 && <circle cx={540} cy={900} r={500} fill="#fff" opacity={0.03} />}
      </Svg>
      <Chip n="06" t="MÚSICA HECHA CON CÓDIGO" />
      <Tag x={250} y={360} at={6} text="batería" size={52} bg={C.gold} rot={-5} />
      <Tag x={780} y={360} at={30} text="bajo" size={52} bg={C.teal} rot={4} />
      <Tag x={290} y={480} at={60} text="piano eléctrico" size={52} bg={C.cream} rot={3} />
      <Tag x={760} y={490} at={90} text="el tema de Nodo" size={52} bg={C.coral} rot={-3} />
      <Big text="¡SUBE DE *TONO!" at={122} y={1330} size={100} />
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.7}} />
    </AbsoluteFill>
  );
};

// ========== 8. Créditos ==========
const ROLES = [
  {t: 'DIBUJO', s: 'volumen · luz · cejas · manos', c: C.gold},
  {t: 'ANIMACIÓN', s: 'antena de 4 huesos · actuación', c: '#7fd8ff'},
  {t: 'SONIDO', s: 'voz de pitidos · efectos con capas', c: C.coral},
  {t: 'MÚSICA', s: 'tema de Nodo · mezcla que respira', c: '#c79bff'},
];
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const logo = 90;
  const bow = f >= 128 && f < 170 ? Math.sin(((f - 128) / 42) * Math.PI) : 0;
  const h = hop(f, logo - 6, 160, 16);
  const dyAt = (i: number) => hop(i, logo - 6, 160, 16).dy + (i >= 128 && i < 170 ? Math.sin(((i - 128) / 42) * Math.PI) * 30 : 0);
  const fade = clamp((f - 214) / 26, 0, 1);
  return (
    <AbsoluteFill>
      <Bg top="#2d3184" bottom="#0b0b1e" />
      <Svg>
        <Stars n={60} seed={41} />
        <Ground y={1460} />
        <Sparks x={540} y={1200} at={logo + 14} n={16} r={460} />
        <Sparks x={540} y={1200} at={logo + 20} n={10} r={300} color={C.coral} />
        {f >= logo - 10 && (
          <Nodo3
            id="o3"
            x={540}
            y={1460}
            s={1.5 * sp(f, logo - 10, SPR.pop)}
            dy={h.dy}
            sq={h.sq}
            airK={h.air}
            lean={bow * 22}
            face={faceAt(f, [
              {at: 0, face: FACES.feliz},
              {at: 128, face: FACES.calma},
              {at: 170, face: FACES.feliz},
            ])}
            antDyn={clamp(lag(f, dyAt, 0.5) * 0.9, -60, 60) + bow * 30}
            blink={blink(f, 23)}
            hands={{
              l: {x: -190, y: -170 + Math.sin(f / 4) * 8, r: -20 + Math.sin(f / 3.2) * 25, pose: 'wave', s: 1.1},
              r: {x: 190, y: -60 + bow * 40, r: 20, pose: f < 128 ? 'thumb' : 'open', s: 1.1},
            }}
          />
        )}
      </Svg>
      <Big text="Un equipo de |expertos en…" at={4} y={150} size={92} out={logo - 4} step={3} />
      {f < logo &&
        ROLES.map((r, i) => {
          const at = 15 + i * 15;
          if (f < at) return null;
          const s = sp(f, at, SPR.pop);
          const flip = (1 - s) * 90;
          return (
            <div
              key={r.t}
              style={{
                position: 'absolute',
                left: 90,
                right: 90,
                top: 470 + i * 200,
                height: 170,
                background: r.c,
                border: `7px solid ${C.ink}`,
                borderRadius: 32,
                boxShadow: `0 10px 0 ${C.ink}`,
                transform: `perspective(900px) rotateX(${flip}deg) rotate(${i % 2 ? 1.5 : -1.5}deg)`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div style={{fontFamily: FONT, fontSize: 84, color: C.ink, lineHeight: 1}}>{r.t}</div>
              <div style={{fontFamily: FONT_T, fontWeight: 900, fontSize: 34, color: C.ink, opacity: 0.8}}>{r.s}</div>
            </div>
          );
        })}
      {f >= logo && <Big text="HECHO DE *NADA" at={logo} y={300} size={128} step={4} rot={-3} />}
      {f >= logo && <Big text="mejorado al *100%" at={logo + 24} y={520} size={86} step={4} rot={2} />}
      <div style={{position: 'absolute', top: 1620, width: '100%', textAlign: 'center', fontFamily: MONO, fontSize: 34, color: '#7fe9cf', opacity: f > logo + 30 ? 0.9 : 0}}>
        @hechodenada · todo hecho con código
      </div>
      <AbsoluteFill style={{background: '#000', opacity: fade}} />
    </AbsoluteFill>
  );
};

// ---------- montaje ----------
export const SCENES: {C: React.FC; from: number; dur: number}[] = [
  {C: Intro, from: 0, dur: 240},
  {C: Antena, from: 240, dur: 300},
  {C: Luz, from: 540, dur: 240},
  {C: Caras, from: 780, dur: 360},
  {C: Manos, from: 1140, dur: 240},
  {C: Habla, from: 1380, dur: 240},
  {C: Musica, from: 1620, dur: 240},
  {C: Outro, from: 1860, dur: 240},
];
export const CUTS: {at: number; t: 'iris' | 'wipe' | 'smear'}[] = [
  {at: 240, t: 'iris'},
  {at: 540, t: 'wipe'},
  {at: 780, t: 'smear'},
  {at: 1140, t: 'iris'},
  {at: 1380, t: 'wipe'},
  {at: 1620, t: 'smear'},
  {at: 1860, t: 'iris'},
];

const io = Easing.inOut(Easing.cubic);
const Transition: React.FC = () => {
  const f = useCurrentFrame();
  const cut = CUTS.find((c) => Math.abs(f - c.at) <= 10);
  if (!cut) return null;
  const d = f - cut.at;
  if (cut.t === 'iris') {
    const r = d < 0 ? interpolate(d, [-9, 0], [1500, 0], {extrapolateLeft: 'clamp', easing: io}) : interpolate(d, [0, 9], [0, 1500], {extrapolateRight: 'clamp', easing: io});
    if (r >= 1499) return null;
    return (
      <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <path d={`M0,0 H1080 V1920 H0 Z M${540 - r},1150 a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`} fill={C.ink} fillRule="evenodd" />
        <circle cx={540} cy={1150} r={r} fill="none" stroke={C.coral} strokeWidth={14} opacity={r > 4 ? 1 : 0} />
      </svg>
    );
  }
  if (cut.t === 'wipe') {
    const x = interpolate(d, [-9, 9], [-1500, 2600], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: io});
    return (
      <AbsoluteFill>
        <div style={{position: 'absolute', left: x - 1250, top: -600, width: 2500, height: 3200, background: C.coral, transform: 'rotate(14deg)', borderLeft: `24px solid ${C.ink}`, borderRight: `24px solid ${C.ink}`}} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      {Array.from({length: 8}).map((_, i) => {
        const p = (d + 8 - i * 0.25) / 16;
        const b = interpolate(p, [0, 0.4], [0, 1080], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
        const a = interpolate(p, [0.6, 1], [0, 1080], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
        return <div key={i} style={{position: 'absolute', top: i * 240, height: 242, left: a, width: Math.max(0, b - a), background: i % 2 ? C.ink : '#24224a'}} />;
      })}
    </AbsoluteFill>
  );
};

const HITS = [150, 179, 240 + 262, 780 + 180, 1140 + 150, 1620 + 120, 1860 + 90];

export const Demo3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Cam hits={HITS} push={0}>
        {SCENES.map(({C: S, from, dur}, i) => (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Cam push={0.05}>
              <S />
            </Cam>
          </Sequence>
        ))}
      </Cam>
      <Vignette />
      <Transition />
      <Grain opacity={0.13} />
      <Audio src={staticFile('mix.wav')} />
    </AbsoluteFill>
  );
};
