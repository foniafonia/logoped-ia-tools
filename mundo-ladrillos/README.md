# mundo-ladrillos — "La Caída de Jericó"

Videojuego web (TypeScript + Three.js + Vite) que convierte la película de ladrillos
del Rab en algo **jugable** por un niño de 6-8 años, fiel y escena a escena.

> ⚠️ **Antes de tocar nada, lee `BIBLIA.md`** (visión y reglas) y `METODOLOGIA-JUEGOS.md`
> (cómo se trabaja). Reglas duras resumidas en `CLAUDE.md`.

## Cómo jugar (usuario)
- **Doble clic** en el HTML entregado (`🧱 Jericó.html`) → **▶ Tocar para empezar**.
- **Controles:** `WASD` / flechas = mover · `Shift` = correr · **arrastrar ratón/dedo** =
  girar cámara (se queda donde la dejes) · `E` = acción (p. ej. tocar el shofar) ·
  `F` o botón ⚔️ = luchar.
- **Recargar** tras una entrega nueva: `Cmd+R` (Mac) / `Ctrl+R`.

## Modos / accesos
- **Juego completo:** abrir `🧱 Jericó.html` normal.
- **Modo Muralla (para grabar/vídeo):** abrir con `#muralla` (o usar el fichero
  `🎺 Muralla épica.html`, que entra directo). Es la muralla épica AISLADA: marcha con el
  ejército → shofar → derrumbe en ladrillos → batalla. Motor propio (no usa el runner).
- **DevHUD 🐞** (esquina, solo en el juego completo): etiqueta de estado copiable, menú
  **🎬 Ir a…** para saltar a cualquier escena, y cuaderno de notas para iterar.

## Desarrollo
```bash
cd mundo-ladrillos
npm install
npx vite build            # build de producción (dist/)
npx vite build --mode single   # un solo HTML autocontenido (dist-single/index.html)
npx tsc --noEmit         # comprobación de tipos (ver backlog de calidad)
```

## Entrega (material privado)
Las **voces/vídeo de la peli son privados** y NO van al repo (`src/audio/clips.ts` lleva
solo SFX libres; `src/video/intro.ts` y `src/story/fondos.ts` van vacíos). Se rellenan
SOLO para la entrega y se restauran después. Hay un hook `.githooks/pre-commit` que
bloquea commitear material privado; actívalo en cada clon:
```bash
git config core.hooksPath .githooks
```

## Estado y pendientes
Ver `coordinacion/backlog-calidad.md` (calidad) y `coordinacion/ideas-futuras.md`
(distribución, juegos logopédicos, DA3).
