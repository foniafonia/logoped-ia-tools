# Auditoria Codex/GPT para Claude - Logoped-IA / Colmenia

Fecha: 2026-07-19  
Autor: Codex  
Objetivo: dar a Claude una auditoria honesta de lo trabajado/localizado por Codex/GPT, incluyendo lo ya subido y lo que mi primera consolidacion dejo fuera.

## Resumen honesto

La landing publica actual sirve como primer centro de control, pero NO es todavia el inventario historico completo de Codex/GPT.

Lo que si esta hecho:

- Repo canonico: `https://github.com/foniafonia/logoped-ia-tools`
- Landing publica: `https://foniafonia.github.io/logoped-ia-tools/LANDING_TODO_LOGOPED_IA.html`
- Archivo canonico: `LANDING_TODO_LOGOPED_IA.html`
- Carpeta subida por Codex: `codex-assets/`
- Bitacora compartida: `tmp_bitacora_compartida.md`
- PR ya mergeado: `https://github.com/foniafonia/logoped-ia-tools/pull/1`
- Publicacion real: rama `gh-pages`
- Validacion Codex:
  - `136` tarjetas renderizables.
  - `115` HTML dentro de `codex-assets`.
  - `0` enlaces relativos rotos.
  - URL principal GitHub Pages responde `200`.

Lo flojo de mi primera auditoria:

- Subi bastante cantera, pero no revise visualmente cada juego.
- Me deje fuera muchas familias locales de Codex/GPT: Preta/fluidez, juegos de aire completos, Logopod, MirrorFono, Valencia/ponencias, herramientas clinicas, versiones de Academia/Suite y varios proyectos con `.vercel`.
- No cruce todos los repos/ramas/deploys de Vercel.
- No revise historico completo de chats GPT/Codex ni artefactos no exportados.
- Algunas tarjetas quedaron como repo/local cuando deberian tener enlace publico directo.

Regla para Claude desde ahora:

**Repo = almacen. Landing = escaparate. Cada tarjeta debe tener boton principal para VER el producto/demo/herramienta, no solo GitHub.**

## Fuentes que Claude debe leer primero

En repo canonico:

- `LANDING_TODO_LOGOPED_IA.html`
- `tmp_bitacora_compartida.md`
- `codex-assets/`
- `codex-assets/docs/INVENTARIO_ESTRATEGICO_ACADEMIA_2026.md`
- `codex-assets/docs/MAPA_ACADEMIA_PROTOTIPOS_2026.md`
- `codex-assets/docs/MENSAJE_SOCIOS_TECNOLOGICOS_ACADEMIA.md`

En local, rutas grandes de Codex/GPT:

- `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS`
- `/Users/joseaserraf/Desktop/ACADEMIA MEMBRESIA LOGOPED-IA DESDE CENTRO`
- `/Users/joseaserraf/Documents/FONOMUNDOS PARA CLAUDE`
- `/Users/joseaserraf/Desktop/poe masivo`
- `/Users/joseaserraf/Desktop/Logoped-IA Suite Membresia`
- `/Users/joseaserraf/Desktop/Logoped-IA Suite Pruebas`
- `/Users/joseaserraf/Desktop/codex_backup/worktrees`
- `/Users/joseaserraf/Documents/New project 6`

No publicar sin revisar:

- bases de conocimiento privadas,
- facturas,
- claves/API keys,
- entregas skill con posible configuracion sensible,
- documentos clinicos/personales,
- carpetas de subvencion/asesoria,
- contenidos personales fuera de Logoped-IA.

## Ya publicado o visible con URL 200

Comprobado con `curl` el 2026-07-19:

- Academia actual: `https://academia-logoped-ia.vercel.app` - 200
- Academia/Colmenia renovacion visual: `https://academia-logoped-ia-git-codex-renov-139c35-foniafonias-projects.vercel.app/` - 200
- FonoMundos: `https://fonomundos.vercel.app` - 200
- FonoMundos WOW: `https://fonomundos-wow-public.vercel.app` - 200
- Sonica Runner: `https://sonica-runner.vercel.app` - 200
- Kig & Find: `https://kig-find-interactivo.vercel.app` - 200
- Conciencia fonologica lexica: `https://conciencia-fonologica-lexica-juego.vercel.app` - 200
- Constructor Silabas Aire: `https://constructor-silabas-aire.vercel.app` - 200
- Puzzle Agarre Aire: `https://puzzle-agarre-aire.vercel.app` - 200
- Logopedizado Gestos / Lengua Runner: `https://logopedizado-gestos-juego.vercel.app` - 200
- FonoMesa Lab: `https://fonomesa-lab.vercel.app` - 200
- FoniaWatch Rehab Demo: `https://foniawatch-rehab-demo.vercel.app` - 200
- LectoViva v2: `https://foniafonia.github.io/lectoviva-v2/` - 200
- Landing maestra: `https://foniafonia.github.io/logoped-ia-tools/LANDING_TODO_LOGOPED_IA.html` - 200

URLs que NO se deben dar por buenas sin buscar deploy real:

- `https://lectoviva-v2.vercel.app` - 404; usar GitHub Pages.
- `https://valenciacodex-live.vercel.app` - 404.
- `https://aelfa-landing.vercel.app` - 404.
- `https://elevenlabs-pitch.vercel.app` - 404.
- `https://laboratorio-logoped-ia-landing.vercel.app` - 404.

## Lo ya subido por Codex a GitHub Pages

Base publica:

`https://foniafonia.github.io/logoped-ia-tools/`

Rutas subidas:

- `codex-assets/suite-poe/` - 10 juegos Suite POE.
- `codex-assets/poe-masivo/` - 55 HTML.
- `codex-assets/poe-descartados/` - 17 HTML.
- `codex-assets/saac/` - SAAC/ARASAAC/PECS.
- `codex-assets/rubi-ia/` - Rubi-IA v2.
- `codex-assets/fonomundos/modo-historia.html` - FonoMundos modo historia.
- `codex-assets/fonomundos/fonomundo-bosque/index.html` - FonoMundo Bosque.
- `codex-assets/fonosuika/index.html` y `codex-assets/fonosuika/demo.mp4`.
- `codex-assets/cognitiva/index.html` y talleres.
- `codex-assets/docs/` - inventarios y mensaje socios.

Regla para Claude:

Si una tarjeta apunta a `codex-assets/...`, el boton principal debe usar URL absoluta de GitHub Pages:

`https://foniafonia.github.io/logoped-ia-tools/codex-assets/RUTA`

No basta con poner repo.

## Academia / Colmenia - evidencia real

Repo GitHub:

- `https://github.com/foniafonia/academia-logoped-ia`
- Visibilidad: privada.
- Homepage GitHub: `https://academia-logoped-ia.vercel.app`

Ramas confirmadas por GitHub:

- `main` - SHA `bbf7e94c973007bdf16d70c0e9777b615a2b356c`
- `codex/renovacion-visual` - SHA `6f77e8e53eaf89c96cfff9ebb503fc137717a2a3`

Deploys/URLs conocidas:

- Produccion: `https://academia-logoped-ia.vercel.app`
- Preview renovacion visual: `https://academia-logoped-ia-git-codex-renov-139c35-foniafonias-projects.vercel.app/`

Dependencias confirmadas en `package.json`, tanto main como `codex/renovacion-visual`:

- `next` 16.1.7
- `react` 19.2.3
- `stripe` ^20.4.1
- `@stripe/stripe-js` ^8.10.0
- `@supabase/supabase-js`
- `@supabase/ssr`
- `bcryptjs`
- `openai`
- `@anthropic-ai/sdk`
- `recharts`
- `resend` aparece en `codex/renovacion-visual`

Rutas relevantes confirmadas en rama `codex/renovacion-visual`:

- `src/app/api/stripe/checkout/route.ts`
- `src/app/api/stripe/portal/route.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `src/lib/stripe.ts`
- `src/app/registro/page.tsx`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/(private)/dashboard/page.tsx`
- `src/app/(private)/suite/page.tsx`
- `public/suite/index.html`
- `public/suite/resource-player.html`
- `public/suite/POE/...`
- `supabase/schema.sql`

Conclusion para Claude:

No marcar Colmenia/Academia como `PROX.`. Hay al menos dos versiones usables y una rama con Stripe/Supabase/IA integrado en codigo. Falta verificar flujo real de checkout con entorno Vercel, pero no es "solo idea".

## Vercel local - proyectos vinculados detectados

Team/org local:

- `team_QTrCNfkgPZhw633br3FxAsaG`

Detectados desde `.vercel/project.json`:

- Academia membresia: `/Users/joseaserraf/Desktop/ACADEMIA MEMBRESIA LOGOPED-IA DESDE CENTRO`
  - projectId `prj_R3RGKqsttmGAybdEgD3dNiTaGVBN`
- Conciencia fonologica lexica:
  - projectId `prj_ZS8cL8eOlRuhL4A5s3wbuPzJKMQN`
- Constructor silabas aire:
  - projectId `prj_5xnm0DDHMfBsIKpxidjzWbtSgRCB`
- Deploy juegos aire:
  - projectId `prj_F6GwzYKbmSJBD60GMu8i44IBotv2`
- Fonia fluidez Telegram cloud:
  - projectId `prj_XJK4mNPa8gADfG9KaKOfXgwZ82Sp`
- FonoMesa Lab:
  - projectId `prj_RvzbEKWjXxztDF97BlftTLoDh3Qe`
- Kig & Find:
  - projectId `prj_uF1MZjYTyc6LPl1ToBtbnEjNlaRv`
- Logopedizado gestos:
  - projectId `prj_ZncOPps1heT3kla5oZukm3HpBRcl`
- Preta fluidez MVP v2 Telegram:
  - projectId `prj_hJehCSiHdehrtTAEEnTKFLhgw4FM`
- Puzzle agarre aire:
  - projectId `prj_WsRqKV0UoFi8dP8IQzZFCB0E9feM`
- FoniaWatch Rehab web demo:
  - projectId `prj_NvofyAXeXciIiYuy2pxZQumgdkqy`
- FonoMundos WOW public:
  - projectId `prj_mmQNgucUBO4uw5caspbutJTP95U7`

Nota: el conector Vercel fallo al listar proyectos con este teamId. Claude debe intentar de nuevo con Vercel/CLI y no inventar URLs por nombre de carpeta.

## GitHub - repos relevantes detectados

Repos Logoped-IA/Colmenia/Codex/GPT:

- `logoped-ia-tools` - publico - Pages actual.
- `logoped-ia-inventario-workia` - privado - inventario previo Codex/Workia.
- `academia-logoped-ia` - privado - Academia/Colmenia.
- `fonomundos` - publico - homepage `https://fonomundos.vercel.app`.
- `fonomesa-lab` - privado.
- `sonica-runner` - privado.
- `vocalclinic-demo` - publico.
- `elevenlabs-pitch` - publico.
- `laboratorio-logoped-ia-landing` - publico.
- `curso-logoped-ia` - privado.
- `CURSO-ONLINE-REPLIT` - publico.
- `aelfa-landing` - publico, default branch `codex/aelfa-landing-final`.
- `valenciacodex-live` - publico.
- `logoped-ia` - publico.
- `zonacentro-ia-familia` - publico.
- `extremadura-landing` - publico.
- `lleno-vacio-teacch` - publico.
- `portfolio` - publico.
- `logopedia-generador` - publico.
- `araia` - publico.
- `adapro-personal` - publico.
- `adapro-plus` - publico.
- `logoped-ia-examen` - publico.
- `lectoviva-v2` - publico.
- `vocaltrack` - privado.
- `valencia-nadina-ia-logopedia-codex` - privado.
- `chatbot_familias_logopedia` - privado.
- `radar-clinico-digital` - publico.
- `juegoslogopedos` - privado.

Fuera de logopedia o personal, separar:

- `cinemundos`
- `pelicula-januka`
- `torah-para-abraham`
- `bundeskosher-site`
- `hilula-kolel-kol-yaakov`

## Nuevos bloques locales que faltan o necesitan auditoria fuerte

### 1. Fluidez / Preta / voz

Rutas:

- `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/fluidez-clinica-lab`
- `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/fonia-fluidez-telegram-cloud`
- `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/preta-fluidez-clinica-local`
- `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/preta-fluidez-mvp`
- `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/preta-fluidez-mvp-v1`
- `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/preta-fluidez-mvp-v2`
- `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/preta-fluidez-mvp-v2-telegram`
- `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/preta-fluidez-mvp-v3-android`
- `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/preta-motor-beta`
- `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/karaoke-tartamudez`
- `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/vocalclinic-demo`

Estado:

- Algunas tienen `.vercel`.
- Algunas tienen `README`, `MODO_SEGURO`, `RIESGOS_NEUTRALIZADOS`.
- Falta publicar/actualizar botones de demo.

Tarea Claude:

- Auditar cual es la version principal.
- Sacar deploy real de `preta-fluidez-mvp-v2-telegram`.
- Separar demo clinica, Telegram cloud, local backend y Android roadmap.

### 2. Juegos de aire y motores de gesto

Rutas:

- `deploy-juegos-aire`
- `abecedario-magico`
- `baloncesto-tiro-aire`
- `constructor-silabas-aire`
- `escritura-aire-rotulador`
- `pintura-aire-colores`
- `puzzle-agarre-aire`
- `logopedizado-gestos-juego`
- `tiro-real-baloncesto-enrique-soler`
- `juegos-aire.html`

Estado:

- Ya hay URLs 200 para constructor, puzzle y logopedizado.
- `deploy-juegos-aire` tiene `.vercel` y probablemente hub.
- Faltan botones para abecedario, escritura, pintura, baloncesto/tiro y hub.

### 3. Logopod

Rutas:

- `logopod-entrenador-app`
- `logopod-app.html`
- `logopod-entrenador-funcional.html`
- `logopod-entrenador-landing.html`
- `logopod-entrenador-real.html`
- versiones dentro de `valenciacodex-live/`

Estado:

- No estaba suficientemente recogido en landing.
- Debe pasar a herramienta/juego con demo o pendiente de publicar.

### 4. MirrorFono / motor espejo

Rutas:

- `mirrorfono-game`
- contiene `dist`, `public`, `src`, `README.md`, `index.html`

Estado:

- No estaba en mi primera landing.
- Candidato claro a juego/herramienta clinica.

### 5. Herramientas clinicas sueltas

Rutas/archivos:

- `herramientas-clinicas/logopedia-dicta.html`
- `herramientas-clinicas/logopedia-landing.html`
- `herramientas-clinicas/logopedia-smb.html`
- `logopedia-dicta.html`
- `logopedia-landing.html`
- `logopedia-smb.html`
- `fabricador-prompts-logopedicos.html`
- `analizador-materiales-landing.html`
- `radar-materiales-landing.html`
- `pictoia-adaptativo.html`
- `arasecuencias-app.html`
- `lleno-vacio-teacch.html`
- `praxiasconnect_FINAL.html`
- `alfabeto-pnl-final.html`

Estado:

- Algunas estan en la landing, pero no todas.
- Muchas son HTML estatico: subir a GitHub Pages o `codex-assets/herramientas/`.

### 6. FonoMundos y video

Rutas locales:

- `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/fonomundos`
- `/Users/joseaserraf/Documents/FONOMUNDOS PARA CLAUDE/fonomundos-wow-public`
- `/Users/joseaserraf/Documents/FONOMUNDOS PARA CLAUDE/fonomundos-clips-juego-limpios-2026-06-05`
- `/Users/joseaserraf/Documents/FONOMUNDOS PARA CLAUDE/fonomundos-clips-para-editor-2026-06-05`
- `/Users/joseaserraf/Documents/FONOMUNDOS PARA CLAUDE/promos-fonomundos-2026-06-04`
- `/Users/joseaserraf/Documents/FONOMUNDOS PARA CLAUDE/promos-fonomundos-2026-06-30`
- `/Users/joseaserraf/Documents/FONOMUNDOS PARA CLAUDE/fonomundos-wow-public/fonomundos-wow.mp4`
- `/Users/joseaserraf/Documents/FONOMUNDOS PARA CLAUDE/fonomundos-wow-public/fonomundos-jose-epico.mp4`
- `/Users/joseaserraf/Documents/FONOMUNDOS PARA CLAUDE/OpenMontage`
- `/Users/joseaserraf/Documents/FONOMUNDOS PARA CLAUDE/COLMENIA BY LOGOPED-IA/README_COLMENIA_CORE_MVP.md`

Estado:

- FonoMundos base y WOW estan online.
- Modo historia y Bosque estan copiados a `codex-assets`.
- Videos de FonoMundos no estan bien enlazados como archivos directos en landing; hay que subir o linkar los MP4 correctos.

### 7. Curso, formacion, ponencias, negocio

Rutas/repos:

- `/Users/joseaserraf/Desktop/TODO PROYECTO LOGOPED IA VICTOR Y DEMAS/curso-ia-preventa`
- repo privado `curso-logoped-ia`
- repo publico `CURSO-ONLINE-REPLIT`
- repo publico `aelfa-landing`
- repo publico `valenciacodex-live`
- repo privado `valencia-nadina-ia-logopedia-codex`
- `valenciacodex-live/`
- `valencia-nadina-ia-logopedia-codex/`
- `valenciacodex-ia-logopedia-final-20260423.html`
- `valenciacodex-ia-logopedia-online-entrega-20260423.html`
- `valenciacodex-46slides-recuperacion.html`
- `valencia-assets/*.mp4`
- `video cluster ia 2026 melilla.mp4`
- `kit-prompts-v2-mayo2026.html`
- `kit-prompts-2025-2026-fusion.html`
- `CANDIDATURA_CONSULTOR_IA_ED_SUPERIOR/`
- `elevenlabs-pitch`
- `laboratorio-logoped-ia-landing`

Estado:

- Varias URLs guessed dieron 404; buscar deploy real o publicar por Pages.
- Es una familia grande de formacion/difusion que debe tener caja propia.
- No mezclar con juegos clinicos.

### 8. JELOU skill / chatbot familias / agentes

Rutas/repos:

- `ENTREGA_JELOU_SKILL_LOGOPEDIA_20260423/`
- `agente-logopedia`
- `agente-presencia-local`
- `agent-bridge`
- repo privado `chatbot_familias_logopedia`
- `BASE_CONOCIMIENTO_LOGOPEDIA_CHATBOT` en Escritorio (detectado antes por Codex)

Estado:

- Muy importante para producto IA, pero potencialmente sensible.
- No subir directamente a repo publico sin revision.
- Crear demo limpia o ficha privada.

### 9. Suite y worktrees Codex

Rutas:

- `/Users/joseaserraf/Desktop/Logoped-IA Suite Membresia`
- `/Users/joseaserraf/Desktop/Logoped-IA Suite Pruebas`
- `/Users/joseaserraf/Desktop/ACADEMIA MEMBRESIA LOGOPED-IA DESDE CENTRO/public/suite`
- `/Users/joseaserraf/Desktop/codex_backup/worktrees/*/academia-renovacion-visual/public/suite/POE`
- `/Users/joseaserraf/dev-worktrees/academia-renovacion-visual/public/suite/POE`
- `/Users/joseaserraf/Developer/ACADEMIA-MEMBRESIA-LOGOPED-IA*/public/suite/POE`

Estado:

- Hay muchas copias de `academia-renovacion-visual`.
- Codex subio 10 juegos Suite POE a `codex-assets/suite-poe`, pero puede haber mas en worktrees.
- Dedupe necesario por checksum/nombre.

## Instrucciones concretas para Claude

1. No rehacer una landing nueva si no hace falta. Trabajar sobre:
   - repo `foniafonia/logoped-ia-tools`,
   - `LANDING_TODO_LOGOPED_IA.html`,
   - `tmp_bitacora_compartida.md`,
   - rama `gh-pages` si se quiere publicar.

2. Convertir tarjetas de repo/local en tarjetas demostrables:
   - Si es HTML estatico, subir/copiar a `codex-assets/...` y crear URL GitHub Pages.
   - Si es Next/Vite/React, buscar deploy Vercel real o desplegar.
   - Si requiere backend, revisar Railway/Vercel API/Supabase.
   - Si contiene datos sensibles, crear demo limpia.

3. Para cada tarjeta usar campos minimos:
   - nombre,
   - que es,
   - boton principal `VER`,
   - repo como secundario,
   - ruta local si existe,
   - rama/commit/deploy si aplica,
   - estado real,
   - `Stripe/Supabase/login/IA/backend/video/datos clinicos`,
   - pendiente concreto.

4. Prioridad de auditoria:
   - Academia/Colmenia.
   - FonoMundos + videos.
   - Fluidez/Preta/FoniaWatch.
   - Juegos de aire.
   - Logopod/MirrorFono.
   - Herramientas clinicas HTML.
   - Curso/formacion/Valencia/AELFA.
   - JELOU/chatbot/agentes.
   - Cantera POE y descartados.

5. No borrar nada aun.
   - Lo dudoso va a `CANTERA / PENDIENTE DE AUDITORIA`.
   - Lo personal o fuera de Logoped-IA se separa, no se mezcla con escaparate comprador.

## Prompt corto para pegarle a Claude

Claude, lee este MD como auditoria Codex/GPT. Mi primera landing fue util pero incompleta. A partir de ahora no quiero tarjetas con solo repo: cada cosa debe tener enlace principal para VER demo/juego/herramienta/video/doc desde movil u ordenador.

Trabaja sobre `foniafonia/logoped-ia-tools`, `LANDING_TODO_LOGOPED_IA.html`, `tmp_bitacora_compartida.md` y `codex-assets/`. Revisa tambien las rutas locales indicadas aqui.

Empieza por Academia/Colmenia: repo privado `foniafonia/academia-logoped-ia`, ramas `main` y `codex/renovacion-visual`, URLs `https://academia-logoped-ia.vercel.app` y `https://academia-logoped-ia-git-codex-renov-139c35-foniafonias-projects.vercel.app/`. Confirmar flujo real Stripe/Supabase/login/dashboard/suite, porque no es `PROX.`.

Luego rescata lo que Codex dejo fuera: Preta/fluidez, juegos aire, Logopod, MirrorFono, herramientas clinicas, Valencia/ponencias, curso IA, videos FonoMundos, JELOU/chatbot/agentes y worktrees de Suite.

No inventes URLs. Si una URL da 404, buscar deploy real o marcar `PENDIENTE DE PUBLICAR`. Si algo esta en local y es enseñable, subirlo/publicarlo. Si puede contener datos sensibles, crear demo limpia.

Objetivo: landing escaparate para comprador, no inventario tecnico.
