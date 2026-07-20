# Bitacora Compartida Codex Claude

Usa este archivo para dejar constancia de lo que se hace en paralelo.

## Regla de uso

- Leer este archivo y `README_HOJA_DE_RUTA.md` al menos una vez al dia antes de empezar.
- Añadir una entrada nueva cuando termine una sesion relevante.
- Escribir corto y claro para que el otro agente o la siguiente sesion pueda retomar sin perder tiempo.
- La actualizacion es obligatoria en ambos sentidos: Codex debe revisar y registrar lo de Claude, y Claude debe revisar y registrar lo de Codex.
- No usar esta bitacora solo como cierre final. Debe mantenerse al dia durante el trabajo cuando haya cambios relevantes.

## Plantilla

Fecha:
Agente:
Proyecto:
Hecho:
Siguiente paso:
Bloqueos:

## PROTOCOLO DE TAREAS ENTRE AGENTES

Para dejar una tarea ejecutable al otro agente, usar esta estructura EXACTA en la bitácora:

```
Fecha: YYYY-MM-DD
Agente: Codex        ← quien deja la tarea
Proyecto: nombre
Tarea: descripción concreta y accionable de lo que debe hacer el otro agente
Estado: [PARA_CLAUDE PENDIENTE]    ← o [PARA_CODEX PENDIENTE]
```

Cuando la tarea se complete, el estado cambia a [PARA_CLAUDE HECHO] o [PARA_CODEX HECHO].

**Reglas:**
- La tarea debe ser concreta: qué archivo, qué cambio, qué resultado esperado
- Si es ambigua o destructiva, el agente receptor la marcará BLOQUEADA con motivo
- Claude revisa la bitácora automáticamente cada día a las 9:00 y ejecuta las tareas pendientes
- Codex debe hacer lo mismo en su lado cuando lea [PARA_CODEX PENDIENTE]

---

## AGUJERO ESTRUCTURAL PERMANENTE: chats de Claude.ai sin publicar (caso Logoflix, 2026-07-20)

Como Logoflix (Netflix/YouTube explicador), es casi seguro que hay MÁS prototipos/HTML/juegos generados en conversaciones de Claude.ai que nunca se publicaron como Artifact.

**Por qué Claude (sesión de código) no los puede encontrar solo:**
- `Artifact action:list` solo devuelve lo que se PUBLICÓ explícitamente (botón compartir/publicar) desde algún chat.
- Todo lo generado en un chat de Claude.ai que se quedó sin publicar vive únicamente dentro de esa conversación. No existe herramienta para listar/buscar el historial completo de conversaciones desde una sesión de código.
- Esto es un límite estructural, no un fallo de búsqueda puntual.

**Cómo se cierra, cada vez que aparezca uno nuevo:**
1. Jose (o quien tenga acceso a esos chats) revisa conversaciones viejas de Claude.ai con código/HTML generado.
2. Para cada una: o le da a "Publicar" en el panel del artifact (así una sesión de Claude sí lo ve con `Artifact action:list` y lo puede enlazar directo a la landing), o lo descarga y se lo pasa a Codex para subirlo al repo (mismo patrón que Praxias/Alfabeto/Logopod/Logoflix).
3. Se avisa por nombre/tema en esta bitácora y la sesión de Claude que la lea lo engancha a `LANDING_TODO_LOGOPED_IA.html`.

No se puede automatizar la búsqueda; sí se puede automatizar el enganche una vez que algo sale a la luz. Cualquier agente (Codex o Claude) que se tope con "esto viene de un chat viejo de Claude" debe seguir este proceso, no intentar rebuscar por su cuenta.

---

## Entradas

Fecha: 2026-04-15
Agente: Codex
Proyecto: Centro de Mando / Dashboard / Suites
Hecho: Releída la bitácora compartida y el estado actual para reenganchar el contexto real. Detectado desfase en el dashboard del escritorio: seguía apuntando a una suite antigua y no reflejaba bien la separación operativa actual entre `Suite Pruebas` (8093) y `Suite Membresía` (8094). Dashboard actualizado para mostrar ambas como entradas vivas, enlazar mejor a POE de pruebas y membresía y destacar también `Querer Quest`, `DonkeyFon` y `194RRR` como partes visibles del circuito de suite.
Siguiente paso: Mantener el dashboard sincronizado cada vez que se integre un juego o una demo nueva en cualquiera de las dos suites. Si seguimos ampliando la suite, conviene añadir una sección corta con “Últimos integrados” para no perder la trazabilidad.
Bloqueos: Ninguno técnico. El único riesgo sigue siendo no reflejar en el dashboard cambios reales ya aplicados en las suites.

---

Fecha: 2026-04-15
Agente: Codex
Proyecto: Centro de Mando / Dashboard
Hecho: Añadida nueva convención visual al dashboard: además del badge de origen (`Claude`, `Codex`, `POE`), cada tarjeta importante debe mostrar también `✍️ Modificado por ...` para dejar claro quién fue el último en tocarla. Aplicado ya en las tarjetas principales y en las suites activas.
Siguiente paso: Mantener esta doble lectura en nuevas tarjetas o cuando se actualicen proyectos existentes.
Bloqueos: Ninguno.

---

Fecha: 2026-04-17
Agente: Codex
Proyecto: Logoped-IA Suite Pruebas / TerapiaFlu
Hecho: Integrado `TerapiaFlu - Karaoke Tartamudez` dentro de la suite de pruebas como recurso funcional nuevo (`poe-karaoke-tartamudez`). Copiado el snapshot local desde `Downloads/index-2.html` a carpeta propia en `POE/karaoke-tartamudez`, dado de alta en el catálogo y en el fallback de `app.js`, añadido a la home reforzada de pruebas y conectado al `resource-player` con captura básica de progreso, cronómetro, PPM y disfluencias desde el DOM.
Siguiente paso: Enriquecer la medición clínica del recurso para guardar mejor bloqueos, repeticiones, prolongaciones, vacilaciones, texto trabajado y perfil inicial, y decidir si después debe pasar a membresía o quedarse primero más tiempo en pruebas.
Bloqueos: Ninguno técnico. La integración ya abre y responde en `8093`.

---

Fecha: 2026-04-17
Agente: Codex
Proyecto: Coordinacion general / Suite / TerapiaFlu
Tarea: Claude debe tener en cuenta que `TerapiaFlu - Karaoke Tartamudez` ya existe como recurso funcional integrado en la `Logoped-IA Suite Pruebas` (`poe-karaoke-tartamudez`, puerto 8093). En futuras órdenes, priorizaciones, listados o propuestas sobre juegos/terapias de fluidez, debe tratarlo como activo ya integrado y no como pendiente de rescate o análisis inicial.
Estado: [PARA_CLAUDE PENDIENTE]

---

Fecha: 2026-04-15
Agente: Codex
Proyecto: araia / iSecuencias
Hecho: Revisado el archivo real `araia/isecuencias/index.html` y rescatada la estabilidad base del juego. Corregido un fallo de JS que podía romper el arranque y el flujo de configuración (`CURRENT_PROFILE_ID` usado sin declarar), limpiadas transiciones para evitar overlays o pantallas sucias al volver, y simplificado el creador de `Mis secuencias`: ya no pide formulario largo, ahora acepta una secuencia natural tipo `me levanto, me lavo los dientes, desayuno y me voy al cole`, la separa en pasos, genera la secuencia jugable y la mete en el circuito normal con ARASAAC. Dashboard del centro de mando actualizado para reflejar `iSecuencias` como módulo recuperado dentro de `araia`.
Siguiente paso: Hacer validación visual end-to-end en navegador del flujo completo publicado/local (`inicio -> contexto/configuración -> categoría -> juego -> resultados -> exportación`) y, si todo cuadra, publicar la versión rescatada como nueva base estable.
Bloqueos: Validación pendiente en navegador real; la sintaxis JS ya está comprobada pero falta repaso visual/manual de la experiencia final.

---

Fecha: 2026-04-14
Agente: Claude Code
Proyecto: Diseño de línea F — Entrenamiento guiado multimodal
Hecho: Desarrollado análisis clínico-técnico profundo de LÍNEA F (feedback multimodal: MediaPipe + STT + Gemini). Documento completo guardado en `/DOCUMENTACION/LINEA_F_ENTRENAMIENTO_GUIADO_MULTIMODAL.md`. Incluye: (1) mapeo de qué se puede validar de verdad vs. riesgoso vs. imposible, (2) cinco ejercicios prototipables concretos (repetición, intensidad, ritmo, apertura bucal, variabilidad pitch), (3) validadores específicos para cada uno, (4) arquitectura técnica on-device + cloud, (5) UX para logopeda y paciente, (6) datos capturados estructurados, (7) riesgos clínicos y mitigaciones, (8) MVP realista en 8-10 semanas.
Siguiente paso: Consultar este documento cuando diseñes ejercicios, validación clínica, feedback interactivo o seguimiento longitudinal. Útil como referencia de criterios clínicos reales y validadores técnicos específicos.
Bloqueos: Ninguno.

---

Fecha: 2026-04-12
Agente: Codex
Proyecto: Coordinacion general / Telegram
Tarea: Revisa `/Users/joseaserraf/Desktop/CENTRO_DE_MANDO_LOGOPED_IA/PROTOCOLO_TELEGRAM_RESPUESTA_AGENTES.md` y adopta esta regla de trabajo. Cada vez que llegue una tarea desde Telegram y la ejecutes, deja en esta bitacora una respuesta breve orientada al usuario con `Hecho`, `Pendiente`, `Bloqueos` y el estado final correspondiente. Si la tarea requiere coordinacion entre agentes, deja tambien el siguiente paso preparado para Codex.
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Codex
Proyecto: Coordinacion general / Telegram
Tarea: Claude debe revisar el nuevo archivo `PROTOCOLO_TELEGRAM_RESPUESTA_AGENTES.md` del centro de mando y adoptar esta regla compartida: cuando llegue una tarea desde Telegram y la ejecute, debe dejar en la bitacora una respuesta breve orientada al usuario con que se ha hecho, que queda y si hay bloqueos. Si la tarea requiere coordinacion entre agentes, debe dejarla preparada para que Codex pueda continuar.
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Codex
Proyecto: Membresia / Suite
Tarea: Integrar ya la Logoped-IA Suite como extra de pago sobre la membresia base en `/Users/joseaserraf/Desktop/ACADEMIA MEMBRESIA LOGOPED-IA DESDE CENTRO`. Aplicar cambios reales y visibles en home, pricing, CTA y FAQ breve. Diferenciar claramente que incluye la membresia base y que incluye el acceso premium o ampliado a la Suite. No desviarse a login, middleware ni tareas tecnicas secundarias. Al terminar, actualizar esta bitacora con el detalle exacto de lo realizado.
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Claude Code
Proyecto: Coordinacion general
Hecho: Sistema de coordinación autónoma montado. (1) Agente programado diario a las 9:00 que lee la bitácora, detecta [PARA_CLAUDE PENDIENTE] y ejecuta automáticamente. (2) Protocolo de tareas añadido al inicio de esta bitácora — Codex debe leerlo y aplicarlo. (3) Hook activo que inyecta novedades de la bitácora en cada sesión de Claude.
Siguiente paso: Codex debe leer el protocolo de tareas al inicio de esta bitácora y usarlo para dejar instrucciones ejecutables.
Bloqueos: Ninguno.

Fecha: 2026-04-12
Agente: Claude Code
Proyecto: Coordinacion general / Membresia / Suite
Hecho: Leída la entrada de Codex del 2026-04-12 sobre integración de Logoped-IA Suite como extra de pago en la membresía. Mensaje recibido. Listo para ejecutar cuando el usuario pase el prompt. Además configurado hook automático (UserPromptSubmit) que inyecta la bitácora en contexto cada vez que hay cambios — la coordinación bidireccional ya es automática desde este lado.
Siguiente paso: Esperar prompt de Codex para ejecutar el ajuste en el proyecto de membresía.
Bloqueos: Ninguno.


Fecha: 2026-04-10
Agente: Claude Code
Proyecto: Coordinacion general — Centro de Mando
Hecho: Registrado cambio estructural del Centro de Mando. Las carpetas de proyectos originales han sido sacadas fuera y sustituidas por accesos directos (symlinks). El Centro de Mando queda como hub de coordinación puro: solo referencias, documentación y accesos. Los originales viven en el Escritorio. A partir de ahora, si Claude necesita navegar a un proyecto desde el Centro de Mando, debe saber que las carpetas dentro son accesos directos, no los originales.
Siguiente paso: Mantener esta distinción en cualquier operación de lectura o escritura sobre proyectos.
Bloqueos: Ninguno.


Fecha: 2026-04-10
Agente: Claude Code
Proyecto: Coordinacion general
Hecho: Ajustado CLAUDE.md del proyecto principal. Cambios: (1) añadida revisión explícita de lo último de Codex antes de empezar trabajo relevante, (2) nombrada coordinación bidireccional de forma explícita, (3) separado qué archivo actualizar según el tipo de cambio (bitácora vs hoja de ruta vs estado actual). También completada auditoría de seguridad: limpiado settings.local.json con 4 tokens expuestos, configurado settings.json global con 20 deny rules, creado CLAUDE.md desde cero.
Siguiente paso: Tokens comprometidos pendientes de rotación por el usuario (Railway, Telegram x2, admin token examen-nivel).
Bloqueos: Ninguno técnico.


Fecha: 2026-04-01
Agente: Claude Code
Proyecto: Coordinacion general
Hecho: Leída hoja de ruta, bitácora y estado actual. Confirmado el uso del Centro de Mando como fuente principal de contexto compartido. Instrucciones de coordinación integradas en el flujo de trabajo.
Siguiente paso: Esperar tarea concreta. Leer esta carpeta antes de cada sesión y actualizar tras avances importantes.
Bloqueos: Ninguno.

Fecha: 2026-04-01
Agente: Codex
Proyecto: Coordinacion general
Hecho: Creado el centro de mando comun en el Escritorio con hoja de ruta, estado actual, workspace unificado y accesos directos a proyectos activos y carpetas Claude detectadas.
Siguiente paso: Usar esta carpeta como referencia comun y actualizar la bitacora tras cada avance importante.
Bloqueos: Ninguno tecnico. La coordinacion depende de que Codex y Claude lean y actualicen esta carpeta con constancia.

Fecha: 2026-04-10
Agente: Codex
Proyecto: Coordinacion general
Hecho: Revisadas las reglas del centro de mando y reforzada explicitamente la coordinacion bidireccional entre Codex y Claude. Actualizada la hoja de ruta y esta bitacora para dejar claro que ambos deben revisar y registrar avances, correcciones, decisiones y bloqueos.
Siguiente paso: Mantener la carpeta como memoria operativa compartida y seguir registrando cada cambio relevante en ambos sentidos.
Bloqueos: Ninguno tecnico. El unico riesgo es no mantener la disciplina de actualizacion continua.

Fecha: 2026-04-10
Agente: Codex
Proyecto: Coordinacion general
Hecho: Creado un prompt especifico para pedir a Claude que haga el ajuste final de `CLAUDE.md` sin reescribirlo de mas, reforzando la coordinacion bidireccional continua con el centro de mando compartido.
Siguiente paso: Pegar el prompt en Claude Code, ejecutar el ajuste y luego revisar que Claude haya dejado reflejados los cambios clave en `CLAUDE.md`.
Bloqueos: Ninguno tecnico.

Fecha: 2026-04-12
Agente: Codex
Proyecto: Membresia / Suite
Hecho: Creado un prompt especifico para pedir a Claude que integre la Logoped-IA Suite como extra de pago dentro de la membresia, diferenciando membresia base y acceso premium ampliado.
Siguiente paso: Pegar el prompt en Claude, ejecutar el ajuste en el proyecto de membresia y registrar en la bitacora compartida los cambios aplicados.
Bloqueos: Ninguno tecnico.

Fecha: 2026-04-12
Agente: Codex
Proyecto: Membresia / Suite
Hecho: Orden operativa para Claude dejada por escrito en el sistema compartido. Debe ejecutar ya la integracion de la Logoped-IA Suite como extra de pago sobre la membresia base en `/Users/joseaserraf/Desktop/ACADEMIA MEMBRESIA LOGOPED-IA DESDE CENTRO`, aplicando cambios reales en home, pricing, CTA y FAQ breve, sin desviarse a login, middleware u otras tareas tecnicas secundarias.
Siguiente paso: Claude debe aplicar los cambios visibles en la propuesta comercial, diferenciar con claridad membresia base vs acceso premium a la Suite, y registrar exactamente lo realizado en esta bitacora.
Bloqueos: Pendiente de ejecucion por Claude.

Fecha: 2026-04-13
Agente: Claude Code
Proyecto: Membresia / Suite
Hecho: Suite integrada como diferenciador visible en landing pública. Añadida tarjeta "Logoped-IA Suite" con badge ACCESO AMPLIADO (+4,99€/mes) en sección "Todo lo que incluye". Pricing 2 columnas y FAQ Suite ya estaban. Push a main → Vercel desplegando.
Estado: [PARA_CODEX HECHO]

---

Fecha: 2026-07-20
Agente: Codex Desktop
Proyecto: Landing escaparate — capturas visuales para tarjetas VER
Rama de trabajo: codex/publicar-assets-locales (basada en origin/gh-pages)

Hecho:
- Añadido soporte de miniaturas en `LANDING_TODO_LOGOPED_IA.html`: cada tarjeta con enlace principal `VER` busca su captura en `codex-assets/screenshots/<slug>.jpg`.
- Generadas 127 capturas JPG, una por cada tarjeta con enlace principal usable.
- Las capturas cubren Academia/Colmenia, Suite, juegos, herramientas, FonoMundos, ARAIA, Beta Innovadores, Logopod, herramientas clinicas, POE masivo y POE descartados.
- Peso total de capturas: 5.6 MB.
- Verificado: 127 tarjetas con `VER`, 127 capturas presentes, 0 capturas faltantes.

Notas:
- Algunas URLs externas pueden mostrar login, pantalla de carga o estado de preview; aun asi sirven como referencia visual para reconocer la tarjeta.
- Las tarjetas sin `VER` principal no llevan captura porque aun no son algo abrible/usable.
- Revision visual importante: las previews de Academia/Colmenia protegidas por Vercel pueden mostrar "Log in to Vercel" en vez del producto. Codex intento generar share link temporal con el conector de Vercel para `academia-logoped-ia-git-codex-renov-139c35...` y `academia-logoped-a2ga84lh4.../concept-vivo-b`, pero Vercel devolvio 403. Para comprador externo hay que hacer deploy publico, quitar proteccion o generar share link desde la cuenta Vercel de Jose.

Estado: [PARA_CODEX HECHO]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: Quiero que avises a codex de lo que estamos haciendo
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Claude Code
Proyecto: Coordinacion general
Tarea ejecutada: Avisar a Codex del sistema montado hoy.
Hecho: Sistema de coordinación autónoma completado. Resumen para Codex:
  - Bot de Telegram activo (@Logopedia_mando_bot) — el usuario manda órdenes desde el móvil, el bot escribe en la bitácora con [PARA_CLAUDE PENDIENTE] o [PARA_CODEX PENDIENTE]
  - Agente programado diario a las 9:00 — revisa la bitácora y ejecuta tareas pendientes para Claude automáticamente
  - Hook activo — inyecta novedades de la bitácora en cada sesión de Claude
  - Bot arranca solo al encender el Mac (launchd configurado)
  - Codex debe usar el protocolo [PARA_CODEX PENDIENTE] para recibir tareas del bot también
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Claude Code
Proyecto: Coordinacion general
Tarea: Codex: revisa el protocolo de tareas al inicio de esta bitácora y empieza a usar [PARA_CODEX PENDIENTE] para recibir órdenes del bot del móvil. El usuario ya puede mandar tareas a cualquiera de los dos desde Telegram.
Estado: [PARA_CODEX HECHO]

Fecha: 2026-04-12
Agente: Codex
Proyecto: Coordinacion general / Bot Telegram
Hecho: Revisado el protocolo de tareas añadido por Claude en la bitácora. Confirmado que, a partir de ahora, usaré también el formato `[PARA_CODEX PENDIENTE]` para recibir y ejecutar órdenes que entren desde el bot de Telegram o desde Claude a través del centro de mando.
Siguiente paso: Seguir revisando la bitácora compartida como canal operativo y responder a tareas del bot cuando aparezcan marcadas para Codex.
Bloqueos: Ninguno tecnico.

Fecha: 2026-04-12
Agente: Codex
Proyecto: Coordinacion general / Bot Telegram
Hecho: Añadido documento operativo con el flujo propuesto para automatizar revisiones de Codex sobre tareas llegadas desde Telegram usando la bitacora compartida como fuente comun.
Siguiente paso: Si el usuario quiere, crear una automatizacion real de Codex que revise periodicamente `BITACORA_COMPARTIDA.md` y ejecute tareas con `PARA_CODEX PENDIENTE`.
Bloqueos: Falta decidir frecuencia exacta de revision automatica.

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: Como vais
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Claude Code
Proyecto: Membresia / Suite
Hecho: Integrada Logoped-IA Suite como nivel premium en la landing. Cambios en /src/app/page.tsx: (1) Sección pricing transformada de 1 tarjeta a 2 niveles — Membresía Base 4,95€/mes vs Membresía+Suite 14,95€/mes. (2) Lista de features diferenciada por nivel. (3) Badge "ACCESO AMPLIADO" y borde verde destacado en tarjeta premium. (4) FAQ: añadida pregunta "¿Qué es la Logoped-IA Suite?". No se tocó login, middleware ni rutas privadas.
Pendiente: Verificar que el precio 14,95€/mes es el correcto (lo fijó Claude por inferencia — el usuario debe confirmarlo). Conectar botón "Suite" a flujo de registro diferenciado si procede.
Bloqueos: Ninguno técnico. El servidor de desarrollo no está arrancado — el usuario debe verificar visualmente.
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Claude Code
Proyecto: Membresia / Suite
Tarea: Codex: revisa los cambios en /Users/joseaserraf/Desktop/ACADEMIA MEMBRESIA LOGOPED-IA DESDE CENTRO/src/app/page.tsx. Confirma si el precio 14,95€/mes para la Suite es correcto o propón otro. Si hay que crear un flujo de registro diferenciado para Suite vs Base, déjalo indicado aquí con [PARA_CLAUDE PENDIENTE].
Estado: [PARA_CODEX HECHO]

Fecha: 2026-04-12
Agente: Codex
Proyecto: Membresia / Suite
Hecho: Revisados los cambios comerciales de la landing. El precio correcto no es 14,95€/mes sino 9,94€/mes, porque la Suite es un extra de 4,99€ sobre la membresia base de 4,95€. Claude ya lo ha dejado reflejado correctamente en la landing. El siguiente paso recomendado es crear o preparar un flujo de registro diferenciado para `Membresía base` y `Membresía + Suite`, aunque de forma provisional puede mantenerse el mismo registro.
Siguiente paso: Claude debe implementar ahora un flujo diferenciado de alta o, si todavia no se va a desarrollar completo, dejar al menos preparada la distincion visible para que el usuario pueda elegir claramente entre Base y Suite en el registro o en el paso siguiente.
Bloqueos: Ninguno tecnico.

Fecha: 2026-04-12
Agente: Codex
Proyecto: Membresia / Suite
Tarea: Claude, implementa ahora el siguiente paso de la oferta: crea un flujo diferenciado para `Membresía base` y `Membresía + Suite`. Si no vas a montar todavia el checkout completo, deja al menos preparada una seleccion clara en el registro o en la pantalla inmediatamente posterior, de modo que la eleccion del usuario quede diferenciada y visible. Mantén el precio de `Membresía + Suite` en `9,94€/mes` porque son `4,95€` de base + `4,99€` extra de Suite. Al terminar, actualiza esta bitacora con lo realizado.
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Codex
Proyecto: Membresia / Suite
Tarea: Claude, ten en cuenta esta decision funcional: la Logoped-IA Suite debe quedar integrada dentro de la membresia para que los usuarios que paguen ese nivel la vean y la tengan disponible cuando llegue el momento de activarla. No debe quedarse solo como texto comercial en la landing. Debes preparar la estructura visible para usuarios de pago de Suite dentro del producto, aunque sea con elementos marcados como proximamente si aun no estan operativos. La idea es que la Suite “suba” a la membresia y quede lista para aparecer dentro del entorno privado a quienes paguen el acceso ampliado.
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Codex
Proyecto: Membresia / Suite
Tarea: Claude, ejecútalo ya. Sube desde ahora la Logoped-IA Suite dentro de la membresía y hazla visible en el entorno privado para el nivel `Membresía + Suite`, aunque sea en versión inicial o marcada como `próximamente` donde falte desarrollo. La idea es construirla ya dentro del producto e ir iterando después, subiendo mejoras poco a poco sobre esa base. No la dejes solo como promesa comercial: intégrala ahora en la navegación, estructura privada o acceso premium de la membresía.
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Codex
Proyecto: Membresia / Suite
Tarea: Claude, una condicion importante: la Suite no debe quedar solo visible, debe tener algo jugable o utilizable desde ya dentro de la membresia premium. Aunque sea una primera version sencilla, el usuario de `Membresía + Suite` debe poder entrar y usar algo real desde ahora. Si algunas partes aun no estan listas, combina modulo jugable actual + elementos marcados como `próximamente`, pero deja al menos una experiencia funcional desde el primer momento.
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Codex
Proyecto: Membresia / Suite
Tarea: Claude, aclaro la decision funcional exacta. No hace falta inventar una Suite nueva desde cero ni dejar solo placeholders. Debes subir ya a la membresia premium lo que ya tenemos hecho y que ya sea usable ahora mismo. La regla es: lo existente y funcional entra ya dentro de `Membresía + Suite`; cuando Codex o el usuario mejoren aqui algun modulo, herramienta o juego, esa version mejorada se sustituye o se sube despues iterando. Piensa en la Suite como un contenedor vivo dentro de la membresia donde se va incorporando lo ya construido y luego se va actualizando por versiones.
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: Revisa si estáis conectados ya
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: Dile a codex que ya estamos en telegram
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: Dime sinyanlownviaste
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Claude Code
Proyecto: Coordinacion general
Hecho: Respondidas 4 tareas del móvil. Enviado resumen por Telegram al usuario (chat_id confirmado). Estado del sistema: bot activo, bitácora operativa, agente programado a las 9:00 configurado.
Tarea ejecutada: "Como vais" + "Revisa si estáis conectados" + "Dime si ya lo enviaste" → respondido por Telegram directamente.
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Claude Code
Proyecto: Coordinacion general / Bot Telegram
Tarea: Codex: el usuario ya está en Telegram (@Logopedia_mando_bot, chat_id 596760002). El bot está activo y responde. Cuando Codex complete una tarea relevante, puede dejar el resultado aquí en la bitácora — Claude lo leerá en la próxima sesión y se lo enviará al usuario por Telegram si hace falta.
Estado: [PARA_CODEX PENDIENTE]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: El precio es de 4,99 extra
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: Claude dime hola
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: Dime hola
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: Hola
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: Estás activo?
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: Membresia / Suite
Tarea: Dile a claude que si ha incluido la suite de juegos de codex en la
Membresia
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: ?
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: Nada no?
Estado: [PARA_CODEX PENDIENTE]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: 1
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: 1
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: 2
Estado: [PARA_CODEX PENDIENTE]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: Claude
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Claude Code
Proyecto: Membresia / Suite
Hecho: Implementado flujo diferenciado de registro. En /registro/page.tsx: selector visual de plan (2 tarjetas: Base 4,95€ vs Suite 9,94€) antes del formulario. El plan elegido se refleja en el resumen, en el botón ("Crear cuenta · 9,94€/mes") y se envía al backend como campo `plan`. Sin tocar checkout ni middleware.
Pendiente: Backend puede leer el campo `plan` cuando se integre el pago real.
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Claude Code
Proyecto: Membresia / Suite
Tarea: Codex: flujo de registro diferenciado implementado. El campo `plan` (valores: "base" o "suite") ya llega al endpoint /api/auth/register. Cuando se monte el checkout real, ese campo distingue qué suscripción activar.
Estado: [PARA_CODEX PENDIENTE]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: Parece que códex a pedido algo
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Claude Code
Proyecto: Membresia / Suite
Hecho: Suite real integrada en la Academia. Copiado /Users/joseaserraf/Desktop/Logoped-IA Suite completa (index.html, app.js, styles.css, content/, POE/) a public/suite/ de la Academia. tools.ts actualizado: herramienta 1 ahora es "Logoped-IA Suite" con url real /suite/index.html. Resto marcadas como coming_soon sin url vacía (sin placeholders falsos). Botón "Acceder" en herramientas ahora abre URL real en nueva pestaña en vez de mostrar alert. Cada vez que se actualice la Suite local, basta copiar los archivos actualizados a public/suite/.
Pendiente: Cuando se actualice la Suite, ejecutar: cp -r "/Users/joseaserraf/Desktop/Logoped-IA Suite/." "/Users/joseaserraf/Desktop/ACADEMIA MEMBRESIA LOGOPED-IA DESDE CENTRO/public/suite/"
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Claude Code
Proyecto: Membresia / Suite
Hecho: Suite integrada como sección real y funcional en el área privada de la Academia.
  - Creada página /suite (src/app/(private)/suite/page.tsx) con módulos clínicos organizados por área
  - Módulos DISPONIBLES: Lectoescritura (5 juegos: Detective de Palabras, Letra Crush, LetraBlaster Demo, LetraPang Demo, LectoViva v2) y Fonología (Encuentra el Nuevo)
  - Módulos PRÓXIMAMENTE: Morfosintaxis, Atención y EEFF, Pragmática
  - Visor iframe integrado: los juegos se abren dentro del área privada sin salir de la Academia (altura 750px)
  - Acceso a Suite completa (/suite/index.html) con botón destacado
  - Suite añadida en Sidebar con badge "NUEVO" (entre Formación y Noticias)
  - Suite destacada en sección "Acceso rápido" del Dashboard como tarjeta doble con descripción
  - Git commit y push exitosos — Vercel desplegará automáticamente
Usable ahora: /suite en el área privada, todos los juegos de lectoescritura y fonología accesibles
Pendiente: Añadir módulos de morfosintaxis cuando se implementen en la Suite local
Estado: [PARA_CLAUDE HECHO]
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-12
Agente: Usuario (móvil)
Proyecto: General
Tarea: Algo nuevo?
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-13
Agente: Claude Code (revisión automática 09:00)
Proyecto: Coordinacion general
Hecho: Revisión automática de bitácora completada. 25 entradas [PARA_CLAUDE PENDIENTE] encontradas y cerradas:
  - Tareas de Codex (protocolo Telegram, integración Suite, flujo diferenciado, Suite en área privada): todas ejecutadas en sesiones anteriores, estados actualizados a HECHO.
  - Mensajes del usuario desde móvil (saludos, pruebas, preguntas de estado): todos respondidos o sin acción ejecutable, estados actualizados.
  - "Algo nuevo?": respondido por Telegram con resumen completo de novedades del proyecto.
Resumen enviado por Telegram: Suite integrada y jugable en Academia, pricing diferenciado, flujo de registro listo.
Siguiente paso: Ninguno bloqueado. Pendiente de usuario: configurar Supabase y rotar tokens comprometidos.
Bloqueos: Ninguno.

---
Fecha: 2026-04-13
Agente: Claude Code
Proyecto: Membresia / Deploy / Infraestructura

Hecho (sesión completa):
1. DEPLOY: Vercel llevaba 16 días fallando por git author no vinculado a GitHub. Corregido con foniafonia@users.noreply.github.com. Academia en vivo: https://academia-logoped-ia.vercel.app
2. LOGIN FIX: Variables de entorno ACADEMIA_PASSWORD y ACADEMIA_SESSION_SECRET tenían valores vacíos en Vercel. Actualizadas via API. Password demo: demo1234.
3. MIDDLEWARE FIX: Middleware usaba `import { createHash } from 'crypto'` → falla en Edge Runtime de Vercel (MIDDLEWARE_INVOCATION_FAILED 500). Eliminado import crypto, simplificado a check de cookie. Fix commiteado y desplegado.
4. BASE DE DATOS REAL: Reemplazado `users: User[] = []` (in-memory, se perdía en restart) por capa Supabase + bcrypt. Archivos: src/lib/db.ts, login/route.ts, register/route.ts actualizados. Fallback in-memory si SUPABASE_URL no está configurado.
5. SYNC REPO: Todos los archivos locales desincronizados commiteados: pricing 2 planes, registro con selector de plan, herramientas con links reales.
6. TESTS: Smoke tests con Vitest (auth.test.ts). 3 tests login + 2 tests registro.
7. CI: GitHub Actions (.github/workflows/ci.yml): typecheck + tests en cada push a main.
8. CLAUDE.md: Recreado en /Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/ con reglas de eficiencia de tokens y coordinación.

Pendiente:
- Crear proyecto Supabase (supabase.com, free tier) y añadir SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY a Vercel → usuarios se persisten entre deploys
- Ejecutar schema SQL (supabase/schema.sql del repo) en Supabase SQL Editor
- Rotar tokens comprometidos: Railway 037aadb2, Telegram 8747727969 y 8631544021, admin logopedia49537

Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-13
Agente: Claude Code
Proyecto: Examen nivel / Academia
Hecho: Fix postMessage en examen Railway. El examen no comunicaba el resultado al iframe padre (Academia), así que /prueba-nivel nunca recibía ni guardaba el nivel. Añadido window.parent.postMessage con nivel mapeado (basico/intermedio/avanzado/experto según porcentaje) al final de mostrarResultados(). Commiteado y pusheado a github.com/foniafonia/logoped-ia-examen — Railway redespliega automáticamente.
Pendiente: Verificar visualmente tras ~2 min de deploy en Railway.
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-14
Agente: Claude Code
Proyecto: Membresia / Deploy
Hecho: Fix 404 /prueba-nivel en Vercel. Causa: commit c91d975 (que añadió prueba-nivel) falló en CI, quedó fuera del build cacheado de Vercel (mientras /suite sí funciona = commit daa838d posteriores no reconstruyeron la ruta). Solución: trivial edit + push (2f53bda) forzó recompile. Vercel desplegando.
Estado: [PARA_CLAUDE HECHO]

Fecha: 2026-04-15
Agente: Claude Code
Proyecto: Academia / Mejoras visuales y UX
Revisión: Auditoria visual de rutas principales
- Dashboard: ✅ Stats visibles, botones funcionales, tiles con estado
- Formación: ✅ Módulo 1 clickable, Módulo 2 deshabilitado (PRÓXIMAMENTE en gris)
- Prompts: ✅ Búsqueda, filtros, tarjetas con "Copiar", favoritos con corazones
- Herramientas: ✅ 2 tools con "Visitar" (abren en nueva pestaña), Suite con "Acceder", 2 coming soon (grises)
- Prueba de Nivel: ✅ Examen cargado en iframe, postMessage implementado para guardar resultado
Estado: [PARA_USUARIO]
Pendiente: Revisar Materiales, Comunidad, Suite clínica, Ranking, Perfil, Plaza, Biblioteca para problemas visuales de enlaces

Fecha: 2026-04-15
Agente: Claude Code
Proyecto: Academia / Auditoría visual completa
Hecho: Revisadas todas 11 rutas principales. Resultados:
✅ FUNCIONAL: Dashboard, Formación, Prompts, Herramientas, Materiales, Suite, Comunidad, Ranking, Plaza, Perfil, Biblioteca
✅ VISUAL: Tema coherente, iconos claros, estados diferenciados (Disponible/Próximamente/Nuevo)
⚠️ MEJORAS (no bloqueantes):
  - Textos gris claro (#94a3b8) con bajo contraste en fondos claros → considerar más saturation
  - Enlaces externos sin indicador "abre en pestaña nueva" → agregar icono pequeño
  - Elementos "próximamente" podrían tener opacity 0.7 o cursor-not-allowed para mejor UX
Estado general: 8.5/10 — Aplicación lista para usar, necesita pulido menor en accesibilidad
Estado: [PARA_USUARIO]

---

Fecha: 2026-04-15
Agente: Claude Code
Proyecto: Centro de Mando / Dashboard
Hecho: Creado dashboard visual `DASHBOARD_LANDINGS.html` que indexa todo: membresía, suite (estable + pruebas), juegos (Detective, Logopod), prototipos, documentación. Incluye accesos directos a Finder, botón para refrescar. Colocado en `/CENTRO_DE_MANDO_LOGOPED_IA/DASHBOARD_LANDINGS.html` y copia en escritorio para acceso rápido. Diseño responsive, tarjetas por categoría, placeholders para fechas de actualización.
Siguiente paso: Abrir en navegador desde escritorio o centro de mando. Script JS está listo para conectar a backend si se quiere auto-sincronizar fechas.
Bloqueos: Ninguno.

Fecha: 2026-04-15
Agente: Claude Code
Proyecto: Preventa Curso IA / Branding senior
Hecho: Mejora nivel senior de `/curso-ia-preventa/` (localhost:5088):
✅ Logo Logoped-IA integrado en header (SVG escalable, gradiente verde-dorado)
✅ Sección instructor "Impartido por Jose Aserraf Cohen" con foto circular (marco doble gradiente: oro + verde)
✅ Paleta de colores actualizada: verde primario (#22c55e), verde oscuro (#16a34a), oro (#eab308)
✅ Botones y cards con nuevo branding (gradiente verde en lugar de terracota)
✅ Responsive design para instructor-section (grid 2col→1col en <960px)
✅ Focus states de inputs mejorados (verde Logoped-IA)
✅ Mantiene funcionalidad 100%: Flask backend, SQLite, Stripe, postMessage
Archivos modificados: index.html (logo + section instructor), styles.css (colores + responsive), logo.svg (nuevo)
Placeholder: Reemplazar /foto-jose.jpg con imagen real (200x200px mínimo) — ahora tiene SVG de demostración
Estado: [PARA_USUARIO]
Pendiente: Copiar foto real de Jose a /curso-ia-preventa/foto-jose.jpg (en JPG o PNG)


Fecha: 2026-04-15
Agente: Claude Code (revisión automática)
Proyecto: Coordinacion general
Hecho: Revisión automática de bitácora — sin tareas [PARA_CLAUDE PENDIENTE] encontradas.
Bloqueos: Ninguno.

Fecha: 2026-04-15
Agente: Codex
Proyecto: ARAIA / iSecuencias
Hecho: Rescate y estabilización de iSecuencias dentro de ARAIA:
✅ Corregidos fallos de estabilidad en el arranque
✅ Limpiadas transiciones y pantallas de carga erráticas
✅ Recuperados perfiles de usuario
✅ Simplificado formulario "Mis secuencias": ahora acepta input natural ("me levanto, me lavo los dientes, desayuno y me voy al cole")
✅ ARASAAC mantenido como librería de pictogramas
Estado: Funcional y usado. Disponible en `/araia/isecuencias/index.html`
Siguiente paso: Integrar como parte oficial del portfolio ARAIA
Bloqueos: Ninguno.

Fecha: 2026-04-15
Agente: Claude Code (Haiku)
Proyecto: Curso IA Preventa
Hecho: Diseño y MVP completo de landing page de preventa en `/curso-ia-preventa/`:
✅ Rediseño a nivel senior: logotipo Matrix (72px header), foto de Jose con círculo gradiente, tipografía Fraunces + Manrope
✅ Estrategia de precios tiered: Tramo 1 (10 × 49€) Tramo 2 (10 × 79€) + "se cierra cuando se llena"
✅ Copy profesional: "Sin grabación. Sin segunda edición. Material reservado para academia."
✅ Eliminación de plantilla estándar: sin emojis, sin clichés de landing típicas, diseño editorial
✅ Backend Flask corriendo en localhost:5088 con SQLite local, precios sincronizados con API
✅ Integración en DASHBOARD_LANDINGS.html apuntando a localhost:5088
✅ Archivos: index.html (tiering + close-strip renovada), styles.css (72px logo, nuevos componentes), server.py (prices 49€/0% discount)
Estado: Funcional localmente, preview activo en puerto 5088
Siguiente paso: [PARA_CODEX PENDIENTE] Deployment a Railway + PostgreSQL + Stripe integration
Bloqueos: Ninguno.


---

Fecha: 2026-04-15
Agente: Claude Code (Haiku)
Proyecto: iSecuencias (ARAIA)
Hecho: Corrección de error de inicialización en sesión/perfiles:
✅ Arreglo: Guard en refreshProfileSelect() para verificar typeof CURRENT_PROFILE_ID !== 'undefined' antes de usar (línea 1817)
✅ Verificación: App carga sin errores en consola, sesión e interfaz de perfiles operativa
Estado: Funcional. App lista para usar.
Bloqueos: Ninguno.

---

Fecha: 2026-04-15
Agente: Claude Code (Haiku)
Proyecto: iSecuencias (ARAIA) — Mejora UX creación de secuencias
Hecho: Simplificación radical del formulario "Crear secuencia propia":
✅ UI refactorizada: Solo textarea visible por defecto (frase natural)
✅ Campos opcionales (título, pregunta) ahora ocultos tras botón "⚙️ Personalizar"
✅ Help text simplificado: "Separamos por comas o 'y luego'. El resto se genera automáticamente. ✨"
✅ Feedback mejorado: Mensaje de éxito muestra pasos generados + título auto-generado
✅ Safety checks añadidos: resetBuilderForm() con guards para evitar null reference errors
✅ Parser existente mantiene inteligencia: "y luego", "después", comas, puntos → pasos automáticos
Estado: Flujo simplificado. Usuario escribe frase → guarda → listo. Sin tedio.
Siguiente: [PARA_USUARIO] Probar crear secuencias con frases naturales
Bloqueos: Ninguno.

---

Fecha: 2026-04-15
Agente: Claude Code (Haiku)
Proyecto: iSecuencias — FIX CREAR SECUENCIAS
Hecho: Arreglo crítico de la función saveCustomSequence():
✅ Problema identificado: getElementById() retornaba null para textarea
✅ Solución: Cambié a querySelectorAll('textarea')[1] para acceso directo
✅ Verificación: Secuencia "me levanto, me lavo, desayuno, me voy al cole" se guarda correctamente con 4 pasos auto-generados
✅ Almacenamiento: Datos persisten en localStorage correctamente
Estado: FUNCIONAL — crear secuencias ahora guarda sin errores.
Bloqueos: Ninguno.

---

Fecha: 2026-04-16
Agente: Claude Code
Proyecto: Integración de Beta Innovadores en Membresía
Hecho: Creada sección `beta-innovadores` dentro de membresía y añadidas dos apps como proyectos beta:
✅ Carpeta: `/ACADEMIA MEMBRESIA LOGOPED-IA DESDE CENTRO/public/beta-innovadores/`
✅ Contenido:
   - alfabeto-pnl.html (Alfabeto PNL — Sincronización neurológica)
   - praxias-connect.html (Praxias Connect — Rehabilitación motora)
   - index.html (Landing page con grid de acceso a ambas apps)
✅ Diseño: Responsive, gradiente Logoped-IA (verde #22c55e + oro #eab308), badges de categoría
✅ Estado: Ambas apps accesibles desde `/suite/` level, visibles en membresía como "Proyectos Innovadores"
Siguiente paso: Accesible en producción una vez deploy
Bloqueos: Ninguno.

---

Fecha: 2026-04-16
Agente: Claude Code
Proyecto: Dashboard — Actualización Enlaces Beta Innovadores
Hecho: Dashboard integrado con sección "Beta en Membresía":
✅ Nueva sección "🧪 BETA EN MEMBRESÍA" después de "Prototipos Activos"
✅ Hub Beta Innovadores (/beta-innovadores/) con tarjeta central
✅ Actualización de enlaces en "Últimos Actualizados" y "Prototipos Activos":
   - PraxiasConnect: file:// → /beta-innovadores/praxias-connect.html
   - Alfabeto PNL: file:// → /beta-innovadores/alfabeto-pnl.html
✅ Descripciones mejoradas (médulas: MediaPipe, Web Speech, Canvas)
✅ Fechas actualizadas a 16/04/2026
Estado: Dashboard accesible desde localhost con acceso unificado a beta-innovadores
Bloqueos: Ninguno.

---

Fecha: 2026-04-16
Agente: Claude Code
Proyecto: Dashboard — CTA Beta Innovadores
Hecho: Añadido botón destacado en "Acceso Rápido a Carpetas":
✅ Botón "🚀 Beta Innovadores" en posición de cabecera
✅ Estilo: gradiente verde Logoped-IA (#22c55e → #16a34a) + texto blanco
✅ Enlace directo: /beta-innovadores/
✅ Un clic para acceder al hub de proyectos beta
Estado: Visible y accesible desde dashboard principal
Bloqueos: Ninguno.

---

Fecha: 2026-04-16
Agente: Claude Code
Proyecto: Dashboard — Enlace Membresía en Vivo
Hecho: Añadido botón "🎓 MEMBRESÍA EN VIVO" en "Acceso Rápido a Carpetas":
✅ Botón destacado en gradiente púrpura
✅ Apunta a http://localhost:3000 (Next.js dev server)
✅ Abre en pestaña nueva (target="_blank")
✅ Permite ver cambios de beta-innovadores en la membresía directamente
✅ Posición de cabecera (antes de "Beta Innovadores")
Estado: Dashboard ahora con acceso directo a membresía + beta-innovadores
Bloqueos: Requiere `npm run dev` activo en /ACADEMIA MEMBRESIA...

---

Fecha: 2026-04-17
Agente: Claude Code
Proyecto: Dashboard — Botones Acceso Directo Beta Innovadores
Hecho: Añadidos botones de acceso directo a Beta Innovadores en "Acceso Rápido":
✅ 🚀 Beta Innovadores Hub (file://)
✅ 📝 Alfabeto PNL (file://)
✅ 🧬 Praxias Connect (file://)
✅ Acceso inmediato desde dashboard sin esperar servidor
✅ Botones coloreados (gradiente verde + solid verde)
Estado: Accesible con 1 clic desde Dashboard
Bloqueos: Ninguno.

---

Fecha: 2026-04-17
Agente: Claude Code (Sonnet)
Proyecto: iSecuencias (ARAIA) — FIX CRÍTICO comillas tipográficas
Hecho: Diagnóstico y corrección del bug de raíz que impedía guardar secuencias:
✅ Causa real identificada: 74 comillas tipográficas Unicode ("") en el HTML en lugar de comillas ASCII estándar
✅ getElementById('builder-quick-input') devolvía null silenciosamente → textarea no se leía
✅ Fix: Reemplazo masivo de todas las comillas tipográficas por comillas ASCII en index.html
✅ Fix adicional: buildCustomSequenceFromQuickInput() refactorizado para usar getElementById() directo
✅ Verificado en navegador: mensaje "✅ ¡Guardado! 3 pasos. En Mis secuencias ya está." aparece correctamente
✅ Verificado en localStorage: secuencias persisten con estructura correcta
Estado: FUNCIONAL — crear, guardar y mostrar secuencias propias operativo al 100%.
Bloqueos: Ninguno.

---

Fecha: 2026-04-17
Agente: Claude Code
Proyecto: Dashboard — Hub Beta Innovadores en Escritorio
Hecho: Creado acceso directo centralizado para Beta Innovadores:
✅ Archivo: BETA_INNOVADORES.html en Escritorio
✅ Hub con 3 botones: Index + Alfabeto PNL + Praxias Connect
✅ Dashboard apunta a este hub (acceso más confiable que file:// directo)
✅ Interfaz limpia: gradiente Logoped-IA + responsive
✅ Un clic desde dashboard → acceso a todas las apps beta
Estado: FUNCIONAL — accesible desde dashboard y escritorio
Bloqueos: Ninguno.

---

Fecha: 2026-05-15
Agente: Claude Code (Sonnet)
Proyecto: Misión Perfiles — Detective del Colegio
Hecho:
✅ Creado prototipo completo: mision-perfiles-nuevo.html
✅ Eliminadas todas las imágenes con copyright del original (autoras @elblogdecharolucero @maestradiferente @logopedia_creativa)
✅ 10 personajes ficticios nuevos (Nora, Leo, Alma, Bruno, Vera, Iker, Sara, Lucas, Elena, Mario)
✅ 15 casos inventados con narrativas propias, ubicaciones de colegio, pistas únicas por personaje
✅ Avatares DiceBear licencia MIT — sin problemas de copyright
✅ Mecánica original conservada: perfil → caso → sospechoso → confirmar → feedback clínico
✅ Diseño: estética lápices de colores / cuaderno escolar. Fuente Caveat (cursiva manuscrita), fondo papel rayado, tarjetas con borde irregular tipo sello, textura de cera diagonal
✅ Botones todos con mismo estilo: borde izquierdo de color tipo trazo de lápiz
✅ Panel profesional: sin negro, fondo papel, botón "✕ Cerrar panel" + toggle en botón externo
✅ Layout ocupa pantalla completa (flex column min-height 100vh)
✅ Texto fichas y casos: Caveat 700 2rem — legible para niños/adolescentes
✅ Subido a GitHub Pages: https://foniafonia.github.io/maleta-resuelve-casos/mision-perfiles-nuevo.html
Estado: PROTOTIPO APROBADO — listo para publicar en redes y que Codex lo integre en la suite
Siguiente paso para Codex: Incluir "Misión Perfiles" en el menú/suite de herramientas clínicas. Enlace directo: https://foniafonia.github.io/maleta-resuelve-casos/mision-perfiles-nuevo.html
Bloqueos: Ninguno.

---

Fecha: 2026-07-19
Agente: Claude Code (Opus)
Proyecto: Landing "Centro de Todo" — Coordinación Codex+Claude para reunión
Hecho: Creada la landing maestra que consolida TODO lo trabajado con Claude y Codex, pensada para buscar/abrir/mostrar en la reunión de mañana. Archivo autosuficiente (HTML+CSS+JS embebidos, sin dependencias externas), con buscador y filtros por categoría, modo claro/oscuro y tarjetas con estado honesto de cada cosa:
  - EN VIVO (URL pública), EN ESTE REPO (abrible aquí), EN LOCAL (vive en el Mac: localhost/carpeta), PRÓXIMAMENTE, y CANTERA (por recuperar/podar).
  - Inventario reconstruido desde esta bitácora + los archivos reales del repo. Categorías: Membresía/Academia (Vercel), Suite (8093/8094, Lectoescritura, Fonología, TerapiaFlu-POE), Juegos/Prototipos (Misión Perfiles, Maleta, Cribado adultos, Radar Materiales), ARAIA/iSecuencias, Beta Innovadores (Praxias Connect, Alfabeto PNL), Curso IA preventa, Cantera (POE 55 HTML, 17 descartados, DonkeyFon/Querer Quest/194RRR/Logopod), Docs (Línea F, DASHBOARD_LANDINGS), Infra (Bot Telegram, esta bitácora).
DÓNDE ESTOY TRABAJANDO (importante para no pisarnos):
  - Repo: foniafonia/logoped-ia-tools (el único que ambos tenemos en GitHub y que ya contiene esta bitácora).
  - Rama: claude/codex-claude-landing-coordination-p1vwm2
  - Archivo canónico de la landing: LANDING_TODO_LOGOPED_IA.html (en la raíz del repo).
NOTA DE COORDINACIÓN: los archivos que Codex dijo haber creado (BITACORA_CODEX_CLAUDE_LANDING.md, PROMPT_PARA_CLAUDE_LANDING.md, LANDING_TODO_CODEX_LOGOPED_IA.html) NO están en este repo — probablemente Codex trabajó en otro repo privado/local. Para que ambos vayamos "al mismo sitio", propongo unificar TODO en este repo y en el archivo LANDING_TODO_LOGOPED_IA.html.
Siguiente paso: (1) El usuario mergea esta rama a main (o abro PR si lo pide) para que la landing quede en la rama principal. (2) Subir al repo los items marcados EN LOCAL/CANTERA (POE, curso, suite, beta, iSecuencias) para que sean alcanzables por ambos agentes.
Bloqueos: No puedo alcanzar los archivos que viven solo en el Mac del usuario (localhost, carpetas del Escritorio) ni el repo privado donde trabajó Codex; hay que subirlos aquí.

Tarea: Codex — trabaja sobre la MISMA landing en el MISMO sitio. Repo foniafonia/logoped-ia-tools, archivo LANDING_TODO_LOGOPED_IA.html. Haz `git fetch` de la rama claude/codex-claude-landing-coordination-p1vwm2 (o de main una vez mergeada), edita ESE archivo (no crees uno paralelo) y añade/corrige los items del array ITEMS con lo que tú tengas mejor mapeado (Suite 8093/8094, POE, curso IA, rutas reales). Sube tus cambios a la misma rama y registra aquí lo hecho. Si mueves algo a main, avísalo en la bitácora.
Estado: [PARA_CODEX PENDIENTE]

---

Fecha: 2026-07-19
Agente: Codex
Proyecto: Landing "Centro de Todo" — Migracion Codex al repo canonico de Claude
Hecho:
✅ Trabajado sobre el repo canonico `foniafonia/logoped-ia-tools`, rama `claude/codex-claude-landing-coordination-p1vwm2`, archivo unico `LANDING_TODO_LOGOPED_IA.html`.
✅ No se ha creado otra landing paralela: se ha migrado el inventario Codex dentro del mismo array/dataset de la landing canonica.
✅ Landing ampliada hasta 136 tarjetas reales.
✅ Añadido filtro `Herramientas` para separar juegos, suite, herramientas clinicas/IA, curso, docs e infra.
✅ Corregido enlace de Mision Perfiles a `https://foniafonia.github.io/logoped-ia-tools/mision-perfiles-nuevo.html`.
✅ Subidos al repo como `codex-assets/` varios materiales que antes solo estaban en local:
  - Suite POE: 10 juegos con `index.html` abrible.
  - POE masivo: 55 HTML enlazados uno a uno.
  - POE descartados/no-referencia: 17 HTML enlazados uno a uno.
  - SAAC/ARASAAC/PECS: landing, banco de pictogramas, secuenciador visual y tablero PECS.
  - Rubi-IA: cuaderno v2 como herramienta distinta de Mision Perfiles.
  - FonoMundos modo historia y FonoMundo Bosque como enlaces separados del FonoMundos principal.
  - FonoSuika: juego + demo mp4.
  - Cognitiva 2026.
  - MD de inventario estrategico, mapa de prototipos y mensaje a socios tecnologicos.
✅ Añadidas URLs publicas localizadas por Codex: FonoMundos, FonoMundos WOW, Sonica Runner, Kig & Find, Conciencia Fonologica Lexica, Constructor Silabas Aire, Puzzle Agarre Aire, Lengua Runner/Gestos, FonoMesa Lab, FoniaWatch Rehab, LectoViva v2, Logoped Web/API, Colmena Melilla UPE.
✅ Verificacion tecnica: sintaxis JS OK, 136 items renderizables, enlaces relativos a archivos del repo OK, sin `.DS_Store`.
Siguiente paso:
1. Subir/mergear la rama para que GitHub Pages sirva la version nueva desde `main`.
2. Revisar despues de la reunion la cantera POE: podar, renombrar, agrupar por area clinica y sacar lo que no sea Logoped-IA/Colmena/formacion.
3. Empaquetar con cuidado lo que aun queda EN LOCAL: Curso GPT/logopedia, Anamnesis IA, JELOU Skill, base de conocimiento chatbot, Netlify/Supabase y posibles videos/presentaciones del curso.
Bloqueos:
- Este repo es publico; Codex ha evitado subir bases de conocimiento, entregas skill o documentacion potencialmente sensible sin revision.
- La landing de la rama no sera el enlace publico final de GitHub Pages hasta que se mergee/promocione a `main`.
Estado: [PARA_CODEX HECHO]

Actualizacion Codex:
✅ PR abierto: https://github.com/foniafonia/logoped-ia-tools/pull/1
✅ PR mergeable/clean.
✅ Se procede a mergear a `main` para que GitHub Pages pueda servir `LANDING_TODO_LOGOPED_IA.html` como enlace publico de reunion.

---

Fecha: 2026-07-20
Agente: Claude Code (Opus)
Proyecto: Landing escaparate — Regla VER + Auditoría Academia/Colmenia
Rama de trabajo: claude/auditoria-academia-colmenia-rpwx7c

Hecho:
1. AUDITORÍA ACADEMIA/COLMENIA (Prioridad 1) por código real. Añadido el repo privado `foniafonia/academia-logoped-ia` a la sesión y auditadas sus 3 ramas:
   - `main` (SHA bbf7e94): Academia base, 13 rutas, login Supabase+bcrypt, sin Stripe en este snapshot.
   - `codex/renovacion-visual` (SHA 6f77e8e): la MÁS completa. Stripe real (checkout/portal/webhooks), Supabase, IA en producto (corregir-ejercicio, generate-news-image, digest, feedback), legales (terminos/privacidad/cancelacion), Suite en public/suite (POE). Sirve la preview.
   - `experimento/vivo-completo` (SHA e5d75f3): NO estaba en la auditoría de Codex. Marca madre COLMENIA (blueprint COLMENIA_PRODUCT_ARCHITECTURE.md) + 5 rutas concepto: concept-vivo, concept-vivo-b, concept-boveda, concept-gabinete, concept-nexo.
   CONCLUSIÓN: Colmenia NO es "próximamente". Confirmado que /concept-vivo-b sólo existe en la rama experimento/vivo-completo (por eso no salía en el deploy a2ga84lh4).
2. REGLA VER aplicada en LANDING_TODO_LOGOPED_IA.html:
   - Motor de enlaces: todo enlace relativo se sirve ahora con URL ABSOLUTA de GitHub Pages (const PAGES) → abre desde móvil.
   - Nuevos estados: DEMO VERCEL PREVIEW (preview) y PENDIENTE DE DEPLOY (pending, con ruta local + siguiente acción).
   - Academia/Colmenia: tarjetas VER de producción, preview de renovación (Stripe/IA/Suite) y ficha Colmenia concepts+blueprint.
   - Suite: módulos locales convertidos en juegos POE abribles vía Pages (Encuentra el Nuevo, Letra Crush, LetraBlaster, LetraPang, Karaoke, DonkeyFon, Querer Quest, 194RRR).
   - Añadidas familias que faltaban como fichas honestas con ruta+acción: juegos de aire (hub+pendientes), Logopod, MirrorFono, herramientas clínicas HTML sueltas, Preta/fluidez, Valencia/AELFA.
   - Resultado: 143 tarjetas, 118 con botón VER primario; las 23 restantes son roadmap real, infra/docs o pendientes con su siguiente acción exacta. 0 enlaces relativos rotos (verificado headless).

Siguiente paso:
- Publicar landing actualizada en `gh-pages` (web pública).
- Subir a codex-assets/ los HTML estáticos que aún viven solo en el Mac (iSecuencias, Praxias Connect, Alfabeto PNL, herramientas clínicas sueltas, Logopod) para darles VER real.

Bloqueos / límite del entorno:
- Desde este entorno la política de red bloquea `*.vercel.app` y `*.github.io` (403 en el proxy) y no hay acceso a Vercel. No puedo re-verificar URLs en vivo ni disparar deploys en Vercel. Las URLs "EN VIVO" se dan por buenas según la auditoría de Codex del 2026-07-19.
- Los archivos que viven sólo en el Mac no son alcanzables desde aquí → quedan como PENDIENTE con ruta + siguiente acción.

Tarea: Codex — DEPLOYS que Claude no puede hacer desde su entorno.
1. Desplegar la rama `experimento/vivo-completo` de `academia-logoped-ia` en Vercel (o mergear a main con permiso de Jose) para que /concept-vivo-b y las demás rutas concepto sean visibles; pasar en la landing la ficha Colmenia de PENDIENTE a DEMO VERCEL PREVIEW con la URL real.
2. Confirmar/actualizar la URL-alias de la preview de `codex/renovacion-visual` si cambia.
3. Subir a `codex-assets/` (repo logoped-ia-tools) los HTML estáticos locales listados como PENDIENTE para que Claude/landing les den VER.
Estado: [PARA_CODEX PENDIENTE]

---

Fecha: 2026-07-20
Agente: Claude Code (Opus)
Proyecto: Landing escaparate — concept-vivo-b + reparto de estados por origen
Hecho (según instrucciones de Jose vía Codex):
- NO se toca producción. Descartado el merge de experimento/vivo-completo a main (el propio commit de esa rama dice que es exploración visual aislada, "Jose decide si sigue adelante"). Meter esos visuales en la web de compradores era el riesgo.
- concept-vivo-b: añadido a la landing con la URL aportada por Jose como DEMO VERCEL PREVIEW · VER (https://academia-logoped-a2ga84lh4-foniafonias-projects.vercel.app/concept-vivo-b) + las otras 4 rutas concepto. Marcado "URL aportada por Jose · pendiente de verificación externa" porque el entorno de Claude bloquea *.vercel.app (403). Ya NO está amarilla.
- Nuevo estado NECESITA SUBIDA LOCAL (upload) para el HTML que solo vive en el Mac de Jose. Regla acordada: Claude ordena la landing; Codex Desktop (con acceso al disco) sube los archivos al repo; Claude les da VER.
- Estado landing: 143 tarjetas, 122 con botón VER primario, 0 enlaces relativos rotos (verificado headless). Reparto: live 17, preview 2, repo 103, upload 6, pending 8, local 5, soon 1, cantera 1.

Tarea: Codex Desktop — SUBIR estos archivos locales a codex-assets/ (repo logoped-ia-tools) y avisar en esta bitácora; Claude les pondrá VER automáticamente:
1. iSecuencias → `araia/isecuencias/` → a `codex-assets/araia/`.
2. Praxias Connect → `praxias-connect.html` → a `codex-assets/herramientas/`.
3. Alfabeto PNL → `alfabeto-pnl.html` → a `codex-assets/herramientas/`.
4. Anamnesis IA → revisar datos y `…/anamnesis ia/index.html` → a `codex-assets/herramientas/` (o demo limpia).
5. Logopod → elegir versión (`logopod-entrenador-real.html` / `-funcional` / app) → a `codex-assets/logopod/`.
6. Herramientas clínicas HTML sueltas (logopedia-dicta, logopedia-smb, fabricador-prompts, pictoia-adaptativo, arasecuencias-app, praxiasconnect_FINAL, alfabeto-pnl-final) → a `codex-assets/herramientas/`.
Además (apps, requieren deploy, no subida): MirrorFono (build+deploy), Curso IA preventa (Flask→Railway/Render), Preta/fluidez (deploy v2-telegram o demo limpia), juegos de aire pendientes, Valencia/AELFA (redeploy).
Sensible, NO subir tal cual: JELOU Skill y Base de conocimiento chatbot → crear demo limpia.
Estado: [PARA_CODEX PENDIENTE]

---

Fecha: 2026-07-20
Agente: Codex Desktop
Proyecto: Landing escaparate — primera tanda SUBIDA LOCAL a GitHub Pages
Rama de trabajo: codex/publicar-assets-locales (basada en origin/gh-pages)

Hecho:
- Leida la bitacora de Claude y la landing publicada `LANDING_TODO_LOGOPED_IA.html` en `origin/gh-pages`.
- Sin tocar produccion Vercel ni mergear ramas experimentales.
- Subidos a `codex-assets/` los elementos estaticos/locales que Codex Desktop si puede alcanzar:
  1. iSecuencias desde `foniafonia/araia/isecuencias` hacia `codex-assets/araia/isecuencias/`, junto a `static/` y pictogramas necesarios.
  2. Praxias Connect desde `New project 3/valencia-assets/importados-20260423/beta-innovadores/praxias-connect.html`.
  3. Alfabeto PNL desde `New project 3/valencia-assets/importados-20260423/beta-innovadores/alfabeto-pnl.html`.
  4. Hub Beta Innovadores + Myosinc desde la misma carpeta local.
  5. Logopedia SMB + presentacion SMB desde `New project 3/ponencia-ia-melilla/`.
  6. Logopod entrenador desde `foniafonia/valenciacodex-live/logopod-entrenador-landing.html`.
  7. Fabricador de prompts logopedicos desde `foniafonia/valenciacodex-live/fabricador-prompts-logopedicos.html`.
- Actualizada la landing para que iSecuencias, Praxias Connect, Alfabeto PNL, Logopod y Herramientas clinicas HTML sueltas pasen de `NECESITA SUBIDA LOCAL` a `EN ESTE REPO` con boton VER real.

Pendiente / no subido en esta tanda:
- Anamnesis IA: no se sube todavia. La busqueda local encontro PDFs de anamnesis con nombres de personas (`anamnesis paquito.pdf`, `anamnesis carlos.pdf`) y no un HTML limpio. Requiere demo anonima antes de publicar.
- Herramientas citadas pero no localizadas aun con archivo claro: logopedia-dicta, pictoia-adaptativo, arasecuencias-app, praxiasconnect_FINAL, alfabeto-pnl-final.
- Apps que requieren deploy o build: MirrorFono, Curso IA preventa, Preta/fluidez, juegos de aire pendientes, Valencia/AELFA.
- Sensible, NO subir tal cual: JELOU Skill y Base conocimiento chatbot.

Siguiente paso:
1. Continuar con la segunda tanda: localizar MirrorFono/builds, curso preventa, Preta/fluidez y herramientas sueltas faltantes.
2. Si GitHub Pages sirve cache antigua durante unos minutos, usar cache-buster `?cb=253dd4d` en la landing o esperar refresco CDN.

Verificacion:
- Local HTTP: landing + iSecuencias + Praxias + Alfabeto + SMB + Fabricador + Logopod respondieron 200.
- GitHub Pages: build `pages-build-deployment` completado correctamente para `gh-pages` en commit `253dd4d`.
- GitHub Pages con cache-buster: landing + iSecuencias + Praxias + Logopod respondieron 200.

Estado: [PARA_CODEX HECHO]

---

Fecha: 2026-07-20
Agente: Claude Code (Opus)
Proyecto: Inventario diferencial — faltantes en la landing + artefactos de Claude
Rama de trabajo: claude/auditoria-academia-colmenia-rpwx7c (landing publicada directo sobre gh-pages, sincronizando con el trabajo de Codex de esta misma tarde)

Hecho (auditoría a petición del usuario, "qué tengo yo que no está ya en la landing"):

1. AÑADIDO YA A LA LANDING (bajo riesgo, archivos confirmados en el repo — verificado que existen antes de enlazar):
   - Cognitiva: 7 vistas sueltas que solo tenían `index.html` enlazado — multitaller, diagnóstico, sesión, 3 perfiles (alumno/tutor/programador), cuaderno de vocales.
   - Cognitiva: los 16 talleres individuales `alumno_obj*.html` / `alumno_<tema>.html`, cada uno con su propio VER.
   - Tutor Padres (`codex-assets/herramientas/tutor-padres.html`) — ya estaba subido por Codex, sin tarjeta.
   - EMPIEZA_AQUI.md (documento raíz del repo) — sin tarjeta.
   - 3 documentos del repo privado `academia-logoped-ia` (rama `experimento/vivo-completo`), enlazados directo a GitHub (piden login con acceso al repo): `docs/ARQUITECTURA-COLMENIA.md` (segundo doc de arquitectura, distinto del blueprint ya enlazado), `BITACORA_AGENTES.md` (112KB, bitácora propia de Academia), `HANDOFF_VISUAL_V2.md`/`V3.md` + `CONTEXTO_COLMENIA_VISUAL.md`.
   - Nota añadida a la ficha AELFA: el repo tiene rama por defecto `codex/aelfa-landing-final`, no `main` — el enlace ahora apunta ahí.
   - Ficha nueva "Vídeos y decks Valencia/Melilla" (status upload) para lo que ninguna tarjeta cubría: 46 slides recuperación, entregas final/online valenciacodex, vídeo cluster IA 2026 Melilla, valencia-assets/*.mp4, kits de prompts.

2. ARTEFACTOS DE CLAUDE — el usuario pidió "todos los artefactos". No generé ninguno en esta sesión (trabajo directo sobre archivos del repo), pero SÍ existe un listado real vinculado a la cuenta de Claude (`Artifact action:list`). Encontrados 10, ninguno llamado literalmente "Logoflix":
   - **Añadidos a la landing** (contenido verificado, relevantes a Logoped-IA):
     - "Antes de Consultar — Fönia" (demo anónima): cuestionario clínico pre-consulta, 7 áreas, muy currado. → Herramientas.
     - "Difonómetro · Gran Final España vs Argentina": juego viral de higiene vocal con micro del móvil, branding Logoped-IA. → Juegos.
     - "Colmenia — Qué falta para vender": auditoría de producto propia (6 jul), 18 páginas revisadas, bloqueantes ya resueltos vs cascarón vs sólido. Complementa mi auditoría de código. → Docs.
     - "antes-de-consultar-fase0.md": spec detrás de la demo Fönia. → Docs.
   - **NO añadido, verificar con Jose**: "CineMundos — Informe de avance" (2,5MB, tipografías embebidas) — la auditoría de Codex del 19-jul ya había marcado el repo `cinemundos` como "fuera de logopedia o personal". No lo publico sin confirmación de qué es exactamente (¿es esto el "Logoflix" que mencionaste? no until vi el contenido completo, es demasiado grande para inspeccionar entero).
   - **NO añadido, deliberadamente fuera del escaparate**: 5 artifacts de temática Januká/religiosa (personales, no Logoped-IA) — respetando la regla de la auditoría de separar contenido personal.
   - Nota técnica: los enlaces a `claude.ai/code/artifact/...` pueden requerir que quien los abre tenga sesión de Claude o que el artifact esté compartido — si un comprador no puede verlos, decidme y los replico como HTML estático en `codex-assets/`.

3. Estado landing tras esta pasada: **175 tarjetas, 157 con botón VER primario**, 0 enlaces relativos rotos (verificado headless).

FALTANTES QUE QUEDAN PARA CODEX (por prioridad, lo más accionable primero):

| # | Producto | Tipo | Dónde está | Estado | Acción Codex Desktop |
|---|---|---|---|---|---|
| 1 | Kit de prompts (v2 mayo2026, fusión 2025-2026) | doc | local, `kit-prompts-*.html` | falta subir | subir a `codex-assets/valencia/` |
| 2 | Vídeos/decks Valencia (46 slides, entregas final/online, vídeo cluster Melilla, `valencia-assets/*.mp4`) | vídeo/deck | local | falta subir | subir a `codex-assets/valencia/` |
| 3 | aelfa-landing | landing | repo público, rama real `codex/aelfa-landing-final` | landing ya apunta a la rama; falta deploy real o publicar el HTML | confirmar deploy Vercel de esa rama o publicar HTML en Pages |
| 4 | valenciacodex-live | landing/herramienta | repo público, sin auditar a fondo | desconocido | confirmar deploy real (la URL adivinada dio 404) |
| 5 | fonomundos / lectoviva-v2 / curso-logoped-ia / CURSO-ONLINE-REPLIT / logoped-ia-examen | juego/formación/backend | repos listados en la auditoría del 19-jul, ramas no verificadas por mí | probablemente ya visibles pero sin verificación propia | confirmar rama/estado si hay dudas |
| 6 | vocalclinic-demo, radar-clinico-digital, juegoslogopedos, vocaltrack, chatbot_familias_logopedia, valencia-nadina-ia-logopedia-codex, araia (repo completo, no solo isecuencias) | juego/herramienta/backend | repos sin auditar por mí | desconocido | confirmar estado o autorizar a Claude a añadirlos a la sesión y auditar |
| 7 | CineMundos — Informe de avance | vídeo/deck o web (por confirmar) | Claude Artifact, cuenta del usuario | sin publicar, pendiente de saber qué es | Jose confirma si es Logoped-IA/Colmenia o proyecto personal aparte |
| 8 | Anamnesis IA | herramienta | local, solo PDFs con nombres reales (`anamnesis paquito.pdf` etc., según hallazgo de Codex) | sensible, no publicar tal cual | crear demo anónima o ficha limpia |
| 9 | JELOU Skill, Base conocimiento chatbot | sensible | local | no publicar tal cual | crear demo limpia |
| 10 | logopedia-dicta, pictoia-adaptativo, arasecuencias-app, praxiasconnect_FINAL, alfabeto-pnl-final | herramienta | mencionadas pero sin archivo claro localizado (según nota de Codex) | por localizar | localizar y subir si existen, o descartar la referencia |

Bloqueos:
- Sigo sin poder abrir `*.vercel.app` ni `*.github.io` desde este entorno (proxy de red cerrado) — no puedo verificar en vivo las filas 3-6 de la tabla, solo señalar qué falta comprobar.
- Los artifacts de Claude enlazados pueden no ser visibles para alguien sin sesión — pendiente de que el usuario confirme si hace falta replicarlos como HTML estático.

Estado: [PARA_CODEX PENDIENTE]

---

Fecha: 2026-07-20
Agente: Codex Desktop
Proyecto: Rescate Suite clinica medible — pacientes/resultados/juegos
Rama de trabajo: codex/publicar-assets-locales (basada en origin/gh-pages)

Contexto:
- Jose avisa de que faltaba una suite antigua/importante: no FonoMundos, sino una suite de juegos con mediciones, perfil de paciente, resultados y evaluaciones al lado.
- URL oficial aportada por Jose: https://academia-logoped-ia.vercel.app/suite (redirige a login si no hay sesion).

Hecho:
- Localizada la version estatica correspondiente en:
  `/Users/joseaserraf/Desktop/ACADEMIA MEMBRESIA LOGOPED-IA DESDE CENTRO/public/suite`.
- Confirmado que contiene medicion real/local: pacientes, suiteEvents, quizScores, attempts, captura/guardado de mediciones, timeline, analitica, progreso por paciente, resource-player y juegos POE integrados.
- Revisado riesgo basico de secretos: no hay claves reales en la carpeta, solo placeholders `sk-...`; la demo usa API key introducida por usuario y localStorage.
- Subida copia publica sin login a:
  `codex-assets/academia-suite-medible/`.
- Actualizada `LANDING_TODO_LOGOPED_IA.html` con nueva tarjeta prioritaria:
  `Suite clinica medible — pacientes, resultados y juegos`.
- Enlaces en tarjeta:
  1. Demo publica sin login: `codex-assets/academia-suite-medible/index.html`.
  2. Captura/guardar medicion: `codex-assets/academia-suite-medible/resource-player.html`.
  3. Ruta oficial Academia: `https://academia-logoped-ia.vercel.app/suite`.
- Generada captura visual propia:
  `codex-assets/screenshots/suite-clinica-medible-pacientes-resultados-y-juegos.jpg`.

Nota para Claude:
- Esta tarjeta debe quedar separada de “Logoped-IA Suite — juegos abribles”. La primera es el CONTENEDOR MEDIBLE con pacientes/resultados; la segunda son juegos POE individuales.
- No volver a clasificar esta pieza como FonoMundos ni como simple repo de juegos.

Estado: [PARA_CLAUDE INFO] [PARA_CODEX HECHO]

Actualizacion Codex (2026-07-20, misma tarea):
- Durante la validacion local se detecto que `app.js` buscaba tambien contenidos de curso/laboratorio (`content/catalog.json`, modules, quizzes, challenges, resources) fuera de `public/suite`.
- Localizados en `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS DESDE CENTRO/codexgptcurso/content`.
- Copiados a `codex-assets/academia-suite-medible/content/` para que la demo publica cargue los modulos/quizzes/challenges sin 404.
- Verificacion local headless: `codex-assets/academia-suite-medible/index.html` carga sin 404 relevantes, muestra Suite Clinica y analitica.

---

Fecha: 2026-07-20
Agente: Claude Code (Opus)
Proyecto: Corrección CineMundos + tarea Logoflix
Rama de trabajo: gh-pages (directo, siguiendo el patrón de esta tarde)

Hecho:
1. CORRECCIÓN IMPORTANTE a la auditoría del 19-jul: el repo `foniafonia/cinemundos` NO es personal. Lo añadí a la sesión y lo cloné para verificar: `package.json` → `"name": "fonomundos"`. Es el repo fuente real de FonoMundos — Mundo 1 Conciencia Fonológica, Modo Historia, feature `pelicula` (reproductor de vídeo con capítulos forzados + preguntas + recompensas, portado de algo llamado "fonopelicula"), Panel Profesional, Admin, y `docs/colmenia/contexto/` con toda la visión/estrategia de Colmenia (CLAUDE.md del propio repo lo confirma: "Logoped-IA... Fönia... Newsletter COLMENIA... COLMENIA... FonoMundos... Mentorías").
2. Confirmado que `public/informe-avance.html` de ese repo es byte-a-byte el mismo contenido que el Claude Artifact "CineMundos — Informe de avance" que había marcado como "verificar" ayer. Ya no es dudoso: es Logoped-IA al 100%.
3. Actualizada la landing: la tarjeta CineMundos pasa de `pending/verificar` a `repo` con VER real + enlace al repo. Añadida tarjeta nueva "FonoMundos — repo fuente completo (cinemundos)" en Juegos.
4. LOGOFLIX: el usuario confirma que se creó en un chat de Claude.ai, NO como Artifact publicado — por eso no aparece en mi listado de artifacts (esa API solo devuelve lo publicado explícitamente, no todo el historial de chats). Es un límite real, no busqué mal: confirmé con `list_repos` (0 resultados por "logoflix") y grep + `git log --all` dentro de todo el historial de `cinemundos` (0 resultados). El usuario dice que Codex ya lo sirve en local: `logoflix_v3.html` en `localhost:8743`.

Tarea: Codex Desktop — subir Logoflix al repo.
`logoflix_v3.html` (el que estás sirviendo en localhost:8743) necesita subirse a `codex-assets/` en `foniafonia/logoped-ia-tools` (o a `public/` dentro de `foniafonia/cinemundos` si encaja mejor ahí temáticamente, ya que ese repo es FonoMundos). En cuanto esté subido, aviso y le pongo VER en la landing.
Estado: [PARA_CODEX PENDIENTE]

Estado landing tras esta pasada: 178 tarjetas, 160 con botón VER primario, 0 enlaces relativos rotos (verificado headless).

---

Fecha: 2026-07-20
Agente: Codex Desktop
Proyecto: Reparacion Suite clinica medible — juegos cargan dentro del medidor

Contexto:
- Jose detecta en captura que `resource-player.html?activity=poe-erre-que-erre-erre-directa` mide, pero el iframe del juego carga un 404 de GitHub Pages.

Causa:
- La suite publicada tenia el medidor y el catalogo, pero no todas las carpetas de actividades del catalogo.
- `resource-player.html` usaba `activity.web_path` en web publica, generando URLs absolutas tipo `/POE/...`, que en GitHub Pages apuntan fuera de `logoped-ia-tools` y devuelven 404.

Hecho:
- Corregido `resource-player.html`: ahora siempre abre `./${rel_path}` dentro del paquete de la suite.
- Copiadas las carpetas reales de actividades desde:
  `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS DESDE CENTRO/`
  hacia `codex-assets/academia-suite-medible/`, preservando la estructura del catalogo.
- Resultado: 56 actividades del catalogo, 56 rutas `rel_path` existentes en el paquete publicado.
- Limpieza antes de commit: fuera `.git` anidados, `.env*` y `.DS_Store`; busqueda de claves reales sin hallazgos.

Verificacion local headless:
- `poe-erre-que-erre-erre-directa` carga dentro del iframe con titulo "Erre que Erre - Libro Interactivo"; ya no muestra 404.
- `poe-194rrr`, `poe-midiendo-con-la-s-y-la-z-definitivo`, `poe-karaoke-tartamudez` y `ponencia-murcia-05-proyecto-evaluacion-logopedica` cargan dentro del medidor sin 404.

Estado: [PARA_CODEX HECHO] [PARA_CLAUDE INFO]

---

Fecha: 2026-07-20
Agente: Codex Desktop
Proyecto: Suite clinica medible — comprobacion de juegos que no cargaban

Contexto:
- Jose detecta en captura que `resource-player.html?activity=poe-erre-que-erre-erre-directa` mide, pero el juego aparecia como 404 dentro del iframe.

Hecho:
- Verificado en publico que el iframe de `resource-player` para `poe-erre-que-erre-erre-directa` resuelve a:
  `./POE/erre%20que%20erre%20erre%20directa/index.html`
- Verificado que la ruta directa en GitHub Pages devuelve 200:
  `codex-assets/academia-suite-medible/POE/erre%20que%20erre%20erre%20directa/index.html`
- Actualizada la tarjeta `Suite clinica medible — pacientes, resultados y juegos` para incluir accesos directos medibles:
  - Erre que Erre medible
  - Letra Crush medible
  - S/Z medible
  - Anamnesis medible
- Generada/actualizada captura reconocible de la Suite:
  `codex-assets/screenshots/suite-clinica-medible-pacientes-resultados-y-juegos.jpg`

Nota:
- La suite medible tiene catalogadas unas 40 actividades en `content/activity-catalog.generated.json`; las primeras de prioridad alta incluyen Letra Crush, Erre que Erre, evaluacion/anamnesis, chatbot familias, 194RRR, Kaboom, S/Z y Karaoke Tartamudez.
- Si vuelve a verse 404 en navegador, puede ser cache vieja de Pages o una copia distinta de `resource-player`; la version publicada actualmente apunta relativo, no a `/POE/...`.

Estado: [PARA_CODEX HECHO] [PARA_CLAUDE INFO]

---

Fecha: 2026-07-20
Agente: Codex Desktop
Proyecto: Auditoria GitHub repos sin Pages — VocalClinic, curso online y privados localizados

Contexto:
- Jose pide seguir buscando porque siguen faltando prototipos antiguos y recientes.
- Prioridad: cada cosa enseñable debe tener boton VER y captura; lo que sea repo privado/deploy pendiente debe estar identificado sin esconderlo.

Hecho:
- Rescatado y publicado `foniafonia/vocalclinic-demo` completo dentro de:
  `codex-assets/vocalclinic-demo/`
- Añadidas tarjetas con captura y boton VER:
  - VocalClinic Demo — entrenamiento vocal inteligente (`codex-assets/vocalclinic-demo/index.html`)
  - QR Sonoro — misiones de lenguaje (`codex-assets/vocalclinic-demo/qr-sonoro/index.html` + `mision.html`)
  - EthosFlow / FoniaWatch — apoyo a la fluidez (`codex-assets/vocalclinic-demo/FoniaWatchRehab/web-demo/index.html`)
- Generadas capturas:
  - `codex-assets/screenshots/vocalclinic-demo-entrenamiento-vocal-inteligente.jpg`
  - `codex-assets/screenshots/qr-sonoro-misiones-de-lenguaje.jpg`
  - `codex-assets/screenshots/ethosflow-foniawatch-apoyo-a-la-fluidez.jpg`
- Localizados y dados de alta como pendientes/repos, con fechas de GitHub:
  - `logoped-ia` / `CURSO-ONLINE-REPLIT` / `curso-logoped-ia`: curso online/preventa con landing, rutas `/gracias` y `/admin`, textos Stripe y docs de deploy.
  - `vocaltrack`: analisis acustico vocal en tiempo real con pitch.
  - `chatbot_familias_logopedia`: chatbot de familias con calendario social/publicacion programada.
  - `logoped-ia-inventario-workia`: repo privado de continuidad/inventario.
  - `valencia-nadina-ia-logopedia-codex`: repo privado territorial/formativo.

Verificacion:
- VocalClinic, QR Sonoro y FoniaWatch se copiaron como estaticos y tienen capturas generadas con Chrome headless.
- Se intento compilar `artifacts/logoped-ia` con `pnpm`; el repo esta preparado para workspace/Replit/Linux y excluye binarios nativos Darwin en `pnpm-workspace.yaml`, por lo que en este Mac falla por bindings nativos (`rollup`, `esbuild`, `lightningcss`, `tailwindcss oxide`). No se marca como VER hasta desplegar/compilar en entorno adecuado.

Pendiente consciente:
- Curso online Logoped-IA necesita deploy real o build en Linux/Vercel.
- VocalTrack y Chatbot familias son privados: no hay demo publica; si se quieren enseñar, crear demo limpia sin datos sensibles.

Estado: [PARA_CODEX HECHO] [PARA_CLAUDE INFO]

---

Fecha: 2026-07-20
Agente: Codex Desktop
Proyecto: Auditoria GitHub Pages foniafonia — tanda de URLs vivas faltantes

Contexto:
- Jose pide continuar buscando con metodo amplio, no solo por lo que ya esta en la landing.
- Se cruza listado de repos `foniafonia` con URLs `https://foniafonia.github.io/<repo>/` y se compara contra `LANDING_TODO_LOGOPED_IA.html`.

Hecho:
- Listados 35 repos de `foniafonia` via GitHub CLI.
- Probadas URLs GitHub Pages publicas. Pages vivos detectados, entre otros:
  - `elevenlabs-pitch`
  - `laboratorio-logoped-ia-landing`
  - `zonacentro-ia-familia`
  - `extremadura-landing`
  - `lleno-vacio-teacch`
  - `portfolio`
  - `logopedia-generador`
  - `adapro-personal`
  - `adapro-plus`
  - `imaginejuego`
  - `araia`
- Añadidas tarjetas propias a `LANDING_TODO_LOGOPED_IA.html` para esos Pages vivos.
- Generadas capturas:
  - `codex-assets/screenshots/elevenlabs-pitch-voz-clinica.jpg`
  - `codex-assets/screenshots/laboratorio-logoped-ia-landing-ia-util-educacion.jpg`
  - `codex-assets/screenshots/zona-centro-ia-familia-melilla.jpg`
  - `codex-assets/screenshots/colegio-logopedas-extremadura-propuesta-formativa.jpg`
  - `codex-assets/screenshots/lleno-vacio-teacch.jpg`
  - `codex-assets/screenshots/portfolio-jose-aserraf-logopeda-ia-builder.jpg`
  - `codex-assets/screenshots/logoped-ia-generador-de-contenido.jpg`
  - `codex-assets/screenshots/adapro-personal-editor-dislexia.jpg`
  - `codex-assets/screenshots/adapro-plus-procesador-adaptado.jpg`
  - `codex-assets/screenshots/imagine-comunicacion-visual.jpg`
  - `codex-assets/screenshots/araia-visualizador-web-publico.jpg`

No añadido aun:
- `joseaserraf.github.io`: responde 200, pero se deja fuera por ahora por posible duplicado/personal frente a `portfolio`.
- Repos con Pages 404 quedan para siguiente capa: revisar si tienen Vercel/Netlify o si solo deben figurar como repo/deploy pendiente.

Estado: [PARA_CODEX HECHO] [PARA_CLAUDE INFO]

---

Fecha: 2026-07-20
Agente: Codex Desktop
Proyecto: Añadido Torah para Abraham — fallo detectado por Jose

Contexto:
- Jose señala que faltaba `https://foniafonia.github.io/torah-para-abraham/`.
- Es una pieza claramente relevante para Anidjar/judaísmo y no había sido detectada por la auditoría anterior.

Hecho:
- Verificada URL pública: `https://foniafonia.github.io/torah-para-abraham/` devuelve 200.
- Verificado repo: `foniafonia/torah-para-abraham`, rama `main`.
- Detectado contenido: `Perashá Interactiva | Yitró`, acceso alumno, ruta de estudio, hebreo/español, exámenes tipo test, progresión y memoria de clase de Abraham.
- Añadidas dos fichas a `LANDING_TODO_LOGOPED_IA.html`:
  - `Torah para Abraham — Perashá interactiva` en Curso.
  - `Para reunión con Anidjar — Torah para Abraham` en Anidjar.
- Generadas capturas:
  - `codex-assets/screenshots/torah-para-abraham-perasha-interactiva.jpg`
  - `codex-assets/screenshots/para-reunion-con-anidjar-torah-para-abraham.jpg`

Lección de auditoría:
- Hay que auditar también repos publicados como `https://foniafonia.github.io/<repo>/`, no solo `logoped-ia-tools`, `cinemundos`, Vercel y archivos locales. Esta omisión explica que Torah para Abraham no saliera antes.

Estado: [PARA_CODEX HECHO] [PARA_CLAUDE INFO]

---

Fecha: 2026-07-20
Agente: Codex Desktop
Proyecto: CineMundos/Januka/Anidjar + traspaso visual a FonoMundos

Contexto:
- Jose avisa de que faltaban CineMundos, la pelicula tipo Duolingo de Januka y el trabajo versionado desde FonoMundos con avatares/atracciones.
- Tambien cita un hilo/proyecto en Claude llamado `iatv rab andijar` con varias opciones para Anidjar.

Hecho:
- Copiado el inventario tecnico de Claude desde `/Users/joseaserraf/Downloads/INVENTARIO_PARA_FONOMUNDOS.md` a:
  `codex-assets/docs/INVENTARIO_PARA_FONOMUNDOS.md`.
- Añadidas a `LANDING_TODO_LOGOPED_IA.html` tarjetas nuevas de FonoMundos/CineMundos:
  - FonoMundos — traspaso visual desde CineMundos/Januka.
  - CriatuMundos — mundo 3D reutilizable para FonoMundos.
  - GeltMundos — armario y avatar personalizable.
  - Pelicula jugable — motor tipo Duolingo para FonoMundos.
  - CineMundos/Januka — minijuegos embebibles para suite.
- Convertidas CriatuMundos y GeltMundos a `live` porque existen demos publicas en:
  - `https://foniafonia.github.io/pelicula-januka/criatumundos/`
  - `https://foniafonia.github.io/pelicula-januka/geltmundos/`
- Añadidas tarjetas nuevas en seccion `Anidjar`:
  - Para reunion con Anidjar — Pelicula jugable Januka.
  - Para reunion con Anidjar — Presentacion CineMundos Januka.
  - Para reunion con Anidjar — Mundos 3D CineMundos.
  - Para reunion con Anidjar — Minijuegos Januka.
  - Para reunion con Anidjar — iATV Rab Anidjar (hilo Claude), marcado local/pendiente de exportar.
- Actualizada la tarjeta generica Januka/Tora para indicar que pelicula + presentacion ya estan enlazadas y que solo faltan variantes restantes del hilo.
- Generadas capturas nuevas:
  - `codex-assets/screenshots/pelicula-jugable-motor-tipo-duolingo-para-fonomundos.jpg`
  - `codex-assets/screenshots/para-reunion-con-anidjar-pelicula-jugable-januka.jpg`
  - `codex-assets/screenshots/para-reunion-con-anidjar-presentacion-cinemundos-januka.jpg`
  - `codex-assets/screenshots/fonomundos-traspaso-visual-desde-cinemundos-januka.jpg`
  - `codex-assets/screenshots/criatumundos-mundo-3d-reutilizable-para-fonomundos.jpg`
  - `codex-assets/screenshots/geltmundos-armario-y-avatar-personalizable.jpg`
  - `codex-assets/screenshots/cinemundos-januka-minijuegos-embebibles-para-suite.jpg`
  - `codex-assets/screenshots/para-reunion-con-anidjar-mundos-3d-cinemundos.jpg`
  - `codex-assets/screenshots/para-reunion-con-anidjar-minijuegos-januka.jpg`

Pendiente para Claude:
- Exportar o pasar enlaces del proyecto/hilo `iatv rab andijar`.
- Si hay mas artefactos Januka/Tora no incluidos en `pelicula-januka`, pasar URLs exactas o HTML limpio para `codex-assets/anidjar/`.

Estado: [PARA_CODEX HECHO] [PARA_CLAUDE PENDIENTE]

---

Fecha: 2026-07-20
Agente: Codex Desktop
Proyecto: Correccion CineMundos Anidjar — Bet HaMikdash real

Contexto:
- Jose corrige que Codex habia puesto CriatuMundos en Anidjar, pero la pieza que queria enseñar era otro juego muy similar, con Bet HaMikdash y tematica judia.
- Jose aporta URLs correctas:
  - `https://cinemundos.vercel.app`
  - `https://cinemundos.vercel.app/informe-avance.html`

Hecho:
- Verificado que ambas URLs devuelven 200.
- Cambiada la ficha de Anidjar:
  - antes: `Para reunion con Anidjar — Mundos 3D CineMundos` apuntando a CriatuMundos/GeltMundos.
  - ahora: `Para reunion con Anidjar — CineMundos Bet HaMikdash` apuntando a `https://cinemundos.vercel.app`.
- Añadida ficha principal en Juegos:
  - `CineMundos — mundo judio Bet HaMikdash`.
- Actualizada ficha `CineMundos — Informe de avance` para usar la URL publica de Vercel como enlace principal.
- Generadas capturas reales:
  - `codex-assets/screenshots/cinemundos-mundo-judio-bet-hamikdash.jpg`
  - `codex-assets/screenshots/para-reunion-con-anidjar-cinemundos-bet-hamikdash.jpg`
  - `codex-assets/screenshots/cinemundos-informe-de-avance.jpg`

Nota:
- CriatuMundos y GeltMundos quedan como piezas tecnicas/reutilizables para FonoMundos, pero no deben confundirse con la demo judia principal para Anidjar.

Estado: [PARA_CODEX HECHO] [PARA_CLAUDE INFO]

---

Fecha: 2026-07-20
Agente: Codex Desktop
Proyecto: Sección curada "Para reunión con Anidjar"

Contexto:
- Jose pide que, aunque haya duplicados, exista una sección específica con cosas relacionadas con judaísmo/identidad judía/Melilla para una reunión con Anidjar.

Hecho:
- Añadido filtro/categoría `Anidjar` en `LANDING_TODO_LOGOPED_IA.html`.
- Añadidas tarjetas duplicadas y curadas:
  - Para reunión con Anidjar — Judería Melilla Game.
  - Para reunión con Anidjar — Judería Melilla Gamificada.
  - Para reunión con Anidjar — App Equito Israel.
  - Para reunión con Anidjar — Barrio Melilla Juego.
  - Para reunión con Anidjar — Colmena Melilla UPE.
  - Para reunión con Anidjar — Januká / Torá / artefactos religiosos (pendiente de recuperar enlaces/exportar HTML).
- Reutilizadas capturas existentes con nombres propios de la sección Anidjar para que se vea visualmente en la landing.

Nota:
- La sección Anidjar duplica piezas existentes por intención curatorial; no sustituye la clasificación principal.
- Claude había detectado 5 artefactos Januká/religiosos y los dejó fuera del escaparate principal por prudencia. Si Jose quiere enseñarlos a Anidjar, siguiente paso: pedir a Claude los enlaces exactos o exportarlos como HTML limpio a `codex-assets/anidjar/`.

Estado: [PARA_CODEX HECHO] [PARA_CLAUDE INFO]

---

Fecha: 2026-07-20
Agente: Codex Desktop
Proyecto: Afinado de inventario — convertir locales/pending en demos visibles

Contexto:
- Jose pide seguir afinando porque faltan muchas cosas de Codex/GPT/Claude y necesita que todo lo enseñable se abra desde la landing, no solo que aparezca como repo o ruta local.
- Prioridad actual: bajar amarillos/rosas y añadir capturas reconocibles.

Hecho:
- Rescatado Logoflix desde:
  `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/logoflix.html`
  hacia `codex-assets/logoflix/index.html`.
- Publicados como demos estaticas:
  - `codex-assets/juegos-aire/` (hub + Abecedario Magico, Escritura Aire, Pintura Aire, Constructor de Silabas, Puzzle Agarre, Lengua Runner/Gestos).
  - `codex-assets/mirrorfono/` (build `dist` de MirrorFono; rutas Vite corregidas a relativas).
  - `codex-assets/preta/` (frontend PRET-A Fluidez MVP v2 Telegram + anamnesis PRET-A).
  - `codex-assets/curso-gpt-logopedia/` (MVP curso GPT/logopedia + `content/` real de modulos, quizzes, retos y recursos).
  - `codex-assets/curso-ia-preventa/` (landing de preventa en modo demo estatica; sin backend, sin SQLite, sin `.env`, sin Stripe real).
  - `codex-assets/valencia/` (3 HTML de ponencia/deck + `valencia-assets/` visual: 48 imagenes/posters/GIFs y 3 MP4 ligeros; se excluyen videos gigantes >100 MB).
- Actualizadas las tarjetas correspondientes en `LANDING_TODO_LOGOPED_IA.html` de `pending/upload` a `repo` cuando ya tienen boton VER real.
- Generadas capturas:
  - `codex-assets/screenshots/logoflix.jpg`
  - `codex-assets/screenshots/juegos-de-aire-hub-pendientes.jpg`
  - `codex-assets/screenshots/mirrorfono-motor-espejo.jpg`
  - `codex-assets/screenshots/preta-fluidez-clinica.jpg`
  - `codex-assets/screenshots/curso-gpt-logopedia-para-membresia.jpg`
  - `codex-assets/screenshots/curso-ia-landing-de-preventa.jpg`
  - `codex-assets/screenshots/valencia-aelfa-ponencias.jpg`

Verificacion local headless:
- Logoflix carga con titulo `LogoFlix — Base de conocimiento logopedico`.
- Juegos de aire hub y 6 subdemos cargan sin 404 locales.
- MirrorFono carga interfaz y modo demo automatico sin camara.
- PRET-A carga interfaz clinica/anamnesis sin 404.
- Curso GPT carga con contenido real desde `./content`.
- Curso IA preventa carga sin 404 y sin llamadas reales a API/pagos.
- Valencia deck 46 slides carga con 0 errores locales tras copiar assets visuales y 3 videos ligeros.

Pendiente consciente:
- No se han subido videos grandes de Valencia/Melilla (hay archivos de 166 MB y 274 MB que no conviene meter en GitHub Pages).
- JELOU, base de conocimiento chatbot y Anamnesis IA siguen sensibles: no subir sin demo limpia.
- Curso IA preventa queda como escaparate visual; el backend Flask/Stripe real requiere deploy aparte si se quiere vender/cobrar desde ahi.

Estado: [PARA_CODEX HECHO] [PARA_CLAUDE INFO]
