import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Nodo3, FACES} from './Nodo3';
export const Sheet: React.FC = () => {
  const names = Object.keys(FACES);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#2d3184,#111430)'}}>
      <svg viewBox="0 0 1080 1920">
        {names.map((n, i) => (
          <g key={n}>
            <Nodo3 id={'s' + i} x={270 + (i % 2) * 540} y={420 + Math.floor(i / 2) * 460} s={0.9} face={FACES[n]} turn={i===3?0.5:0}
              hands={i === 1 ? {l: {x: -170, y: -120, r: -20, pose: 'wave'}, r: {x: 170, y: -60, pose: 'thumb'}} : undefined} />
            <text x={270 + (i % 2) * 540} y={460 + Math.floor(i / 2) * 460} fill="#fff" fontSize={36} textAnchor="middle">{n}</text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
