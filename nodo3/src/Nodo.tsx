import React from 'react';
import {C} from './kit';

export type Expr = 'calma' | 'idea' | 'alarma' | 'triunfo' | 'plano';
export type Wear =
  | 'none'
  | 'copa'
  | 'chef'
  | 'gorra'
  | 'corona'
  | 'mago'
  | 'gafas'
  | 'auriculares'
  | 'birrete'
  | 'lentes';

export type NodoProps = {
  id: string;
  x: number;
  y: number; // suelo
  s?: number;
  sq?: number; // 1 normal, <1 aplasta, >1 estira
  lean?: number; // grados
  ant?: number; // desvío de la punta de la antena (px locales)
  dy?: number; // altura del salto (negativo = arriba)
  airK?: number; // 0..1 para la sombra
  expr?: Expr;
  blink?: number;
  look?: [number, number];
  wear?: Wear;
  flat?: boolean; // dibujo "antes": sin brillo, sin sombra
  hatDy?: number;
};

const BODY = 'M6,-282 C26,-232 122,-172 122,-92 C122,-30 72,8 0,8 C-72,8 -122,-30 -122,-92 C-122,-168 -18,-226 6,-282 Z';

export const Nodo: React.FC<NodoProps> = ({
  id,
  x,
  y,
  s = 1,
  sq = 1,
  lean = 0,
  ant = 0,
  dy = 0,
  airK = 0,
  expr = 'calma',
  blink = 0,
  look = [0, 0],
  wear = 'none',
  flat = false,
  hatDy = 0,
}) => {
  const sx = 1 / Math.pow(sq, 0.8);
  const eyeK = 1 - blink * 0.92;
  const lx = look[0] * 9;
  const ly = look[1] * 7;
  const tipX = 8 + ant;
  const tipY = -405 + Math.abs(ant) * 0.25;
  const tipRot = ant * 0.45;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <defs>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#8ff3d6" />
          <stop offset="0.55" stopColor={C.teal} />
          <stop offset="1" stopColor="#2fae90" />
        </linearGradient>
        <radialGradient id={`g${id}`}>
          <stop offset="0" stopColor="#ff8a6a" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ff8a6a" stopOpacity="0" />
        </radialGradient>
      </defs>
      {!flat && (
        <ellipse
          cx={0}
          cy={10}
          rx={118 * sx * (1 - airK * 0.45)}
          ry={16 * (1 - airK * 0.4)}
          fill="#000"
          opacity={0.32 * (1 - airK * 0.6)}
        />
      )}
      <g transform={`translate(0,${dy}) rotate(${lean}) scale(${sx},${sq})`}>
        {/* antena */}
        <path
          d={`M6,-276 Q${6 + ant * 0.15},-340 ${tipX},${tipY + 22}`}
          stroke={C.ink}
          strokeWidth={15}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M6,-276 Q${6 + ant * 0.15},-340 ${tipX},${tipY + 22}`}
          stroke={flat ? C.teal : C.tealL}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
        />
        <g transform={`translate(${tipX},${tipY}) rotate(${tipRot})`}>
          {!flat && <circle r={44} fill={`url(#g${id})`} />}
          <rect x={-15} y={-24} width={30} height={46} rx={8} fill={C.coral} stroke={C.ink} strokeWidth={6} />
          {!flat && <rect x={-7} y={-16} width={6} height={18} rx={3} fill="#fff" opacity={0.55} />}
        </g>
        {/* cuerpo */}
        <path d={BODY} fill={flat ? C.teal : `url(#b${id})`} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
        {!flat && <ellipse cx={-58} cy={-150} rx={20} ry={34} fill="#fff" opacity={0.28} transform="rotate(28,-58,-150)" />}
        {/* líneas de código en la panza */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i} opacity={flat ? 0.25 : 0.45}>
            <rect x={-70 + (i % 2) * 8} y={-62 + i * 13} width={46 - i * 6} height={6} rx={3} fill={C.tealD} />
            <rect x={-14 + (i % 2) * 6} y={-62 + i * 13} width={70 - i * 10} height={6} rx={3} fill={C.tealD} />
          </g>
        ))}
        {/* ojos */}
        <g transform={`translate(-46,-118) scale(1,${eyeK})`}>
          <circle r={40} fill="#fffaf0" stroke={C.ink} strokeWidth={7} />
          {eyeK > 0.25 && (
            <>
              <circle cx={lx} cy={ly} r={17} fill={C.ink} />
              <circle cx={lx - 6} cy={ly - 6} r={6} fill="#fff" />
            </>
          )}
        </g>
        <g transform={`translate(42,-120) scale(1,${eyeK})`}>
          <circle r={29} fill="#fffaf0" stroke={C.ink} strokeWidth={6} />
          {eyeK > 0.25 && (
            <>
              <circle cx={lx * 0.8} cy={ly * 0.8 + 3} r={12} fill={C.ink} />
              <circle cx={lx * 0.8 - 4} cy={ly * 0.8 - 2} r={4} fill="#fff" />
            </>
          )}
          {expr === 'calma' && !flat && (
            <path d="M-31,-6 Q0,-20 31,-6" stroke={C.ink} strokeWidth={6} fill="#5fe0c0" strokeLinecap="round" />
          )}
        </g>
        {/* boca */}
        {expr === 'triunfo' ? (
          <g>
            <path d="M-34,-70 Q4,-12 40,-72 Z" fill="#3a1630" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            <ellipse cx={4} cy={-46} rx={14} ry={8} fill={C.coral} />
          </g>
        ) : expr === 'alarma' ? (
          <ellipse cx={2} cy={-58} rx={11} ry={14} fill="#3a1630" stroke={C.ink} strokeWidth={5} />
        ) : expr === 'plano' ? (
          <path d="M-22,-60 L28,-60" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        ) : (
          <path d="M-28,-66 Q6,-38 38,-70" stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
        )}
        <g transform={`translate(0,${hatDy})`}>
          <Hat w={wear} />
        </g>
      </g>
    </g>
  );
};

const st = {stroke: C.ink, strokeWidth: 7, strokeLinejoin: 'round' as const};

export const Hat: React.FC<{w: Wear}> = ({w}) => {
  switch (w) {
    case 'copa':
      return (
        <g transform="rotate(-8,0,-210)">
          <rect x={-58} y={-345} width={116} height={140} rx={10} fill="#262650" {...st} />
          <rect x={-58} y={-238} width={116} height={20} fill={C.coral} {...st} />
          <ellipse cx={0} cy={-206} rx={98} ry={18} fill="#262650" {...st} />
          <rect x={-40} y={-330} width={9} height={80} rx={4} fill="#fff" opacity={0.25} />
        </g>
      );
    case 'chef':
      return (
        <g>
          <rect x={-62} y={-262} width={124} height={62} rx={8} fill="#fffaf0" {...st} />
          <circle cx={-48} cy={-276} r={40} fill="#fffaf0" {...st} />
          <circle cx={48} cy={-276} r={40} fill="#fffaf0" {...st} />
          <circle cx={0} cy={-306} r={50} fill="#fffaf0" {...st} />
          <rect x={-58} y={-258} width={116} height={30} fill="#fffaf0" />
          <path d="M-30,-250 L-30,-212 M0,-250 L0,-210 M30,-250 L30,-212" stroke="#d9d0bf" strokeWidth={5} />
        </g>
      );
    case 'gorra':
      return (
        <g transform="rotate(6,0,-210)">
          <ellipse cx={80} cy={-206} rx={70} ry={14} fill="#2e6fd6" {...st} />
          <path d="M-78,-204 C-78,-290 78,-290 78,-204 Z" fill="#3b86f0" {...st} />
          <circle cx={0} cy={-272} r={8} fill="#2e6fd6" {...st} strokeWidth={5} />
        </g>
      );
    case 'corona':
      return (
        <g>
          <path d="M-74,-204 L-86,-296 L-42,-250 L0,-318 L42,-250 L86,-296 L74,-204 Z" fill={C.gold} {...st} />
          <circle cx={-38} cy={-222} r={9} fill="#4aa3ff" stroke={C.ink} strokeWidth={4} />
          <circle cx={0} cy={-222} r={10} fill={C.coral} stroke={C.ink} strokeWidth={4} />
          <circle cx={38} cy={-222} r={9} fill="#5fe0c0" stroke={C.ink} strokeWidth={4} />
        </g>
      );
    case 'mago':
      return (
        <g>
          <path d="M-70,-212 C-40,-260 -10,-330 6,-372 C22,-386 70,-392 98,-376 C60,-370 40,-320 70,-214 Z" fill="#6b3fd0" {...st} />
          <ellipse cx={0} cy={-210} rx={112} ry={22} fill="#5a33b5" {...st} />
          <path d="M-10,-268 l9,-20 l9,20 l22,2 l-17,14 l6,22 l-20,-12 l-20,12 l6,-22 l-17,-14 Z" fill={C.gold} stroke={C.ink} strokeWidth={4} />
        </g>
      );
    case 'gafas':
      return (
        <g>
          <path d="M-96,-140 L84,-142" stroke={C.ink} strokeWidth={9} />
          <path d="M-92,-142 C-92,-90 -10,-86 -6,-128 L-4,-142 Z" fill={C.ink} />
          <path d="M8,-142 C10,-96 80,-94 84,-142 Z" fill={C.ink} />
          <path d="M-70,-132 L-50,-112" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
        </g>
      );
    case 'lentes':
      return (
        <g fill="none">
          <circle cx={-46} cy={-118} r={50} stroke={C.ink} strokeWidth={8} />
          <circle cx={42} cy={-120} r={38} stroke={C.ink} strokeWidth={8} />
          <path d="M4,-124 Q0,-132 -4,-124" stroke={C.ink} strokeWidth={7} />
        </g>
      );
    case 'auriculares':
      return (
        <g>
          <path d="M-112,-120 C-118,-330 118,-330 112,-120" stroke={C.ink} strokeWidth={22} fill="none" strokeLinecap="round" />
          <path d="M-112,-120 C-118,-330 118,-330 112,-120" stroke="#3b3b6e" strokeWidth={11} fill="none" strokeLinecap="round" />
          <rect x={-140} y={-160} width={42} height={84} rx={18} fill={C.coral} {...st} />
          <rect x={98} y={-160} width={42} height={84} rx={18} fill={C.coral} {...st} />
        </g>
      );
    case 'birrete':
      return (
        <g transform="rotate(-6,0,-230)">
          <path d="M-56,-252 L-56,-212 Q0,-196 56,-212 L56,-252 Z" fill="#262650" {...st} />
          <path d="M-124,-256 L0,-296 L124,-256 L0,-218 Z" fill="#2f2f62" {...st} />
          <path d="M0,-258 L-86,-246 L-90,-196" stroke={C.gold} strokeWidth={6} fill="none" />
          <rect x={-100} y={-200} width={20} height={30} rx={5} fill={C.gold} stroke={C.ink} strokeWidth={4} />
        </g>
      );
    default:
      return null;
  }
};
