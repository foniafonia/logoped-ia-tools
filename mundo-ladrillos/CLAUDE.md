# mundo-ladrillos — reglas para cualquier hilo/agente

**📖 LEE `BIBLIA.md` ANTES DE TOCAR NADA.** Ahí están la visión, las decisiones y las
correcciones del proyecto. Aquí van solo las reglas duras que no se saltan nunca:

## Reglas de oro
1. **TODO en mundo 3D de ladrillo** (como la escena de la muralla). 🚫 **NUNCA** usar
   fotogramas de la peli como **fondo plano 2.5D** (se probó, quedó fatal, se descartó).
   Los fotogramas solo como **referencia** para construir escenarios 3D.
2. Personajes **simpáticos y de juguete**, nunca tétricos. Caras **dibujadas** de
   ladrillo (no fotos pegadas, no modelos foto→3D).
3. **Sin violencia realista:** los enemigos vencidos **se deshacen en ladrillos**.
4. 🚫 Nunca la palabra **"LEGO"** ni marcas en código/textos/assets (usa "ladrillos",
   "bloques", "minifigura").
5. 🔒 El **material de la peli** (audio, fotogramas) es **PRIVADO**: jamás al repo.
   `clips.ts` y `fondos.ts` van **vacíos/libres** en el repo; se rellenan solo para
   entregas.

## Coordinación (producción por minutos, en paralelo)
- **Los hilos NO comparten chat; solo el repo.** Comunícate por el **tablón**:
  `coordinacion/` (lee `coordinacion/README.md`). Escribe tu estado/dudas/peticiones
  en `coordinacion/<tu-nombre>.md` y lee a los demás con `git fetch --all`.
- Trabaja en **tu rama** y en **tu carpeta** `src/scenes/minXX/`. **No** edites archivos
  compartidos (los integra el LEAD).
- Reutiliza las piezas compartidas: `structures/BrickStructureBuilder`,
  `characters/MinifigureFactory`, `story/StoryEngine`, `characters/CharacterController`,
  `camera/ThirdPersonCamera`, `effects/Dust`, `world/EnvironmentManager`, `core/Quality`.
- Entrega **capturas** de tus escenas. Cuida el **rendimiento móvil** (instancia
  multitudes, limita luces).

## Flujo
- Se itera por **HITOS** (escena ya con vida: poblada + animada + sonido + pulido), no
  por esqueletos.
- Las **decisiones de dirección** las marca el usuario; la **ejecución** corre libre.

## 🔔 Regla del TIMBRE (decisiones con el usuario)
- **Los hilos creadores PREGUNTAN al usuario antes de decidir**, aunque la pregunta
  parezca de tontos. Mejor una pregunta simple que asumir. El usuario aprueba; él es
  el timbre. (Los detalles finos de ejecución sí corren libres, pero ante cualquier
  bifurcación o duda de dirección → **se pregunta**, no se da por hecho.)
- **EXCEPCIÓN — el INTEGRADOR va a su bola:** monta el juego completo copiando del
  trabajo de todos los hilos, **sin preguntar**; el usuario **revisa después** y
  decide. (Detalle en `coordinacion/integrador.md`.)

## Comprobar que compila
```
cd mundo-ladrillos && npx vite build
```
