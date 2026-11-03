# QA audio short38 (MP4 final, whisper): PASA
- OK: palabras ajenas al guion: «2020»
- OK: parecido guion/voz: 0.971
- OK: primera voz: «un» a 0.00 s (guion: «un»)
- OK: subtitulos vs voz: peor desfase 0.12 s
- OK: final: ultima palabra «llorando» termina a 29.86 s, video 30.25 s (cola 0.39 s)
- OK: duracion: 30.3 s (30-40)


## QA general (qa.py)
- OK: texto prohibido: ninguno
- CORRIGE: escena 4 caption «Y QUEDA FIJO»: +14 frames respecto a la voz
- AVISO: escena 5 whisper oye distinto: «pero el estrés se hace algo.» (guion: «Pero el estrés sí hace algo:»)
- AVISO: escena 6 whisper oye distinto: «En 2020 en Harvard vieron en ratones que el estrés agota las células que dan color.» (guion: «en dos mil veinte, en Harvard, vieron en ratones que el estrés agota las células que dan color.»)
- CORRIGE: escena 8 caption «O SEA:»: +10 frames respecto a la voz
- AVISO: escena 8 whisper oye distinto: «O sea, así te pueden salir ganas por estrés, pero tardan semanas, no una noche.» (guion: «O sea: sí te pueden salir canas por estrés, pero tardan semanas, no una noche.»)
- CORRIGE: escena 9 caption «YO ME ASUSTO DIARIO»: +8 frames respecto a la voz
- CORRIGE: escena 10 caption «AHORA MISMO ESTÁS *LLORANDO»: -15 frames respecto a la voz
- AVISO: escena 10 whisper oye distinto: «¿Lo sabías? Comentas sí o no. Mañana, número 14. Ahora mismo estás llorando.» (guion: «¿Lo sabías? Comenta sí o no. Mañana, número catorce: ahora mismo estás llorando.»)
- OK: captions vs voz: peor desfase medido 15 frames
- OK: video: 1080x1920 h264 30/1 yuv420p
- OK: duracion: 30.3 s (objetivo 30-35)
- OK: loudness: -13.9 LUFS, pico -3.9 dBFS, LRA 1.2
- OK: silencios >0,4 s: ninguno
- OK: cola tras la ultima palabra: 0.37 s
