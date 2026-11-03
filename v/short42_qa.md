# QA audio short42 (MP4 final, whisper): PASA
- OK: palabras ajenas al guion: ninguna
- OK: parecido guion/voz: 0.992
- OK: primera voz: «fellizcate» a 0.00 s (guion: «pellizcate»)
- OK: subtitulos vs voz: peor desfase 0.13 s
- OK: final: ultima palabra «enferma» termina a 31.24 s, video 31.68 s (cola 0.44 s)
- OK: duracion: 31.7 s (30-40)

Oido: ¡Fellizcate el codo! ¡No duele! ¿Te digo por qué? La piel del codo es floja y elástica para que puedas doblar el brazo. Tiene menos terminaciones nerviosas que la de tus dedos. Por eso puedes estirarla y casi no la sientes. ¡Pero cuidado! Si te golpeas un poquito más abajo, sientes un corrientazo. Eso no es el hueso, es un nervio que pasa ahí sin protección. Le dicen hueso de la risa y no da risa. No te lo engaño. ¿Lo sabías? Comenta sí o no. Mañana número 16. ¡El frío no te enferma!

## QA general (qa.py)
- OK: texto prohibido: ninguno
- AVISO: escena 1 whisper oye distinto: «¡Pelliscate el codo! ¡No duele! ¿Te digo por qué?» (guion: «Pellízcate el codo. No duele. Te digo por qué.»)
- AVISO: escena 3 whisper oye distinto: «Tienen menos terminaciones nerviosas que la de tus dedos.» (guion: «Tiene menos terminaciones nerviosas que la de tus dedos.»)
- AVISO: escena 8 whisper oye distinto: «¿Lo sabías? Comenta sí o no. Mañana, número 16, el frío no te enferma.» (guion: «¿Lo sabías? Comenta sí o no. Mañana, número dieciséis: el frío no te enferma.»)
- OK: captions vs voz: peor desfase medido 4 frames
- OK: video: 1080x1920 h264 30/1 yuv420p
- OK: duracion: 31.7 s (objetivo 30-35)
- OK: loudness: -14.0 LUFS, pico -4.4 dBFS, LRA 1.8
- OK: silencios >0,4 s: ninguno
- OK: cola tras la ultima palabra: 0.40 s
