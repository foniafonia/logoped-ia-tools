# Inventario para actualizar FonoMundos

> Qué construimos en el proyecto "Película de Januká", **dónde está cada cosa**, y
> qué se puede **reutilizar en FonoMundos** (parte visual, avatares, atracciones,
> mecánicas) **sin el componente judío**. Todo vive en el repo `foniafonia/cinemundos`,
> rama `claude/cinemundos-concept-alternatives-yod81c`.

Leyenda: ♻️ = reutilizable tal cual · ✂️ = quitar/renombrar lo judío · 🔧 = patrón técnico reutilizable

---

## A. Mundos 3D con AVATAR y ATRACCIONES (lo más reutilizable para FonoMundos)

Son juegos 3D completos (Three.js) montados sobre el mismo motor que tu bosque original.
El motor, el avatar, el mundo y las atracciones **no tienen nada judío**; solo hay que
cambiar 3-4 textos/nombres.

### 1. CriatuMundos — `public/criatumundos/`
Mundo 3D de bosque tipo supervivencia (caminar, recoger ramas/piedras/bayas, construir
fuego/muro/cofre, hambre/calor, ciclo día-noche).
- ♻️ **Motor 3D + avatar que camina**: `public/criatumundos/js/game.js`
- ♻️ **Atracciones/mecánicas**: NPCs, **tienda/shop**, **skins** de avatar, construcción, recolección (todo en `js/game.js`)
- ♻️ **Assets 3D** (avatar rogue, esqueletos, texturas de bosque, edificios medievales): `public/criatumundos/assets/`
- ♻️ **Motor Three.js incluido**: `public/criatumundos/vendor/`
- ✂️ **Único judío a quitar**: la palabra "sufganiyot" en `public/criatumundos/strings.js`
  (mensajes `msg_starving`, `msg_dead`). Cámbiala por "fruta"/"comida" y queda 100% neutro.
- Textos de interfaz centralizados en `public/criatumundos/strings.js` → fácil de traducir/retematizar.

### 2. GeltMundos — `public/geltmundos/`
Mundo 3D tipo **Obby (circuito de obstáculos, estilo Roblox)** recogiendo monedas.
- ♻️ **Circuito 3D + avatar (caballero)**: `public/geltmundos/js/game.js`
- ♻️ **ARMARIO/CLOSET de personalización del avatar** (lo de "avatares"): buscar `closet`/`armario` en `public/geltmundos/js/game.js` (~26 referencias). Es el sistema de vestir/personalizar.
- ♻️ **Recogida de monedas + sonido**: `public/geltmundos/assets/audio/pickup.mp3`, avatar `knight.glb`
- ✂️ **Judío a quitar**: el nombre "Gelt"/"Obby de Januká" (título en `index.html` y strings). Renómbralo a "monedas" y listo — la mecánica es genérica.

### 3. Motor base original — `public/fonomundo-bosque/`
Es el "CineMundos — Bosque de la Película" del que salieron los dos de arriba. Sirve de
referencia del motor original. (No lo tocamos; es la base.)

---

## B. Los 6 MINIJUEGOS 2D (mejorados: modo embebible + pantalla completa)

Todos partían de juegos tuyos de fonética/FonoMundos. A cada uno le añadimos lo mismo
(🔧 patrón reutilizable) y contenido judío (✂️ a quitar):

🔧 **Lo que añadimos a TODOS (reutilizable para meter cualquier juego dentro de una app):**
- **Modo embebido** con `?embed=1`: salta los menús, arranca solo y ocupa toda la ventana.
- **Contrato de fin de juego**: al terminar hace `postMessage({type:'juego:completado', score})`
  al contenedor. Con esto CUALQUIER juego encaja dentro de FonoMundos igual que en la película.
- **Gancho de pruebas** `window.__debugCompletarJuego()`.
- **Layout a pantalla casi completa** en móvil y PC.

| Juego | Archivo | Mecánica (♻️ reutilizable) | Contenido judío (✂️ a quitar) |
|---|---|---|---|
| Nave/Carroza | `public/juego-carroza/index.html` | Shooter con jefe final, **compañeros-arma que se ganan**, mezcla de ítems en texto/imagen, mecánica "atrapa bueno / dispara malo" | Arte `carroza.png`, `shofar-*.png`, `jefe.png`; grupo `JANUKA` en `phonemeDatabase`; arrays `JANUKA_ITEMS`/`NO_JANUKA_ITEMS`; nombre "Antíoco". Vuelve a poner la nave original y tus fonemas. |
| Detective (linterna) | `public/juego-detective/index.html` | Buscar objetos con **linterna en la oscuridad**, por rondas | `PELICULA_TEMAS` y el tipo de búsqueda `pelicula` (símbolos/letras hebreas) |
| Encuentra el nuevo | `public/juego-encuentra/index.html` | Memoria/atención: detectar el elemento nuevo | `JANUKA_WORDS` (símbolos de Januká) |
| Golpea (topos) | `public/juego-topos/index.html` | "Golpea al topo" con buenos/malos | `gameElements.januka` y `gameModeConfig.januka` |
| Alef-bet (3 en raya) | `public/juego-alebet/index.html` | Match-3 de fichas con imágenes/sonido | La familia `Januká` (menorá, velas, sevivón…) |

> Para FonoMundos: en cada uno, **conserva el modo `?embed=1` y el `postMessage` de fin**,
> y sustituye solo las listas de palabras/símbolos por tus fonemas y las imágenes por las tuyas.

---

## C. El FORMATO "Película Jugable" (app React) — 🔧 reutilizable entero

Toda la arquitectura ver-un-trozo → jugar → premio → siguiente. Reutilizable cambiando
solo el contenido.

- `src/features/pelicula/PeliculaJugable.tsx` — **el corazón**. Contiene:
  - `Sendero` = el **menú tipo Duolingo** (mapa de paradas, progreso, bloqueos).
  - Selector de **dos modos**: "Ver y jugar" / "Jugar y ver".
  - `Reproductor` = vídeo por tramos (se para solo) + preguntas + juego + recompensa.
  - `ParadaJuego` = **el que embebe cada juego por iframe** con `?embed=1` y escucha el
    `postMessage` de fin. Aquí está el mapa `JUEGO_POR_ESCENA` (qué juego va en cada parada).
- `src/features/pelicula/peliculaData.ts` — ✂️ **datos de la película de Januká** (6 escenas,
  preguntas, símbolos). Esto se reemplaza por el contenido de FonoMundos.
- `src/features/pelicula/youtubeApi.ts` — ♻️ helper para cargar el reproductor de YouTube (genérico).
- Integración: `src/App.tsx` (ruta `#pelicula`), `src/features/pelicula/CasaPelicula.tsx`,
  `src/features/pelicula/PlazaJuegos.tsx`.

---

## D. Resumen: qué copiar a FonoMundos y qué quitar

**Copiar tal cual (neutro o casi):**
- `public/criatumundos/` (mundo 3D bosque + avatar + tienda + skins) — solo cambia "sufganiyot".
- `public/geltmundos/` (Obby 3D + **armario/personalización de avatar**) — solo renombra "gelt".
- El **patrón embebido `?embed=1` + `postMessage`** de los 6 minijuegos.
- El **formato Película Jugable** (`PeliculaJugable.tsx`, `youtubeApi.ts`).

**Quitar/retematizar (componente judío):**
- Arte de la carroza, shofarot y el rey Antíoco (`public/juego-carroza/*.png`).
- Todas las listas `JANUKA_*` / familias / temas de los 5 minijuegos (tabla sección B).
- `peliculaData.ts` completo (escenas y preguntas de Januká).
- Nombres/títulos con "Januká", "Gelt", "sufganiyot".

---

## E. Dónde está publicado (para ver funcionando)
- Demo pública (juego + presentación): `https://foniafonia.github.io/pelicula-januka/`
- Código: rama `claude/cinemundos-concept-alternatives-yod81c` del repo `foniafonia/cinemundos`.
