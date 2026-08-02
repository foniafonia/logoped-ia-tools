#!/bin/bash
# =====================================================================
#  02_migrar_proyectos.sh
#  Saca los PROYECTOS DE PROGRAMACION de iCloud y los deja en ~/Dev
# =====================================================================
#  POR QUE ESTO Y NO "LIMPIAR node_modules CADA NOCHE":
#  Si borras node_modules pero el proyecto sigue dentro de iCloud, el
#  siguiente 'npm install' vuelve a crear 30.000 ficheros dentro de
#  iCloud y estas igual que al principio. Sacando el proyecto entero a
#  ~/Dev (que iCloud NO sincroniza), el problema se resuelve una vez.
#  El codigo no pierde respaldo: su respaldo es GitHub.
#
#  SEGURIDAD:
#   - Por defecto SIMULA. No toca nada hasta que pongas DRY_RUN=0.
#   - MUEVE, nunca borra. Si te equivocas, se deshace moviendo de vuelta.
#   - Se niega a mover un proyecto con cambios sin guardar en git.
#   - Se niega a mover un proyecto sin copia en GitHub.
#   - Se niega a mover si iCloud esta trabajando fuerte.
#   - Deja un manifiesto con TODO lo que ha movido y de donde.
#
#  USO:
#     bash 02_migrar_proyectos.sh              <- simulacion (seguro)
#     DRY_RUN=0 bash 02_migrar_proyectos.sh    <- mueve de verdad
#     DRY_RUN=0 MAX_MOVES=1 bash 02_migrar_proyectos.sh   <- solo uno
# =====================================================================

set -uo pipefail

DRY_RUN="${DRY_RUN:-1}"
MAX_MOVES="${MAX_MOVES:-3}"
CPU_LIMITE="${CPU_LIMITE:-30}"

ICLOUD="$HOME/Library/Mobile Documents/com~apple~CloudDocs"
DESTINO="$HOME/Dev"
BASE="$HOME/Documents/LIMPIEZA Y OPERATIVIDAD DEL MAC"
MANIFIESTO="$BASE/MANIFIESTO_MIGRACION.md"
mkdir -p "$BASE" 2>/dev/null

echo ""
echo "====================================================================="
if [ "$DRY_RUN" = "0" ]; then
  echo "   MODO REAL  --  se van a mover hasta $MAX_MOVES proyecto(s)"
else
  echo "   MODO SIMULACION  --  NO SE VA A TOCAR NADA"
  echo "   (para mover de verdad:  DRY_RUN=0 bash 02_migrar_proyectos.sh)"
fi
echo "====================================================================="

# ---------------------------------------------------------------------
# GUARDIAN 1: iCloud tiene que estar tranquilo
# ---------------------------------------------------------------------
echo ""
echo ">> Comprobando que iCloud esta tranquilo..."
BLOQUEADO=0
for PROC in fileproviderd bird cloudd; do
  CPU="$(ps -Axo pcpu,comm 2>/dev/null | awk -v p="$PROC" '$2 ~ p"$" {s+=$1} END {printf "%.0f", s+0}')"
  echo "   $PROC: ${CPU}% CPU"
  if [ "${CPU:-0}" -ge "$CPU_LIMITE" ]; then
    echo "   !! $PROC esta por encima del ${CPU_LIMITE}%."
    BLOQUEADO=1
  fi
done

if [ "$BLOQUEADO" = "1" ] && [ "$DRY_RUN" = "0" ]; then
  echo ""
  echo "   ABORTADO: iCloud esta ocupado. Espera 30-60 minutos y reintenta."
  echo "   (La simulacion si puedes lanzarla ahora, no molesta a nadie.)"
  exit 1
fi

# ---------------------------------------------------------------------
# GUARDIAN 2: memoria
# ---------------------------------------------------------------------
PRESION="$(memory_pressure 2>/dev/null | awk -F': ' '/System-wide memory free percentage/ {gsub("%","",$2); print $2}')"
if [ -n "${PRESION:-}" ]; then
  echo ""
  echo ">> Memoria libre: ${PRESION}%"
  if [ "${PRESION:-100}" -lt 10 ] && [ "$DRY_RUN" = "0" ]; then
    echo "   ABORTADO: quedan menos del 10% de memoria libre."
    echo "   Cierra Chrome y Safari y vuelve a intentarlo."
    exit 1
  fi
fi

# ---------------------------------------------------------------------
# Buscar proyectos candidatos dentro de iCloud
# ---------------------------------------------------------------------
echo ""
echo ">> Buscando proyectos de programacion dentro de iCloud..."
echo "   (un 'proyecto' = carpeta con .git, package.json o requirements.txt)"

TMP="$(mktemp)"
find "$ICLOUD" -maxdepth 6 \
     \( -name node_modules -o -name .venv -o -name venv -o -name .next \) -prune -o \
     \( -name .git -o -name package.json -o -name requirements.txt -o -name pyproject.toml \) -print 2>/dev/null \
  | while read -r MARCA; do dirname "$MARCA"; done \
  | sort -u > "$TMP"

NUM="$(wc -l < "$TMP" | tr -d ' ')"
echo "   Proyectos encontrados: $NUM"

if [ "${NUM:-0}" -eq 0 ]; then
  echo ""
  echo "   No hay proyectos de programacion dentro de iCloud."
  echo "   El problema esta en otro sitio: revisa el informe del paso 1."
  rm -f "$TMP"
  exit 0
fi

# ---------------------------------------------------------------------
# Analizar cada proyecto y decidir si es seguro moverlo
# ---------------------------------------------------------------------
echo ""
echo "====================================================================="
echo "   ANALISIS PROYECTO POR PROYECTO"
echo "====================================================================="

MOVIDOS=0
SEGUROS=""

while IFS= read -r P; do
  [ -d "$P" ] || continue
  NOMBRE="$(basename "$P")"
  echo ""
  echo "---------------------------------------------------------------------"
  echo " PROYECTO: $NOMBRE"
  echo " Ruta:     $P"

  # Cuantas carpetas tecnicas tiene dentro (medida barata del dano)
  TEC=0
  for TIPO in node_modules .next .venv venv __pycache__ dist build .vercel .turbo .cache; do
    N="$(find "$P" -maxdepth 4 -type d -name "$TIPO" -prune -print 2>/dev/null | wc -l | tr -d ' ')"
    TEC=$((TEC + N))
  done
  echo " Carpetas tecnicas dentro: $TEC"

  PROBLEMAS=""

  # -- Ficheros no descargados (solo estan en la nube) --------------
  DATALESS="$(find "$P" -flags dataless -print 2>/dev/null | head -50 | wc -l | tr -d ' ')"
  if [ "${DATALESS:-0}" -gt 0 ]; then
    echo " AVISO: hay ficheros que NO estan descargados en el Mac (solo en la nube)."
    PROBLEMAS="$PROBLEMAS
     * Tiene ficheros sin descargar. Haz clic derecho en la carpeta en
       el Finder -> 'Descargar ahora', espera, y vuelve a ejecutar esto."
  fi

  # -- Estado de git ------------------------------------------------
  if [ -d "$P/.git" ]; then
    SUCIO="$(git -C "$P" status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
    REMOTO="$(git -C "$P" remote get-url origin 2>/dev/null)"
    SINSUBIR="$(git -C "$P" log --branches --not --remotes --oneline 2>/dev/null | wc -l | tr -d ' ')"

    echo " Git: cambios sin guardar=$SUCIO  commits sin subir=$SINSUBIR"
    echo " Git remoto: ${REMOTO:-NINGUNO}"

    [ "${SUCIO:-0}" -gt 0 ] && PROBLEMAS="$PROBLEMAS
     * Tiene $SUCIO cambios sin guardar en git. Guardalos antes de mover."
    [ -z "${REMOTO:-}" ] && PROBLEMAS="$PROBLEMAS
     * No tiene copia en GitHub. Si se pierde, se pierde del todo."
    [ "${SINSUBIR:-0}" -gt 0 ] && PROBLEMAS="$PROBLEMAS
     * Tiene $SINSUBIR commits sin subir a GitHub."
  else
    echo " Git: este proyecto NO usa git."
    PROBLEMAS="$PROBLEMAS
     * No usa git, asi que no tiene respaldo automatico."
  fi

  if [ -n "$PROBLEMAS" ]; then
    echo " VEREDICTO: NO SE MUEVE.$PROBLEMAS"
    continue
  fi

  echo " VEREDICTO: SEGURO PARA MOVER (git limpio y subido a GitHub)"
  SEGUROS="$SEGUROS$NOMBRE
"

  # -- Mover --------------------------------------------------------
  if [ "$DRY_RUN" = "0" ]; then
    if [ "$MOVIDOS" -ge "$MAX_MOVES" ]; then
      echo " (limite de $MAX_MOVES movimientos alcanzado en esta pasada)"
      continue
    fi
    mkdir -p "$DESTINO"
    FINAL="$DESTINO/$NOMBRE"
    if [ -e "$FINAL" ]; then
      FINAL="$DESTINO/${NOMBRE}_$(date +%Y%m%d%H%M%S)"
    fi
    echo " MOVIENDO -> $FINAL"
    if mv "$P" "$FINAL"; then
      MOVIDOS=$((MOVIDOS+1))
      {
        echo ""
        echo "## $(date '+%Y-%m-%d %H:%M:%S')"
        echo "- Proyecto: \`$NOMBRE\`"
        echo "- Origen (iCloud): \`$P\`"
        echo "- Destino (local): \`$FINAL\`"
        echo "- Git remoto: \`${REMOTO:-ninguno}\`"
        echo "- Para deshacer: \`mv \"$FINAL\" \"$P\"\`"
      } >> "$MANIFIESTO"
      echo " OK. Anotado en el manifiesto."
      echo " Esperando 10 s para no saturar iCloud..."
      sleep 10
    else
      echo " ERROR al mover. No se ha tocado nada de este proyecto."
    fi
  fi
done < "$TMP"

rm -f "$TMP"

# ---------------------------------------------------------------------
echo ""
echo "====================================================================="
echo "   RESUMEN"
echo "====================================================================="
if [ "$DRY_RUN" = "0" ]; then
  echo "   Proyectos movidos a $DESTINO : $MOVIDOS"
  echo "   Manifiesto: $MANIFIESTO"
  echo ""
  echo "   SIGUIENTE PASO:"
  echo "     1. Espera 15-30 minutos (iCloud tiene que digerir el cambio)."
  echo "     2. Ejecuta otra vez: bash 01_diagnostico.sh"
  echo "     3. Comprueba que 'pendientes de indexar' ha BAJADO."
  echo "     4. Si ha bajado, repite este paso 2 para los siguientes."
else
  echo "   SIMULACION TERMINADA. No se ha tocado nada."
  echo ""
  echo "   Proyectos que se moverian:"
  if [ -n "$SEGUROS" ]; then
    echo "$SEGUROS" | sed '/^$/d' | sed 's/^/     - /'
    echo ""
    echo "   Si estas de acuerdo, lanza SOLO UNO para probar:"
    echo "     DRY_RUN=0 MAX_MOVES=1 bash 02_migrar_proyectos.sh"
  else
    echo "     (ninguno: todos tienen algo pendiente, mira los avisos arriba)"
  fi
fi
echo ""
