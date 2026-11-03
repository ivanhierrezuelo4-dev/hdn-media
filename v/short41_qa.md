# QA audio short41 (MP4 final, whisper): PASA
- OK: palabras ajenas al guion: ninguna
- OK: parecido guion/voz: 0.989
- OK: primera voz: «el» a 0.00 s (guion: «el»)
- OK: subtitulos vs voz: peor desfase 0.12 s
- OK: final: ultima palabra «camufla» termina a 34.12 s, video 34.54 s (cola 0.42 s)
- OK: duracion: 34.5 s (30-40)

Oido: El pulpo tiene tres corazones y la sangre azul es ese sí. Dos corazones pequeños empujan la sangre solo por las branquias. El tercero, el grande, la manda al resto del cuerpo. Es azul porque lleva cobre en vez de hierro. Con el frío y poco oxígeno del mar, le funciona mejor. Y la más raro, cuando nada, el corazón grande se detiene. Por eso preguire caminar con los brazos, nada lo cansa. Tres corazones y aún así se cansa. Yo con uno estoy bien. ¿Lo sabías? Comenta sí o no. Mañana, número 14, el camaleón no se camufla.

## QA general (qa.py)
- OK: texto prohibido: ninguno
- AVISO: escena 6 whisper oye distinto: «y la más raro, cuando nada, el corazón grande se detiene.» (guion: «Y lo más raro: cuando nada, el corazón grande se detiene.»)
- AVISO: escena 7 whisper oye distinto: «Por eso prefiere caminar con los brazos, nadarlo cansa.» (guion: «Por eso prefiere caminar con los brazos: nadar lo cansa.»)
- AVISO: escena 9 whisper oye distinto: «¿Lo sabías? Comenta sí o no. Mañana, número 14. El camaleón no se camufla.» (guion: «¿Lo sabías? Comenta sí o no. Mañana, número catorce: el camaleón no se camufla.»)
- OK: captions vs voz: peor desfase medido 4 frames
- OK: video: 1080x1920 h264 30/1 yuv420p
- OK: duracion: 34.5 s (objetivo 30-35)
- OK: loudness: -14.0 LUFS, pico -4.4 dBFS, LRA 2.2
- OK: silencios >0,4 s: ninguno
- OK: cola tras la ultima palabra: 0.40 s
