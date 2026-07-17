# Cómo compartir todos tus proyectos con tu socio tecnológico

> Objetivo: que tu socio tenga acceso a **todo** lo que haces en GitHub
> (muchos proyectos) y que ambos podáis trabajar en la nube con Codex y
> Claude sobre el mismo código, sin copias sueltas que se desincronizan.

---

## Resumen rápido (lee esto primero)

| Lo que quieres | Lo que NO debes hacer | Lo que SÍ debes hacer |
|---|---|---|
| Que tu socio vea y edite **todos** tus proyectos | Clonar cada repo a otra cuenta (se crean copias que se desincronizan) | Crear una **Organización** de GitHub y mover ahí tus repos |
| Trabajar los dos a la vez en la nube | Pasaros archivos por WhatsApp/correo | Trabajar sobre el **mismo repo** en la organización |

**Decisión recomendada para tu caso: crear una Organización de GitHub.**
Es una "cuenta compartida" real: metes todos tus proyectos dentro y tu
socio entra una sola vez como miembro. A partir de ahí ve y trabaja en
todo, sin tener que invitarle repo por repo.

---

## Diferencia entre "clonar" y "compartir" (importante)

- **Clonar** = hacer una copia del repo. Si tu socio clona a su cuenta,
  tendrá una copia **separada**. A los pocos días tú y él tendréis
  versiones distintas y os pisaréis el trabajo. **No es lo que quieres.**
- **Compartir/colaborar** = trabajar sobre **el mismo** repo. Los dos
  veis siempre la última versión. **Esto es lo correcto.**

La palabra "clonar" solo se usa para bajar el repo a tu ordenador un
momento; no para compartirlo con alguien.

---

## Opción A (RECOMENDADA): Organización de GitHub

Una Organización es gratis y sirve exactamente para esto: acceso común
de un equipo a muchos proyectos.

### Paso 1. Crear la organización
1. Entra en GitHub con **tu** cuenta.
2. Ve a: https://github.com/organizations/plan → elige el plan **Free**.
3. Ponle un nombre (ej. `foniafonia-team` o el nombre de tu proyecto).
4. Indica que es para una empresa/equipo pequeño y termina.

### Paso 2. Mover tus repos a la organización
Para cada proyecto (incluido `logoped-ia-tools`):
1. Abre el repo → **Settings** (Ajustes).
2. Baja del todo hasta **Danger Zone**.
3. Pulsa **Transfer ownership** (Transferir propiedad).
4. Escribe el nombre de tu **organización** como nuevo dueño y confirma.

> El repo se mueve con todo: historial, ramas, issues. No se pierde nada.
> El enlace antiguo sigue redirigiendo al nuevo, así que no rompe nada.

### Paso 3. Invitar a tu socio
1. En la organización → pestaña **People** (Personas).
2. **Invite member** → pon el usuario o correo de tu socio.
3. Rol recomendado: **Owner** si quieres que gestione todo igual que tú,
   o **Member** con acceso de escritura si prefieres que trabaje pero no
   cambie ajustes de la organización.

Con eso, tu socio ve y edita **todos** los proyectos de la organización.
No hay que invitarle repo por repo nunca más.

---

## Opción B (más simple, pero repo por repo): añadir colaborador

Si de momento solo quieres compartir **este** repo y no crear una
organización todavía:

1. Abre `logoped-ia-tools` → **Settings** → **Collaborators**.
2. **Add people** → usuario o correo de tu socio → rol **Write**.
3. Tu socio recibe una invitación y, al aceptarla, ya puede trabajar.

Limitación: hay que repetirlo en **cada** repo. Por eso, si son muchos
proyectos, la Opción A (Organización) es mejor.

---

## Trabajar "en la nube" una vez compartido

Da igual la herramienta: como trabajáis sobre el **mismo** repo, siempre
veis la última versión. Estas son las tres formas típicas:

1. **Editar en github.com o Codespaces**
   - Codespaces es un entorno de programación en la nube de GitHub.
   - En el repo: botón verde **Code** → pestaña **Codespaces** →
     **Create codespace**. Se abre un editor completo en el navegador.

2. **Agentes Codex y Claude (como esta sesión)**
   - Tu socio, al ser miembro de la organización, puede lanzar sus
     propios agentes sobre los mismos repos.
   - La coordinación entre agentes ya la tenéis montada en
     `tmp_bitacora_compartida.md` (bitácora compartida Codex/Claude).

3. **Publicar las herramientas HTML con GitHub Pages** (opcional)
   - En el repo → **Settings** → **Pages** → activa Pages desde la rama
     `main`. GitHub te da una URL pública para probar las herramientas
     (`index.html`, etc.) sin instalar nada.

---

## Regla de oro para no pisaros el trabajo

Como ambos tocáis el mismo repo:

- Antes de empezar: `git pull` (o "Sync/Pull" en la web) para bajar lo
  último.
- Al terminar: `git commit` + `git push` (o "Commit changes" en la web).
- Usad **ramas** distintas para cambios grandes y luego un **Pull
  Request** para juntarlos, en vez de escribir los dos a la vez en `main`.
- Mantened al día `tmp_bitacora_compartida.md`: es vuestro punto de
  coordinación entre sesiones y entre agentes.

---

## En una frase

Crea una **Organización** de GitHub, **transfiere** tus repos ahí e
**invita** a tu socio como miembro. A partir de ese momento tenéis una
cuenta compartida con acceso a todos los proyectos, y podéis trabajar en
la nube (web, Codespaces, Codex o Claude) sobre el mismo código sin
copias sueltas.
