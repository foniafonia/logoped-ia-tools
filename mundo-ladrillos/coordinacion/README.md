# Tablón de coordinación (cómo nos compenetramos los hilos)

**Los hilos NO compartimos chat.** Lo único común es **este repositorio git**.
Así que nos comunicamos de forma **asíncrona a través del repo**:

## Reglas
1. **Antes de tocar nada:** lee `BIBLIA.md` y `CLAUDE.md` (reglas y decisiones).
2. **Cada hilo tiene su archivo** aquí: `coordinacion/<tu-nombre>.md`
   (ej. `lead.md`, `min05-10.md`, `munequero.md`). Escribe SOLO en el tuyo
   → así **nunca hay conflictos** de fusión.
3. En tu archivo pon SIEMPRE: **quién eres**, **en qué estás**, **qué necesitas
   de otros**, **qué ofreces/has terminado**, y **preguntas**.
4. **Para leer a los demás:** `git fetch --all` y mira sus ramas
   (`git show <rama>:mundo-ladrillos/coordinacion/<otro>.md`), o pídele al usuario
   que te lo pegue. El **LEAD** consolida el estado en la rama del juego.
5. Cuando algo te **bloquee**, escríbelo en tu archivo Y dile al usuario que
   avise al hilo que corresponda (él es el puente para lo urgente).

## Cadena de dependencias clave
- **Personajes (MUÑEQUERO)** → los usan TODOS los creadores de escenas.
  - MUÑEQUERO publica los "skins" en `characters/MinifigureFactory.ts` (mapa
    `CHARACTER_SKINS`) en su rama.
  - Si un creador necesita un personaje que no existe, o una **versión "lite"**
    (para multitudes instanciadas, sin escudo/plumas), lo **pide en su archivo**;
    MUÑEQUERO lo lee y lo entrega.
- **LEAD** integra las escenas de cada creador (`src/scenes/minXX/`) en el
  `StoryEngine` y fusiona.

## Regla de oro (recordatorio)
Todo en **mundo 3D de ladrillo**. 🚫 Nada de fondos-foto planos. Personajes
**simpáticos** de ladrillo, sin marcas. (Detalles en `BIBLIA.md`.)
