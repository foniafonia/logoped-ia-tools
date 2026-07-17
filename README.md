# logoped-ia — Espacio de trabajo compartido

Repositorio común del proyecto. Todo lo que hacemos (yo y mi socio
tecnológico, con Claude Code y Codex) vive aquí para que ambos lo veamos
siempre actualizado.

## ⚠️ Hay DOS repositorios — no te líes

Para evitar confusiones, cada repo tiene un papel claro:

| Repositorio | Para qué es | Quién lo mira |
|---|---|---|
| **`logoped-ia-tools`** (este) | **Taller de trabajo** del día a día. Aquí se crea y prueba todo. | Yo + los agentes (Claude / Codex) |
| **`logoped-ia-inventario-workia`** (privado) | **Escaparate curado para el socio (Workia)**. Solo lo seleccionado y limpio, sin nada personal ni legal. | El socio tecnológico |

Regla de oro para no perder nada: **se trabaja aquí** (`logoped-ia-tools`)
y, cuando algo está listo para el socio, se copia al repo curado
`logoped-ia-inventario-workia`. Nunca al revés.

## Mapa: dónde va cada cosa

| Carpeta / archivo | Qué contiene |
|---|---|
| **Raíz** (`index.html`, `*.html`) | Las herramientas web de logopedia (se publican con GitHub Pages) |
| `colmenia/` | Todo lo del proyecto **Colmenia** |
| `newsletter/` | Todo lo de la **newsletter** |
| `assets/` | Imágenes y recursos compartidos |
| `tmp_bitacora_compartida.md` | Bitácora de coordinación entre agentes (Claude / Codex) |
| `COMPARTIR_REPO.md` | Guía para compartir y colaborar |

## Reglas básicas

- **Proyecto sí, vida personal no.** Solo se sube trabajo del proyecto.
  Lo personal se guarda en una carpeta `personal/` o `privado/` (el
  `.gitignore` hace que GitHub las ignore y nunca las suba).
- **Subir = commit + push.** Al terminar cada sesión de trabajo se hace
  commit y push para que el otro lo vea.
- **Antes de empezar:** `git pull` para bajar lo último.
- Para cambios grandes, usar una rama y luego un Pull Request.

## Cómo colaborar

Ver `COMPARTIR_REPO.md` para invitar personas, crear una organización y
trabajar en la nube.
