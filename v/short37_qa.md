# QA audio short37 (MP4 final, whisper): PASA
- OK: palabras ajenas al guion: «1700»
- OK: parecido guion/voz: 0.965
- OK: primera voz: «en» a 0.00 s (guion: «en»)
- OK: subtitulos vs voz: peor desfase 0.11 s
- OK: final: ultima palabra «bajito» termina a 32.40 s, video 32.88 s (cola 0.48 s)
- OK: duracion: 32.9 s (30-40)

Oido: En tiempos de Colón, nadie culto creía que la tierra era plana. Su tamaño ya se había medido en 1 .700 años antes. Era Tóstenes en Egipto, comparó la sombra del sol en dos ciudades al mismo medio día. Así calculó el tamaño de la tierra y casi acierta. Entonces, me dijeron que no a Colón. ¿Por qué creía la tierra mucho más chica? Los expertos tenían razón, con esa distancia no llegaba a Asia. Los salvó un continente entero que nadie esperaba en media. Hizo mal la cuenta y le salió bien. ¿Lo quieres a suerte? ¿Lo sabías? Comenta sí o no. Mañana, número 12. Napoleón no era bajito.

## QA general (qa.py)
- OK: texto prohibido: ninguno
- AVISO: escena 2 whisper oye distinto: «Su tamaño ya se había medido 1 .700 años antes.» (guion: «Su tamaño ya se había medido mil setecientos años antes.»)
- CORRIGE: escena 3 caption «ERATÓSTENES, EN EGIPTO»: +9 frames respecto a la voz
- AVISO: escena 3 whisper oye distinto: «Heratóstenes en Egipto comparó la sombra del sol en dos ciudades al mismo mediodía.» (guion: «Eratóstenes, en Egipto, comparó la sombra del sol en dos ciudades al mismo mediodía.»)
- AVISO: escena 4 whisper oye distinto: «Así calcuro el tamaño de la tierra y casi acierta.» (guion: «Así calculó el tamaño de la Tierra, y casi acierta.»)
- CORRIGE: escena 5 caption «ENTONCES,»: -8 frames respecto a la voz
- AVISO: escena 6 whisper oye distinto: «porque él creía en la tierra mucho más chica.» (guion: «Porque él creía la Tierra mucho más chica.»)
- AVISO: escena 7 whisper oye distinto: «Los expertos tenían razón, con esa distancia no llegaba hacia.» (guion: «Los expertos tenían razón: con esa distancia no llegaba a Asia.»)
- AVISO: escena 8 whisper oye distinto: «los album continente entero que nadie esperaba en medio.» (guion: «Lo salvó un continente entero que nadie esperaba en medio.»)
- CORRIGE: escena 10 caption «MAÑANA, #12:»: -13 frames respecto a la voz
- OK: captions vs voz: peor desfase medido 13 frames
- OK: video: 1080x1920 h264 30/1 yuv420p
- OK: duracion: 32.9 s (objetivo 30-35)
- OK: loudness: -14.0 LUFS, pico -4.1 dBFS, LRA 2.9
- OK: silencios >0,4 s: ninguno
- OK: cola tras la ultima palabra: 0.47 s
