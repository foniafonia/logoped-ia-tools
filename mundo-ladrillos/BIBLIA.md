# BIBLIA DEL PROYECTO — "La Conquista de Israel" (película → videojuego)

> Documento vivo. Toda la forma de trabajar, las decisiones y las **correcciones**
> a lo largo del tiempo. **Todo hilo/creador debe leer esto antes de tocar nada.**
> Si algo cambia, se actualiza AQUÍ.

---

## 1. Qué estamos haciendo
Convertir la película de animación estilo ladrillos (tipo bloques, **sin marca**)
"Construyendo la Conquista de Israel" (~29 min, 54 escenas) en un **videojuego web**
jugable, donde un **niño VIVE la película jugándola**, de forma **fiel, escena a
escena**. Tecnología: **TypeScript + Three.js + Vite** (móvil y PC, un solo HTML).

---

## 2. LA REGLA DE ORO (aprendida a base de errores)
**TODO en MUNDO 3D DE LADRILLO**, como la escena de la muralla (ejército, shofar,
derrumbe, batalla). Cada escena es un **escenario 3D de ladrillo con personajes que
ACTÚAN**.

🚫 **PROHIBIDO** usar fotogramas de la peli como **fondo plano 2.5D**. Se probó y
quedó fatal (el muñeco parecía flotar en un descampado delante de una foto). Los
fotogramas se usan **solo como REFERENCIA** para construir los escenarios en 3D.

---

## 3. Decisiones vigentes (y por qué)
- **3D de ladrillo, no fotos planas.** Es el "look" y la dinámica que funcionan.
- **Multi-protagonista por relevo:** en cada escena controlas al personaje que
  actúa en la peli (espía, Yehoshúa, niños, sacerdote…). Uno cada vez, no dos a la vez.
- **Personajes simpáticos y de juguete**, nunca tétricos. Caras **dibujadas** (con
  ojos/sonrisa), no fotos pegadas.
- **Sin violencia realista:** los enemigos, al ser vencidos, **se deshacen en un
  montón de ladrillos** (nada de sangre ni golpes realistas).
- **Iteración por HITOS:** se enseña la escena **ya con vida** (poblada + animada +
  sonido + pulido), no esqueletos sosos.
- **Fidelidad a la peli en la estructura** (orden, escenas, personajes, momentos
  clave); **diversión en lo que el niño HACE** dentro de cada escena.

---

## 4. CORRECCIONES a lo largo del tiempo (para que nadie repita errores)
- ❌ **Fondos foto planos 2.5D** → el muñeco flotaba en un descampado. **ABANDONADO.**
  Volvimos al mundo 3D de ladrillo.
- ❌ **Pegar la cara de foto** en el muñeco → quedaba "recortado" y chocaba con el 3D.
  **ABANDONADO.** Caras dibujadas de ladrillo.
- ❌ **Espía ninja negro con cara de furia** ("tétrico") → rehecho **simpático**
  (cara amarilla amable, traje azul).
- ❌ **Soldados "cutres" de cajas** → minifiguras de verdad (turbante, arma, escudo).
- ❌ **Generar muñecos 3D por IA (foto→3D)** → rompe el estilo de ladrillo. **NO.**

---

## 5. Cómo trabajamos (flujo de decisiones)
- **En BIFURCACIONES de dirección** (concepto, estilo, qué acto, qué mecánica base)
  → se **para y decide con el usuario**. Ahí meter la pata sale caro.
- **En EJECUCIÓN** dentro de una dirección ya acordada → el creador **corre libre**
  hasta un **hito presentable** (escena con vida), sin parar en cada tornillo.
- Producción por **MINUTOS** (tramos de 5 min), **en paralelo**, y se **fusiona al final**.

---

## 6. Equipo (hilos / agentes)
- **LEAD / Creador 0–5** (Claude principal): integra el motor + hace el minuto 0–5 +
  **fusiona** el trabajo de todos.
- **Creador 5–10, 10–15, 15–20, 20–25, 25–29**: cada uno su tramo de 5 min.
- **MUÑEQUERO**: personajes (`MinifigureFactory.ts`).
- Todos **ven el repo** (ramas) y aprenden del trabajo de los demás.

---

## 7. Reglas de COORDINACIÓN (para fusionar sin dolor)
1. Cada creador trabaja en **su RAMA** (`claude/min-05-10`, `claude/munecos`, …).
2. Cada creador crea **su CARPETA** (`src/scenes/minXX/`) y **NO edita archivos
   compartidos** (así no hay conflictos). El LEAD integra.
3. Usar SIEMPRE las **piezas compartidas** (no reinventar):
   - `src/structures/BrickStructureBuilder.ts` — geometría de ladrillo (muros, torres…).
   - `src/characters/MinifigureFactory.ts` — personajes por "skin" (SPY_SKIN, YOSHUA_SKIN…).
   - `src/story/StoryEngine.ts` — motor narrativo (escena: subtítulo → objetivo → siguiente).
   - `src/characters/CharacterController.ts`, `src/camera/ThirdPersonCamera.ts`.
   - `src/effects/Dust.ts`, `src/world/EnvironmentManager.ts`, `src/core/Quality.ts`.
4. **Entregar capturas** (Playwright headless con swiftshader) de cada escena.
5. **Rendimiento móvil:** instanciar multitudes; para masas usar versión "lite" de
   los muñecos (sin escudo/plumas). Limitar luces dinámicas.

---

## 8. Reglas de CONTENIDO / técnicas (obligatorias)
- 🚫 Nunca la palabra **"LEGO"** ni marcas en código, textos, assets o nombres.
  Usar "ladrillos", "bloques", "minifigura".
- 🔒 El **material de la peli** (audio, fotogramas, clips) es **PRIVADO**: **jamás al
  repo público**. Se embebe **solo en las entregas**. Patrón: `clips.ts` y `fondos.ts`
  van **VACÍOS/libres** en el repo y se rellenan con un script para la entrega.
- 📦 Entregas **autocontenidas** (single-file HTML) para compartir con el cliente.
- 🎨 Escala de personaje ~4.1 de alto; acabado de plástico (clearcoat); estilo coherente.

---

## 9. El mapa de la peli (tramos de 5 min)
- **0–5:** intro estudio (rabino director), campamento de Israel, Yehoshúa arenga,
  beduino cómico (camello que se derrumba). → *Creador 0–5*
- **5–10:** los dos espías, cruzar el río, la treta del "avión", colarse en Jericó. → *Creador 5–10*
- **10–15:** Restaurante de Rahab, esconderse, engaño a los guardias, cordón rojo.
- **15–20:** huida de los espías, reporte a Yehoshúa, preparativos, los shofarot.
- **20–25:** el **cruce del Jordán** (aguas partidas), la **marcha** alrededor de Jericó.
- **25–29:** el **shofar** y el **derrumbe de la muralla**, la batalla, rescate de Rahab,
  Hai (bromas de los niños), reparto de tribus, cierre.

**La MURALLA (asedio + shofar + derrumbe + batalla + combate) YA ESTÁ HECHA = CLÍMAX.**
Está a salvo en git (commit `ae8b2b7`) y en los módulos `Army.ts`,
`ShofarInteraction.ts`, `Combat.ts`, `BrickStructureBuilder.buildJericho/buildCourtyard`.

---

## 10. Estado actual
- Rama del juego (LEAD): `claude/pelicula-videojuego-primera-persona-kst6ip`.
- **Minuto 0–5:** campamento 3D de ladrillo con vida (aldeanos, animales, gag del
  beduino) — en curso.
- **Muralla:** terminada y a salvo (es el clímax; se enganchará al final del recorrido).
- **StoryEngine:** existe (secuencia narrativa); se usará para encadenar los tramos
  sobre escenas 3D (no fondos planos).

---

_Mantener este documento al día es responsabilidad de todos. Si tomas una decisión
o corriges un rumbo, escríbelo aquí._
