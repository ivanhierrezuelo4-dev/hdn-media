# hdn-media
Videos de Hecho de Nada servidos a Buffer (rama media, carpeta v/).

## Mod "candado-audio" (Claude Code)
Bloquea cualquier subida o programación (YouTube con `upload.py`, Buffer con `buffer_post.py run` o el conector de Buffer) si el video no tiene `VIDEO.mp4.qa.json` con veredicto PASA del archivo exacto (`candado.py check`).

Instalar (una vez, dentro de Claude Code):
```
/plugin marketplace add ivanhierrezuelo4-dev/hdn-media
/plugin install candado-audio@hdn-media
```
