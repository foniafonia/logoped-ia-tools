# Historias sociales · Vídeo interactivo ramificado

Motor web reutilizable para crear **historias sociales en vídeo interactivo**
pensadas para la intervención con personas con autismo. El usuario ve una escena,
el vídeo se detiene en un momento de decisión, aparecen varias opciones grandes y
la historia continúa por una **rama distinta** según lo que elija.

No es "un vídeo con dos botones fijos": es un **motor guiado por JSON**. Se pueden
crear muchas historias distintas sin reprogramar la aplicación: basta con añadir un
archivo JSON y sus clips.

- Sin backend, sin datos personales (primer prototipo).
- TypeScript + Vite, sin frameworks de UI.
- Responsive (ordenador, tableta, móvil) y desplegable en Vercel.

---

## Arrancar en local

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # comprobación de tipos + build de producción (dist/)
npm run preview  # servir el build
```

## Desplegar en Vercel

El repositorio incluye `vercel.json`. En Vercel:

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`

No hace falta configuración adicional.

---

## Estructura del proyecto

```
video-interactivo/
├─ index.html
├─ vercel.json
├─ src/
│  ├─ main.ts                     Punto de entrada
│  ├─ types.ts                    Tipos del esquema de historias
│  ├─ engine/
│  │  ├─ StoryEngine.ts           Máquina de estados del grafo (sin DOM)
│  │  ├─ validateStory.ts         Validación + detección de bucles infinitos
│  │  └─ loadStory.ts             Carga de catálogo y de historias
│  ├─ player/
│  │  ├─ InteractiveVideoPlayer.ts  Reproductor (crossfade, controles, fallback)
│  │  └─ AudioController.ts         Locuciones de pregunta/opción/feedback
│  ├─ ui/                         Pantallas (decisión, feedback, final, pausa…)
│  ├─ app/App.ts                  Orquestador de vistas
│  └─ styles/main.css             Estilos (paleta calmada, accesible)
└─ public/
   ├─ stories/
   │  ├─ index.json               Catálogo de historias
   │  └─ nino-enfadado.json       Historia de ejemplo
   ├─ videos/…                    Clips .mp4 (tú los aportas)
   ├─ audio/…                     Locuciones .mp3 (opcionales)
   └─ images/…                    Portadas y pictogramas (opcionales)
```

> **Modo demo sin medios:** si un clip de vídeo falta, el reproductor muestra un
> mensaje y un botón **Continuar** para que la historia siga funcionando. Así se
> puede probar todo el árbol de decisiones antes de tener los vídeos grabados.

---

## Cómo añadir una historia nueva (sin tocar código)

1. Crea los clips y colócalos en `public/videos/mi-historia/`.
2. Crea `public/stories/mi-historia.json` (ver esquema abajo).
3. Añade una entrada en `public/stories/index.json`:

```json
{
  "id": "mi-historia",
  "title": "Título visible",
  "description": "Descripción breve.",
  "thumbnail": "/images/mi-historia/portada.jpg",
  "level": 1,
  "src": "stories/mi-historia.json"
}
```

La aplicación cargará automáticamente la historia en la biblioteca.

### Concepto clave: una historia = varios clips

No metas toda la historia en un único `.mp4`. Cada historia se compone de varios
clips cortos (situación, consecuencias, reparación, final…). El motor reproduce un
clip, espera la decisión y carga el siguiente según el árbol. Para el usuario
parece una historia continua (transición suave, sin pantalla negra).

---

## Esquema de una historia (JSON)

```jsonc
{
  "id": "mi-historia",
  "title": "…",
  "description": "…",
  "thumbnail": "/images/…",
  "level": 1,                     // 1 | 2 | 3 (dificultad)
  "startNode": "situacion",       // nodo inicial (obligatorio)
  "settings": { … },              // ajustes por defecto de la historia
  "nodes": { "situacion": { … } } // grafo de nodos
}
```

### `settings` (todos opcionales)

| Campo               | Descripción                                            |
|---------------------|--------------------------------------------------------|
| `showText`          | Mostrar textos.                                        |
| `showImages`        | Mostrar imágenes/pictogramas.                          |
| `showAudioButtons`  | Mostrar botones para escuchar audios.                  |
| `autoplayAudio`     | Reproducir automáticamente pregunta/feedback.          |
| `autoplayVideo`     | Intentar reproducir el vídeo automáticamente.          |
| `showSubtitles`     | Subtítulos activados por defecto.                      |
| `allowBack`         | Permitir "volver atrás".                               |
| `allowReplay`       | Permitir repetir clips.                                |
| `showFeedback`      | Mostrar los mensajes de feedback.                      |
| `pauseBeforeChoices`| Milisegundos de pausa antes de mostrar las opciones.   |

Estos ajustes se combinan con la configuración de sesión del usuario (⚙).

### Tipos de nodo (`type`)

| Tipo          | Para qué sirve                                                        |
|---------------|----------------------------------------------------------------------|
| `video`       | Reproduce un clip. Puede tener pregunta, opciones, feedback o `next`. |
| `image`       | Muestra una imagen fija (con audio/pregunta/opciones opcionales).    |
| `feedback`    | Muestra una explicación clínica y continúa.                          |
| `choice`      | Solo una decisión (sin vídeo).                                        |
| `observation` | Pregunta abierta ("¿qué has observado?"), sin respuesta correcta.    |
| `pause`       | Pausa para que el profesional hable con la persona.                  |
| `ending`      | Final: permite repetir o probar otra ruta.                           |

### Campos de un nodo

```jsonc
{
  "type": "video",
  "video": "/videos/…/clip.mp4",
  "poster": "/images/…/frame.jpg",   // se congela mientras aparecen opciones
  "subtitles": "/videos/…/clip.es.vtt",
  "question": "¿Qué puedes hacer?",
  "questionAudio": "/audio/…/pregunta.mp3",
  "feedback": { … },                 // ver abajo
  "choices": [ … ],                  // ver abajo
  "next": "otro-nodo"                // avance automático si NO hay opciones
}
```

### Opciones (`choices`)

```jsonc
{
  "id": "ayudar",
  "label": "Le ofrezco ayuda",
  "image": "/images/choices/ayudar.png",   // opcional
  "imageAlt": "Una mano ofreciendo ayuda",  // texto alternativo
  "audio": "/audio/choices/ayudar.mp3",     // opcional (botón de escucha)
  "next": "consecuencia-ayudar",            // nodo destino (obligatorio)
  "category": "helpful"                     // helpful | unhelpful | neutral…
}
```

Se admiten **2, 3 o 4 opciones**. La cuadrícula es responsive:
móvil 1–2 columnas · tableta 2 · ordenador 2–3.

### Feedback clínico (`feedback`)

No hay "correcto/incorrecto" punitivo. El `tone` se muestra con **texto e icono**,
nunca solo con color:

| `tone`        | Significado                                             |
|---------------|--------------------------------------------------------|
| `positive`    | Refuerzo de una acción de ayuda.                       |
| `reflective`  | Invita a observar y pensar.                            |
| `neutral`     | Describe una posibilidad.                              |
| `consequence` | Muestra la consecuencia de una acción.                 |
| `repair`      | Reconoce la reparación de la situación.                |
| `observation` | Recoge lo observado por el usuario.                    |

```jsonc
"feedback": {
  "title": "Observa lo que ha pasado",
  "text": "El plátano no le ha ayudado. Ahora está más enfadado.",
  "audio": "/audio/…/feedback.mp3",
  "tone": "reflective"
}
```

### Nodo final (`ending`)

```jsonc
{
  "type": "ending",
  "video": "/videos/…/final.mp4",
  "title": "Historia terminada",
  "message": "A veces podemos ayudar preguntando, esperando y observando…",
  "allowReplay": true,
  "allowChooseAnotherPath": true
}
```

---

## Niveles de dificultad

Cada historia declara `level` (1, 2 o 3):

- **Nivel 1:** dos opciones, contraste muy claro, pictogramas grandes, feedback directo.
- **Nivel 2:** dos o tres opciones plausibles; hay que observar más la escena.
- **Nivel 3:** opciones dependientes del contexto, varias rutas válidas, preguntas
  abiertas para el profesional y posibilidad de comparar rutas.

El nivel se muestra como etiqueta en la biblioteca y guía cómo redactas los nodos.

---

## Accesibilidad

- Navegación por teclado y **foco visible** en todos los controles.
- Botones semánticos, `aria-label` y `aria-live` para pregunta y feedback.
- Subtítulos (WebVTT) y texto alternativo en imágenes.
- Configuración de sesión (⚙): mostrar/ocultar texto, imágenes, audios,
  subtítulos, feedback; activar/desactivar sonido y autoplay; **reducir movimiento**;
  **tamaño de fuente** ajustable; interfaz mínima.
- Sin cuenta atrás, sin penalizaciones, sin mensajes punitivos.
- No se depende solo del color para transmitir información.

Las preferencias de accesibilidad se guardan en el navegador (localStorage). No se
recogen datos personales.

---

## Robustez del motor

- **Validación** del JSON al cargar: referencias rotas, tipos desconocidos, tonos
  inválidos, opciones sin destino…
- **Detección de bucles infinitos** de avance automático (ciclos de `next` sin
  interacción) en la validación, con una red de seguridad adicional en tiempo de
  ejecución.
- **Historial** para "volver atrás" y **reinicio** de la historia.
- Errores de archivos ausentes controlados sin bloquear la sesión.
