import React from 'react';
import {interpolateColors, useCurrentFrame} from 'remotion';
import {C, rnd} from './kit';
import {Hat, Wear} from './Nodo';

// ---------- Cara paramétrica: toda expresión es un set de números, así se pueden mezclar ----------
export type Face = {
  bL: number; // ceja izq: ángulo (+ = punta interior arriba)
  bR: number;
  hL: number; // ceja izq: altura extra
  hR: number;
  lid: number; // párpado superior 0 abierto .. 1 cerrado
  lidA: number; // inclinación del párpado (+ = enojado)
  lidB: number; // párpado inferior (ojos que sonríen)
  pup: number; // tamaño de pupila
  mw: number; // ancho de boca
  mc: number; // curva (+ sonrisa, - tristeza)
  mo: number; // apertura
  ma: number; // asimetría (+ sube la comisura derecha)
  blush: number;
  ant: [number, number, number, number]; // forma de reposo de la antena (grados por tramo)
  glow: string;
  gk: number; // brillo del foco
};

export const FACES: Record<string, Face> = {
  calma: {bL: 0, bR: 5, hL: 0, hR: 3, lid: 0.2, lidA: 0, lidB: 0.08, pup: 1, mw: 64, mc: 0.55, mo: 0, ma: 0.25, blush: 0.25, ant: [-14, 16, 24, 30], glow: '#ff8a6a', gk: 0.6},
  feliz: {bL: 8, bR: 6, hL: 12, hR: 14, lid: 0, lidA: 0, lidB: 0.6, pup: 1.1, mw: 82, mc: 1, mo: 0.55, ma: 0, blush: 0.75, ant: [-6, -12, 6, 26], glow: '#ffd25a', gk: 1},
  curioso: {bL: -6, bR: 20, hL: -4, hR: 22, lid: 0.12, lidA: 0, lidB: 0, pup: 1.3, mw: 38, mc: 0.1, mo: 0.18, ma: 0.6, blush: 0.2, ant: [12, 36, 56, 74], glow: '#7fd8ff', gk: 0.9},
  triste: {bL: 28, bR: 26, hL: 4, hR: 6, lid: 0.4, lidA: -12, lidB: 0, pup: 1.35, mw: 50, mc: -0.75, mo: 0.06, ma: -0.15, blush: 0.1, ant: [34, 44, 46, 38], glow: '#6a8cff', gk: 0.35},
  enojado: {bL: -30, bR: -28, hL: -12, hR: -12, lid: 0.34, lidA: 18, lidB: 0.18, pup: 0.7, mw: 58, mc: -0.5, mo: 0.28, ma: 0.25, blush: 0, ant: [16, -50, 54, -46], glow: '#ff3b3b', gk: 1},
  sorpresa: {bL: 6, bR: 4, hL: 32, hR: 34, lid: 0, lidA: 0, lidB: 0, pup: 0.55, mw: 34, mc: 0, mo: 1, ma: 0, blush: 0.15, ant: [0, 0, 0, 0], glow: '#ffffff', gk: 1},
  picaro: {bL: -16, bR: 22, hL: -6, hR: 16, lid: 0.38, lidA: 6, lidB: 0.3, pup: 1, mw: 70, mc: 0.85, mo: 0, ma: 0.8, blush: 0.55, ant: [-16, -26, 8, 46], glow: '#ff6fae', gk: 0.9},
  decidido: {bL: -16, bR: -12, hL: -6, hR: -4, lid: 0.26, lidA: 8, lidB: 0.1, pup: 0.9, mw: 56, mc: 0.3, mo: 0, ma: -0.35, blush: 0.15, ant: [-8, -6, -4, -2], glow: '#ffd25a', gk: 0.9},
};

const mixN = (a: number, b: number, t: number) => a + (b - a) * t;
export const mixFace = (a: Face, b: Face, t: number): Face => {
  const o = {} as Face;
  (Object.keys(a) as (keyof Face)[]).forEach((k) => {
    if (k === 'ant') o.ant = a.ant.map((v, i) => mixN(v, b.ant[i], t)) as Face['ant'];
    else if (k === 'glow') o.glow = interpolateColors(t, [0, 1], [a.glow, b.glow]);
    else (o[k] as number) = mixN(a[k] as number, b[k] as number, t);
  });
  return o;
};

// ---------- Manos flotantes ----------
export type Pose = 'open' | 'fist' | 'point' | 'thumb' | 'wave';
export type HandP = {x: number; y: number; r?: number; pose?: Pose; s?: number};

const GLOVE = '#fffaf0';
export const Hand: React.FC<HandP & {flip?: boolean}> = ({x, y, r = 0, pose = 'open', s = 1, flip}) => {
  const st = {stroke: C.ink, strokeWidth: 7, strokeLinejoin: 'round' as const};
  return (
    <g transform={`translate(${x},${y}) rotate(${r}) scale(${(flip ? -1 : 1) * s},${s})`}>
      {(pose === 'open' || pose === 'wave') && (
        <g>
          {[-22, -7, 8, 22].map((fx, i) => (
            <rect key={i} x={fx - 8} y={-58 + Math.abs(i - 1.5) * 6} width={16} height={44} rx={8} fill={GLOVE} {...st} />
          ))}
          <ellipse cx={-30} cy={-6} rx={11} ry={20} transform="rotate(-38,-30,-6)" fill={GLOVE} {...st} />
          <ellipse cx={0} cy={0} rx={32} ry={28} fill={GLOVE} {...st} />
          <path d="M-14,-6 Q0,6 14,-6" stroke="#d9cfbd" strokeWidth={4} fill="none" />
        </g>
      )}
      {pose !== 'open' && pose !== 'wave' && (
        <g>
          {pose === 'point' && <rect x={-10} y={-74} width={20} height={56} rx={10} fill={GLOVE} {...st} />}
          {pose === 'thumb' && <rect x={-36} y={-64} width={22} height={50} rx={11} fill={GLOVE} {...st} />}
          <rect x={-30} y={-26} width={62} height={52} rx={22} fill={GLOVE} {...st} />
          <path d="M-12,-22 L-12,-8 M4,-22 L4,-8 M18,-22 L18,-8" stroke="#d9cfbd" strokeWidth={4} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

// ---------- Nodo 3.0 ----------
export type Nodo3Props = {
  id: string;
  x: number;
  y: number;
  s?: number;
  sq?: number;
  lean?: number;
  dy?: number;
  airK?: number;
  face?: Face;
  look?: [number, number];
  blink?: number;
  turn?: number; // -1..1 giro de 3/4
  light?: number; // ángulo de la luz en grados (0 = derecha, -90 = arriba)
  rim?: string; // color de luz de borde (el del ambiente)
  shade?: number; // 0 = plano (antes) .. 1 = volumen completo
  antDyn?: number; // empuje dinámico de la antena (grados)
  antVib?: number; // vibración rápida (sorpresa / zap)
  talk?: number; // 0..1 apertura por sílaba
  vowel?: 'a' | 'e' | 'i' | 'o' | 'u';
  hands?: {l?: HandP; r?: HandP};
  wear?: Wear;
  boil?: number;
  showRig?: boolean; // muestra los huesos de la antena (escena técnica)
};

const BODY_PTS = [
  [6, -282],
  [26, -232], [122, -172], [122, -92],
  [122, -30], [72, 8], [0, 8],
  [-72, 8], [-122, -30], [-122, -92],
  [-122, -168], [-18, -226], [6, -282],
];

const bodyPath = (b: (i: number) => number) => {
  const p = BODY_PTS.map(([x, y], i) => [x + b(i * 2), y + b(i * 2 + 1)]);
  p[12] = p[0];
  return `M${p[0][0]},${p[0][1]} C${p[1]} ${p[2]} ${p[3]} C${p[4]} ${p[5]} ${p[6]} C${p[7]} ${p[8]} ${p[9]} C${p[10]} ${p[11]} ${p[12]} Z`;
};

const VOW = {a: {o: 1, w: 66}, e: {o: 0.6, w: 76}, i: {o: 0.35, w: 82}, o: {o: 0.85, w: 40}, u: {o: 0.5, w: 30}};

export const Nodo3: React.FC<Nodo3Props> = ({
  id,
  x,
  y,
  s = 1,
  sq = 1,
  lean = 0,
  dy = 0,
  airK = 0,
  face = FACES.calma,
  look = [0, 0],
  blink = 0,
  turn = 0,
  light = -125,
  rim = '#ff9ad5',
  shade = 1,
  antDyn = 0,
  antVib = 0,
  talk = 0,
  vowel = 'a',
  hands,
  wear = 'none',
  boil = 1.6,
  showRig,
}) => {
  const f = useCurrentFrame();
  const fr = Math.floor(f / 2); // "dibujado en doses": el contorno hierve 15 veces por segundo
  const bo = (i: number) => (i < 2 || i > 23 ? 0 : (rnd(fr * 31 + i * 7 + id.length) - 0.5) * 2 * boil);
  const BP = bodyPath(bo);
  const BP0 = bodyPath(() => 0);
  const sx = 1 / Math.pow(sq, 0.8);
  const la = (light * Math.PI) / 180;
  const L = [Math.cos(la), Math.sin(la)];

  // antena: cadena de 4 huesos con retraso progresivo
  const idle = (i: number) => Math.sin(f / 14 - i * 0.7) * 3 + Math.sin(f / 6.1 - i) * 1.2;
  const pts: [number, number][] = [[6 + turn * 10, -278]];
  let th = 0;
  const angs: number[] = [];
  for (let i = 0; i < 4; i++) {
    th += face.ant[i] + antDyn * (0.35 + 0.3 * i) + idle(i) + antVib * Math.sin(f * 2.3 + i) * (i + 1) * 0.5;
    angs.push(th);
    const r = (th * Math.PI) / 180;
    const [px, py] = pts[i];
    pts.push([px + Math.sin(r) * 36, py - Math.cos(r) * 36]);
  }
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const segs: string[] = [];
  let prev: number[] = pts[0];
  for (let i = 1; i < 4; i++) {
    const m = mid(pts[i], pts[i + 1]);
    segs.push(`M${prev[0]},${prev[1]} Q${pts[i][0]},${pts[i][1]} ${m[0]},${m[1]}`);
    prev = m;
  }
  segs.push(`M${prev[0]},${prev[1]} L${pts[4][0]},${pts[4][1]}`);
  const tip = pts[4];
  const tipRot = angs[3];

  // pies de la cara: giro de 3/4
  const fx = turn * 30;
  const fsx = 1 - Math.abs(turn) * 0.1;
  const mo = Math.max(face.mo, VOW[vowel].o * talk);
  const mw = mixN(face.mw, VOW[vowel].w, talk * 0.8);

  const lx = look[0] * 10;
  const ly = look[1] * 8;

  const shadowCol = '#1f8f7a';
  const lit = `url(#lit${id})`;

  const Eye: React.FC<{cx: number; cy: number; r: number; side: 1 | -1; k: number}> = ({cx, cy, r, side, k}) => {
    const lid = Math.max(face.lid, blink);
    const e = -r + 2 * r * lid;
    const tA = Math.tan(((face.lidA * side) * Math.PI) / 180) * r;
    const eb = r - 2 * r * face.lidB * 0.32;
    const cid = `e${id}${side}`;
    return (
      <g transform={`translate(${cx},${cy})`}>
        <clipPath id={cid}>
          <circle r={r} />
        </clipPath>
        <circle r={r} fill="#fffaf0" />
        <g clipPath={`url(#${cid})`}>
          {shade > 0 && <ellipse cx={0} cy={-r * 0.95} rx={r * 1.1} ry={r * 0.55} fill="#2b2050" opacity={0.12 * shade} />}
          <circle cx={lx * k} cy={ly * k + 2} r={r * 0.52} fill={shade > 0 ? '#1d6b5c' : C.ink} />
          <circle cx={lx * k} cy={ly * k + 2} r={r * 0.32 * face.pup} fill={C.ink} />
          <circle cx={lx * k - r * 0.18} cy={ly * k - r * 0.16} r={r * 0.14} fill="#fff" />
          {shade > 0 && <circle cx={lx * k + r * 0.16} cy={ly * k + r * 0.2} r={r * 0.06} fill="#fff" opacity={0.8} />}
          {/* párpado superior */}
          <path
            d={`M${-r - 6},${-r - 6} L${r + 6},${-r - 6} L${r + 6},${e + tA} L${-r - 6},${e - tA} Z`}
            fill={shade > 0 ? '#58d3b4' : C.teal}
          />
          <path d={`M${-r - 6},${e - tA} L${r + 6},${e + tA}`} stroke={C.ink} strokeWidth={6} />
          {/* párpado inferior (ojos que sonríen) */}
          {face.lidB > 0.02 && (
            <>
              <path d={`M${-r - 6},${r + 6} L${-r - 6},${eb + r * 0.25} Q0,${eb - r * 0.5 * face.lidB} ${r + 6},${eb + r * 0.25} L${r + 6},${r + 6} Z`} fill="#4fc9ab" />
              <path d={`M${-r - 6},${eb + r * 0.25} Q0,${eb - r * 0.5 * face.lidB} ${r + 6},${eb + r * 0.25}`} stroke={C.ink} strokeWidth={5} fill="none" />
            </>
          )}
        </g>
        <circle r={r} fill="none" stroke={C.ink} strokeWidth={side === 1 ? 7 : 6} />
      </g>
    );
  };

  const Brow: React.FC<{cx: number; cy: number; ang: number; w: number}> = ({cx, cy, ang, w}) => (
    <g transform={`translate(${cx},${cy}) rotate(${ang})`}>
      <path d={`M${-w / 2},4 Q0,-8 ${w / 2},4`} stroke={C.ink} strokeWidth={13} strokeLinecap="round" fill="none" />
    </g>
  );

  // boca paramétrica
  const mcx = 4;
  const mcy = -60;
  const hw = mw / 2;
  const yL = mcy - face.mc * 13 + face.ma * 5;
  const yR = mcy - face.mc * 13 - face.ma * 11;
  const up = mcy + face.mc * 10 - mo * 8;
  const lo = mcy + face.mc * 10 + mo * 72 + 2;
  const mouthD = `M${mcx - hw},${yL} Q${mcx},${up} ${mcx + hw},${yR} Q${mcx},${lo} ${mcx - hw},${yL} Z`;

  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <defs>
        <linearGradient id={`lit${id}`} x1={0.5 - L[0] * 0.5} y1={0.5 - L[1] * 0.5} x2={0.5 + L[0] * 0.5} y2={0.5 + L[1] * 0.5}>
          <stop offset="0" stopColor="#3cc2a3" />
          <stop offset="0.6" stopColor={C.teal} />
          <stop offset="1" stopColor="#a6f7df" />
        </linearGradient>
        <radialGradient id={`gl${id}`}>
          <stop offset="0" stopColor={face.glow} stopOpacity={0.9 * face.gk} />
          <stop offset="1" stopColor={face.glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`ao${id}`} cx="0.5" cy="1" r="0.6">
          <stop offset="0" stopColor="#0b3b33" stopOpacity="0.55" />
          <stop offset="1" stopColor="#0b3b33" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`cb${id}`}>
          <path d={BP} />
        </clipPath>
      </defs>
      {/* sombra de contacto que se encoge en el aire */}
      <ellipse cx={0} cy={10} rx={124 * sx * (1 - airK * 0.5)} ry={17 * (1 - airK * 0.45)} fill="#000" opacity={0.34 * (1 - airK * 0.6)} />
      {shade > 0 && <ellipse cx={0} cy={10} rx={70 * sx * (1 - airK * 0.5)} ry={9} fill="#000" opacity={0.25 * (1 - airK)} />}
      <g transform={`translate(0,${dy}) rotate(${lean}) scale(${sx},${sq})`}>
        {/* antena: brillo detrás */}
        <circle cx={tip[0]} cy={tip[1]} r={70} fill={`url(#gl${id})`} />
        {segs.map((d, i) => (
          <path key={'k' + i} d={d} stroke={C.ink} strokeWidth={19 - i * 2.2} fill="none" strokeLinecap="round" />
        ))}
        {segs.map((d, i) => (
          <path key={'c' + i} d={d} stroke={i % 2 ? '#9ff0db' : C.tealL} strokeWidth={8.5 - i * 1.3} fill="none" strokeLinecap="round" />
        ))}
        <g transform={`translate(${tip[0]},${tip[1]}) rotate(${tipRot})`}>
          <rect x={-16} y={-30} width={32} height={46} rx={13} fill={C.coral} stroke={C.ink} strokeWidth={6} />
          <rect x={-16} y={-30} width={32} height={46} rx={13} fill={face.glow} opacity={0.35 * face.gk} />
          <rect x={-8} y={-22} width={7} height={18} rx={3.5} fill="#fff" opacity={0.7} />
        </g>
        {showRig &&
          pts.map((p, i) => (
            <g key={'r' + i}>
              {i > 0 && <line x1={pts[i - 1][0]} y1={pts[i - 1][1]} x2={p[0]} y2={p[1]} stroke={C.gold} strokeWidth={3} strokeDasharray="6 5" />}
              <circle cx={p[0]} cy={p[1]} r={8} fill={C.gold} stroke={C.ink} strokeWidth={3} />
            </g>
          ))}

        {/* cuerpo con volumen: luz de borde, sombra propia y luz principal */}
        {shade > 0 ? (
          <g clipPath={`url(#cb${id})`}>
            <path d={BP0} fill={interpolateColors(0.4, [0, 1], [shadowCol, rim])} transform="scale(1.1)" />
            <path d={BP0} fill={shadowCol} transform={`translate(${L[0] * 9 * shade},${L[1] * 9 * shade})`} />
            <path d={BP0} fill={lit} transform={`translate(${L[0] * 46 * shade},${L[1] * 46 * shade})`} />
            <ellipse cx={0} cy={0} rx={150} ry={70} fill={`url(#ao${id})`} />
            {/* brillo especular que sigue la luz */}
            <ellipse cx={L[0] * 62 + fx * 0.4} cy={-120 + L[1] * 70} rx={18} ry={36} fill="#fff" opacity={0.42 * shade} transform={`rotate(${28 + L[0] * 20},${L[0] * 62},${-120 + L[1] * 70})`} />
            <circle cx={L[0] * 62 + 12} cy={-120 + L[1] * 70 + 50} r={7} fill="#fff" opacity={0.4 * shade} />
          </g>
        ) : (
          <path d={BP} fill={C.teal} />
        )}
        {/* tinta: más gruesa del lado de la sombra */}
        <path d={BP} fill="none" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
        {shade > 0 && (
          <g clipPath={`url(#cb${id})`}>
            <path d={BP} fill="none" stroke={C.ink} strokeWidth={9} transform={`translate(${-L[0] * 5},${-L[1] * 5})`} />
          </g>
        )}

        {/* panza de código */}
        <g transform={`translate(${fx * 0.6},0)`}>
          {[0, 1, 2].map((i) => (
            <g key={i} opacity={shade > 0 ? 0.42 : 0.25}>
              <rect x={-66 + (i % 2) * 10} y={-30 + i * 12} width={40 - i * 6} height={6} rx={3} fill={C.tealD} />
              <rect x={-16 + (i % 2) * 6} y={-30 + i * 12} width={64 - i * 12} height={6} rx={3} fill={C.tealD} />
            </g>
          ))}
        </g>

        {/* cara */}
        <g transform={`translate(${fx},0) scale(${fsx},1)`}>
          {face.blush > 0.02 && (
            <g opacity={face.blush}>
              <ellipse cx={-84} cy={-70} rx={22} ry={12} fill="#ff4f8a" opacity={0.6} />
              <ellipse cx={80} cy={-74} rx={18} ry={10} fill="#ff4f8a" opacity={0.6} />
            </g>
          )}
          <Eye cx={-46} cy={-120} r={40} side={1} k={1} />
          <Eye cx={44} cy={-122} r={30} side={-1} k={0.8} />
          <Brow cx={-46} cy={-176 - face.hL} ang={-face.bL} w={60} />
          <Brow cx={44} cy={-166 - face.hR} ang={face.bR} w={48} />
          {mo < 0.06 ? (
            <path d={`M${mcx - hw},${yL} Q${mcx},${up + 4} ${mcx + hw},${yR}`} stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
          ) : (
            <g>
              <clipPath id={`m${id}`}>
                <path d={mouthD} />
              </clipPath>
              <path d={mouthD} fill="#3a1630" />
              <g clipPath={`url(#m${id})`}>
                <ellipse cx={mcx + 6} cy={(lo + mcy) / 2 + mo * 26 + 10} rx={hw * 0.6} ry={16} fill="#ff6f7d" />
                {face.mc > 0.3 && <rect x={mcx - hw} y={up - 30} width={mw} height={30 + 12 * Math.min(1, mo * 2)} fill="#fffaf0" opacity={0.95} />}
              </g>
              <path d={mouthD} fill="none" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            </g>
          )}
        </g>
        <Hat w={wear} />
      </g>
      {hands && (
        <g transform={`translate(0,${dy})`}>
          {hands.l && <Hand {...hands.l} flip />}
          {hands.r && <Hand {...hands.r} />}
        </g>
      )}
    </g>
  );
};
