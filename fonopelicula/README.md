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

- **Mapa de mundos** con 6 capítulos, camino, bloqueo progresivo y estrellas.
- **Reproductor interactivo**: embebe fragmentos reales de YouTube por rangos `start`/`end`
  (con póster elegante si no hay conexión) y botón de saltar vídeo para demos.
- **Motor de actividades** con 5 tipos: test, verdadero/falso, ordenar secuencia,
  elegir emoción y memoria de parejas. 20 actividades mock etiquetadas con objetivo pedagógico.
- **Recompensas**: estrellas (1–3 por escena según aciertos a la primera), monedas, corazones,
  8 coleccionables (pegatinas, gemas, cofres, insignias) y modal de celebración.
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

- Control real del reproductor con la YouTube IFrame API (detectar fin de fragmento).
- Locuciones de Foni (TTS o grabadas) y refuerzo auditivo en cada feedback.
- Más tipos de actividad: asociación imagen-palabra con imágenes reales, huecos de vocabulario,
  grabación de voz para repetición/denominación.
- Modo colegio: sesiones por grupo, ranking amable, informes por aula.
- Multi-película: selector de películas ("mundos") con la misma estructura de datos.
- Accesibilidad: lectura de enunciados en voz alta, modo pictogramas, alto contraste.
