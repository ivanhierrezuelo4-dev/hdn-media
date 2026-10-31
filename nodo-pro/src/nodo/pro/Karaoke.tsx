// Subtítulos palabra por palabra (informe §7). Usa los tiempos por palabra que ya produce make.py.
// Regla: máx. 4 palabras en pantalla, una sola en color por frase, el dato clave en coral.
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {fitText} from '@remotion/layout-utils';
import {sp} from './motion';

export type Word = {text: string; from: number; to: number; key?: boolean}; // from/to en fotogramas de la escena

export const KaraokeCaps: React.FC<{
  words: Word[];
  y: number; // top en px (fuera de la zona 1500-1920)
  font: string;
  accent?: string; // palabra sonando
  keyColor?: string; // dato clave (coral)
  ink?: string;
  maxWords?: number;
  maxSize?: number;
  width?: number;
}> = ({words, y, font, accent = '#ffd25a', keyColor = '#f2694a', ink = '#15142b', maxWords = 4, maxSize = 118, width = 920}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!words.length) return null;
  // páginas de <= maxWords; se muestra la página cuya primera palabra ya empezó
  const pages: Word[][] = [];
  for (let i = 0; i < words.length; i += maxWords) pages.push(words.slice(i, i + maxWords));
  let page = pages[0];
  for (const p of pages) if (f >= p[0].from - 3) page = p;
  const start = page[0].from - 3;
  if (f < start) return null;
  const text = page.map((w) => w.text).join(' ');
  const {fontSize} = fitText({text, withinWidth: width, fontFamily: font, fontWeight: '400'});
  const size = Math.min(fontSize, maxSize);
  return (
    <div style={{position: 'absolute', top: y, width: '100%', display: 'flex', justifyContent: 'center', flexWrap: 'wrap'}}>
      {page.map((w, i) => {
        const s = sp(f, fps, start + i * 2, 'snappy');
        const on = f >= w.from && f < w.to;
        return (
          <span
            key={i}
            style={{
              fontFamily: font,
              fontSize: size,
              display: 'inline-block',
              marginRight: '0.32em',
              opacity: Math.min(1, s),
              transform: `translateY(${(1 - s) * 26}px) scale(${on ? 1.1 : 1}) rotate(${on ? -2 : 0}deg)`,
              color: w.key ? keyColor : on ? accent : '#fff',
              WebkitTextStroke: `${size * 0.11}px ${ink}`,
              paintOrder: 'stroke fill',
              textShadow: `0 ${size * 0.08}px 0 ${ink}`,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
