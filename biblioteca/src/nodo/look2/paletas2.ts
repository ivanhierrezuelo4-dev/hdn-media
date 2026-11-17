// 16 paletas NUEVAS (las de v1 son: night, cold, selva, arena, violet, sky, think, warm, oro, rosa, alarm, dead).
// sky = [arriba, medio, horizonte] · ground = suelo bajo el horizonte · glow = halo detrás de Nodo · accent = acentos del escenario
export type Pal2 = {sky: [string, string, string]; ground: string; line: string; glow: string; accent: string};

export const PAL2: Record<string, Pal2> = {
  tormenta: {sky: ['#14162a', '#2b2f4e', '#4b4f72'], ground: '#0e1020', line: '#8fa0ff', glow: '#8fa0ff', accent: '#fff6a8'},
  hielo: {sky: ['#bfe9ff', '#7fc6ee', '#d9f4ff'], ground: '#1d4a66', line: '#ffffff', glow: '#e6fbff', accent: '#ffffff'},
  cumbre: {sky: ['#1f4fa8', '#5f93d9', '#ffc58a'], ground: '#2a2340', line: '#ffe0b8', glow: '#ffd6a0', accent: '#f6f3ff'},
  abismo: {sky: ['#04263a', '#06506a', '#0d7f8c'], ground: '#03141f', line: '#5ff0e0', glow: '#5ff0e0', accent: '#a8fff2'},
  cloro: {sky: ['#2fb5e6', '#4fd3f0', '#a6f0ff'], ground: '#0f5f86', line: '#ffffff', glow: '#bff6ff', accent: '#ff4f6d'},
  azulejo: {sky: ['#cfeee8', '#a9ded3', '#e8f7f3'], ground: '#3d6f74', line: '#ffffff', glow: '#ffffff', accent: '#5fb7c4'},
  cocina: {sky: ['#ffe7c2', '#f6c58e', '#ffefd9'], ground: '#6b3b2a', line: '#fff3e0', glow: '#fff1c9', accent: '#d9583b'},
  cuarto: {sky: ['#0c1033', '#1d2366', '#3a3a8c'], ground: '#0a0b24', line: '#b8b5ff', glow: '#ffcf7a', accent: '#ffe7a8'},
  quirofano: {sky: ['#d8f6ee', '#b5eadc', '#effcf8'], ground: '#2f6b62', line: '#ffffff', glow: '#ffffff', accent: '#ff5a6e'},
  sinapsis: {sky: ['#14051f', '#3a0d4f', '#6a1a7a'], ground: '#0c0313', line: '#ff8ef0', glow: '#ff8ef0', accent: '#7cf3ff'},
  sangre: {sky: ['#3a0610', '#7a0f22', '#b52a3a'], ground: '#24040a', line: '#ff9aa6', glow: '#ff6b7c', accent: '#ffd0d6'},
  miel: {sky: ['#5a2c00', '#b8680a', '#ffb52e'], ground: '#2e1600', line: '#ffe08a', glow: '#ffd25a', accent: '#ffe7a0'},
  pradera: {sky: ['#4fb3ff', '#9fdcff', '#fff4c2'], ground: '#2c6b2a', line: '#eaffd0', glow: '#fff4c2', accent: '#ff7ab8'},
  faraon: {sky: ['#1b2a6b', '#d9772e', '#ffd27a'], ground: '#5a3510', line: '#ffe6a8', glow: '#ffc35a', accent: '#2c5bd6'},
  aurora: {sky: ['#020a1c', '#06213a', '#0b3d4f'], ground: '#06121c', line: '#7cffc4', glow: '#7cffc4', accent: '#c48aff'},
  pizarra: {sky: ['#1f3a30', '#26493c', '#2f5848'], ground: '#5a3a22', line: '#e8f0e8', glow: '#e8f0e8', accent: '#ffd25a'},
};
