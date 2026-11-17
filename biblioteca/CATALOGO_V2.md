# Biblioteca de looks v2 (17-nov-2026)

Amplía la biblioteca v1 del PC (`src/nodo/look/`: 19 accesorios, 10 escenarios) sin repetir nada.
Todo es código (SVG en React), estilo Nodo Limpio, y se mueve solo en bucle.

| Qué | Cuántos | Archivo | Catálogo |
|---|---|---|---|
| Accesorios de Nodo | 26 | `src/nodo/look2/accesorios2.tsx` | `catalogo/catalogo-accesorios-v2.png` |
| Escenarios animados | 16 | `src/nodo/look2/escenarios2.tsx` | `catalogo/catalogo-escenarios-v2.png` |
| Paletas | 16 | `src/nodo/look2/paletas2.ts` | `catalogo/catalogo-paletas-v2.png` |
| Utilería animada (mecanismos) | 20 | `src/nodo/look2/utileria2.tsx` | `catalogo/catalogo-utileria-v2.png` |
| Efectos de sonido (código) | 19 | `audio/sfx2.py` → `audio/sfx/*.wav` | — |
| Video de muestra 6 s con sonido | 1 | `catalogo/muestra_v2.mp4` | — |

## Instalar en el PC (una vez)
1. Copiar `biblioteca/src/nodo/look2/` a `src/nodo/look2/` del proyecto (no toca nada de v1).
2. Copiar `biblioteca/audio/sfx2.py` y `audio/sfx/` a `scripts/` (o donde esté `synth.py`). En `make.py`, si un nombre de `sfx` no está en synth.py, buscarlo en `sfx2.SFX2`.
3. En `Short.tsx`, aceptar `look.set` / `look.wear` / `look.bg` de v2:
   - fondo: `<EscenaR set={look.set} pal={look.bg} nodoX={...} />` (de `look2/remotion.tsx`) cuando `look.set` esté en `SET2`.
   - accesorio: dentro del `<g>` de Nodo3, junto a `<Hat/>`: `{WEAR2.includes(w) && <WearR w={w} />}`.
   - utilería: tipo de prop `"p2"` → `<PropR t={p.id} x y s k />` (`k` 0..1 se anima con `set[]` como los demás props).
4. Render de prueba de 1 escena y comparar con `catalogo/`.

Coordenadas: accesorios en el sistema local de Nodo (igual que `<Hat/>`); escenarios a 1080x1920 con horizonte y=1250 (igual que v1); la zona 0-420 queda libre para título y pastilla.

## Guía tema → look para las ideas libres (en orden del calendario de canal/11)
Regla de siempre: nunca repetir set ni paleta en dos Shorts seguidos. Ya está cuidado en este orden.

| Idea | Serie | set | wear | bg | utilería | sfx |
|---|---|---|---|---|---|---|
| frio_resfriado | cuerpo | polar | bufanda | hielo | termometro, virus | viento_frio, escalofrio |
| remolino_inodoro | mundo | bano | detective | azulejo | remolino (dir ±1), globo_coriolis | remolino |
| nadar_comer | cuerpo | piscina | flotador | cloro | estomago, reloj | glug, burbujas |
| chimborazo | mundo | cumbre | alpinista | cumbre | montana_bulto | viento_frio, campana_correcto |
| cerebro_lados | cuerpo | neuronas | electrodos | sinapsis | cerebro (side L/R) | brillo |
| rayo_dos_veces | mundo | tormenta | impermeable | tormenta | rayo, calendario | trueno, rayo_zap |
| corazon_izquierda | cuerpo | hospital | estetoscopio | quirofano | corazon | latido |
| mosca_24h | mundo | cocina | antenas_bicho | cocina | mosca, reloj, calendario | zumbido_mosca |
| azucar_hiper | cuerpo | aula | gorro_fiesta | pizarra | cubo_azucar | brillo, boing |
| piramides_esclavos | mundo | egipto | faraon | faraon | piramide_bloques | pasos_arena |
| unas_muerte | cuerpo | venas | bata | sangre | una_crece, lupa | encoger |
| gota_lluvia | mundo | nubes (v1) o tormenta | impermeable | sky (v1) | gota_real (k 0→1) | gota |
| bostezo_oxigeno | cuerpo | dormitorio | gorro_dormir | cuarto | pulmones | bostezo |
| cerebro_dolor | cuerpo | neuronas | curita | sinapsis | cerebro | squish |
| agua_pura | mundo | aula | gafas_lab | pizarra | molecula_agua | glug |
| abejorro_vuela | mundo | pradera | alas_abeja | pradera | abejorro | zumbido_abeja |

De reserva para temas futuros: fondo_marino + buzo/capitan (océano), aurora (polos, luz), colmena (abejas), vikingo/romano/laurel (historia: "Te mintieron"), banda_sudor (deporte), sombrero_paja (campo/sol), boina (arte), corbata (trabajo).

## Regenerar catálogos / sonidos
`tools/LEEME.md`.
