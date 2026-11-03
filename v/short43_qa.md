# QA audio short43 (MP4 final, whisper): PASA
- OK: palabras ajenas al guion: ninguna
- OK: parecido guion/voz: 0.992
- OK: primera voz: «el» a 0.00 s (guion: «el»)
- OK: subtitulos vs voz: peor desfase 0.06 s
- OK: final: ultima palabra «reves» termina a 37.04 s, video 37.44 s (cola 0.40 s)
- OK: duracion: 37.4 s (30-40)

Oido: El camaleón no cambia de color para esconderse, cambia por cómo se siente. Su color de siempre ya lo camuflajea. Los cambios fuertes los hace para pelear, para conquistar pareja o para calentarse al sol. No lo hace con pintura. Bajo su piel hay cristales de minutos. Cuando se relaja quedan juntos y se ve verde. Cuando se emociona se separan y brilla amarillo o rojo. Un macho enojado se pone más llamativo, no menos. Se pone rojo cuando se enoja. Igualito a mi jefe. ¿Lo sabías? Comenta así o no. Mañana número 15. El agua del inodoro no gira al revés.

## QA general (qa.py)
- OK: texto prohibido: ninguno
- AVISO: escena 3 whisper oye distinto: «Su color de siempre ya lo camuflajea.» (guion: «Su color de siempre ya lo camufla.»)
- AVISO: escena 11 whisper oye distinto: «¿Lo sabías? Comenta así o no. Mañana número 15. El agua del inodoro no gira al revés.» (guion: «¿Lo sabías? Comenta sí o no. Mañana, número quince: el agua del inodoro no gira al revés.»)
- OK: captions vs voz: peor desfase medido 2 frames
- OK: video: 1080x1920 h264 30/1 yuv420p
- BLOQUEA: duracion: 37.4 s (objetivo 30-35)
- OK: loudness: -14.0 LUFS, pico -4.2 dBFS, LRA 2.8
- OK: silencios >0,4 s: ninguno
- OK: cola tras la ultima palabra: 0.40 s
