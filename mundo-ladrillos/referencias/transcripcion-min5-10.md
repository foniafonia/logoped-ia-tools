# Minuto 5–10 — mapa temporal para el Director de beats

**Para el Creador 5–10.** Esto acompaña al audio real del tramo, que va embebido
en `src/audio/clips.ts` con la clave **`narracion_min5-10`** (voces + música
juntas, 5:00 exactos) — úsalo como **columna vertebral** (spine), igual que el
min 0–5 usa `narracion_min0-5`.

## ⚠️ Aviso importante sobre el texto
La transcripción **literal automática no fue posible** en este entorno: el proxy
bloquea la descarga de modelos de voz (Hugging Face y Azure → sin STT). Así que:

- **Los TIEMPOS son reales**: sacados por detección de audio (silencios) y por los
  fotogramas del propio tramo. Fíables para cuadrar cada beat.
- **El TEXTO no es literal**: es la **descripción de lo que ocurre** en cada momento
  (por fotograma + narrativa de Josué 2), NO las frases exactas del narrador.
  **Verifícalo de oído** con `narracion_min5-10` y sustituye por las frases reales.

Formato: `[m:ss] descripción de la escena` (un frame de referencia cada ~9 s).

## Fronteras de frase detectadas (pausas de narración, seg. reales)
~53 · ~82 · ~101 · ~111–115 · ~196 · y racha de diálogo corto 253→296.
Bloques de habla continua: 0–53 · 54–82 · 83–101 · 115–196 · 197–252 · 253–296.
(Úsalas para alinear los cortes de beat con precisión.)

## Mapa (tiempos reales del tramo 5–10)
```
[0:00] Los espías cruzan el río Jordán de noche por un puente de cuerdas.
[0:09] Llegan a las murallas de Jericó; guardias con escudo en la puerta iluminada.
[0:18] Primer plano de los DOS espías (uno de negro/ninja, uno de gris) entre juncos.
[0:27] La puerta de la ciudad, escaleras, un guardia vigilando.
[0:36] Los dos espías planean cómo entrar.
[0:45] Guardias patrullando entre la vegetación.
[0:54] Dos guardias con faroles hacen la ronda junto a la muralla.
[1:03] Huellas en la arena: un rastro, casi los descubren.
[1:12] Un guardia con farol inspecciona.
[1:21] La puerta con guardias.
[1:30] Un guardia junto a la muralla.
[1:39] Primer plano de un guardia adormilado (gag cómico) → oportunidad para colarse.
[1:48] Los espías aprovechan y se cuelan por la puerta.
[1:57] Entran a las calles de la ciudad de noche; cartel "RESTAURANTE DE RAHAB".
[2:06] Dentro: el espía y Rahab (figura de blanco) junto a la barra.
[2:15] Calle con guardias; el restaurante de Rahab.
[2:24] Primer plano del espía, decidido.
[2:33] Los dos espías con tazas, hablando con Rahab en el restaurante.
[2:42] Charlan con Rahab (tazas humeantes).
[2:51] Guardias sentados en el restaurante (peligro cerca).
[3:00] Más guardias en las mesas.
[3:09] Macetas en la terraza (una volcada): el escondite de la azotea.
[3:18] Primer plano del espía junto al cartel de Rahab.
[3:27] La terraza con macetas, de noche.
[3:36] Un espía agazapado, escondido entre las plantas.
[3:45] Fachada del "Restaurante de Rahab".
[3:54] Tapiz de "Restaurante de Rahab"; una figura.
[4:03] Primer plano del espía junto al tapiz.
[4:12] Terraza con vistas a la ciudad; figuras en las mesas.
[4:21] Rahab y el espía en la terraza.
[4:30] Rahab sirviendo; guardias en la terraza.
[4:39] Primer plano del espía con un farol.
[4:48] Interior de noche: los espías y Rahab con un farol (el pacto).
```

## Cómo usarlo (patrón del min 0–5)
1. `audio.playSpine('narracion_min5-10', …)` → el reloj del audio conduce el tramo.
2. Un `Beat[]` con `{ t (segundos), sub, obj, onEnter }`; el Director lanza cada
   beat cuando el reloj del audio llega a su `t`. Sin audio (repo), reloj de pared.
3. Cada mini-juego (cruzar el puente, esquivar guardias con su cono de visión,
   colarse, esconderse en la terraza) cae en su beat.
4. Sustituye los subtítulos por las **frases reales** cuando las verifiques de oído.
