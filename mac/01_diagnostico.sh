#!/bin/bash
# =====================================================================
#  01_diagnostico.sh  --  Radiografia del Mac. NO TOCA NADA.
# =====================================================================
#  Este script SOLO MIRA. No borra, no mueve, no copia, no apaga nada.
#  Puedes ejecutarlo mil veces sin ningun riesgo.
#
#  Al final te dice una de estas tres cosas:
#     VERDE    -> el Mac esta tranquilo, se puede actuar
#     AMARILLO -> se puede actuar, pero solo lotes muy pequenos
#     ROJO     -> NO actuar ahora. Te dice exactamente por que.
#
#  Uso:   bash 01_diagnostico.sh
# =====================================================================

set -uo pipefail

ICLOUD="$HOME/Library/Mobile Documents/com~apple~CloudDocs"
LOGDIR="$HOME/Documents/LIMPIEZA Y OPERATIVIDAD DEL MAC/informes"
mkdir -p "$LOGDIR" 2>/dev/null
STAMP="$(date +%Y-%m-%d_%H%M%S)"
LOG="$LOGDIR/diagnostico_$STAMP.txt"

# Contadores de problemas
ROJOS=0
AMARILLOS=0
MOTIVOS_ROJOS=""
MOTIVOS_AMARILLOS=""

rojo()    { ROJOS=$((ROJOS+1));       MOTIVOS_ROJOS="$MOTIVOS_ROJOS
   - $1"; }
amarillo(){ AMARILLOS=$((AMARILLOS+1)); MOTIVOS_AMARILLOS="$MOTIVOS_AMARILLOS
   - $1"; }

titulo() {
  echo ""
  echo "====================================================================="
  echo "  $1"
  echo "====================================================================="
}

# Todo lo que se imprime se guarda tambien en el informe
exec > >(tee "$LOG") 2>&1

echo "INFORME DE DIAGNOSTICO DEL MAC"
echo "Fecha: $(date)"
echo "Equipo: $(scutil --get ComputerName 2>/dev/null || echo desconocido)"
echo "macOS: $(sw_vers -productVersion 2>/dev/null)"
echo "Informe guardado en: $LOG"

# ---------------------------------------------------------------------
titulo "1. ESPACIO EN DISCO"
# ---------------------------------------------------------------------
df -h / /System/Volumes/Data 2>/dev/null | sed 's/^/   /'

LIBRE_GB="$(df -g /System/Volumes/Data 2>/dev/null | awk 'NR==2 {print $4}')"
[ -z "${LIBRE_GB:-}" ] && LIBRE_GB="$(df -g / | awk 'NR==2 {print $4}')"
echo ""
echo "   -> Espacio libre real: ${LIBRE_GB} GB"

if [ "${LIBRE_GB:-0}" -lt 10 ]; then
  rojo "Solo quedan ${LIBRE_GB} GB libres. Por debajo de 10 GB macOS se vuelve inestable."
elif [ "${LIBRE_GB:-0}" -lt 25 ]; then
  amarillo "Quedan ${LIBRE_GB} GB libres. Es poco margen para mover cosas."
fi

# ---------------------------------------------------------------------
titulo "2. MEMORIA Y SWAP  (lo que congela el Mac)"
# ---------------------------------------------------------------------
RAM_TOTAL_GB=$(( $(sysctl -n hw.memsize) / 1073741824 ))
echo "   RAM instalada: ${RAM_TOTAL_GB} GB"

# Presion de memoria: el numero que de verdad importa
PRESION="$(memory_pressure 2>/dev/null | awk -F': ' '/System-wide memory free percentage/ {gsub("%","",$2); print $2}')"
if [ -n "${PRESION:-}" ]; then
  OCUPADO=$((100 - PRESION))
  echo "   Memoria libre: ${PRESION}%   (ocupada: ${OCUPADO}%)"
  if [ "$PRESION" -lt 10 ]; then
    rojo "Memoria libre al ${PRESION}%. El Mac esta al borde de congelarse."
  elif [ "$PRESION" -lt 25 ]; then
    amarillo "Memoria libre al ${PRESION}%. Margen justo."
  fi
else
  echo "   (no se pudo leer memory_pressure)"
fi

# Swap: si el Mac esta escribiendo memoria al disco, va lento si o si
SWAP_LINE="$(sysctl -n vm.swapusage 2>/dev/null)"
echo "   Swap: $SWAP_LINE"
SWAP_USADO_MB="$(echo "$SWAP_LINE" | awk '{for(i=1;i<=NF;i++) if($i=="used") {gsub("M","",$(i+2)); gsub("G","",$(i+2)); print int($(i+2))}}')"
if echo "$SWAP_LINE" | grep -q "used = .*G"; then
  rojo "El Mac esta usando swap en GB. Esta tirando de disco como si fuera RAM: por eso se congela."
elif [ -n "${SWAP_USADO_MB:-}" ] && [ "${SWAP_USADO_MB:-0}" -gt 2000 ]; then
  amarillo "Swap por encima de 2 GB. El Mac va justo de memoria."
fi

# ---------------------------------------------------------------------
titulo "3. LOS 12 PROCESOS QUE MAS RAM ESTAN COMIENDO"
# ---------------------------------------------------------------------
printf "   %-8s %6s %6s  %s\n" "PID" "%CPU" "%RAM" "PROCESO"
ps -Axo pid,pcpu,pmem,comm -m 2>/dev/null | sed -n '2,13p' | while read -r pid cpu mem comm; do
  printf "   %-8s %6s %6s  %s\n" "$pid" "$cpu" "$mem" "$(basename "$comm")"
done

# ---------------------------------------------------------------------
titulo "4. ICLOUD / FILEPROVIDER  (el sospechoso principal)"
# ---------------------------------------------------------------------
for PROC in fileproviderd bird cloudd cloudphotod mediaanalysisd; do
  CPU="$(ps -Axo pcpu,comm 2>/dev/null | awk -v p="$PROC" '$2 ~ p"$" {s+=$1} END {printf "%.1f", s+0}')"
  printf "   %-18s CPU: %6s %%\n" "$PROC" "$CPU"
  CPU_INT="${CPU%%.*}"
  if [ "$PROC" = "fileproviderd" ] || [ "$PROC" = "bird" ] || [ "$PROC" = "cloudd" ]; then
    if [ "${CPU_INT:-0}" -ge 80 ]; then
      rojo "$PROC esta al ${CPU}% de CPU. iCloud esta saturado ahora mismo."
    elif [ "${CPU_INT:-0}" -ge 30 ]; then
      amarillo "$PROC al ${CPU}% de CPU. iCloud esta trabajando, mejor no cargarlo mas."
    fi
  fi
done

echo ""
echo "   Cola de indexado de iCloud (esto puede tardar ~30 s, es normal):"
DUMP="$(fileproviderctl dump 2>/dev/null | grep -E 'pending-indexable-count|pending-upload|pending-download' | head -20)"
if [ -n "$DUMP" ]; then
  echo "$DUMP" | sed 's/^/      /'
  PEND="$(echo "$DUMP" | awk -F'[^0-9]*' '/pending-indexable-count/ {for(i=1;i<=NF;i++) if($i>m) m=$i} END {print m+0}')"
  echo ""
  echo "      -> Ficheros pendientes de indexar: $PEND"
  if [ "${PEND:-0}" -gt 200000 ]; then
    rojo "iCloud tiene $PEND ficheros pendientes. Esta es LA causa del problema."
  elif [ "${PEND:-0}" -gt 20000 ]; then
    amarillo "iCloud tiene $PEND ficheros pendientes. Alto, pero manejable."
  fi
else
  echo "      (fileproviderctl no devolvio datos)"
fi

# ---------------------------------------------------------------------
titulo "5. APPS ABIERTAS QUE PESAN"
# ---------------------------------------------------------------------
for APP in "Google Chrome" "Safari" "Claude" "Code" "Electron" "node" "Simulator" "Docker" "chromium" "playwright"; do
  N="$(pgrep -f "$APP" 2>/dev/null | wc -l | tr -d ' ')"
  if [ "${N:-0}" -gt 0 ]; then
    RAMPCT="$(ps -Axo pmem,command 2>/dev/null | grep -i "$APP" | grep -v grep | awk '{s+=$1} END {printf "%.1f", s+0}')"
    printf "   %-16s %3s procesos   ~%s%% de la RAM\n" "$APP" "$N" "$RAMPCT"
  fi
done

# ---------------------------------------------------------------------
titulo "6. SNAPSHOTS DE TIME MACHINE (espacio fantasma)"
# ---------------------------------------------------------------------
SNAPS="$(tmutil listlocalsnapshots / 2>/dev/null | grep -c 'com.apple.TimeMachine')"
echo "   Snapshots locales: ${SNAPS:-0}"
[ "${SNAPS:-0}" -gt 0 ] && amarillo "Hay ${SNAPS} snapshots locales ocupando disco invisible."

# ---------------------------------------------------------------------
titulo "7. CARPETAS TECNICAS DENTRO DE ICLOUD  (lo que hay que sacar)"
# ---------------------------------------------------------------------
if [ -d "$ICLOUD" ]; then
  echo "   Buscando en: $ICLOUD"
  echo "   (solo cuenta carpetas, no entra dentro: es rapido y no despierta a iCloud)"
  echo ""
  TOTAL_TEC=0
  for TIPO in node_modules .next .nuxt .vercel .turbo dist build .venv venv __pycache__ .pytest_cache .gradle target vendor Pods .cache; do
    N="$(find "$ICLOUD" -maxdepth 7 -type d -name "$TIPO" -prune -print 2>/dev/null | wc -l | tr -d ' ')"
    if [ "${N:-0}" -gt 0 ]; then
      printf "   %-18s %4s carpetas\n" "$TIPO" "$N"
      TOTAL_TEC=$((TOTAL_TEC + N))
    fi
  done
  NGIT="$(find "$ICLOUD" -maxdepth 7 -type d -name ".git" -prune -print 2>/dev/null | wc -l | tr -d ' ')"
  printf "   %-18s %4s carpetas\n" ".git" "${NGIT:-0}"
  echo ""
  echo "   -> TOTAL carpetas tecnicas regenerables en iCloud: $TOTAL_TEC"
  echo "   -> Proyectos con historial git en iCloud: ${NGIT:-0}"
  [ "$TOTAL_TEC" -gt 0 ] && echo "      (cada node_modules puede tener 30.000+ ficheros diminutos)"
else
  echo "   No se encuentra la carpeta de iCloud Drive en la ruta esperada."
fi

# ---------------------------------------------------------------------
titulo "VEREDICTO"
# ---------------------------------------------------------------------
if [ "$ROJOS" -gt 0 ]; then
  echo ""
  echo "   #######  ROJO  --  NO ACTUAR AHORA  #######"
  echo ""
  echo "   Motivos:$MOTIVOS_ROJOS"
  echo ""
  echo "   QUE HACER:"
  echo "     1. Cierra Chrome y Safari."
  echo "     2. Deja el Mac encendido y quieto 30-60 minutos."
  echo "     3. Vuelve a ejecutar este mismo diagnostico."
  echo "     4. Si fileproviderd sigue disparado, ejecuta tu script"
  echo "        calmar_icloud_fileprovider.sh y espera otros 30 minutos."
elif [ "$AMARILLOS" -gt 0 ]; then
  echo ""
  echo "   #######  AMARILLO  --  SE PUEDE ACTUAR CON CUIDADO  #######"
  echo ""
  echo "   Avisos:$MOTIVOS_AMARILLOS"
  echo ""
  echo "   QUE HACER:"
  echo "     Puedes pasar al paso 2 (bash 02_migrar_proyectos.sh),"
  echo "     que por defecto es SIMULACION y no toca nada."
else
  echo ""
  echo "   #######  VERDE  --  EL MAC ESTA TRANQUILO  #######"
  echo ""
  echo "   QUE HACER:"
  echo "     Pasa al paso 2:  bash 02_migrar_proyectos.sh"
fi

echo ""
echo "   Informe completo guardado en:"
echo "   $LOG"
echo ""
