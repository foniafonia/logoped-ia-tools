# Procedencia y licencia de los assets — rama `claude/munecos-ifepfa`

Documento honesto de dónde salió cada cosa de ESTA rama/carpeta (`mundo-ladrillos`).
Escrito para que otros proyectos (p. ej. LEO · Jugar para leer) puedan decidir qué
material pueden reutilizar sin sorpresas legales. Ámbito: **solo este repo/rama**.
De assets de OTROS repos (p. ej. los GLB/GLTF de `fonomundo-bosque`) no puedo
responder — ver la sección final.

Fecha: 2026-08-13 · Autor del inventario: hilo MUÑEQUERO.

---

## 1. Código (geometría, UI, lógica) — ORIGINAL de este proyecto

Escrito a mano como código en este repo. Sin assets de terceros incrustados.
Geometría y materiales generados por código (Three.js) o CSS.

| Qué | Ruta | Notas |
|---|---|---|
| Fábrica de minifiguras | `src/characters/MinifigureFactory.ts` | ~973 líneas. 11 skins canónicos + 20 aldeanos deterministas + 14 emociones. Geometría por código. |
| Controlador de personaje | `src/characters/CharacterController.ts` | Código. |
| Multitudes | `src/world/Crowd.ts` | Código. |
| Mundo / props / escenografía | `src/world/*.ts` | Código (Ark, Army, Tent, Market, Shofar, etc.). |
| UI de ladrillo (19 componentes) | `src/ui/*.ts` | Código + CSS. |
| Demos (24) | `src/*-demo.ts` | Código. |
| Manifiesto de recursos | `coordinacion/recursos-munequero.{data.ts,ts,json}` | Código/datos. Índice; sus URLs de imagen apuntan a CloudFront (ver §3). |

**Licencia sugerida:** libre para reutilizar dentro de estos proyectos internos.
No hay `LICENSE` formal en el repo todavía — conviene añadir uno explícito.

---

## 2. Texturas e iconos EMBEBIDOS (data-URI) — IA (Higgsfield · z_image)

Generados con IA y **embebidos como base64** en el propio `.ts` (sin red).
La cabecera de cada fichero ya lo declara.

| Lote | Ruta | Formato | Origen |
|---|---|---|---|
| 18 texturas tileables | `src/assets/tex*.ts` | JPEG base64 | **IA — Higgsfield, modelo `z_image`** (seamless) |
| 13 iconos de juego | `src/assets/gameIcons.ts` | WebP base64 | **IA — Higgsfield `z_image`** + recorte de fondo con IA |

- Modelo: **z_image** (Higgsfield).
- Estado del trial Higgsfield: cancelado sin cargo; caducado el 2026-07-28.
- Estos SÍ cumplen "todo en local, sin red": son los assets recomendados para LEO.
- **Ningún dato de un niño real** interviene: son texturas/objetos sintéticos.

> Nota sobre derechos de imágenes IA: la salida de un modelo generativo puede
> tener condiciones según los términos del proveedor (Higgsfield) vigentes en el
> momento de la generación. Para uso clínico conviene que el titular de la cuenta
> confirme los términos de Higgsfield sobre propiedad/uso comercial de las
> generaciones. No invento aquí una licencia que no puedo verificar.

---

## 3. PNG grandes en el catálogo (carátula, pantallas, retratos, objetos, escenas)

Catalogados en `coordinacion/biblioteca-av-munequero.md` con job id + URL de
CloudFront. **Todos IA — Higgsfield `z_image`.** NO están embebidos: viven en el
CDN privado de la cuenta Higgsfield del usuario.

- **No son empaquetables en local tal cual** (violan la condición "sin red" de LEO).
- No se pueden descargar desde este entorno: CloudFront devuelve **403** tanto por
  el proxy del entorno como desde el sandbox de Higgsfield (probado 2026-08-13).
- Para tenerlos en local hay que descargarlos desde la sesión web de Higgsfield
  (autenticada) del titular de la cuenta y colocarlos en `public/assets/munequero/`.

---

## 4. Assets de OTROS repos (fuera de mi ámbito) — NO LO SÉ

Los modelos **GLB de personajes** (knight, barbarian, mage, rogue, skeleton_*,
chest) y los **GLTF de edificios medievales** de `fonomundo-bosque` **no son míos,
no están en este repo/rama, y no puedo verificar su procedencia ni su licencia**
desde aquí.

- Tienen pinta de pack de terceros (estilo Kenney / Quaternius), como bien apuntas,
  pero **no lo confirmo**: no voy a inventar una licencia.
- Recomendación: tratarlos como "procedencia desconocida" y **descartarlos para uso
  clínico** hasta que el autor de ese repo documente su origen y licencia reales.

---

## Resumen para decidir rápido (LEO)

- ✅ **Reutilizable y en local:** todo el §1 (código) + §2 (texturas/iconos embebidos IA).
- ⚠️ **Requiere descarga manual del titular:** §3 (PNG grandes en CloudFront).
- ⛔ **Descartar salvo prueba de licencia:** §4 (GLB/GLTF de `fonomundo-bosque`).
- 🚫 **Ningún asset de esta rama procede de un niño real** (ni fotos, ni voz, ni nombres).
