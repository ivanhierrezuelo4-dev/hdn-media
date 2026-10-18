# hdn-candado

Candado de audio + QA por código para los Shorts de Hecho de Nada. Es puro código: usarlo cuesta 0 tokens.

## Qué bloquea (solo fallos técnicos)

| Chequeo | Bloquea si |
|---|---|
| Instrucción del TTS | se oye texto antes de la 1.ª palabra del guion, o frases tipo «di en español…» |
| Palabras de más | 4+ palabras seguidas fuera del guion, o 2+ tras el final |
| Guion vs voz | se oye menos del 80 % del guion |
| Volumen | fuera de -16..-12 LUFS, o pico sobre 0 dBTP |
| Silencios | 1.ª voz después de 1 s, hueco de más de 2 s entre palabras, o corte total de audio |
| Subtítulos | algún subtítulo desfasado más de 0,3 s (9 frames) de su voz |
| Formato | no vertical 9:16, menos de 5 s o más de 180 s, sin audio |
| Audio IG | AAC de más de 128 kbps (por defecto se arregla solo, sin tocar el video) |

Lo demás (fps, duración fuera de 20-60 s, pausas de 1-2 s, palabras que el ASR oye distinto, cola larga) es AVISO y nunca frena. Los umbrales están arriba de `qa/candado.py`.

## Uso

```
pip install sherpa-onnx numpy        # una vez (y ffmpeg instalado)
python qa/candado.py setup           # una vez: baja el ASR Parakeet desde GitHub
python qa/candado.py check out/short11.mp4 --guion guion.txt --subs subs.srt
```

`check` deja `short11.mp4.qa.json` al lado del video. `upload.py` y `buffer_post.py` (en `canal/yt`, con una copia de `candado.py` al lado) se niegan a subir un video sin QA PASA hecho sobre ese archivo exacto: si el video cambia después del QA, hay que repetirlo.

El mod además frena cualquier comando de Claude que llame a `upload.py` o `buffer_post.py run` sin QA aprobado (el `--dry-run` pasa).

## Instalar el mod

At the prompt of a terminal session:

```
/plugin install hdn-candado --marketplace ivanhierrezuelo4-dev/hdn-media
```

From a shell:

```
claude plugin install hdn-candado --marketplace ivanhierrezuelo4-dev/hdn-media
```
