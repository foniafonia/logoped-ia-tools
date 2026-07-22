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

## Comprobar que compila
```
cd mundo-ladrillos && npx vite build
```
