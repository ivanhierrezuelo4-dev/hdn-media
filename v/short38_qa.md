# QA audio short38 (MP4 final, whisper): PASA
- OK: palabras ajenas al guion: «2020»
- OK: parecido guion/voz: 0.972
- OK: primera voz: «un» a 0.00 s (guion: «un»)
- OK: subtitulos vs voz: peor desfase 0.09 s
- OK: final: ultima palabra «llorando» termina a 29.86 s, video 30.25 s (cola 0.39 s)
- OK: duracion: 30.3 s (30-40)

Oido: Un susto no te pone el pelo blanco de la noche a la mañana. El pelo que ya salió no puede cambiar de color. Cada pelo es tejido muerto. Su color se fabrica abajo en la raíz. Y queda fijo cuando sale. Pero el estrés y hace algo. En 2020 en Harvard vieron en ratones que el estrés agota las células que dan color. El pelo que nace después sale blanco. O sea, así te pueden salir ganas por estrés, pero tardan semanas, no en la noche. Yo me asusto diario y sigo igual de verde. Bueno, no tengo pelo. ¿Lo sabías? Comenta sí o no. Mañana, número 14. Ahora mismo estás llorando.

## QA general (qa.py)
- OK: texto prohibido: ninguno
- AVISO: escena 5 whisper oye distinto: «pero el estrés se hace algo.» (guion: «Pero el estrés sí hace algo:»)
- AVISO: escena 6 whisper oye distinto: «En 2020 en Harvard vieron en ratones que el estrés agota las células que dan color.» (guion: «en dos mil veinte, en Harvard, vieron en ratones que el estrés agota las células que dan color.»)
- AVISO: escena 8 whisper oye distinto: «O sea, así te pueden salir ganas por estrés, pero tardan semanas, no una noche.» (guion: «O sea: sí te pueden salir canas por estrés, pero tardan semanas, no una noche.»)
- AVISO: escena 10 whisper oye distinto: «¿Lo sabías? Comentas sí o no. Mañana, número 14. Ahora mismo estás llorando.» (guion: «¿Lo sabías? Comenta sí o no. Mañana, número catorce: ahora mismo estás llorando.»)
- OK: captions vs voz: peor desfase medido 3 frames
- OK: video: 1080x1920 h264 30/1 yuv420p
- OK: duracion: 30.3 s (objetivo 30-35)
- OK: loudness: -13.9 LUFS, pico -4.5 dBFS, LRA 1.3
- OK: silencios >0,4 s: ninguno
- OK: cola tras la ultima palabra: 0.37 s
