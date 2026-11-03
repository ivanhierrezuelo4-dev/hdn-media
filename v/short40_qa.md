# QA audio short40 (MP4 final, whisper): PASA
- OK: palabras ajenas al guion: ninguna
- OK: parecido guion/voz: 0.988
- OK: primera voz: «ahora» a 0.00 s (guion: «ahora»)
- OK: subtitulos vs voz: peor desfase 0.05 s
- OK: final: ultima palabra «codo» termina a 31.00 s, video 31.40 s (cola 0.40 s)
- OK: duracion: 31.4 s (30-40)

Oido: Ahora mismo tus ojos están llorando y no lo notas, una glándula arriba de cada ojo fabrica lágrimas todo el día. Cada vez que parpadeas la repartes con un limpio para brisas, después se van por dos agujeritos en la esquina del ojo y bajan directo a tu nariz. Por eso cuando lloras fuerte te moquea la nariz, es la misma lágrima saliendo por el otro lado. O sea que todos lloran todo el día. Ya me siento menos solo. ¿Lo sabías? Comenta así o no. Mañana número 15. ¡Pelliscate el codo!

## QA general (qa.py)
- OK: texto prohibido: ninguno
- AVISO: escena 3 whisper oye distinto: «Cada vez que parpadeas, las repartes como un limpio para brisas.» (guion: «Cada vez que parpadeas, las repartes como un limpiaparabrisas.»)
- AVISO: escena 8 whisper oye distinto: «¿Lo sabías? Comenta así o no. Mañana número 15. ¡Pelliscate el codo!» (guion: «¿Lo sabías? Comenta sí o no. Mañana, número quince: pellízcate el codo.»)
- OK: captions vs voz: peor desfase medido 2 frames
- OK: video: 1080x1920 h264 30/1 yuv420p
- OK: duracion: 31.4 s (objetivo 30-35)
- OK: loudness: -13.9 LUFS, pico -4.3 dBFS, LRA 4.3
- OK: silencios >0,4 s: ninguno
- OK: cola tras la ultima palabra: 0.40 s
