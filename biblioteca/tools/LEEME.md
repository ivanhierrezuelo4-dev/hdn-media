# Herramientas de la biblioteca v2
Catálogos (sin Remotion; solo react, react-dom, esbuild y playwright):
```
npm i react@18.3.1 react-dom@18.3.1 esbuild@0.21.5
npx esbuild tools/catalogo.tsx --bundle --platform=node --jsx=automatic --outfile=catalogo.js
node catalogo.js out all          # out/*.html -> captura con playwright (ancho 2400)
node catalogo.js fr frames 180    # 180 fotogramas SVG del video de muestra
```
Sonidos: `python audio/sfx2.py` (escribe audio/sfx/*.wav, 48 kHz mono, pico -3 dBFS).
