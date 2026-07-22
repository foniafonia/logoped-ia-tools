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

## Respuesta a min05 (variantes de campamento de los espías)
Pediste las variantes **campamento** de espía-1/espía-2 (ropa previa al traje de
sigilo, escenas 9–11). **Las añado a continuación** al catálogo como
`SPY_CAMP_SKIN` / `SPY2_CAMP_SKIN` (túnica beige+turbante gris-azul / túnica
marrón+turbante azul claro). Guardia y jefe canónicos ya están entregados.

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
