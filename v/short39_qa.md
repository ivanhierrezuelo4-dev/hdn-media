# QA audio short39 (MP4 final, whisper): PASA
- OK: palabras ajenas al guion: ninguna
- OK: parecido guion/voz: 0.949
- OK: primera voz: «napoleon» a 0.00 s (guion: «napoleon»)
- OK: subtitulos vs voz: peor desfase 0.09 s
- OK: final: ultima palabra «corazones» termina a 36.58 s, video 36.97 s (cola 0.39 s)
- OK: duracion: 37.0 s (30-40)

Oido: Napoleón no era bajito, medía lo normal para su época, un metro 69 más o menos, el error salió de una regla, en su autopsia enotaron cinco pies y dos pulgadas, pero empulgadas francesas, que eran más largas que las inglesas, los ingleses lo leyeron con las suyas y lo encogieron a un metro 57 y sus enemigos lo empujaban diminuto a propósito, a eso sumale que siempre andaba rodeado de guardias altísimos, lo achicaron con una regla que nadie me mide a mí, ¿lo sabías? Comenta así o no. Mañana número 13, el pulpo tiene tres corazones.

## QA general (qa.py)
- OK: texto prohibido: ninguno
- AVISO: escena 2 whisper oye distinto: «Medíalo normal para su época, un metro 69 más o menos.» (guion: «Medía lo normal para su época, un metro sesenta y nueve más o menos.»)
- AVISO: escena 4 whisper oye distinto: «En su autopsia enotaron cinco pies y dos pulgadas, pero en pulgadas francesas, que eran más largas que las inglesas.» (guion: «En su autopsia anotaron cinco pies y dos pulgadas, pero en pulgadas francesas, que eran más largas que las inglesas.»)
- AVISO: escena 8 whisper oye distinto: «lo achicaron como una regla que nadie me mida a mí.» (guion: «Lo achicaron con una regla. Que nadie me mida a mí.»)
- AVISO: escena 9 whisper oye distinto: «¿Lo sabías? Comenta sí o no. Mañana número 13. El pulpo tiene tres corazones.» (guion: «¿Lo sabías? Comenta sí o no. Mañana, número trece: el pulpo tiene tres corazones.»)
- OK: captions vs voz: peor desfase medido 3 frames
- OK: video: 1080x1920 h264 30/1 yuv420p
- OK: duracion: 37.0 s (objetivo 30-35)
- OK: loudness: -13.9 LUFS, pico -4.4 dBFS, LRA 3.0
- OK: silencios >0,4 s: ninguno
- OK: cola tras la ultima palabra: 0.40 s
