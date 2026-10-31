# Animación pro → pipeline de Shorts (Hecho de Nada)

Módulo listo y probado en la nube (tipos OK + render de prueba 1080x1920, BT.709). Se instala en el
proyecto del PC `C:\Users\ivanj\video solo claude code`. Ningún JSON de Short cambia: todo se hereda.

## 1. Copiar (una vez)
- `src/nodo/pro/` → `src/nodo/pro/` del PC (motion.ts, rig.ts, fx.tsx, Karaoke.tsx, index.ts).
- `scripts/fx_grain.py` → `scripts/`; correr `python scripts/fx_grain.py` (crea `public/fx/grain0..3.png`).
- `npm i @remotion/noise @remotion/layout-utils` con la MISMA versión exacta de `remotion` del package.json.

## 2. Enchufar en el código existente (orden; render de contacto tras cada paso)
1. **Nodo.tsx**: el intérprete ya calcula x/y por fotograma. Envolver eso en `posX(f)`/`posY(f)` y llamar
   `acting({frame, fps, posX, posY, groundY, seed: índice de escena, still})`. Aplicar `sy/sx` con pivote en
   los pies, `lean`, `antenna` (rotación de la antena), `blink`, `swayX`, `breathe`, `lookX` (sumar a `look`),
   y la sombra con `ContactShadow k={shadowK}`. Si el JSON trae `still`, pasar `still: true`.
2. **Short.tsx, keyframes**: sustituir el resorte único por `sp(frame, fps, at, k)` con `k = key.ease ??
   roleFor('nodo'|'prop'|'caption'|'cam'|'bg')`. Para x/y de Nodo sumar `anticipateKeys(frame, keys)`.
3. **Short.tsx, capas**: cielo en `<CamLayer depth={0.15}>`, escenario/look en `depth={0.5}`, Nodo+props en
   `depth={1}`; título y subtítulos FUERA de las capas. `shakeAt(frame, hits)` con hits = fotogramas de sfx
   `impact`/`crack`. `<Grain/>` y `<Vignette/>` encima de todo menos título y subtítulos.
4. **bgTo**: color con `blendColor(frame, at, a, b)` (10 fotogramas) en vez de corte. Nuevo `enter: "iris"`
   con `<Iris x={nodoX} y={nodoY}>`. En `whip`, aplicar `smear(dx, dy)` 1-2 fotogramas.
5. **Subtítulos**: `<KaraokeCaps words=…>` con los tiempos por palabra de make.py (convertidos a fotogramas
   de la escena). Marcar `key: true` en la palabra/cifra clave de cada caption (la primera con dígito, o la
   que lleve `*` en `caps`). Máx. 4 palabras en pantalla. Zona 1500-1920 libre.
6. **make.py `final`**: flags de render
   `--jpeg-quality=95 --crf=16 --x264-preset=slow --color-space=bt709 --pixel-format=yuv420p --audio-bitrate=128k`
   (128k = lo que pide Instagram; antes salía a 317k y fallaba). Se queda en 30 fps.

## 3. Reglas que NO cambian
- QA de audio obligatorio antes de subir: sin instrucción del TTS leída, primera voz = primera palabra del guion.
- Horario 13:15 / 18:30 EC, 4 redes, sin domingos. Sin blur ni doble dibujado (el grano es PNG, no filtro).

## 4. Verificación al instalar
`make.py <id> build contact` del próximo Short + 1 fotograma suelto con Nodo saltando. Debe verse: parpadeo,
antena que llega tarde, aplastar al aterrizar, sombra que se achica en el aire, karaoke, grano leve.
Si algo rompe el render: constante `PRO = false` en Short.tsx desactiva todo el módulo.

## Pendiente (cambios grandes del informe, después)
Boca sincronizada (§10), rig v2 con poses (§11), line boil (§12), luz de escena (§13), lint de ritmo 2,5 s (§14).
