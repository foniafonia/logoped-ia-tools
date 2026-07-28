# Propuesta al cliente — "La Caída de Jericó" (BORRADOR guardado)

> Estado: **borrador para retocar y entregar** tras hablarlo en el Zoom.
> Cifras acordadas: **2.000 €** el juego (1.000 al empezar + 1.000 a la entrega),
> **150 €/mes** mantenimiento, plazo **~10 semanas** (antes si se puede).
> Cuando Idan lo pida, se retoca y se convierte en una página bonita (PDF/web) para enviar.

---

## PROPUESTA (texto listo para el cliente)

# 🧱 Propuesta — Videojuego "La Caída de Jericó"

**Para:** [Comunidad / cliente]

### Qué es
Un **videojuego web en 3D** (estilo mundo de ladrillos) que recrea la historia de
**La Caída de Jericó** para **niños de 6 a 8 años**, para que **vivan y aprendan la
historia jugando**. Cinco mundos —el campamento, los espías y el Jordán, la posada de
Rahab, el cordón rojo y la huida— y el **clímax**: la muralla que se derrumba en
ladrillos. Cada escena es un mini-juego. **Con la voz original de la película.**

Está construido con **mi manera de trabajar y todo mi conocimiento integrado para que
sea accesible**: claro, bien ritmado y fácil de entender para los más pequeños.

### Por qué este precio
Lo hago por **2.000 €** porque **quiero hacerlo, sea como sea**: me encanta este proyecto
y para mí es **kodesh (sagrado)**. No es un precio que refleje lo que cuesta un trabajo
así en el mercado —es mi manera de poner mi oficio al servicio de algo en lo que creo.

| Quién lo hace | Precio de mercado |
|---|---|
| Un estudio profesional | 30.000 – 50.000 € |
| Un programador freelance (a mano) | 8.000 – 15.000 € |
| Un freelance con IA (hoy) | 4.000 – 8.000 € |
| **Yo, para vosotros** | **2.000 €** |

### Cómo se juega
- 💻 **Ordenador** (navegador)
- 📱 **Móvil y tablet** (Chrome y Safari) — se adapta solo, con controles táctiles
- 📲 **App descargable**: se instala en el móvil/tablet como un icono y **funciona sin
  internet**, sin pasar por las tiendas
- *Google Play y App Store: solo si en el futuro hay interés real (se valoraría aparte)*

Todo desde **un solo enlace** en vuestra web: en el ordenador abre la versión de PC, en
el móvil la versión móvil, y quien quiera se lo instala como app.

### Inversión
- **2.000 €** por el juego completo
  - **1.000 € al empezar**
  - **1.000 € a la entrega final**
- **150 €/mes** de mantenimiento — incluye:
  - Alojamiento (que esté siempre disponible y seguro)
  - Correcciones y que no se rompa con las actualizaciones de los móviles
  - Pequeñas mejoras y soporte
  - Contenido y ajustes nuevos cada cierto tiempo

### Plazo
Aproximadamente **10 semanas** hasta el juego completo, al nivel del primer mundo (que ya
podéis ver terminado). **Si se termina antes, antes.**

### Qué recibís
El juego completo en un enlace para vuestra web —jugable en ordenador, móvil y como app
descargable, con la voz de la película— y a alguien que lo mantiene vivo y lo mejora.

---

## NOTA INTERNA (NO para el cliente)

- El marco **kodesh** explica el precio bajo por **devoción, no por poco valor** (resuelve
  el riesgo de anclaje). La tabla de mercado al lado remata esa idea.
- Los **150 €/mes son la semilla de ingreso recurrente**: no regalarlos.
- Objetivo real de Idan: **sueldo/ingreso recurrente**, no maximizar este pago. Este
  cliente es el **ancla / caso de éxito**, no el pagador del sueldo. El sueldo sale de
  **reutilizar el motor** (2.º, 3.º juego bíblico cuestan una fracción) + **vender a la
  red** (comunidades/colegios/logopedas).
- Banderas rojas a vigilar: familia + dinero (padre-rabino), scope creep ("como sea" ≠
  gratis), dependencia de un solo cliente, no sobrevender uso terapéutico, IP/licencia de
  la película.

## REFERENCIA TÉCNICA — móvil y app (para no repetir la explicación)

- **Una sola base de código** sirve para PC + móvil + app. No se mantienen versiones
  separadas: el mismo archivo detecta el dispositivo y se adapta (`IS_MOBILE` en
  `core/Quality.ts`; modo `lite` en `core/PreciousRender.ts`; controles en
  `ui/TouchControls.ts`).
- **Móvil web (Chrome/Safari):** funciona; calidad auto-ajustada (menos sombras, sin IBL,
  post-proceso ligero). ~90-95% de la experiencia de PC. Falta pulido/testeo en móvil real
  (parte del trabajo de terminar).
- **"App descargable" = PWA:** añadir manifest + service worker (~1 día) → "Añadir a
  pantalla de inicio", icono, pantalla completa, offline. Sin tiendas, sin cuotas.
- **Nativa (App Store/Google Play):** solo si hay interés real futuro. 99 $/año Apple +
  25 $ Google, revisiones, normas de apps para niños. Presupuesto aparte.

## PENDIENTE cuando se retome
1. Retocar el texto según lo hablado en el Zoom.
2. Convertirlo en **página bonita** (PDF o web de una página) para enviar.
3. (Técnico, aparte) implementar la **PWA** para la "app descargable" cuando toque.
