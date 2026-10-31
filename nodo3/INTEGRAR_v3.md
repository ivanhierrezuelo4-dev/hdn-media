# Nodo 3.0 + sonido 3.0 → pipeline de Shorts y largos (Hecho de Nada)

Código probado en la nube (render 1080x1920, 70 s, BT.709, audio -14 LUFS / pico -1.4 dBTP).
Va ENCIMA de la animación pro (canal/13_animacion_pro/integracion, INTEGRAR.md). Se instala en
`C:\Users\ivanj\video solo claude code`. Los JSON de Shorts viejos siguen funcionando.

## Qué hace plano a Nodo y cómo se arregla (investigación)
| Problema | Arreglo (archivo) |
|---|---|
| Antena recta = un palo sin intención | Cadena de 4 huesos (`Nodo3.tsx`): forma de reposo curva y asimétrica por emoción (`face.ant`), retraso progresivo por hueso (follow-through), vibración (`antVib`). Recta SOLO en sorpresa (contraste). Foco de la punta cambia de color con la emoción (`glow`). |
| Relleno plano | Volumen por capas recortadas al cuerpo: luz de borde (color del ambiente), sombra propia, luz principal con degradado orientado a la luz, oclusión en la base, brillo especular que sigue `light`. Tinta más gruesa del lado de la sombra. |
| Cara de 2 expresiones | Cara paramétrica (`Face`): cejas (ángulo/altura por lado), párpado superior con inclinación, párpado inferior (ojos que sonríen), pupila que se dilata, boca de 4 números (ancho, curva, apertura, asimetría) con lengua y dientes, mejillas. 8 presets y `mixFace` para pasar de una a otra con resorte. |
| Siempre de frente | `turn` (-1..1): giro 3/4 que corre la cara y comprime los rasgos. |
| Sin gestos | Manos flotantes (guantes): open/wave/point/thumb/fist. Sin brazos = mismo diseño, más actuación. |
| Línea "de computadora" | Line boil: el contorno se redibuja 15 veces/s con ±1,6 px (`boil`). |
| Boca muerta al hablar | Visemas a/e/i/o/u desde tiempos por sílaba (`talk`, `vowel`). En Shorts con voz: usar los tiempos por palabra de make.py (o amplitud del wav) para `talk`. |

## Sonido 3.0 (audio/score.py, solo numpy+scipy, ~5 s de cálculo)
- Música por secciones (`section(a,b,partes,key)`) alineada a la rejilla de 120 bpm = 15 fotogramas por pulso:
  batería (bombo con click, caja+palmas, hats con swing), bajo, piano eléctrico FM, arpegio Karplus-Strong, pad.
- **Tema de Nodo** (motivo de 10 notas) que reaparece: caja de música "plana" al inicio, campanas, melodía, final.
- Cambio de tono (+2) para levantar el clímax; golpe + platillo en cada cambio de escena.
- Efectos con capas y paneo por posición: pop, whoosh, impacto, thump+squish al aterrizar, boing de antena,
  "¿?" curioso, silbato que cae (triste), zap+gruñido (enojado), twang+gasp (sorpresa), zumbido de lámpara que
  se mueve en estéreo con la luz, fwip por cada saludo.
- Voz de Nodo de pitidos con formantes (a/e/i/o/u) sincronizada con la boca desde `speech.json`.
- Mezcla: ducking -10 dB de la música bajo la voz (y el medidor en pantalla usa el mismo cálculo), -3 dB bajo
  efectos fuertes, reverb de convolución (sala para música, corta para efectos), master con techo suave y
  loudnorm de 2 pasadas a -14 LUFS / -1,5 dBTP (lo que usan YouTube/TikTok/IG).

## Instalar en el PC (orden; contacto tras cada paso; `PRO3=false` lo apaga)
1. Copiar `src/Nodo3.tsx` a `src/nodo/` y `audio/score.py` a `scripts/`. Requiere `pip install scipy`.
2. En `Short.tsx`, cambiar `<Nodo …>` por `<Nodo3 …>`; mapear la `expr` vieja a `FACES` (idea→curioso,
   alarma→sorpresa, triunfo→feliz, plano→calma) y pasar `antDyn` = lag del rig pro (`acting().antenna`).
3. Luz: `light` y `rim` por look/escenario (ej. atardecer: light=-40, rim naranja).
4. Voz TTS: NO se reemplaza. score.py hace la música y efectos con el `gate` de ducking calculado desde el
   wav de voz (RMS > umbral) en vez de speech.json. La voz entra en la mezcla después del QA de audio.
5. Efectos: lista de cues por fotograma generada por el intérprete (cada `hop` → squeak/thump/boing,
   cada `enter` → pop, cada `bgTo` → whoosh, cada sfx `impact` → impacto + temblor). Así nunca se desincroniza.
6. Render: `--jpeg-quality=95 --crf=16 --x264-preset=slow --color-space=bt709 --pixel-format=yuv420p --audio-bitrate=128k`.

## Reglas que NO cambian
QA de audio obligatorio: primera voz = primera palabra del guion, sin instrucción del TTS leída.
Horario 13:15 / 18:30 EC, 4 redes, sin domingos. Sin blur.
