# QA audio short36 (MP4 final, whisper): PASA
- OK: palabras ajenas al guion: ninguna
- OK: parecido guion/voz: 0.984
- OK: primera voz: «el» a 0.00 s (guion: «el»)
- OK: subtitulos vs voz: peor desfase 0.15 s
- OK: final: ultima palabra «blanco» termina a 39.58 s, video 39.91 s (cola 0.34 s)
- OK: duracion: 39.9 s (30-40)


## QA general (qa.py)
- OK: texto prohibido: ninguno
- AVISO: escena 3 whisper oye distinto: «viene de un estudio alemán de 1901 que solo notó diferencias mínimas.» (guion: «Viene de un estudio alemán de mil novecientos uno que solo notó diferencias mínimas.»)
- AVISO: escena 4 whisper oye distinto: «En 1942, alguien dibujó mal su gráfica y los libros la copiaron.» (guion: «En mil novecientos cuarenta y dos alguien dibujó mal su gráfica, y los libros la copiaron.»)
- AVISO: escena 6 whisper oye distinto: «dulce, salado, ácido, amargo y humami.» (guion: «Dulce, salado, ácido, amargo y umami.»)
- AVISO: escena 8 whisper oye distinto: «Yuni tengo lengua y aún así me hicieron demorizar el mapa.» (guion: «Yo ni tengo lengua, y aun así me hicieron memorizar el mapa.»)
- AVISO: escena 9 whisper oye distinto: «¿Lo sabías? Comenta sí o no. Mañana número 13. Un susto no te pone el pelo blanco.» (guion: «¿Lo sabías? Comenta sí o no. Mañana, número trece: un susto no te pone el pelo blanco.»)
- OK: captions vs voz: peor desfase medido 6 frames
- OK: video: 1080x1920 h264 30/1 yuv420p
- BLOQUEA: duracion: 39.9 s (objetivo 30-35)
- OK: loudness: -14.0 LUFS, pico -4.0 dBFS, LRA 3.4
- OK: silencios >0,4 s: ninguno
- OK: cola tras la ultima palabra: 0.33 s
