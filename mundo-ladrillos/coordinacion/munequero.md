# MUÑEQUERO / Personajes (minifiguras de ladrillo)

**Quién soy:** hilo de personajes. Publico los "skins" y la geometría procedural
en `characters/MinifigureFactory.ts` (rama `claude/munecos-ifepfa`). No toco la
lógica del juego ni las escenas de nadie.

**En qué estoy / HECHO:**
- **9 personajes canónicos** afinados con `referencias/personajes.md` (HEX) + los
  fotogramas de `referencias-peli`. Mapa `CHARACTER_SKINS`:
  `espia, espia2, yehoshua, rahab, guardia, jefeGuardia, sacerdote, beduino, rabino`.
- Correcciones clave vs versión antigua: **Yehoshúa AZUL** (chaleco/pantalón azul,
  cinturón marrón, barba blanca-canosa, turbante cobalto+franja); **Rahab** mujer
  (pestañas, labios, melena plateada, vestido gris claro, **cordón rojo carmesí**);
  **guardia** casco cónico plateado + rayas rojo/amarillo + escudo león + lanza;
  **jefe** bronce + capa negra + penacho + **alabarda dorada**; **sacerdote**
  turbante blanco + pectoral + **shofar dorado**; **beduino** turbante beige +
  túnica oliva + pantalón marrón; **rabino** traje marino + gafas + kipá + barba gris.
- Campos de skin nuevos (retrocompatibles): `emotion, beardStyle, mustache,
  glasses, cape, tunicStripe, turbanStripe, pectoral, patches, shield, accessory,
  feminine, lips, skirt, skirtLong, cord, tie, spearGold`.

## CÓMO INTEGRAR MIS MUÑECOS (para LEAD, min05 e INTEGRADOR)

`MinifigureFactory.ts` es **autónomo** (solo depende de THREE + PlasticMaterialFactory,
ambos compartidos). Forma **quirúrgica y sin conflictos** de traerlo:

```
git fetch origin claude/munecos-ifepfa
git checkout origin/claude/munecos-ifepfa -- mundo-ladrillos/src/characters/MinifigureFactory.ts
git add -A && git commit -m "Muñecos canonicos (hilo minifiguras)"
npx vite build
```

- **LEAD (rama del juego 0–5):** fusión completa también verificada **LIMPIA**
  (0 conflictos). Puedes hacer el `git merge origin/claude/munecos-ifepfa` o el
  checkout de arriba (recomendado: no arrastra mi harness de preview).
- **min05:** tu copia adoptada es **idéntica a la mía salvo el cordón de Rahab**
  (lo afiné: más fino). El checkout de arriba te deja al día sin conflicto.
- **INTEGRADOR (juego-completo):** mi archivo es la fuente de verdad de personajes;
  cógelo con el checkout de arriba al ensamblar.

## Respuesta a min05 (variantes de campamento de los espías) — ✅ HECHO
Ya están en el catálogo (`CHARACTER_SKINS`): **`SPY_CAMP_SKIN`** (`espiaCamp`,
túnica beige + turbante gris-azulado) y **`SPY2_CAMP_SKIN`** (`espia2Camp`, túnica
marrón + turbante azul claro), cara amable. Úsalas en las escenas 9–11 y cambia a
`SPY_SKIN`/`SPY2_SKIN` (sigilo) desde la 12. Guardia y jefe canónicos ya estaban.

## Ofrezco / pendiente
- **Versión LITE para multitudes:** OJO — `Army.ts` (del LEAD) ya instancia su
  propia tropa con geometría fusionada; un "lite" como minifig **puede ser
  redundante**. Antes de hacerlo, propongo validar si de verdad hace falta.
- **Aviso de consistencia (paleta de tropa):** la tropa de Jericó de `Army.ts` va
  en rojo oscuro/morado (`ENEMY_HELMS/ROBES`), pero el **guardia canónico** es
  rojo/amarillo + casco plata. De cerca y de lejos parecen **dos ejércitos**.
  Recomiendo alinear la paleta enemiga (cascos plata + acentos rojo/amarillo).
  Es tu archivo, LEAD → decisión tuya/del usuario; yo puedo pasar un parche de
  solo-colores si lo queréis.

**Preguntas:** ninguna bloqueante. Todo lo mío está publicado y listo para recoger.

---

## 📋 VISOR — auditoría de jugabilidad y AUDIO (para LEAD, min05 e INTEGRADOR)

> Audito los tramos a petición del usuario. **Lo de AUDIO son INSTRUCCIONES
> DEL USUARIO** (no opinión mía). Lo de jugabilidad son observaciones a valorar.

### 🔊 AUDIO — instrucción del usuario (PRIORIDAD, sobre todo min05)
- ❌ **Quitar la "musiquita" de fondo SINTÉTICA** de min05: en
  `scenes/min05/audio/SoundEngine.ts` la música de osciladores "siempre sonando"
  (`musicGain` / `startMusic()` / `scheduler()`). Palabras del usuario: **"está
  fatal"**. Desactívala.
- ✅ **Mantener los SFX** (recoger/gema, alarma, pasos, puerta): están **bien**.
- ✅ **Música/voces = AUDIO REAL DE LA PELI**, como la **muralla**: usar el
  `AudioManager` compartido + `audio/clips.ts` (el patrón ya existe y funciona en
  la rama del LEAD). min05 ya tiene el hook `film.play('shout')` → **extenderlo**
  a música y líneas de cada escena.
- 🎬 **Conectar las escenas con la HISTORIA:** ahora se sienten **desconectadas**
  del relato. Cada escena debe engancharse a **lo que se DICE en la película**
  (diálogo/beat de `story/guion.ts` + su clip real), igual que la muralla
  (shofar → derrumbe con audio real). El usuario pide seguir el patrón del **hilo
  inicial** (muralla + primera parte), que tiene el audio de la peli bien metido.
  → **LEAD/INTEGRADOR:** convendría compartir con min05 el patrón "Director de
  beats" (audio real acompasado a la acción) para unificarlo.

### 🎮 JUGABILIDAD — observaciones (a valorar)
Lo bueno ya hecho: control sólido, sigilo con barra de alarma + viñeta + "!" +
grito real, cruce por cuerda con equilibrio, distracción, confeti/estrellas de
premio. Mejoras:
1. **Un verbo por escena:** las de "anda hasta la marca" (min05 9-12; min00 en
   parte) ganan mucho con UNA microacción (hablar/coger/apartar juncos/ayudar).
2. **Fallo más blando (es para un NIÑO):** en sigilo, al pillarte vuelves al
   inicio → mejor **checkpoint a mitad** o un aviso previo antes del reinicio.
3. **Feel unificado:** min05 (barras+viñeta+confeti) y min00 (estrellas+logros)
   están bien pero distintos; al **unir tramos**, unificar el lenguaje de premio.
- Menor: el **salto** no se usa para nada jugable → darle uso o quitarlo.

---

## 🏔️ VISOR — "MUNDO LLENO, nunca vacío" (dirección visual, instrucción del usuario)

**Problema detectado por el usuario:** varias escenas se sienten VACÍAS — el
muñeco parece flotar en la nada, con el horizonte infinito liso. Mata la
inmersión.

**Regla (BIBLIA):** los fotogramas NO se pegan como fondo plano (ya se probó y
quedó fatal). El fondo se **RECONSTRUYE EN BLOQUES**, fiel al frame.

**Mockup de referencia** (mi rama `claude/munecos-ifepfa`):
`proto/mundo_vacio.png` (como ahora) vs `proto/mundo_lleno.png` (objetivo).
Fuente: `src/backdrop.ts` (sandbox, no es el juego; cópiese la idea, no el archivo).

**"Kit de horizonte" (barato, no hunde el móvil) — 5 ingredientes:**
1. **Cielo con color** (degradado atardecer/noche), no fondo liso.
2. **Niebla** (`THREE.Fog`) que funde lo lejano → profundidad + oculta el borde.
3. **Cerros de ARENISCA al fondo: mesetas de cima plana + colinas redondeadas**
   (NO pirámides puntiagudas — el desierto de la peli es así).
4. **Silueta de la fortaleza de Jericó** en el horizonte donde toque (además
   recuerda el objetivo de la historia).
5. **Elementos de encuadre cerca** (palmeras, juncos, rocas) para dar capas.

**Mapa de horizonte por escena (fiel a los frames):**
| Escena | Fondo de bloques |
|---|---|
| Campamento 0-5 | desierto atardecer, dunas + mesetas/colinas, oasis; río + Jericó intuidos al fondo |
| 9 Orilla Jordán | río + orilla verde, Jericó al otro lado, atardecer, colinas |
| 10 Reclutar espías | campamento atardecer (mismo horizonte) |
| 11 Murallas noche | gran muralla enorme, cielo nocturno + luna, braseros |
| 12 Trajes sigilo | noche, oasis/juncos, tiendas |
| 13 Cruzar río | río de noche, muralla al fondo, luna, juncos |
| 14 Treta avión | puerta/muro noche, faroles, guardias |
| 15 Colarse puerta | calles de Jericó noche: arenisca, arcos, faroles, luna, "Restaurante de Rahab" |
| 16 Guardias calles | calle completa noche: edificios a los lados, faroles, barriles, taberna |
| Muralla (clímax) | gran muralla + desierto + amanecer, dos ejércitos (ya existe) |

Mismo kit con 4 modos: *desierto-atardecer / río-oasis / muralla-noche /
calle-noche*. Sugerencia: un helper reutilizable `buildHorizon(modo)` que cada
escena añade DETRÁS de lo suyo. Es **dirección visual del usuario**; el "cómo"
lo decide cada creador.

**Ejemplo concreto del modo "calle-noche"** (mockup, mi rama): `proto/jerico_noche.png`
+ fuente `src/jerico-noche.ts`. Fiel al frame: arenisca, arcos (medio cilindro),
faroles cálidos (point lights) contra noche fría, luna, "Restaurante de Rahab",
cobblestones. NOTA de brillo: **noche ILUMINADA** (que un niño vea todo), no
cueva — exposición ~1.75, hemisférica alta + ambient de relleno.

---

## 🎭 VISOR — ESCONDITE ESTRELLA "la alfombra" + qué hace MEMORABLE un juego

Petición del usuario: el momento de la peli en que un ninja **se esconde tras una
alfombra colgada de la pared** debe ser **espectacular**. Mockup de referencia
(mi rama): `proto/rug_out.png` (acercándose) + `proto/rug_in.png` (escondido),
fuente `src/rug-hide.ts`.

**Spec de la mecánica (escondite especial, se apoya en el `StealthSystem`):**
- Alfombra de **kilim** (textura tejida) colgada de una barra, junto a un farol.
- Cerca → prompt "pulsa para esconderte". Al meterse: el ninja se desliza detrás;
  la tela se levanta y cae dejando un **BULTO** (cuerpo + cabeza) que **respira**
  (gaussiana animada en los vértices del plano), **piernas asomando** por debajo
  y una **manita** agarrando el borde.
- Escondido = un `HidingSpot` más: los conos pasan por encima y NO te ven. Si un
  guardia se acerca mucho, el bulto se queda quieto y sube un **latido**.
- Salir → sales de golpe apartando la tela (ágil, cómico).
- **Jugo:** "swish" al entrar/salir, motas de polvo, tela ondeando (vértices),
  farol cálido encima. La tela: `PlaneGeometry` con segmentos + desplazamiento de
  vértices (ondeo tapered desde la barra; bulto = suma de gaussianas). Barato.

### 🌟 El principio: qué hace que un niño NO OLVIDE el juego
No son las mecánicas genéricas; son los **momentos con alma y tacto**. La alfombra
no es "un escondite": es una tela con dibujo que **se mueve**, un bulto que
**respira**, unas **piernas que asoman**. Eso es lo que el niño imita al día
siguiente. Principios para TODOS los tramos:
1. **Un "toque estrella" por escena.** Algo hecho con mimo que se recuerde (la
   alfombra, la treta del avión, la muralla cayendo, el río partido con peces).
2. **Reacción tangible.** Todo responde: la tela se deforma, el guardia mira, el
   objetivo brilla. Nada estático.
3. **Carisma sobre realismo.** Caras amables, gestos cómicos, piezas de juguete.
4. **Se siente, no se lee.** Icono + sonido + movimiento cuentan la acción.
5. **Nunca vacío** (ver kit de horizonte): el mundo siempre rodea al niño.
El listón: que cada escena tenga **al menos UN detalle** del que puedas decir
"guau, mira eso". Con eso el juego pasa de "está bien" a **inolvidable**.

---

## 📋 VISOR — Auditoría VISUAL del juego ensamblado (recomendaciones)
Revisé las capturas del integrador (`entrega/capturas/`) y del min05. Gran avance:
verbo por escena (E), balizas/anillos de objetivo, contador de gemas, subtítulos,
mis muñecos integrados, interiores marcados "sin horizonte", escenas de esconder/
cordón/aguas/taberna ya existen. Ahora, lo que MÁS lastra el conjunto (por impacto):

1. **MUNDOS VACÍOS / LAVADOS (prioridad #1, es general).** La mayoría de escenas
   exteriores (`E2-esconder`, `10-resync-jordan`, `D3-cruce-aguas`, `E1-taberna`)
   se ven como un **descampado pálido**: suelo de un color + fondo claro vacío,
   sin cielo, sin niebla, sin cerros, sin Jericó al fondo. **El kit de horizonte
   NO está aplicado.** Aplicarlo (ver `proto/mundo_lleno.png` + `src/backdrop.ts`)
   es el cambio que más transforma el juego. Cada escena, su modo de horizonte
   (mapa de arriba). NUNCA un muñeco flotando en el vacío.
2. **LUZ PLANA (mood).** Escenas que en la peli son atardecer/noche se ven como
   mediodía plano (Jordán, esconder, taberna). Ya sabéis hacerlo bien (`E3-cordon`
   noche, muralla atardecer) → aplicad ESA atmósfera a todas: cielo con color,
   sombras largas, charcos de luz cálida de noche.
3. **INTERIORES VACÍOS.** "Sin horizonte" es correcto, pero la **taberna**
   (`E1-taberna`) es una sala vacía. Hay que **vestirla**: paredes, barra con
   vasijas, estantes, faroles, Rahab detrás, el cartel "Restaurante de Rahab".
   Interior lleno ≠ horizonte; es dressing de sala.
4. **MOMENTOS "WOW" SOLO NARRADOS.** `D3-cruce-aguas` dice "muros de agua con
   peces" pero **no se ven** (agua plana). El río partido merece los **muros de
   agua + peces + cauce seco** (fiel al frame `escenas/jordan-partido`). Igual el
   **cordón rojo** (`E3-cordon`): es un momento clave, que se vea atar el cordón y
   Jericó abajo. Visualizad los golpes, no los contéis.
5. **CÁMARA/ENCUADRE.** A veces muy alta/lejos o rara (`11-resync-muralla`: cubos
   enormes sosos, jugador diminuto). Acercar/bajar; que el personaje y la acción
   manden, con algo de mundo detrás.

**Vara de medir de referencia (mis mockups, mi rama):** `proto/mundo_lleno.png`
(horizonte), `proto/jerico_noche.png` (calle-noche llena), `proto/rug_in.png`
(detalle estrella). Objetivo: que CUALQUIER captura se parezca más a esas que a
un descampado pálido.
