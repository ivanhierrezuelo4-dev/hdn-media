// Genera los catálogos PNG (y fotogramas del video de muestra) de la biblioteca v2.
// Uso: ver tools/LEEME.md. No hace falta Remotion: las piezas son funciones puras de `f`.
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as fs from 'fs';
import * as path from 'path';
import {Escena2, SET2, SET2_PAL} from '../src/nodo/look2/escenarios2';
import {WEAR2} from '../src/nodo/look2/accesorios2';
import {PROP2, Prop2} from '../src/nodo/look2/utileria2';
import {PAL2} from '../src/nodo/look2/paletas2';
import {NodoMuestra} from '../src/nodo/look2/NodoMuestra';

const out = process.argv[2] || 'out';
fs.mkdirSync(out, {recursive: true});
const css = `*{margin:0;box-sizing:border-box}body{background:#1b1840;font-family:'DejaVu Sans',sans-serif;color:#f6efe0}
.w{padding:34px 40px;background:radial-gradient(ellipse at 50% 0%,#2f2c74 0%,#1b1840 60%);display:inline-block}
h1{font-size:44px;margin-bottom:6px}h1 span{color:#f2694a}.sub{font-size:22px;color:#bdf5e6;margin-bottom:22px}
.g{display:grid;gap:16px}.c{background:#14123a;border:2px solid #2c2960;border-radius:20px;text-align:center;padding:6px 6px 12px}
.c svg{display:block;margin:0 auto}.l{font-size:22px;font-weight:bold;margin-top:4px}.n{font-size:16px;color:#a8a6d6}`;
const page = (body: string) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="w" id="w">${body}</div></body></html>`;
const svg = (el: React.ReactElement) => renderToStaticMarkup(el);

const NOTE: Record<string, string> = {
  bufanda: 'frío, invierno', orejeras: 'frío, sonido', gorro_dormir: 'sueño, bostezo', estetoscopio: 'corazón, médico',
  gafas_lab: 'química, agua pura', gafas_natacion: 'nadar, piscina', flotador: 'nadar tras comer', gorro_fiesta: 'azúcar, fiesta',
  detective: 'mito desmentido', alpinista: 'Chimborazo, cumbres', faraon: 'pirámides, Egipto', antenas_bicho: 'insectos, mosca',
  alas_abeja: 'abejorro (animadas)', electrodos: 'cerebro (chispas)', impermeable: 'lluvia, tormenta', vikingo: 'historia (mitos)',
  romano: 'historia antigua', sombrero_paja: 'campo, sol', bata: 'ciencia, doctor', corbata: 'trabajo, serio',
  capitan: 'mar, barcos', boina: 'arte, Francia', laurel: 'Grecia, victoria', banda_sudor: 'deporte, ejercicio',
  buzo: 'océano, buceo', curita: 'dolor, golpes',
};

function accesorios(f = 0) {
  const cells = WEAR2.map((w, i) => `<div class="c">${svg(
    <svg width={250} height={250} viewBox="-200 -400 400 430"><NodoMuestra id={`a${i}`} x={0} y={0} s={0.95} wear={w} f={f} /></svg>,
  )}<div class="l">${w}</div><div class="n">${NOTE[w] ?? ''}</div></div>`).join('');
  return page(`<h1>Accesorios de Nodo <span>v2 · 26 nuevos</span></h1><div class="sub">No repiten los 19 de v1. Mismo sistema de coordenadas que &lt;Hat/&gt;: van encima del Nodo Limpio.</div><div class="g" style="grid-template-columns:repeat(7,250px)">${cells}</div>`);
}

function escenarios(f = 0) {
  const cells = SET2.map((s, i) => `<div class="c">${svg(
    <svg width={270} height={480} viewBox="0 0 1080 1920" style={{borderRadius: 14}}>
      <Escena2 set={s} f={f} />
      <NodoMuestra id={`e${i}`} x={300} y={1250} s={1.2} f={f} bob />
    </svg>,
  )}<div class="l">${s}</div><div class="n">paleta: ${SET2_PAL[s]}</div></div>`).join('');
  return page(`<h1>Escenarios <span>v2 · 16 nuevos, animados</span></h1><div class="sub">Mismo esqueleto que v1 (horizonte y=1250, suelo con ondas y glifos de código). Todo se mueve en bucle.</div><div class="g" style="grid-template-columns:repeat(8,280px)">${cells}</div>`);
}

const PROP_NOTE: Record<string, string> = {
  termometro: 'k = temperatura', virus: 'frio_resfriado', remolino: 'dir = ±1', globo_coriolis: 'remolino_inodoro',
  cerebro: "side = 'L' | 'R'", gota_real: 'k: lágrima → gota real', rayo: 'parpadea', montana_bulto: 'k: flecha al centro',
  corazon: 'late (lub-dub)', pulmones: 'respira / k', mosca: 'zumba', reloj: 'gira / k', piramide_bloques: 'k: se construye',
  abejorro: 'alas rápidas', cubo_azucar: 'destellos', una_crece: 'k: piel se retrae', molecula_agua: 'vibra',
  estomago: 'k: % digestión', lupa: 'genérico', calendario: 'label = día',
};
function utileria(f = 0, k = 0.7) {
  const cells = PROP2.map((t) => `<div class="c">${svg(
    <svg width={230} height={230} viewBox="-250 -250 500 500"><Prop2 t={t} f={f} k={k} side="L" dir={1} /></svg>,
  )}<div class="l">${t}</div><div class="n">${PROP_NOTE[t] ?? ''}</div></div>`).join('');
  return page(`<h1>Utilería animada <span>v2 · 20 piezas</span></h1><div class="sub">Pensadas para las ideas libres de ideas.json. k (0..1) mueve el mecanismo; f el frame.</div><div class="g" style="grid-template-columns:repeat(5,250px)">${cells}</div>`);
}

function paletas() {
  const cells = Object.entries(PAL2).map(([n, p]) => `<div class="c" style="padding:10px"><div style="height:150px;border-radius:12px;background:linear-gradient(${p.sky[0]},${p.sky[1]} 55%,${p.sky[2]})"></div>
  <div style="height:40px;border-radius:0 0 12px 12px;background:${p.ground};border-top:4px solid ${p.line}"></div>
  <div style="display:flex;gap:6px;justify-content:center;margin-top:8px">${[p.glow, p.accent].map((c) => `<span style="width:26px;height:26px;border-radius:50%;background:${c};border:3px solid #15142b"></span>`).join('')}</div>
  <div class="l">${n}</div></div>`).join('');
  return page(`<h1>Paletas <span>v2 · 16 nuevas</span></h1><div class="sub">cielo (3 tonos) · suelo + línea · halo y acento</div><div class="g" style="grid-template-columns:repeat(8,170px)">${cells}</div>`);
}

const mode = process.argv[3] || 'all';
if (mode === 'all') {
  fs.writeFileSync(path.join(out, 'accesorios.html'), accesorios(8));
  fs.writeFileSync(path.join(out, 'escenarios.html'), escenarios(10));
  fs.writeFileSync(path.join(out, 'utileria.html'), utileria(6));
  fs.writeFileSync(path.join(out, 'paletas.html'), paletas());
}
if (mode === 'frames') {
  // video de muestra: 8 s a 30 fps de los 16 escenarios + utilería moviéndose
  const N = Number(process.argv[4] || 240);
  for (let f = 0; f < N; f++) {
    const sc = SET2.map((s, i) => svg(
      <svg x={(i % 4) * 270} y={Math.floor(i / 4) * 480} width={270} height={480} viewBox="0 0 1080 1920">
        <Escena2 set={s} f={f} />
        <NodoMuestra id={`v${i}`} x={300} y={1250} s={1.2} f={f} bob wear={WEAR2[(i * 5) % WEAR2.length]} />
        <Prop2 t={PROP2[i]} x={760} y={760} s={1.2} f={f} k={(f % 120) / 120} />
      </svg>,
    )).join('');
    fs.writeFileSync(path.join(out, `f${String(f).padStart(4, '0')}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">${sc}</svg>`);
  }
}
