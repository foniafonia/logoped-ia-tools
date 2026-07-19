const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const safeLocationSearch = isBrowser ? window.location.search : '';
const profileId = new URLSearchParams(safeLocationSearch).get('alumno') || ('anonimo_' + Date.now());
const STORAGE_KEY = `multitaller_estado_${profileId}`;

const MODEL = {
  id_multitaller: 'mt_001',
  criterio_avance_columna: { aciertos_minimos: 8, intentos_maximos: 10 },
  criterio_profundizacion_fila: { errores_consecutivos: 3 },
  matriz: [
    [ { id_taller: 'obj015j', nivel: 1 }, { id_taller: 'obj017b', nivel: 1 } ],
    [ { id_taller: 'obj015t', nivel: 2 }, { id_taller: 'obj020p', nivel: 2 } ]
  ]
};

function loadState() {
  const raw = isBrowser ? localStorage.getItem(STORAGE_KEY) : null;
  if (raw) return JSON.parse(raw);
  return {
    fila_actual: 0,
    columna_actual: 0,
    aciertos: 0,
    intentos: 0,
    errores_consecutivos: 0,
    estados: MODEL.matriz.map((row) => row.map(() => 'pending'))
  };
}

function saveState(state) {
  if (isBrowser) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const __raw = isBrowser ? localStorage.getItem(STORAGE_KEY) : null;
const state = loadState();
if (!__raw) {
  state.estados[state.fila_actual][state.columna_actual] = 'active';
  saveState(state);
}

function getEstadoActual() {
  return {
    fila_actual: state.fila_actual,
    columna_actual: state.columna_actual,
    id_taller_activo: MODEL.matriz[state.fila_actual][state.columna_actual].id_taller
  };
}

function avanzarColumna() {
  const c = MODEL.criterio_avance_columna;
  if (state.aciertos >= c.aciertos_minimos && state.intentos <= c.intentos_maximos) {
    state.estados[state.fila_actual][state.columna_actual] = 'done';
    if (state.columna_actual < MODEL.matriz[state.fila_actual].length - 1) {
      state.columna_actual += 1;
    }
    state.aciertos = 0;
    state.intentos = 0;
    state.errores_consecutivos = 0;
    state.estados[state.fila_actual][state.columna_actual] = 'active';
    saveState(state);
    if (isBrowser) render();
  }
}

function profundizarFila() {
  const c = MODEL.criterio_profundizacion_fila;
  if (state.errores_consecutivos >= c.errores_consecutivos) {
    state.estados[state.fila_actual][state.columna_actual] = 'reinforce';
    if (state.fila_actual < MODEL.matriz.length - 1) state.fila_actual += 1;
    state.columna_actual = Math.min(state.columna_actual, MODEL.matriz[state.fila_actual].length - 1);
    state.errores_consecutivos = 0;
    state.aciertos = 0;
    state.intentos = 0;
    state.estados[state.fila_actual][state.columna_actual] = 'active';
    saveState(state);
    if (isBrowser) render();
  }
}

function registrarResultado(correcto) {
  state.intentos += 1;
  if (correcto) {
    state.aciertos += 1;
    state.errores_consecutivos = 0;
  } else {
    state.errores_consecutivos += 1;
  }
  saveState(state);
  avanzarColumna();
  profundizarFila();
  if (isBrowser) render();
}

function render() {
  const matrix = document.getElementById('matrix');
  const pre = document.getElementById('estado');
  matrix.innerHTML = '';
  MODEL.matriz.forEach((row, r) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    row.forEach((cell, c) => {
      const d = document.createElement('div');
      const st = state.estados[r][c];
      d.className = `cell ${st}`;
      d.textContent = `${cell.id_taller} (nivel ${cell.nivel})`;
      rowEl.appendChild(d);
    });
    matrix.appendChild(rowEl);
  });
  pre.textContent = JSON.stringify(getEstadoActual(), null, 2);
}

function launchActive() {
  const { id_taller_activo } = getEstadoActual();
  const map = {
    obj015j: 'alumno_obj015j.html',
    obj017b: 'alumno_obj017b.html',
    obj015t: 'alumno_obj015t.html',
    obj020p: 'alumno_obj020p.html'
  };
  const url = map[id_taller_activo];
  if (!url) {
    console.error(`Taller no encontrado en mapa: ${id_taller_activo}`);
    alert(`Error: taller "${id_taller_activo}" no tiene HTML asignado.`);
    return;
  }
  window.open(`${url}?alumno=${encodeURIComponent(profileId)}`, '_blank');
}

if (isBrowser) {
  document.getElementById('btnLanzar').addEventListener('click', launchActive);
  render();
}

