# CLAUDE.md — Reglas del cuartel general Logoped-IA / Colmenia

**Este repo (`foniafonia/logoped-ia-tools`) es el CUARTEL GENERAL. Todo lo del ecosistema Logoped-IA/Colmenia vive o acaba aquí.**

## Antes de empezar (siempre)
1. Lee `EMPIEZA_AQUI.md` y `tmp_bitacora_compartida.md`.
2. No crees cosas nuevas sueltas fuera del repo sin decir dónde van dentro de él.

## La regla de oro
> Todo lo que se haga en cualquier sitio termina en `foniafonia/logoped-ia-tools`. Nada se queda solo en local. Local (`localhost`, Mac) = invisible y en riesgo de perderse.

## Cómo entra cada cosa
- **Chat de Claude** (idea/informe/juego): publícalo como **artefacto** (se guarda solo) y avísalo en la bitácora.
- **Claude Code / Codex**: al terminar algo, **commit + push** a este repo.
- **Demos estáticas (HTML)**: copiar a `codex-assets/` → GitHub Pages da su URL pública (VER).
- **Apps (Next/Vite/React)**: quedan en su repo + deploy Vercel; aquí solo se **enlaza** la URL pública.
- **Datos sensibles** (claves, facturas, clínicos, personales): NO subir tal cual; demo limpia o ficha privada.

## Escaparate y orden
- El escaparate para enseñar producto es `LANDING_TODO_LOGOPED_IA.html` (panel de demostración: cada tarjeta con botón **VER**; el repo es enlace secundario).
- Al terminar trabajo relevante, registra en `tmp_bitacora_compartida.md`: Hecho / Siguiente paso / Bloqueos.
- No inventar URLs: si un deploy da 404, buscar el real o marcar **PENDIENTE DE PUBLICAR** con el plan.

## Coordinación
- Claude es el organizador: consolida lo que llegue al repo en el escaparate y la bitácora.
- Codex y Claude comparten `tmp_bitacora_compartida.md` como memoria común.
