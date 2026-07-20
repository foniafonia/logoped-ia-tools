# 🏠 EMPIEZA AQUÍ — Cuartel General Logoped-IA / Colmenia

**Este es el sitio general. Da igual dónde trabajes (Claude, Codex, un chat, el móvil): todo vive o acaba AQUÍ.**

Repo único: **`foniafonia/logoped-ia-tools`**
Web pública: https://foniafonia.github.io/logoped-ia-tools/EMPIEZA_AQUI.md

---

## 🗺️ El mapa (los 4 sitios que importan)

1. **Escaparate (lo que se enseña a un comprador):**
   `LANDING_TODO_LOGOPED_IA.html` → https://foniafonia.github.io/logoped-ia-tools/LANDING_TODO_LOGOPED_IA.html
2. **Bitácora (qué se ha hecho, quién, siguiente paso):**
   `tmp_bitacora_compartida.md`
3. **Auditoría Codex/GPT:**
   `AUDITORIA_CODEX_GPT_PARA_CLAUDE_2026-07-19.md`
4. **Inventario y mapa de prototipos:**
   `codex-assets/docs/`

---

## ✅ LA REGLA (una sola, para no perderse nunca)

> **Todo lo que yo haga en cualquier sitio termina en `foniafonia/logoped-ia-tools`. Nada se queda solo en local.**

Local (`localhost`, tu Mac) = solo tú y en riesgo de perderse. Si no está en este repo o en un deploy público, **no se puede enseñar y se puede perder.**

---

## 🔌 Cómo entra cada cosa al cuartel general

| Dónde lo haces | Qué haces para que no se pierda |
|---|---|
| **Un chat de Claude** (idea, informe, juego) | Dile: **"publícalo como artefacto"**. Se guarda solo en tu cuenta y Claude lo puede recoger y añadir al escaparate. |
| **Claude Code / Codex** | Al terminar algo: **commit + push** a este repo. |
| **Archivos / demos estáticas (HTML)** | Copiar a `codex-assets/` → salen solas por GitHub Pages como enlace VER. |
| **Apps (Next / Vite / React)** | Se quedan en su repo + su deploy en Vercel. Aquí solo se **enlaza** su URL pública. |
| **Algo con datos sensibles** | NO subir tal cual. Hacer una demo limpia o ficha privada. |

---

## 🚀 El "arranque" — pega esto al empezar CUALQUIER sesión (Claude o Codex)

```
Trabaja siempre contra el repo foniafonia/logoped-ia-tools (mi cuartel general).
Antes de crear algo nuevo suelto, dime dónde va DENTRO de este repo.
Al terminar, sube lo hecho (commit + push) o, si es un chat, publícalo como artefacto.
No dejes nada solo en local. Lee EMPIEZA_AQUI.md y tmp_bitacora_compartida.md antes de empezar.
```

---

## 👮 Quién ordena

- **Claude** es el organizador: consolida lo que llegue al repo en el escaparate y la bitácora.
- Cuando vuelvas de trabajar en otro sitio, dile a Claude: **"consolida lo nuevo"** y él revisa y ordena.
- Si vas a "meterte" en una carpeta o sitio suelto, la respuesta por defecto es: **"no — súbelo al cuartel general."**

---

*Última actualización: 2026-07-19 · Mantienen: Claude + Codex*
