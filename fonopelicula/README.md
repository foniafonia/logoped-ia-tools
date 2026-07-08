# 🎬 FonoPelícula — La Aventura Desbloqueada (beta demo)

Beta jugable para presentar a cliente: convierte una película/vídeo educativo infantil en una
aventura gamificada tipo Duolingo. El niño ve fragmentos de la película y desbloquea los
siguientes superando retos de comprensión audiovisual.

Parte del ecosistema **Logoped-IA / FonoMundos**.

## Arranque

```bash
cd fonopelicula
npm install
npm run dev
```

Sin backend, sin login, sin pagos. El progreso se guarda en `localStorage`
(clave `fonopelicula-demo-v1`). El botón **Demo cliente** (abajo a la derecha) tiene el tour
rápido para reuniones: mapa → escena → pregunta → recompensa → panel profesional, más
"desbloquear todo" y "reiniciar demo".

## Qué incluye

- **Selector de edad** (3–5, 6–8, 9–12, «a mi ritmo»): corta los fragmentos de película
  (60/90/120 s o completo con botón "Ver más película") y adapta la dificultad
  (nº de opciones, pasos de secuencia, parejas de memoria, ritmo del minijuego).
  Config en [`src/data/ages.ts`](src/data/ages.ts).
- **Mapa de mundos ilustrado**: paisaje con camino serpenteante, nubes animadas,
  avatar "¡estás aquí!", 6 capítulos con miniaturas SVG propias, bloqueo progresivo y estrellas.
- **Ilustraciones SVG por escena** ([`SceneArt.tsx`](src/components/SceneArt.tsx)):
  pósters estilo crayon únicos por capítulo (bola de cristal, lupa, arcoíris, tormenta,
  bombilla, estreno de cine).
- **Reproductor interactivo**: embebe fragmentos reales de YouTube por rangos `start`/`end`
  cortados según edad, póster ilustrado, y botón de saltar vídeo para demos.
- **Motor de actividades** con 5 tipos: test, verdadero/falso, ordenar secuencia,
  elegir emoción y memoria de parejas. 20 actividades mock con objetivo pedagógico,
  contador de racha 🔥 y sonidos.
- **Retos mágicos con juegos reales**: tras los retos de cada escena, el niño elige entre
  tres minijuegos (rota la recomendación por capítulo). Son **ports fieles de juegos ya
  existentes del ecosistema Logoped-IA**, no mecánicas inventadas — misma lógica, misma
  física, mismo contenido que el original, adaptados a React/TS:
  - 🎨 **Pintura en el aire** ([`AirPaintGame.tsx`](src/components/AirPaintGame.tsx)):
    port de `pintura-aire-colores` — agarra la bola de pintura cerrando el puño
    (MediaPipe Hands), lánzala con impulso al objeto del color pedido. Misma
    clasificación de gesto, física de lanzamiento y SVG de objetos que el original.
  - 😊 **Praxias mágicas** ([`PraxiasGame.tsx`](src/components/PraxiasGame.tsx) +
    [`src/lib/mirrorfono.ts`](src/lib/mirrorfono.ts)): port de MirrorFono — sonrisa, beso,
    boca, mejillas y soplo frente a la cámara (Face Landmarker), mismas fórmulas de
    landmarks faciales y modo simulación de respaldo.
  - 🔎 **Caza del sonido** ([`BuscaSonidoGame.tsx`](src/components/BuscaSonidoGame.tsx)):
    port de "Busca Sonido" de FonoMundos — conciencia fonológica /m/s/p/r/, mismo
    vocabulario y lógica de rondas.
  Todos 100 % locales (sin CDN, sin backend), con pausa en pestaña oculta y cleanup
  completo de cámara/micro al salir.
- **Foni habla (TTS)**: los enunciados se leen en voz alta — automático en modo Peques,
  botón de altavoz en el resto (`src/lib/speech.ts`, síntesis de voz del navegador).
- **Juice**: sonidos WebAudio sintetizados (sin assets), confeti de canvas limitado en
  FPS/tiempo, animaciones suaves con `prefers-reduced-motion` respetado, toggle de mute.
- **Recompensas**: estrellas (1–3 según aciertos a la primera), monedas (+5 por captura
  del minijuego), corazones, 8 coleccionables y modal de celebración con confeti.
- **Avatar** con 3 personajes, nivel y corazones.
- **Panel de progreso**: % de película desbloqueada, precisión, misión actual, colección.
- **Panel profesional** (mock): alumnos, precisión media, tabla de resultados
  (incluye tu sesión real), objetivos pedagógicos e informe (placeholder).

## Cómo cambiar el contenido (película real)

Todo el contenido vive en [`src/data/demoFilm.ts`](src/data/demoFilm.ts):

1. **Vídeo**: cambia `youtubeId` por el id de la película real.
2. **Escenas**: ajusta `videoStart` / `videoEnd` (segundos) de cada capítulo, títulos,
   emoji, color y narrativa de Foni.
3. **Actividades**: cada escena tiene un array `activities`. Tipos disponibles:
   `quiz` | `trueFalse` | `emotion` (opciones + `correctOptionId`),
   `sequence` (`sequenceItems` en orden correcto; se barajan solos) y
   `memory` (`memoryPairs` palabra+emoji).
4. **Recompensas y avatares**: arrays `rewards` y `avatars` en el mismo archivo.

No hace falta tocar ningún componente: el motor (`ActivityEngine`) renderiza según `type`.

## Estructura

```
src/
  components/   MapView, SceneCard, InteractivePlayer, ActivityEngine,
                RewardModal, ProgressPanel, AvatarPanel,
                ProfessionalDashboard, DemoControls
  data/         demoFilm.ts  ← único punto de contenido
  store/        gameStore.ts (Zustand + persistencia localStorage)
  types/        index.ts
```

## Camino a MVP (con Supabase)

1. **Auth**: Supabase Auth con perfiles niño/profesional (magic link para familias).
2. **Datos**: tablas `films`, `scenes`, `activities`, `students`, `attempts`, `rewards`
   — el shape ya coincide con `src/types/index.ts`; migrar `demoFilm.ts` a filas.
3. **Progreso**: sustituir la persistencia de `gameStore` por sync con Supabase
   (mantener localStorage como caché offline).
4. **Panel profesional real**: consultas por alumno/objetivo + export PDF (jsPDF, como en
   la evaluación de adultos ya hecha).
5. **CMS ligero**: formulario interno para que el logopeda cree escenas/preguntas sin código.

## Mejoras futuras

- Más ports de juegos reales del ecosistema (candidatos: Constructor de Sílabas Aire,
  Puzzle Agarre Aire, Karaoke Tartamudez) como cuarto/quinto reto mágico.
- Locuciones grabadas de Foni (en vez de solo TTS del navegador) para mayor calidez.
- Más tipos de actividad: asociación imagen-palabra con imágenes reales, huecos de vocabulario.
- Modo colegio: sesiones por grupo, ranking amable, informes por aula.
- Multi-película: selector de películas ("mundos") con la misma estructura de datos.
- Accesibilidad: modo pictogramas, alto contraste.
