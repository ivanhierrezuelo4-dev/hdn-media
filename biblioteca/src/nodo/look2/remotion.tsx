// Envolturas para Remotion: leen el frame solas. Uso en un Short:
//   <svg viewBox="0 0 1080 1920"><EscenaR set="tormenta" /> ... <PropR t="rayo" x={760} y={700} /></svg>
//   Dentro del <g> de Nodo3 (después del cuerpo, igual que <Hat/>): <WearR w="bufanda" />
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Escena2, Set2} from './escenarios2';
import {Wear2} from './accesorios2';
import {Prop2} from './utileria2';
import {PAL2} from './paletas2';

export const EscenaR: React.FC<{set: Set2; pal?: keyof typeof PAL2; nodoX?: number}> = (p) => {
  const fr = useCurrentFrame();
  return <Escena2 {...p} f={fr} />;
};
export const WearR: React.FC<{w: Wear2}> = ({w}) => {
  const fr = useCurrentFrame();
  return <Wear2 w={w} f={fr} />;
};
export const PropR: React.FC<React.ComponentProps<typeof Prop2>> = (p) => {
  const fr = useCurrentFrame();
  return <Prop2 {...p} f={p.f ?? fr} />;
};
