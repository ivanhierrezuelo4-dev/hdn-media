// Nodo Limpio estático (pose "calma") SOLO para catálogos y miniaturas de prueba.
// En los Shorts se usa el Nodo3.tsx real del PC; los accesorios v2 usan sus mismas coordenadas.
import React from 'react';
import {CORAL, CREAM, INK} from './kit2';
import {Wear2} from './accesorios2';

const BODY = 'M6,-282 C26,-232 122,-172 122,-92 C122,-30 72,8 0,8 C-72,8 -122,-30 -122,-92 C-122,-168 -18,-226 6,-282 Z';
const ANT = 'M6,-276 C4,-318 30,-336 54,-352';

export const NodoMuestra: React.FC<{id: string; x: number; y: number; s?: number; wear?: Wear2; f?: number; bob?: boolean}> = ({id, x, y, s = 1, wear, f = 0, bob}) => {
  const dy = bob ? Math.sin((f / 40) * Math.PI * 2) * 6 : 0;
  const eye = (cx: number, cy: number, r: number, pr: number) => (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={CREAM} stroke={INK} strokeWidth={7} />
      <circle cx={cx + 6} cy={cy - 2} r={pr} fill={INK} />
      <circle cx={cx + 6 - pr * 0.35} cy={cy - 2 - pr * 0.38} r={pr * 0.36} fill="#fff" />
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={0} cy={12} rx={112} ry={16} fill="#000" opacity={0.3} />
      <g transform={`translate(0,${dy})`}>
        <path d={ANT} stroke={INK} strokeWidth={18} fill="none" strokeLinecap="round" />
        <path d={ANT} stroke="#b4f8e4" strokeWidth={8} fill="none" strokeLinecap="round" />
        <g transform="translate(54,-352) rotate(52)">
          <rect x={-16} y={-28} width={32} height={44} rx={13} fill={CORAL} stroke={INK} strokeWidth={6} />
          <rect x={-8} y={-20} width={7} height={16} rx={3.5} fill="#fff" opacity={0.7} />
        </g>
        <defs>
          <clipPath id={`cb${id}`}>
            <path d={BODY} />
          </clipPath>
        </defs>
        <g clipPath={`url(#cb${id})`}>
          <rect x={-140} y={-300} width={280} height={320} fill="#2fae90" />
          <path d={BODY} fill="#5fe0c0" transform="translate(-20,-16)" />
          <ellipse cx={-62} cy={-150} rx={16} ry={34} fill="#fff" opacity={0.45} transform="rotate(28,-62,-150)" />
        </g>
        <path d={BODY} fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        {eye(-44, -122, 46, 21)}
        {eye(46, -124, 35, 16)}
        <path d="M-8,-58 Q4,-48 16,-58" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
        {wear && <Wear2 w={wear} f={f} />}
      </g>
    </g>
  );
};
