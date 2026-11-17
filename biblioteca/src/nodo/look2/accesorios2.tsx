import React from 'react';
import {CORAL, CREAM, GOLD, INK, st, wave} from './kit2';

// 26 accesorios NUEVOS de Nodo (no repiten los 19 de look/accesorios.tsx:
// copa, vaquero, chef, gorra, lana, corona, birrete, minero, explorador, mago, pirata,
// auriculares, gafas, lentes, monoculo, bigote, pajarita, astronauta, capa).
// Coordenadas locales del cuerpo de Nodo Limpio: punta (6,-282), ojos (-44,-122) r46 y (46,-124) r35,
// boca ~(6,-56), ancho máx ±122 en y=-92, base y=8. Se dibuja DESPUÉS del cuerpo (como <Hat/>).
// Los que van "detrás" (alas) usan relleno translúcido para no tapar la cara.

export const WEAR2 = [
  'bufanda', 'orejeras', 'gorro_dormir', 'estetoscopio', 'gafas_lab', 'gafas_natacion', 'flotador',
  'gorro_fiesta', 'detective', 'alpinista', 'faraon', 'antenas_bicho', 'alas_abeja', 'electrodos',
  'impermeable', 'vikingo', 'romano', 'sombrero_paja', 'bata', 'corbata', 'capitan', 'boina',
  'laurel', 'banda_sudor', 'buzo', 'curita',
] as const;
export type Wear2 = (typeof WEAR2)[number];

type P = {w: Wear2; f?: number};

export const Wear2: React.FC<P> = ({w, f = 0}) => {
  switch (w) {
    case 'bufanda': {
      const sway = wave(f, 48) * 6;
      return (
        <g>
          <path d="M-121,-58 Q0,-26 121,-58 L116,-20 Q0,10 -116,-20 Z" fill="#e8413f" {...st} />
          <path d="M-60,-40 L-56,-4 M0,-30 L0,4 M60,-40 L56,-4" stroke="#ffe3c9" strokeWidth={9} opacity={0.9} />
          <g transform={`rotate(${sway},70,-24)`}>
            <path d="M58,-30 L96,-28 L104,58 L64,62 Z" fill="#e8413f" {...st} />
            <path d="M66,10 L100,8 M68,34 L102,32" stroke="#ffe3c9" strokeWidth={9} />
            <path d="M66,62 L64,80 M78,62 L78,82 M90,60 L92,80 M102,58 L106,78" stroke={INK} strokeWidth={5} />
          </g>
        </g>
      );
    }
    case 'orejeras':
      return (
        <g>
          <path d="M-118,-150 C-110,-290 120,-290 118,-150" stroke={INK} strokeWidth={20} fill="none" strokeLinecap="round" />
          <path d="M-118,-150 C-110,-290 120,-290 118,-150" stroke="#ff8fb4" strokeWidth={9} fill="none" strokeLinecap="round" />
          {[-122, 122].map((x) => (
            <g key={x}>
              <circle cx={x} cy={-146} r={40} fill={CREAM} {...st} />
              <path d={`M${x - 24},${-160} q8,-10 18,-2 q10,-10 18,2 M${x - 22},${-134} q9,8 20,0 q10,8 20,0`} stroke="#d9cfbd" strokeWidth={4} fill="none" />
            </g>
          ))}
        </g>
      );
    case 'gorro_dormir': {
      const sw = wave(f, 60) * 8;
      return (
        <g>
          <path d={`M-84,-214 C-70,-300 30,-330 96,-300 C140,-280 ${170 + sw},-220 ${178 + sw},-170 L150,-182 C120,-250 60,-262 40,-246 L84,-214 Z`} fill="#5b7cff" {...st} />
          <path d="M-40,-268 L-30,-224 M10,-290 L18,-232 M60,-290 L58,-238 M110,-268 L100,-226" stroke="#c9d4ff" strokeWidth={8} />
          <path d="M-96,-222 Q0,-196 96,-222 L92,-196 Q0,-170 -92,-196 Z" fill={CREAM} {...st} />
          <circle cx={172 + sw} cy={-160} r={24} fill={CREAM} {...st} />
        </g>
      );
    }
    case 'estetoscopio':
      return (
        <g fill="none">
          <path d="M-96,-150 C-110,-60 -60,-20 -10,-24 C40,-28 80,-60 92,-150" stroke={INK} strokeWidth={16} strokeLinecap="round" />
          <path d="M-96,-150 C-110,-60 -60,-20 -10,-24 C40,-28 80,-60 92,-150" stroke="#3a3f58" strokeWidth={7} strokeLinecap="round" />
          <path d="M-10,-24 C-14,10 30,30 50,4" stroke={INK} strokeWidth={14} strokeLinecap="round" />
          <path d="M-10,-24 C-14,10 30,30 50,4" stroke="#3a3f58" strokeWidth={6} strokeLinecap="round" />
          <circle cx={58} cy={-6} r={20} fill="#c7cbd8" {...st} />
          <circle cx={58} cy={-6} r={9} fill="#8e93a8" />
          <circle cx={-96} cy={-154} r={9} fill="#c7cbd8" {...st} strokeWidth={5} />
          <circle cx={92} cy={-154} r={9} fill="#c7cbd8" {...st} strokeWidth={5} />
        </g>
      );
    case 'gafas_lab':
      return (
        <g>
          <path d="M-124,-128 L-100,-126 M100,-130 L124,-132" stroke={INK} strokeWidth={14} />
          <rect x={-102} y={-176} width={198} height={100} rx={34} fill="#bff3ff" fillOpacity={0.35} {...st} strokeWidth={9} />
          <path d="M-84,-160 L-50,-160" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.8} />
          <circle cx={-80} cy={-90} r={5} fill={INK} />
          <circle cx={74} cy={-90} r={5} fill={INK} />
        </g>
      );
    case 'gafas_natacion':
      return (
        <g>
          <path d="M-122,-128 L-96,-126 M92,-130 L122,-132" stroke="#ff5aa0" strokeWidth={12} />
          <path d="M-96,-126 L92,-130" stroke="#ff5aa0" strokeWidth={8} />
          <ellipse cx={-44} cy={-124} rx={52} ry={44} fill="#3de0ff" fillOpacity={0.4} {...st} strokeWidth={10} />
          <ellipse cx={46} cy={-126} rx={42} ry={36} fill="#3de0ff" fillOpacity={0.4} {...st} strokeWidth={10} />
          <path d="M-70,-146 l18,-8 M24,-146 l14,-6" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    case 'flotador': {
      const bob = wave(f, 40) * 4;
      return (
        <g transform={`translate(0,${bob})`}>
          <path d="M-158,-30 A158,52 0 0 0 158,-30" stroke={INK} strokeWidth={62} fill="none" />
          <path d="M-158,-30 A158,52 0 0 0 158,-30" stroke="#ff7a59" strokeWidth={48} fill="none" />
          <path d="M-158,-30 A158,52 0 0 0 158,-30" stroke={CREAM} strokeWidth={48} fill="none" strokeDasharray="44 62" />
          <path d="M-120,-4 A140,40 0 0 0 -40,18" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.7} />
        </g>
      );
    }
    case 'gorro_fiesta':
      return (
        <g transform="rotate(14,10,-220)">
          <path d="M-56,-214 L14,-372 L78,-214 Z" fill="#ff5fa2" {...st} />
          <circle cx={-14} cy={-250} r={9} fill={GOLD} />
          <circle cx={30} cy={-296} r={8} fill="#5fe0c0" />
          <circle cx={42} cy={-240} r={9} fill="#7a7cff" />
          <path d="M-60,-212 Q10,-196 82,-212" stroke={GOLD} strokeWidth={12} fill="none" strokeLinecap="round" />
          <circle cx={14} cy={-378} r={18} fill={GOLD} {...st} />
        </g>
      );
    case 'detective':
      return (
        <g transform="rotate(-6,0,-220)">
          <path d="M-96,-206 C-96,-300 96,-300 96,-206 Z" fill="#a7865a" {...st} />
          <path d="M-60,-282 L-56,-206 M-20,-292 L-20,-206 M20,-292 L20,-206 M60,-282 L56,-206 M-90,-240 L90,-240 M-80,-266 L80,-266" stroke="#7a5d38" strokeWidth={5} />
          <path d="M-96,-210 L-136,-196 L-96,-188 Z" fill="#a7865a" {...st} />
          <path d="M96,-210 L136,-196 L96,-188 Z" fill="#a7865a" {...st} />
          <path d="M-20,-296 q20,-14 40,0" stroke={INK} strokeWidth={6} fill="none" />
        </g>
      );
    case 'alpinista':
      return (
        <g>
          <path d="M-100,-206 C-100,-312 104,-312 104,-206 Z" fill="#ff9a2e" {...st} />
          <path d="M-60,-290 C-20,-306 40,-306 70,-288" stroke="#ffd08a" strokeWidth={8} fill="none" />
          <rect x={-86} y={-262} width={172} height={44} rx={20} fill="#2a2a44" {...st} />
          <ellipse cx={-38} cy={-240} rx={34} ry={17} fill="#ffcf5a" stroke={INK} strokeWidth={5} />
          <ellipse cx={38} cy={-240} rx={34} ry={17} fill="#ffcf5a" stroke={INK} strokeWidth={5} />
          <path d="M-58,-246 l14,-4 M18,-246 l14,-4" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
          <path d="M-104,-206 L104,-206" stroke={INK} strokeWidth={10} />
        </g>
      );
    case 'faraon':
      return (
        <g>
          <path d="M-130,-60 L-118,-200 C-90,-262 90,-262 118,-200 L130,-60 L96,-60 L92,-170 L-92,-170 L-96,-60 Z" fill={GOLD} {...st} />
          {[-0.75, -0.25, 0.25, 0.75].map((k, i) => (
            <path key={i} d={`M${-128 + 4},${-86 - i * 30} L${-94},${-90 - i * 30} M${94},${-90 - i * 30} L${126},${-86 - i * 30}`} stroke="#2c5bd6" strokeWidth={13} />
          ))}
          <path d="M-90,-196 Q0,-234 90,-196" stroke="#2c5bd6" strokeWidth={13} fill="none" />
          <path d="M0,-238 c-10,-26 12,-40 16,-22 c4,14 -10,18 -10,30" fill="#2c5bd6" {...st} strokeWidth={5} />
        </g>
      );
    case 'antenas_bicho': {
      const a = wave(f, 22) * 8;
      const b = wave(f, 26, 1.3) * 8;
      return (
        <g>
          <path d="M-96,-196 Q0,-236 96,-196" stroke={INK} strokeWidth={18} fill="none" strokeLinecap="round" />
          <path d="M-96,-196 Q0,-236 96,-196" stroke="#2b2b2b" strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d={`M-60,-216 Q${-110 + a},-300 ${-126 + a},-344`} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d={`M66,-216 Q${120 + b},-300 ${140 + b},-340`} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
          <circle cx={-126 + a} cy={-350} r={16} fill="#ff4f6d" {...st} strokeWidth={6} />
          <circle cx={140 + b} cy={-346} r={16} fill="#ff4f6d" {...st} strokeWidth={6} />
        </g>
      );
    }
    case 'alas_abeja': {
      const flap = 0.55 + 0.45 * Math.abs(wave(f, 3));
      return (
        <g opacity={0.92}>
          {[-1, 1].map((s) => (
            <g key={s} transform={`translate(${s * 112},-140) scale(${s},${flap})`}>
              <ellipse cx={46} cy={-50} rx={66} ry={38} transform="rotate(-30,46,-50)" fill="#f2fdff" fillOpacity={0.8} {...st} strokeWidth={6} />
              <ellipse cx={50} cy={-4} rx={40} ry={22} transform="rotate(-10,50,-4)" fill="#f2fdff" fillOpacity={0.8} {...st} strokeWidth={6} />
              <path d="M6,-14 Q40,-50 92,-76" stroke="#9ec9d6" strokeWidth={4} fill="none" />
            </g>
          ))}
        </g>
      );
    }
    case 'electrodos': {
      const spark = (Math.floor(f / 4) % 3) as number;
      const pts: [number, number][] = [[-70, -232], [-20, -258], [34, -252], [80, -222]];
      const cols = ['#ff5a5a', GOLD, '#5ad1ff', '#7cff8a'];
      return (
        <g>
          <path d="M-104,-196 Q0,-246 104,-196" stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" />
          <path d="M-104,-196 Q0,-246 104,-196" stroke="#c7cbd8" strokeWidth={7} fill="none" strokeLinecap="round" />
          {pts.map(([x, y], i) => (
            <g key={i}>
              <path d={`M${x},${y} C${x + 10},${y - 40} ${120 + i * 6},${-300} ${132 + i * 7},${-40 - i * 8}`} stroke={cols[i]} strokeWidth={6} fill="none" />
              <ellipse cx={x} cy={y} rx={18} ry={10} fill={cols[i]} {...st} strokeWidth={5} />
              {spark === i % 3 && <path d={`M${x - 8},${y - 22} l6,-12 l4,8 l6,-14`} stroke={GOLD} strokeWidth={5} fill="none" />}
            </g>
          ))}
        </g>
      );
    }
    case 'impermeable':
      return (
        <g>
          <path d="M-132,-40 C-150,-200 -60,-300 6,-300 C80,-300 150,-200 132,-40 L104,-44 C116,-170 60,-238 6,-238 C-50,-238 -116,-170 -104,-44 Z" fill="#ffd23a" {...st} />
          <path d="M-118,-150 C-100,-220 -50,-262 6,-266" stroke="#fff3a6" strokeWidth={8} fill="none" opacity={0.8} />
          <path d="M-104,-44 L-112,-14 M104,-44 L112,-14" stroke={INK} strokeWidth={6} />
          <circle cx={-110} cy={-6} r={7} fill="#ffd23a" {...st} strokeWidth={4} />
          <circle cx={110} cy={-6} r={7} fill="#ffd23a" {...st} strokeWidth={4} />
        </g>
      );
    case 'vikingo':
      return (
        <g>
          <path d="M-96,-210 C-122,-246 -158,-262 -176,-318 C-140,-290 -110,-282 -88,-262 Z" fill={CREAM} {...st} />
          <path d="M102,-210 C128,-246 164,-262 182,-318 C146,-290 116,-282 94,-262 Z" fill={CREAM} {...st} />
          <path d="M-100,-204 C-100,-312 106,-312 106,-204 Z" fill="#9aa3b5" {...st} />
          <path d="M3,-300 L3,-204" stroke="#6e7790" strokeWidth={12} />
          <path d="M-104,-206 L108,-206" stroke="#6e7790" strokeWidth={16} strokeLinecap="round" />
          <path d="M-104,-206 L108,-206" stroke={INK} strokeWidth={4} opacity={0.5} />
          {[-70, -30, 40, 80].map((x) => <circle key={x} cx={x} cy={-206} r={4} fill={INK} />)}
        </g>
      );
    case 'romano':
      return (
        <g>
          <path d="M-60,-300 C-40,-372 60,-372 80,-300 L70,-286 C50,-340 -30,-340 -50,-286 Z" fill="#d9333b" {...st} />
          {Array.from({length: 9}).map((_, i) => (
            <path key={i} d={`M${-46 + i * 13},-298 L${-50 + i * 14},-348`} stroke="#ff7a7a" strokeWidth={4} />
          ))}
          <path d="M-104,-204 C-104,-312 108,-312 108,-204 Z" fill="#d6a640" {...st} />
          <path d="M-104,-204 L-110,-150 L-80,-156 L-76,-204 Z" fill="#d6a640" {...st} />
          <path d="M108,-204 L114,-150 L84,-156 L80,-204 Z" fill="#d6a640" {...st} />
          <path d="M-60,-288 C-20,-300 30,-300 60,-288" stroke="#ffe08a" strokeWidth={8} fill="none" />
        </g>
      );
    case 'sombrero_paja':
      return (
        <g transform="rotate(-5,0,-214)">
          <ellipse cx={4} cy={-210} rx={168} ry={34} fill="#efc76a" {...st} />
          <path d="M-74,-214 C-70,-292 78,-292 82,-214 Z" fill="#efc76a" {...st} />
          <path d="M-76,-232 Q4,-214 84,-232 L82,-214 Q4,-198 -74,-214 Z" fill="#e85d4a" {...st} strokeWidth={5} />
          <path d="M-140,-204 L-100,-218 M-120,-196 L-60,-214 M60,-216 L120,-198 M100,-220 L150,-206 M-30,-270 L30,-272" stroke="#c99a3a" strokeWidth={4} />
        </g>
      );
    case 'bata':
      return (
        <g>
          <path d="M-121,-70 L-60,-40 L-30,8 L-82,6 C-110,-10 -122,-40 -121,-70 Z" fill={CREAM} {...st} />
          <path d="M121,-70 L60,-40 L30,8 L82,6 C110,-10 122,-40 121,-70 Z" fill={CREAM} {...st} />
          <rect x={58} y={-28} width={38} height={30} rx={4} fill={CREAM} {...st} strokeWidth={5} />
          <path d="M66,-26 L66,-48 M78,-26 L78,-52" stroke="#2c5bd6" strokeWidth={6} strokeLinecap="round" />
          <path d="M78,-26 L78,-52" stroke={CORAL} strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    case 'corbata': {
      const sw = wave(f, 50) * 3;
      return (
        <g transform={`rotate(${sw},6,-34)`}>
          <path d="M-12,-40 L24,-40 L16,-24 L-4,-24 Z" fill="#2c5bd6" {...st} strokeWidth={5} />
          <path d="M-4,-24 L16,-24 L30,40 L6,60 L-18,40 Z" fill="#2c5bd6" {...st} strokeWidth={5} />
          <path d="M-6,0 L22,-12 M-12,24 L26,10" stroke={GOLD} strokeWidth={5} />
        </g>
      );
    }
    case 'capitan':
      return (
        <g transform="rotate(-4,0,-214)">
          <path d="M-90,-232 C-100,-300 108,-300 98,-232 Z" fill={CREAM} {...st} />
          <rect x={-86} y={-236} width={180} height={28} rx={8} fill="#1d2550" {...st} />
          <path d="M-80,-208 Q10,-176 102,-208 L96,-196 Q10,-160 -76,-196 Z" fill="#111633" {...st} strokeWidth={5} />
          <path d="M4,-262 l0,22 M-8,-252 l24,0 M-6,-244 q10,10 20,0" stroke={GOLD} strokeWidth={5} fill="none" />
          <path d="M-60,-226 Q4,-216 70,-226" stroke={GOLD} strokeWidth={5} fill="none" />
        </g>
      );
    case 'boina':
      return (
        <g transform="rotate(-14,0,-220)">
          <path d="M-110,-214 C-120,-260 -40,-290 30,-282 C100,-276 128,-244 104,-214 Q0,-196 -110,-214 Z" fill="#c2304f" {...st} />
          <path d="M12,-284 l4,-18" stroke={INK} strokeWidth={8} strokeLinecap="round" />
          <path d="M-70,-262 Q0,-280 60,-264" stroke="#e86a85" strokeWidth={7} fill="none" />
        </g>
      );
    case 'laurel':
      return (
        <g>
          {[-1, 1].map((s) => (
            <g key={s} transform={`scale(${s},1)`}>
              <path d="M8,-236 Q66,-236 108,-190" stroke="#3f7d2a" strokeWidth={7} fill="none" />
              {[0, 1, 2, 3, 4].map((i) => {
                const x = 22 + i * 20;
                const y = -236 + i * i * 2 + i * 4;
                return <ellipse key={i} cx={x} cy={y - 14} rx={24} ry={12} transform={`rotate(${-34 + i * 14},${x},${y - 14})`} fill="#62b043" {...st} strokeWidth={4} />;
              })}
            </g>
          ))}
        </g>
      );
    case 'banda_sudor':
      return (
        <g>
          <path d="M-114,-186 Q0,-222 116,-188 L118,-160 Q0,-196 -116,-158 Z" fill="#ff4f6d" {...st} />
          <path d="M-112,-176 Q0,-210 116,-178" stroke={CREAM} strokeWidth={6} fill="none" />
          <path d="M-28,-198 l8,14 l8,-14 l8,14" stroke={CREAM} strokeWidth={4} fill="none" />
        </g>
      );
    case 'buzo':
      return (
        <g>
          <path d="M-122,-130 L-100,-128 M98,-132 L122,-134" stroke={INK} strokeWidth={14} />
          <path d="M-102,-170 C-102,-196 98,-196 98,-170 L98,-86 C60,-64 -60,-64 -102,-86 Z" fill="#9ff0ff" fillOpacity={0.35} {...st} strokeWidth={11} />
          <path d="M-86,-170 L-30,-176" stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.8} />
          <path d="M118,-120 L136,-120 L136,-300" stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
          <path d="M118,-120 L136,-120 L136,-300" stroke="#ffcf2e" strokeWidth={12} fill="none" strokeLinecap="round" />
          <rect x={124} y={-316} width={24} height={20} rx={6} fill={CORAL} {...st} strokeWidth={5} />
        </g>
      );
    case 'curita':
      return (
        <g transform="rotate(-28,-30,-210)">
          <rect x={-92} y={-228} width={124} height={38} rx={18} fill="#f3c48c" {...st} />
          <rect x={-46} y={-224} width={34} height={30} rx={4} fill="#e9a76b" />
          {[[-74, -216], [-66, -202], [12, -216], [20, -202]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.6} fill="#b97b44" />)}
          <g transform="rotate(56,-30,-210)">
            <rect x={-92} y={-228} width={124} height={38} rx={18} fill="#f3c48c" {...st} />
            <rect x={-46} y={-224} width={34} height={30} rx={4} fill="#e9a76b" />
          </g>
        </g>
      );
    default:
      return null;
  }
};
