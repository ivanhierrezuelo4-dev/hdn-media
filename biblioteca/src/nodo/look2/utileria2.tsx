import React from 'react';
import {CORAL, CREAM, GOLD, INK, TAU, clamp01, loop, rnd, st, wave} from './kit2';

// 20 piezas de utilería ANIMADA pensadas para las ideas `libre` de canal/plan/ideas.json.
// Cada una dibuja centrada en (0,0) a ~tamaño 300 px; se coloca con <Prop2 t="..." x y s f k />.
// `k` (0..1) es el parámetro del mecanismo (nivel, avance, intensidad); `f` el frame para el movimiento vivo.

export const PROP2 = [
  'termometro', 'virus', 'remolino', 'globo_coriolis', 'cerebro', 'gota_real', 'rayo', 'montana_bulto',
  'corazon', 'pulmones', 'mosca', 'reloj', 'piramide_bloques', 'abejorro', 'cubo_azucar', 'una_crece',
  'molecula_agua', 'estomago', 'lupa', 'calendario',
] as const;
export type Prop2Id = (typeof PROP2)[number];

type PP = {f: number; k: number; dir?: 1 | -1; side?: 'L' | 'R' | 'both'; label?: string};

const Termometro: React.FC<PP> = ({f, k}) => {
  const h = 40 + clamp01(k) * 200;
  const col = k < 0.4 ? '#4fa8ff' : k < 0.7 ? GOLD : '#ff4f4f';
  return (
    <g>
      <rect x={-34} y={-170} width={68} height={300} rx={34} fill={CREAM} {...st} />
      <rect x={-14} y={110 - h} width={28} height={h} rx={14} fill={col} />
      <circle cx={0} cy={140} r={52} fill={col} {...st} />
      <circle cx={-16} cy={124} r={12} fill="#fff" opacity={0.6} />
      {Array.from({length: 7}).map((_, i) => <path key={i} d={`M34,${80 - i * 34} l18,0`} stroke={INK} strokeWidth={5} />)}
      {k > 0.85 && <path d={`M60,-170 l14,-20 M80,-150 l20,-10`} stroke={col} strokeWidth={6} opacity={0.5 + 0.5 * wave(f, 8)} />}
    </g>
  );
};

const Virus: React.FC<PP> = ({f}) => {
  const b = wave(f, 30) * 4;
  return (
    <g transform={`rotate(${f * 0.6})`}>
      {Array.from({length: 12}).map((_, i) => {
        const a = (i / 12) * TAU;
        const r = 92 + wave(f, 20, i) * 6;
        return (
          <g key={i}>
            <path d={`M${Math.cos(a) * 70},${Math.sin(a) * 70} L${Math.cos(a) * r},${Math.sin(a) * r}`} stroke={INK} strokeWidth={8} />
            <circle cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={14} fill="#ff6f9a" {...st} strokeWidth={5} />
          </g>
        );
      })}
      <circle r={74 + b} fill="#9bdc5a" {...st} />
      <circle cx={-20} cy={-14} r={12} fill="#6fae36" />
      <circle cx={24} cy={10} r={16} fill="#6fae36" />
      <circle cx={-6} cy={30} r={9} fill="#6fae36" />
    </g>
  );
};

const Remolino: React.FC<PP> = ({f, dir = 1}) => {
  const rot = dir * f * 6;
  return (
    <g>
      <ellipse rx={150} ry={60} fill="#7fd3ff" {...st} />
      <g transform={`scale(1,0.4) rotate(${rot})`}>
        {[0, 1, 2].map((j) => (
          <path key={j} transform={`rotate(${j * 120})`} d={Array.from({length: 30}, (_, i) => {
            const t = i / 29;
            const r = 140 * (1 - t);
            const a = dir * t * TAU * 1.2;
            return `${i ? 'L' : 'M'}${Math.cos(a) * r},${Math.sin(a) * r}`;
          }).join(' ')} stroke="#ffffff" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.85} />
        ))}
      </g>
      <ellipse rx={18} ry={8} fill="#1a4a6b" />
      <path d={`M${dir * 120},-80 A140,60 0 0 ${dir > 0 ? 1 : 0} ${dir * -40},-90`} stroke={CORAL} strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d={`M${dir * -40},-90 l${dir * 22},-16 M${dir * -40},-90 l${dir * 24},12`} stroke={CORAL} strokeWidth={10} strokeLinecap="round" />
    </g>
  );
};

const GloboCoriolis: React.FC<PP> = ({f}) => {
  const sp = loop(f, 120);
  return (
    <g>
      <defs>
        <clipPath id="gc">
          <circle r={140} />
        </clipPath>
      </defs>
      <circle r={140} fill="#3a8ee6" {...st} />
      <g clipPath="url(#gc)">
        {[0, 1, 2].map((i) => {
          const x = ((sp * 3 + i) % 3) * 200 - 300;
          return <path key={i} d={`M${x},-90 q60,-30 90,10 q20,40 -10,80 q-40,30 -60,-20 Z M${x + 40},40 q40,0 50,40 q-20,30 -50,0 Z`} fill="#5ccf6a" stroke={INK} strokeWidth={5} />;
        })}
      </g>
      <path d="M-140,0 L140,0" stroke="#fff" strokeWidth={4} strokeDasharray="12 10" />
      <path d="M-60,-70 a40,40 0 1 1 40,40" stroke={GOLD} strokeWidth={8} fill="none" />
      <path d="M-20,-30 l-4,-20 M-20,-30 l-20,2" stroke={GOLD} strokeWidth={8} strokeLinecap="round" />
      <path d="M60,70 a40,40 0 1 0 -40,-40" stroke={CORAL} strokeWidth={8} fill="none" />
      <path d="M20,30 l4,20 M20,30 l20,-2" stroke={CORAL} strokeWidth={8} strokeLinecap="round" />
      <text x={0} y={-160} textAnchor="middle" fontSize={34} fontWeight="bold" fill={CREAM} fontFamily="sans-serif">N</text>
      <text x={0} y={190} textAnchor="middle" fontSize={34} fontWeight="bold" fill={CREAM} fontFamily="sans-serif">S</text>
    </g>
  );
};

const Cerebro: React.FC<PP> = ({f, side = 'both'}) => {
  const on = (s: 'L' | 'R') => side === 'both' || side === s;
  const g = 0.5 + 0.5 * wave(f, 24);
  const lobe = (s: number, lit: boolean) => (
    <g transform={`scale(${s},1)`}>
      <path d="M6,-110 C40,-130 100,-120 120,-70 C150,-40 140,30 110,50 C100,90 50,100 6,90 Z" fill={lit ? '#ff9ac2' : '#d7b6c8'} {...st} />
      <path d="M30,-80 q30,10 20,40 q-10,30 30,30 M60,-100 q30,20 50,10 M30,20 q30,-10 50,20 q20,10 40,-10 M20,60 q20,-10 40,10" stroke="#c0567f" strokeWidth={5} fill="none" />
      {lit && <path d="M6,-110 C40,-130 100,-120 120,-70 C150,-40 140,30 110,50 C100,90 50,100 6,90 Z" fill="#fff" opacity={0.15 * g} />}
    </g>
  );
  return (
    <g>
      {lobe(-1, on('L'))}
      {lobe(1, on('R'))}
      <path d="M0,-110 L0,90" stroke={INK} strokeWidth={6} />
      <path d="M-20,90 q20,40 40,70" stroke={INK} strokeWidth={22} strokeLinecap="round" />
      <path d="M-20,90 q20,40 40,70" stroke="#d7b6c8" strokeWidth={12} strokeLinecap="round" />
    </g>
  );
};

// k=0 lágrima de dibujo animado (lo que creemos) → k=1 gota real (pan de hamburguesa)
const GotaReal: React.FC<PP> = ({f, k}) => {
  const t = clamp01(k);
  const tipY = -150 * (1 - t) + -70 * t;
  const sideX = 90 + 30 * t;
  const botY = 80 - 10 * t;
  const flat = 40 * t;
  const d = `M0,${tipY} C${30 - 30 * t},${-100 + 20 * t} ${sideX},${-30 - 20 * t} ${sideX},${20 - 10 * t} C${sideX},${botY - 10} ${50},${botY} 0,${botY - flat * 0.2} C-50,${botY} ${-sideX},${botY - 10} ${-sideX},${20 - 10 * t} C${-sideX},${-30 - 20 * t} ${-30 + 30 * t},${-100 + 20 * t} 0,${tipY} Z`;
  const wob = 1 + wave(f, 14) * 0.02;
  return (
    <g transform={`scale(${wob},${2 - wob})`}>
      <path d={d} fill="#6ccaff" {...st} />
      <ellipse cx={-36} cy={-30} rx={12} ry={24} fill="#fff" opacity={0.6} transform="rotate(20,-36,-30)" />
      {t > 0.6 && <path d={`M-70,${botY + 8} Q0,${botY - 20} 70,${botY + 8}`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.6} />}
    </g>
  );
};

const Rayo: React.FC<PP> = ({f}) => {
  const fl = loop(f, 24) < 0.35 ? 1 : 0.35;
  return (
    <g opacity={fl}>
      <path d="M20,-200 L-60,10 L0,10 L-40,200 L90,-40 L20,-40 L70,-200 Z" fill={GOLD} {...st} strokeWidth={8} />
      <path d="M40,-180 L-20,-10" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
      <circle r={180} fill={GOLD} opacity={0.12 * fl} />
    </g>
  );
};

// Tierra achatada: el Chimborazo (cerca del ecuador) es el punto más lejos del centro. k anima las dos flechas.
const MontanaBulto: React.FC<PP> = ({k}) => {
  const t = clamp01(k);
  const peak = (x: number, y: number, ang: number, h: number, key: string) => (
    <g key={key} transform={`translate(${x},${y}) rotate(${ang})`}>
      <path d={`M-30,6 L0,${-h} L30,6 Z`} fill="#8a7a9a" {...st} strokeWidth={5} />
      <path d={`M-11,${-h * 0.62} L0,${-h} L11,${-h * 0.62} Z`} fill="#fff" />
    </g>
  );
  return (
    <g>
      <ellipse cx={0} cy={40} rx={200} ry={170} fill="#3a8ee6" {...st} />
      <path d="M-120,-40 q40,-40 90,-10 q30,30 -10,60 q-50,10 -80,-50 Z M40,60 q60,-20 110,10 q-10,60 -70,60 q-40,-20 -40,-70 Z" fill="#5ccf6a" stroke={INK} strokeWidth={4} />
      <path d="M-200,40 L200,40" stroke="#fff" strokeWidth={3} strokeDasharray="10 8" opacity={0.7} />
      {peak(198, 40, 90, 60, 'c')}
      {peak(-124, -94, -42, 46, 'e')}
      <circle cx={0} cy={40} r={9} fill={CORAL} {...st} strokeWidth={4} />
      <path d={`M0,40 L${258 * t},40`} stroke={CORAL} strokeWidth={8} strokeLinecap="round" />
      <path d={`M0,40 L${-158 * t},${40 - 170 * t}`} stroke={CREAM} strokeWidth={5} strokeDasharray="10 8" strokeLinecap="round" />
      <text x={150} y={-40} fontSize={26} textAnchor="middle" fill={CREAM} fontFamily="sans-serif" fontWeight="bold">Chimborazo</text>
      <text x={-150} y={-170} fontSize={26} textAnchor="middle" fill={CREAM} fontFamily="sans-serif">Everest</text>
    </g>
  );
};

const Corazon: React.FC<PP> = ({f}) => {
  const ph = loop(f, 24);
  const s = 1 + (ph < 0.1 ? ph * 1.2 : ph < 0.2 ? 0.12 - (ph - 0.1) * 0.6 : ph < 0.3 ? 0.06 + (ph - 0.2) * 0.4 : Math.max(0, 0.1 - (ph - 0.3) * 0.15));
  return (
    <g transform={`scale(${s})`}>
      <path d="M0,110 C-90,40 -150,-10 -120,-80 C-100,-130 -30,-130 0,-70 C30,-130 100,-130 120,-80 C150,-10 90,40 0,110 Z" fill="#e8344f" {...st} />
      <path d="M-90,-80 q20,-30 50,-10" stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.6} />
      <path d="M40,-110 l10,-50 M70,-104 l20,-40" stroke="#b81c38" strokeWidth={16} strokeLinecap="round" />
    </g>
  );
};

const Pulmones: React.FC<PP> = ({f, k}) => {
  const b = k > 0 ? clamp01(k) : 0.5 + 0.5 * wave(f, 90);
  const s = 0.85 + 0.2 * b;
  return (
    <g>
      <path d="M0,-150 L0,-60 M0,-60 Q-30,-40 -50,-20 M0,-60 Q30,-40 50,-20" stroke={INK} strokeWidth={22} strokeLinecap="round" fill="none" />
      <path d="M0,-150 L0,-60 M0,-60 Q-30,-40 -50,-20 M0,-60 Q30,-40 50,-20" stroke="#ffc2cf" strokeWidth={12} strokeLinecap="round" fill="none" />
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${sd * 20},0) scale(${sd * s},${s})`}>
          <path d="M20,-90 C80,-110 120,-20 110,60 C100,120 40,130 20,90 C10,40 10,-40 20,-90 Z" fill="#ff8fa6" {...st} />
          <path d="M30,-40 q30,10 40,40 M30,20 q30,0 50,30" stroke="#d65a76" strokeWidth={5} fill="none" />
        </g>
      ))}
    </g>
  );
};

const Mosca: React.FC<PP> = ({f}) => {
  const fl = Math.abs(wave(f, 2));
  const dx = wave(f, 40) * 30;
  const dy = wave(f, 23, 1) * 20;
  return (
    <g transform={`translate(${dx},${dy}) rotate(${wave(f, 40) * 10}) scale(1.7)`}>
      <ellipse cx={-26} cy={-36} rx={30} ry={46 * fl + 6} fill="#e6fbff" fillOpacity={0.6} {...st} strokeWidth={4} transform="rotate(-20,-26,-36)" />
      <ellipse cx={26} cy={-36} rx={30} ry={46 * fl + 6} fill="#e6fbff" fillOpacity={0.6} {...st} strokeWidth={4} transform="rotate(20,26,-36)" />
      <ellipse rx={40} ry={48} fill="#3a3a48" {...st} />
      <circle cx={-22} cy={-34} r={20} fill="#c0232f" {...st} strokeWidth={5} />
      <circle cx={22} cy={-34} r={20} fill="#c0232f" {...st} strokeWidth={5} />
      <circle cx={-26} cy={-40} r={6} fill="#fff" opacity={0.6} />
      <path d="M-40,20 l-30,24 M40,20 l30,24 M-40,0 l-34,4 M40,0 l34,4" stroke={INK} strokeWidth={6} />
    </g>
  );
};

const Reloj: React.FC<PP> = ({f, k}) => {
  const a = k > 0 ? k * 360 : f * 6;
  return (
    <g>
      <circle r={130} fill={CREAM} {...st} strokeWidth={10} />
      {Array.from({length: 12}).map((_, i) => {
        const r = (i / 12) * TAU;
        return <path key={i} d={`M${Math.sin(r) * 104},${-Math.cos(r) * 104} L${Math.sin(r) * 118},${-Math.cos(r) * 118}`} stroke={INK} strokeWidth={i % 3 ? 4 : 8} />;
      })}
      <path d={`M0,0 L${Math.sin((a / 12) * (Math.PI / 180)) * 60},${-Math.cos((a / 12) * (Math.PI / 180)) * 60}`} stroke={INK} strokeWidth={12} strokeLinecap="round" />
      <path d={`M0,0 L${Math.sin((a * Math.PI) / 180) * 96},${-Math.cos((a * Math.PI) / 180) * 96}`} stroke={CORAL} strokeWidth={7} strokeLinecap="round" />
      <circle r={10} fill={INK} />
      <rect x={-18} y={-162} width={36} height={22} rx={6} fill={CORAL} {...st} strokeWidth={5} />
    </g>
  );
};

// k = cuánto de la pirámide está construida (bloques aparecen de abajo hacia arriba con salto)
const PiramideBloques: React.FC<PP> = ({k}) => {
  const rows = 6;
  const total = (rows * (rows + 1)) / 2;
  let n = 0;
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const cnt = rows - r;
    for (let c = 0; c < cnt; c++) {
      const idx = n++;
      const appear = clamp01(k * total - idx);
      if (appear <= 0) continue;
      const x = (c - (cnt - 1) / 2) * 52;
      const y = 120 - r * 40 - (1 - appear) * 60;
      out.push(<rect key={idx} x={x - 24} y={y - 18} width={48} height={36} rx={4} fill={(r + c) % 2 ? '#d9a35a' : '#c98f45'} {...st} strokeWidth={4} opacity={appear} />);
    }
  }
  return (
    <g>
      <path d="M-180,142 L180,142" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      {out}
    </g>
  );
};

const Abejorro: React.FC<PP> = ({f}) => {
  const fl = Math.abs(wave(f, 1.6));
  const bob = wave(f, 30) * 10;
  return (
    <g transform={`translate(0,${bob})`}>
      <ellipse cx={-30} cy={-70} rx={36} ry={52 * fl + 6} fill="#e6fbff" fillOpacity={0.65} {...st} strokeWidth={4} transform="rotate(-24,-30,-70)" />
      <ellipse cx={20} cy={-74} rx={34} ry={50 * fl + 6} fill="#e6fbff" fillOpacity={0.65} {...st} strokeWidth={4} transform="rotate(18,20,-74)" />
      <ellipse rx={92} ry={70} fill={GOLD} {...st} />
      <path d="M-40,-64 Q-50,0 -40,64 M10,-70 Q0,0 10,70" stroke={INK} strokeWidth={24} fill="none" />
      <circle cx={84} cy={-6} r={40} fill="#2b2b2b" {...st} />
      <circle cx={96} cy={-16} r={11} fill="#fff" />
      <circle cx={99} cy={-16} r={5} fill={INK} />
      <path d="M-92,0 l-26,6 l26,10" fill={INK} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${-150 - i * 20},${-30 + i * 24} l-30,0`} stroke={CREAM} strokeWidth={6} strokeLinecap="round" opacity={0.5 * fl} />)}
    </g>
  );
};

const CuboAzucar: React.FC<PP> = ({f}) => (
  <g>
    <path d="M-80,-40 L0,-80 L80,-40 L80,60 L0,100 L-80,60 Z" fill="#ffffff" {...st} />
    <path d="M-80,-40 L0,0 L80,-40 M0,0 L0,100" stroke={INK} strokeWidth={6} fill="none" />
    <path d="M0,0 L80,-40 L80,60 L0,100 Z" fill="#e8ecf5" />
    <path d="M-80,-40 L0,0 L0,100 L-80,60 Z" fill="#f5f7fc" />
    {Array.from({length: 18}).map((_, i) => <circle key={i} cx={-70 + rnd(i) * 140} cy={-50 + rnd(i * 2) * 130} r={3} fill="#cfd6e6" />)}
    {[0, 1, 2, 3].map((i) => {
      const t = loop(f + i * 12, 48);
      const a = (i / 4) * TAU + 0.6;
      const r = 110 + t * 40;
      return <path key={i} transform={`translate(${Math.cos(a) * r},${Math.sin(a) * r - 20}) scale(${1 - t})`} d="M0,-18 L5,-5 L18,0 L5,5 L0,18 L-5,5 L-18,0 L-5,-5 Z" fill={GOLD} />;
    })}
  </g>
);

// k=0 dedo normal, k=1 la piel se retrae y la uña "parece" crecer (la ilusión de la idea unas_muerte)
const UnaCrece: React.FC<PP> = ({k}) => {
  const t = clamp01(k);
  return (
    <g>
      <rect x={-70} y={-60} width={140} height={260} rx={64} fill="#f2b98d" {...st} />
      <rect x={-48} y={-110} width={96} height={110 + t * 14} rx={40} fill="#ffe6ef" {...st} strokeWidth={6} />
      <rect x={-70} y={-20 + t * 30} width={140} height={60} fill="#f2b98d" />
      <path d={`M-70,${-20 + t * 30} Q0,${-48 + t * 30} 70,${-20 + t * 30}`} stroke={INK} strokeWidth={6} fill="#f2b98d" />
      <path d="M-30,-96 q20,-10 40,0" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
      {t > 0.3 && (
        <g opacity={t}>
          <path d="M100,-60 L100,20" stroke={CORAL} strokeWidth={6} />
          <path d="M100,20 l-10,-14 M100,20 l10,-14" stroke={CORAL} strokeWidth={6} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

const MoleculaAgua: React.FC<PP> = ({f}) => {
  const w = wave(f, 18) * 6;
  return (
    <g transform={`rotate(${wave(f, 120) * 12})`}>
      <path d={`M0,0 L${-90 - w},70 M0,0 L${90 + w},70`} stroke={INK} strokeWidth={16} strokeLinecap="round" />
      <circle r={70} fill="#ff5a5a" {...st} />
      <circle cx={-90 - w} cy={70} r={44} fill={CREAM} {...st} />
      <circle cx={90 + w} cy={70} r={44} fill={CREAM} {...st} />
      <text y={14} textAnchor="middle" fontSize={50} fontWeight="bold" fill={CREAM} fontFamily="sans-serif">O</text>
      <text x={-90 - w} y={84} textAnchor="middle" fontSize={36} fontWeight="bold" fill={INK} fontFamily="sans-serif">H</text>
      <text x={90 + w} y={84} textAnchor="middle" fontSize={36} fontWeight="bold" fill={INK} fontFamily="sans-serif">H</text>
      <circle cx={-20} cy={-24} r={14} fill="#fff" opacity={0.5} />
    </g>
  );
};

const Estomago: React.FC<PP> = ({f, k}) => (
  <g>
    <path d="M-40,-150 L-40,-90 C-40,-40 -140,-30 -140,60 C-140,150 20,170 100,110 C160,60 140,-40 60,-40 C20,-40 10,-80 10,-150" fill="#ff9aa8" {...st} />
    <g opacity={0.8}>
      {[0, 1, 2].map((i) => {
        const a = f * 0.08 + (i * TAU) / 3;
        return <circle key={i} cx={-20 + Math.cos(a) * 50} cy={60 + Math.sin(a) * 30} r={14} fill={['#ffd25a', '#8be06a', '#c88a5a'][i]} stroke={INK} strokeWidth={4} />;
      })}
    </g>
    <text x={0} y={-170} textAnchor="middle" fontSize={30} fill={CREAM} fontFamily="sans-serif" opacity={clamp01(k)}>
      {Math.round(clamp01(k) * 100)}%
    </text>
  </g>
);

const Lupa: React.FC<PP> = ({f}) => (
  <g transform={`rotate(${-20 + wave(f, 60) * 6})`}>
    <path d="M70,70 L170,170" stroke={INK} strokeWidth={44} strokeLinecap="round" />
    <path d="M78,78 L166,166" stroke="#8a4b30" strokeWidth={26} strokeLinecap="round" />
    <circle r={100} fill="#c7f3ff" fillOpacity={0.35} {...st} strokeWidth={18} />
    <circle r={100} fill="none" stroke="#c7cbd8" strokeWidth={8} />
    <path d="M-60,-30 a70,70 0 0 1 40,-40" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" />
  </g>
);

const Calendario: React.FC<PP> = ({f, label}) => {
  const flip = loop(f, 40);
  return (
    <g>
      <rect x={-110} y={-120} width={220} height={240} rx={20} fill={CREAM} {...st} />
      <rect x={-110} y={-120} width={220} height={66} rx={20} fill={CORAL} {...st} />
      <circle cx={-56} cy={-122} r={10} fill={INK} />
      <circle cx={56} cy={-122} r={10} fill={INK} />
      <text y={50} textAnchor="middle" fontSize={110} fontWeight="bold" fill={INK} fontFamily="sans-serif">{label ?? '24'}</text>
      <path d={`M-110,-54 L110,-54 L110,${-54 + (1 - flip) * 160} L-110,${-54 + (1 - flip) * 160} Z`} fill={CREAM} stroke={INK} strokeWidth={5} opacity={flip < 0.5 ? 0.9 : 0} />
    </g>
  );
};

const MAP: Record<Prop2Id, React.FC<PP>> = {
  termometro: Termometro, virus: Virus, remolino: Remolino, globo_coriolis: GloboCoriolis, cerebro: Cerebro,
  gota_real: GotaReal, rayo: Rayo, montana_bulto: MontanaBulto, corazon: Corazon, pulmones: Pulmones, mosca: Mosca,
  reloj: Reloj, piramide_bloques: PiramideBloques, abejorro: Abejorro, cubo_azucar: CuboAzucar, una_crece: UnaCrece,
  molecula_agua: MoleculaAgua, estomago: Estomago, lupa: Lupa, calendario: Calendario,
};

export const Prop2: React.FC<{t: Prop2Id; x?: number; y?: number; s?: number; rot?: number; f?: number; k?: number; dir?: 1 | -1; side?: 'L' | 'R' | 'both'; label?: string}> = ({
  t, x = 0, y = 0, s = 1, rot = 0, f = 0, k = 0, ...rest
}) => {
  const C = MAP[t];
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
      <C f={f} k={k} {...rest} />
    </g>
  );
};

