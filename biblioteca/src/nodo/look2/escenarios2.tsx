import React from 'react';
import {H, HORIZON as HZ, INK, TAU, W, loop, rnd, wave} from './kit2';
import {PAL2, Pal2} from './paletas2';

// 16 escenarios NUEVOS (v1 ya tiene: ciudad, montanas, bosque, desierto, espacio, nubes, laboratorio, playa, ruinas, celulas).
// Mismo esqueleto que v1 (cielo en degradado, siluetas hasta la línea de horizonte y=1250, suelo oscuro con ondas
// y glifos de código tenues) para que el canal siga siendo reconocible. Todo se mueve despacio y en bucle
// (parallax, vaivén, partículas): "vivo" sin robar atención al texto. Zona 0-420 libre para título/pastilla.

export const SET2 = [
  'tormenta', 'polar', 'cumbre', 'fondo_marino', 'piscina', 'bano', 'cocina', 'dormitorio',
  'hospital', 'neuronas', 'venas', 'colmena', 'pradera', 'egipto', 'aurora', 'aula',
] as const;
export type Set2 = (typeof SET2)[number];

// paleta por defecto de cada escenario (se puede cruzar con otra)
export const SET2_PAL: Record<Set2, keyof typeof PAL2> = {
  tormenta: 'tormenta', polar: 'hielo', cumbre: 'cumbre', fondo_marino: 'abismo', piscina: 'cloro', bano: 'azulejo',
  cocina: 'cocina', dormitorio: 'cuarto', hospital: 'quirofano', neuronas: 'sinapsis', venas: 'sangre', colmena: 'miel',
  pradera: 'pradera', egipto: 'faraon', aurora: 'aurora', aula: 'pizarra',
};

const Sky: React.FC<{id: string; p: Pal2}> = ({id, p}) => (
  <>
    <defs>
      <linearGradient id={`sk${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.sky[0]} />
        <stop offset="0.55" stopColor={p.sky[1]} />
        <stop offset="1" stopColor={p.sky[2]} />
      </linearGradient>
      <radialGradient id={`gl${id}`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={p.glow} stopOpacity={0.35} />
        <stop offset="1" stopColor={p.glow} stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={0} y={0} width={W} height={HZ + 2} fill={`url(#sk${id})`} />
  </>
);

const GLYPHS = ['{ }', '01', '=>', '//', '</>', '[]', '0x', ';'];
const Ground: React.FC<{p: Pal2; f: number; seed?: number}> = ({p, f, seed = 0}) => (
  <g>
    <rect x={0} y={HZ} width={W} height={H - HZ} fill={p.ground} />
    <path d={`M0,${HZ} ${Array.from({length: 13}, (_, i) => `Q${i * 90 + 45},${HZ + 6 * wave(f, 70, i)} ${(i + 1) * 90},${HZ}`).join(' ')}`} stroke={p.line} strokeWidth={4} fill="none" opacity={0.85} />
    {Array.from({length: 7}).map((_, i) => {
      const y = HZ + 60 + i * 52 + i * i * 6;
      const dx = loop(f + i * 40, 240 + i * 30) * 180;
      return <path key={i} d={`M${-180 + dx + rnd(i + seed) * 200},${y} q60,-8 120,0 t120,0 M${520 + dx + rnd(i + 9 + seed) * 200},${y + 14} q50,-7 100,0`} stroke={p.line} strokeWidth={3} fill="none" opacity={0.18} />;
    })}
    {Array.from({length: 6}).map((_, i) => (
      <text key={i} x={80 + i * 180 + rnd(i + seed) * 40} y={HZ + 200 + (i % 3) * 70} fill={p.line} opacity={0.12} fontSize={44} fontFamily="monospace">
        {GLYPHS[(i + seed) % GLYPHS.length]}
      </text>
    ))}
  </g>
);

const Stars: React.FC<{n: number; f: number; c?: string; maxY?: number; seed?: number}> = ({n, f, c = '#fff', maxY = 1000, seed = 3}) => (
  <g>
    {Array.from({length: n}).map((_, i) => (
      <circle key={i} cx={rnd(i + seed) * W} cy={rnd(i * 3 + seed) * maxY} r={1.5 + rnd(i * 7) * 2.5} fill={c} opacity={0.25 + 0.5 * Math.abs(wave(f, 60 + rnd(i) * 80, i))} />
    ))}
  </g>
);

// ------------------------------------------------------------------ escenarios
const Tormenta: React.FC<{p: Pal2; f: number}> = ({p, f}) => {
  const fl = loop(f, 150); // un relámpago cada 5 s
  const flash = fl < 0.03 ? 1 : fl < 0.06 ? 0.4 : fl < 0.08 ? 0.8 : 0;
  return (
    <g>
      <rect x={0} y={0} width={W} height={HZ} fill="#fff" opacity={flash * 0.25} />
      {flash > 0.3 && <path d="M700,180 L640,420 L700,420 L610,720 L760,380 L690,380 L760,180 Z" fill={p.accent} opacity={0.9} />}
      {[0, 1, 2].map((k) => (
        <g key={k} transform={`translate(${loop(f + k * 260, 900 + k * 300) * 1500 - 420},${140 + k * 170})`} opacity={0.75 - k * 0.12}>
          {[0, 1, 2, 3].map((j) => <circle key={j} cx={j * 90} cy={(j % 2) * -30} r={80 + (j % 2) * 20} fill={k === 0 ? '#3b3f63' : '#2e3253'} />)}
        </g>
      ))}
      <path d={`M0,${HZ} L0,1120 Q180,1060 360,1110 T720,1090 T1080,1120 L1080,${HZ} Z`} fill="#1a1c33" />
      {Array.from({length: 70}).map((_, i) => {
        const x = rnd(i) * W;
        const y = loop(f * 1.0 + rnd(i * 2) * 60, 26) * (HZ + 80) - 60;
        return <path key={i} d={`M${x},${y} l-10,46`} stroke="#aab6ff" strokeWidth={3} opacity={0.45} />;
      })}
    </g>
  );
};

const Polar: React.FC<{p: Pal2; f: number}> = ({p, f}) => (
  <g>
    <circle cx={820} cy={460} r={110} fill="#fffbe8" opacity={0.85} />
    <path d={`M0,${HZ} L0,1060 L140,980 L260,1080 L420,940 L560,1100 L700,1010 L860,1090 L1080,980 L1080,${HZ} Z`} fill="#eaf8ff" stroke={INK} strokeOpacity={0.15} strokeWidth={4} />
    <path d="M140,980 L200,1030 L170,1040 M420,940 L470,1000 L440,1010 M1080,980 L1000,1030" stroke="#a9d5ee" strokeWidth={10} fill="none" />
    {[[150, 0.9], [760, 1.2]].map(([x, s], i) => (
      <g key={i} transform={`translate(${x + wave(f, 120, i) * 8},${HZ - 6}) scale(${s})`}>
        <path d="M-80,0 L-50,-90 L-10,-120 L40,-70 L80,0 Z" fill="#ffffff" stroke="#9ccbe6" strokeWidth={6} />
        <path d="M-10,-120 L0,0" stroke="#bfe3f5" strokeWidth={6} />
      </g>
    ))}
    {Array.from({length: 60}).map((_, i) => {
      const y = loop(f + rnd(i) * 300, 300 + rnd(i * 5) * 200) * HZ;
      const x = rnd(i * 3) * W + wave(f, 90, i) * 30;
      return <circle key={i} cx={x} cy={y} r={3 + rnd(i) * 5} fill="#fff" opacity={0.85} />;
    })}
  </g>
);

const Cumbre: React.FC<{p: Pal2; f: number}> = ({p, f}) => (
  <g>
    <circle cx={260} cy={520} r={90} fill="#fff1d6" opacity={0.9} />
    <path d={`M80,${HZ} L470,640 L560,600 L660,660 L1040,${HZ} Z`} fill="#5d4f7a" stroke={INK} strokeWidth={6} strokeOpacity={0.4} />
    <path d="M470,640 L560,600 L660,660 L620,700 L590,670 L560,712 L520,676 L500,700 Z" fill={p.accent} />
    <path d={`M0,${HZ} L0,1100 L180,1000 L320,1120 L440,1060 L600,1160 L760,1040 L900,1130 L1080,1020 L1080,${HZ} Z`} fill="#3c3358" />
    {[0, 1].map((k) => {
      const x = (loop(f + k * 400, 1100) * 1500) - 300;
      return <path key={k} d={`M${x},${880 + k * 60} q60,-40 120,0 q50,-30 100,0 q40,-20 90,0 Z`} fill="#fff" opacity={0.55} />;
    })}
    <text x={560} y={570} fontSize={30} fill="#fff" opacity={0.6} textAnchor="middle" fontFamily="sans-serif">6.263 m</text>
  </g>
);

const FondoMarino: React.FC<{p: Pal2; f: number}> = ({p, f}) => (
  <g>
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${200 + i * 220 + wave(f, 160, i) * 40},0 L${120 + i * 240},${HZ} L${260 + i * 240},${HZ} Z`} fill={p.accent} opacity={0.07} />
    ))}
    <path d={`M0,${HZ} L0,1180 Q270,1130 540,1180 T1080,1170 L1080,${HZ} Z`} fill="#0a3b47" />
    {[90, 210, 860, 980, 640].map((x, i) => (
      <path key={i} d={`M${x},${HZ} C${x + wave(f, 70, i) * 30},${HZ - 120} ${x - 30 + wave(f, 60, i + 1) * 40},${HZ - 220} ${x + wave(f, 50, i) * 50},${HZ - 300 - (i % 2) * 80}`} stroke={i % 2 ? '#1fae7f' : '#2bd39a'} strokeWidth={22} fill="none" strokeLinecap="round" />
    ))}
    {Array.from({length: 26}).map((_, i) => {
      const y = HZ - loop(f + rnd(i) * 200, 200 + rnd(i * 2) * 160) * (HZ - 150);
      const x = rnd(i * 4) * W + wave(f, 40, i) * 14;
      return <circle key={i} cx={x} cy={y} r={5 + rnd(i) * 10} fill="none" stroke={p.accent} strokeWidth={3} opacity={0.6} />;
    })}
    <g transform={`translate(${(loop(f, 600) * 1400) - 200},760)`}>
      <path d="M0,0 q40,-30 80,0 q-40,30 -80,0 Z M80,0 l26,-18 l0,36 Z" fill="#ffb84a" stroke={INK} strokeWidth={5} />
    </g>
  </g>
);

const Piscina: React.FC<{p: Pal2; f: number}> = ({p, f}) => (
  <g>
    {Array.from({length: 13}).map((_, i) => <path key={'v' + i} d={`M${i * 90},0 L${i * 90},${HZ}`} stroke="#ffffff" strokeWidth={3} opacity={0.25} />)}
    {Array.from({length: 15}).map((_, i) => <path key={'h' + i} d={`M0,${i * 90} L${W},${i * 90}`} stroke="#ffffff" strokeWidth={3} opacity={0.25} />)}
    {Array.from({length: 14}).map((_, i) => (
      <path key={i} d={`M${rnd(i) * W},${rnd(i * 2) * HZ} q30,${-18 * wave(f, 50, i)} 60,0 q30,${18 * wave(f, 50, i)} 60,0`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.5} />
    ))}
    {[1, 2].map((k) => (
      <g key={k}>
        <path d={`M${k * 360},0 L${k * 360},${HZ}`} stroke={INK} strokeWidth={10} opacity={0.12} />
        {Array.from({length: 22}).map((_, j) => <circle key={j} cx={k * 360} cy={j * 58 + 20 + wave(f, 60, j) * 3} r={14} fill={j % 2 ? p.accent : '#fff'} stroke={INK} strokeWidth={3} opacity={0.9} />)}
      </g>
    ))}
  </g>
);

const Bano: React.FC<{p: Pal2; f: number}> = ({p, f}) => (
  <g>
    {Array.from({length: 10}).map((_, r) =>
      Array.from({length: 8}).map((_, c) => (
        <rect key={`${r}-${c}`} x={c * 140 + (r % 2) * 0} y={560 + r * 70} width={136} height={66} rx={6} fill={r < 2 ? '#ffffff' : (r + c) % 2 ? '#dff4ef' : '#cdeee6'} opacity={r < 2 ? 0.0 : 1} />
      )),
    )}
    <rect x={0} y={556} width={W} height={10} fill={p.accent} />
    <rect x={640} y={160} width={300} height={360} rx={150} fill="#e6fffb" stroke={INK} strokeWidth={8} />
    <path d="M700,240 L760,200 M720,300 L840,220" stroke="#fff" strokeWidth={10} strokeLinecap="round" />
    <path d="M90,1250 L90,1080 Q90,1040 130,1040 L460,1040 Q500,1040 500,1080 L500,1250 Z" fill="#ffffff" stroke={INK} strokeWidth={8} />
    <path d="M160,1040 L160,980 Q160,960 180,960 L200,960" stroke="#9aa3b5" strokeWidth={12} fill="none" strokeLinecap="round" />
    {[0, 1, 2].map((i) => {
      const y = 990 + loop(f + i * 20, 60) * 50;
      return <path key={i} d={`M200,${y} q-6,10 0,16 q6,-6 0,-16 Z`} fill={p.accent} opacity={1 - loop(f + i * 20, 60)} />;
    })}
  </g>
);

const Cocina: React.FC<{p: Pal2; f: number}> = ({p, f}) => (
  <g>
    <rect x={620} y={120} width={360} height={300} rx={20} fill="#bfe8ff" stroke={INK} strokeWidth={8} />
    <path d="M800,120 L800,420 M620,270 L980,270" stroke={INK} strokeWidth={8} />
    <circle cx={720} cy={200} r={34} fill="#fff7c2" />
    {[0, 1, 2].map((s) => (
      <g key={s}>
        <rect x={60} y={560 + s * 150} width={420} height={14} rx={6} fill="#8a4b30" />
        {[0, 1, 2, 3].map((j) => {
          const cols = ['#ff7a59', '#ffd25a', '#5fe0c0', '#b28aff'];
          return <rect key={j} x={80 + j * 100} y={560 + s * 150 - 90 + ((j + s) % 2) * 20} width={70} height={90 - ((j + s) % 2) * 20} rx={14} fill={cols[(j + s) % 4]} stroke={INK} strokeWidth={6} />;
        })}
      </g>
    ))}
    {[640, 780, 920].map((x, i) => {
      const r = wave(f, 80, i) * 5;
      return (
        <g key={i} transform={`rotate(${r},${x},520)`}>
          <path d={`M${x},500 L${x},590`} stroke={INK} strokeWidth={6} />
          <circle cx={x} cy={630} r={44 - i * 4} fill="#3a3a52" stroke={INK} strokeWidth={6} />
          <rect x={x - 6} y={570} width={12} height={30} fill="#3a3a52" />
        </g>
      );
    })}
    <rect x={0} y={1080} width={W} height={170} fill="#a8573a" />
    <rect x={0} y={1070} width={W} height={20} fill={p.accent} />
  </g>
);

const Dormitorio: React.FC<{p: Pal2; f: number}> = ({p, f}) => (
  <g>
    <rect x={560} y={160} width={400} height={480} rx={24} fill="#141a52" stroke={INK} strokeWidth={10} />
    <Stars n={20} f={f} maxY={600} seed={11} />
    <circle cx={840} cy={300} r={64} fill="#fff4c9" />
    <circle cx={812} cy={284} r={64} fill="#141a52" />
    <path d="M760,160 L760,640 M560,400 L960,400" stroke={INK} strokeWidth={10} />
    <path d="M520,150 Q600,400 520,660 L560,660 L560,150 Z M1000,150 Q920,400 1000,660 L960,660 L960,150 Z" fill="#6a3fd0" opacity={0.85} />
    <circle cx={170} cy={980} r={170} fill={p.glow} opacity={0.18 + 0.04 * wave(f, 90)} />
    <path d="M130,1040 L210,1040 L190,960 L150,960 Z" fill="#ffcf7a" stroke={INK} strokeWidth={6} />
    <rect x={160} y={1040} width={20} height={150} fill="#3a2a52" />
    <path d="M520,1250 L520,1090 Q520,1060 560,1060 L1080,1060 L1080,1250 Z" fill="#3b3f8f" stroke={INK} strokeWidth={8} />
    <rect x={560} y={1020} width={170} height={60} rx={28} fill="#e8e6ff" stroke={INK} strokeWidth={6} />
    {[0, 1, 2].map((i) => {
      const t = loop(f + i * 40, 120);
      return <text key={i} x={760 + t * 120 + i * 20} y={980 - t * 260} fontSize={40 + i * 14} fill={p.accent} opacity={1 - t} fontFamily="sans-serif" fontWeight="bold">z</text>;
    })}
  </g>
);

const Hospital: React.FC<{p: Pal2; f: number}> = ({p, f}) => {
  const t = loop(f, 45);
  const ecg = Array.from({length: 40}, (_, i) => {
    const x = 640 + i * 8;
    const ph = (i / 40 + t) % 1;
    const y = 380 + (ph > 0.45 && ph < 0.5 ? -60 : ph >= 0.5 && ph < 0.55 ? 40 : 0);
    return `${i ? 'L' : 'M'}${x},${y}`;
  }).join(' ');
  return (
    <g>
      <rect x={600} y={240} width={400} height={260} rx={22} fill="#123b36" stroke={INK} strokeWidth={8} />
      <path d={ecg} stroke="#6dffb0" strokeWidth={6} fill="none" />
      <text x={950} y={290} fontSize={36} fill="#6dffb0" textAnchor="end" fontFamily="monospace">72</text>
      <path d="M800,500 L800,640 M740,640 L860,640" stroke="#8aa8a0" strokeWidth={10} />
      {Array.from({length: 7}).map((_, i) => (
        <path key={i} d={`M${40 + i * 60},120 Q${70 + i * 60 + wave(f, 100, i) * 6},600 ${40 + i * 60},1100`} stroke="#9fdccc" strokeWidth={30} fill="none" opacity={0.6} />
      ))}
      <path d="M20,110 L460,110" stroke="#7a8f8a" strokeWidth={10} />
      <rect x={880} y={720} width={120} height={120} rx={16} fill="#fff" stroke={INK} strokeWidth={6} />
      <path d="M940,745 L940,815 M905,780 L975,780" stroke={p.accent} strokeWidth={18} />
    </g>
  );
};

const NEU: [number, number][] = [[140, 520], [360, 380], [600, 560], [860, 420], [980, 720], [720, 860], [420, 800], [180, 940], [520, 1100], [880, 1080]];
const LINKS: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [6, 2], [5, 9], [8, 6], [8, 9], [0, 6], [1, 3]];
const Neuronas: React.FC<{p: Pal2; f: number}> = ({p, f}) => (
  <g>
    {LINKS.map(([a, b], i) => {
      const [x1, y1] = NEU[a];
      const [x2, y2] = NEU[b];
      const mx = (x1 + x2) / 2 + wave(f, 120, i) * 20;
      const my = (y1 + y2) / 2 - 40;
      const t = loop(f + i * 13, 50);
      const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2;
      const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2;
      return (
        <g key={i}>
          <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} stroke={p.line} strokeWidth={5} fill="none" opacity={0.35} />
          <circle cx={px} cy={py} r={9} fill={p.accent} opacity={0.9} />
        </g>
      );
    })}
    {NEU.map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={46} fill={p.glow} opacity={0.12 + 0.08 * wave(f, 40, i)} />
        <circle cx={x} cy={y} r={20} fill={p.line} stroke={INK} strokeWidth={5} />
      </g>
    ))}
  </g>
);

const Venas: React.FC<{p: Pal2; f: number}> = ({p, f}) => (
  <g>
    {Array.from({length: 7}).map((_, i) => {
      const k = loop(f + i * 30, 210);
      const r = 80 + k * 900;
      return <ellipse key={i} cx={540} cy={640} rx={r} ry={r * 0.82} fill="none" stroke={p.line} strokeWidth={4 + k * 18} opacity={0.08 + k * 0.25} />;
    })}
    {Array.from({length: 14}).map((_, i) => {
      const k = loop(f + rnd(i) * 200, 160);
      const a = rnd(i * 3) * TAU;
      const d = 40 + k * 700;
      const x = 540 + Math.cos(a) * d;
      const y = 640 + Math.sin(a) * d * 0.82;
      const s = 0.2 + k * 1.4;
      return (
        <g key={i} transform={`translate(${x},${y}) rotate(${a * 57 + f}) scale(${s})`} opacity={Math.min(1, k * 3)}>
          <ellipse rx={46} ry={30} fill="#e0384f" stroke={INK} strokeWidth={5} />
          <ellipse rx={20} ry={11} fill="#a81f33" />
        </g>
      );
    })}
  </g>
);

const Colmena: React.FC<{p: Pal2; f: number}> = ({p, f}) => {
  const hex = (cx: number, cy: number, r: number) => Array.from({length: 6}, (_, i) => `${i ? 'L' : 'M'}${cx + r * Math.cos((i * TAU) / 6)},${cy + r * Math.sin((i * TAU) / 6)}`).join(' ') + 'Z';
  return (
    <g>
      {Array.from({length: 9}).map((_, r) =>
        Array.from({length: 8}).map((_, c) => {
          const cx = c * 150 + (r % 2) * 75;
          const cy = 360 + r * 108;
          const full = rnd(r * 11 + c) > 0.45;
          return <path key={`${r}-${c}`} d={hex(cx, cy, 70)} fill={full ? '#ffbe3b' : '#7a3d05'} fillOpacity={full ? 0.55 + 0.15 * wave(f, 90, r + c) : 0.6} stroke="#ffdf8a" strokeWidth={6} opacity={0.75} />;
        }),
      )}
      {[0, 1, 2, 3].map((i) => {
        const t = f / (90 + i * 20) + i * 0.27;
        const x = 540 + Math.cos(t * TAU) * (320 - i * 40);
        const y = 700 + Math.sin(t * TAU * 2) * 160 - i * 60;
        const fl = Math.abs(wave(f, 2.5, i));
        return (
          <g key={i} transform={`translate(${x},${y}) scale(0.9)`}>
            <ellipse cx={-6} cy={-24} rx={18} ry={26 * fl + 4} fill="#fff" opacity={0.7} />
            <ellipse cx={14} cy={-24} rx={18} ry={26 * fl + 4} fill="#fff" opacity={0.7} />
            <ellipse rx={30} ry={22} fill={p.glow} stroke={INK} strokeWidth={5} />
            <path d="M-6,-20 L-6,20 M8,-20 L8,20" stroke={INK} strokeWidth={8} />
          </g>
        );
      })}
    </g>
  );
};

const Pradera: React.FC<{p: Pal2; f: number}> = ({p, f}) => (
  <g>
    <circle cx={850} cy={400} r={100} fill="#fff7c9" />
    {[0, 1].map((k) => <path key={k} d={`M${(loop(f + k * 500, 1200) * 1500) - 300},${300 + k * 140} q50,-40 100,0 q40,-30 90,0 q40,-20 80,0 Z`} fill="#fff" opacity={0.85} />)}
    <path d={`M0,${HZ} L0,1040 Q300,920 600,1020 T1080,980 L1080,${HZ} Z`} fill="#5fb84a" />
    <path d={`M0,${HZ} L0,1130 Q260,1060 540,1120 T1080,1100 L1080,${HZ} Z`} fill="#3f9a3a" />
    {Array.from({length: 22}).map((_, i) => {
      const x = rnd(i) * W;
      const y = 1080 + rnd(i * 2) * 160;
      const sw = wave(f, 70, i) * 6;
      const cols = [p.accent, '#ffd25a', '#ffffff', '#b28aff'];
      return (
        <g key={i} transform={`rotate(${sw},${x},${y + 40})`}>
          <path d={`M${x},${y} L${x},${y + 40}`} stroke="#2b6b25" strokeWidth={5} />
          {[0, 1, 2, 3, 4].map((j) => <circle key={j} cx={x + Math.cos((j * TAU) / 5) * 10} cy={y + Math.sin((j * TAU) / 5) * 10} r={8} fill={cols[i % 4]} />)}
          <circle cx={x} cy={y} r={6} fill="#ffb02e" />
        </g>
      );
    })}
  </g>
);

const Egipto: React.FC<{p: Pal2; f: number}> = ({p, f}) => (
  <g>
    <circle cx={540} cy={820} r={170} fill="#ffe2a0" opacity={0.95} />
    {[[180, 1250, 260], [520, 1250, 380], [880, 1250, 220]].map(([x, y, s], i) => (
      <g key={i}>
        <path d={`M${x - s},${y} L${x},${y - s * 0.95} L${x + s},${y} Z`} fill={i === 1 ? '#c98a3a' : '#b47a30'} stroke={INK} strokeWidth={6} strokeOpacity={0.5} />
        <path d={`M${x},${y - s * 0.95} L${x + s},${y} L${x + s * 0.18},${y} Z`} fill="#8f5c22" opacity={0.6} />
        {Array.from({length: 6}).map((_, j) => <path key={j} d={`M${x - s + (j + 1) * s / 7 * 0.95},${y - (j + 1) * s * 0.95 / 7} L${x + s - (j + 1) * s / 7 * 0.95},${y - (j + 1) * s * 0.95 / 7}`} stroke="#7a4e1c" strokeWidth={3} opacity={0.45} />)}
      </g>
    ))}
    <path d={`M0,${HZ} L0,1200 Q270,1150 540,1210 T1080,1190 L1080,${HZ} Z`} fill="#e0a85a" />
    {Array.from({length: 5}).map((_, i) => (
      <path key={i} d={`M0,${1150 - i * 30} ${Array.from({length: 9}, (_, k) => `Q${k * 120 + 60},${1150 - i * 30 + 6 * wave(f, 30, i + k)} ${(k + 1) * 120},${1150 - i * 30}`).join(' ')}`} stroke="#fff3c9" strokeWidth={3} fill="none" opacity={0.15} />
    ))}
  </g>
);

const Aurora: React.FC<{p: Pal2; f: number}> = ({p, f}) => (
  <g>
    <Stars n={50} f={f} maxY={900} seed={21} />
    {[0, 1, 2].map((k) => {
      const pts = Array.from({length: 10}, (_, i) => `${i * 120},${300 + k * 120 + 80 * wave(f + i * 20, 220 + k * 40, k)}`);
      const d = `M${pts[0]} ${pts.slice(1).map((pt) => `L${pt}`).join(' ')}`;
      return <path key={k} d={d} stroke={k === 1 ? p.accent : p.line} strokeWidth={70 - k * 14} fill="none" opacity={0.18 + 0.08 * wave(f, 90, k)} strokeLinecap="round" strokeLinejoin="round" />;
    })}
    <path d={`M0,${HZ} L0,1110 Q240,1040 520,1100 T1080,1070 L1080,${HZ} Z`} fill="#dff3ff" opacity={0.9} />
    <path d={`M0,${HZ} L0,1170 Q300,1120 600,1170 T1080,1150 L1080,${HZ} Z`} fill="#b7dcef" />
    {[160, 900].map((x, i) => (
      <path key={i} d={`M${x},1180 L${x - 40},1180 L${x},1060 L${x + 40},1180 Z M${x},1100 L${x - 30},1120 M${x},1100 L${x + 30},1120`} fill="#0b2a2a" stroke="#0b2a2a" strokeWidth={6} />
    ))}
  </g>
);

const Aula: React.FC<{p: Pal2; f: number}> = ({p, f}) => {
  const ang = (f / 30) * 6;
  return (
    <g>
      <rect x={0} y={0} width={W} height={HZ} fill="#d9c9a8" />
      <rect x={60} y={460} width={960} height={520} rx={14} fill={p.sky[1]} stroke="#7a5230" strokeWidth={22} />
      <g stroke={p.line} strokeWidth={5} fill="none" opacity={0.85}>
        <path d="M130,560 q30,-30 60,0 t60,0 M290,540 l0,50 M270,565 l40,0 M350,560 q20,-30 40,0 l20,0" />
        <path d="M140,690 L320,690 M140,720 L270,720" />
        <path d="M560,760 a90,90 0 1 0 180,0 a90,90 0 1 0 -180,0 M650,760 L740,760" />
        <text x={760} y={620} fill={p.line} stroke="none" fontSize={64} fontFamily="monospace">E=?</text>
      </g>
      <rect x={60} y={980} width={960} height={22} fill="#7a5230" />
      <rect x={180} y={984} width={70} height={14} rx={4} fill="#fff" />
      <circle cx={880} cy={220} r={90} fill="#fff" stroke={INK} strokeWidth={10} />
      <path d={`M880,220 L${880 + 50 * Math.sin((ang * Math.PI) / 180)},${220 - 50 * Math.cos((ang * Math.PI) / 180)}`} stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <path d={`M880,220 L${880 + 70 * Math.sin((ang * 12 * Math.PI) / 180)},${220 - 70 * Math.cos((ang * 12 * Math.PI) / 180)}`} stroke={p.accent} strokeWidth={5} strokeLinecap="round" />
      <rect x={0} y={1100} width={W} height={150} fill="#a7764a" />
    </g>
  );
};

const MAP: Record<Set2, React.FC<{p: Pal2; f: number}>> = {
  tormenta: Tormenta, polar: Polar, cumbre: Cumbre, fondo_marino: FondoMarino, piscina: Piscina, bano: Bano, cocina: Cocina,
  dormitorio: Dormitorio, hospital: Hospital, neuronas: Neuronas, venas: Venas, colmena: Colmena, pradera: Pradera,
  egipto: Egipto, aurora: Aurora, aula: Aula,
};

// <Escena2 set="tormenta" f={frame} /> ; `pal` cruza un escenario con otra paleta. `nodoX` coloca el halo detrás de Nodo.
export const Escena2: React.FC<{set: Set2; f?: number; pal?: keyof typeof PAL2; nodoX?: number}> = ({set, f = 0, pal, nodoX = 300}) => {
  const p = PAL2[pal ?? SET2_PAL[set]];
  const S = MAP[set];
  const id = `${set}${pal ?? ''}`;
  return (
    <g>
      <Sky id={id} p={p} />
      {(set === 'neuronas' || set === 'venas') && <Stars n={18} f={f} c={p.line} maxY={500} />}
      <ellipse cx={nodoX} cy={HZ - 120} rx={360} ry={360} fill={`url(#gl${id})`} />
      <S p={p} f={f} />
      <Ground p={p} f={f} seed={SET2.indexOf(set)} />
    </g>
  );
};
