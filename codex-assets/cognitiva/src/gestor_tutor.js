const K = {
  alumnos: 'cognitiva_alumnos',
  cuadernos: 'cognitiva_cuadernos',
  avisos: 'cognitiva_avisos',
  grupos: 'cognitiva_grupos',
  centro: 'cognitiva_centro'
};

const TALLERES_DISPONIBLES = [
  'obj001a','obj003a','obj006a','obj015j','obj015t','obj017b','obj020p','obj031a','obj041a','obj008a','eficiencia','escritura','lenguaje','ortografia'
];

const NOMBRES = {
  obj001a: 'Letras', obj003a: 'Sonidos', obj006a: 'Vocales',
  obj015j: 'Sílabas directas', obj015t: 'Sílabas inversas',
  obj017b: 'Palabras', obj020p: 'Frases', obj031a: 'Comprensión',
  obj041a: 'Inferencias', obj008a: 'Conciencia fonológica',
  eficiencia: 'Lectura eficiente', escritura: 'Escritura',
  lenguaje: 'Lenguaje abstracto', ortografia: 'Ortografía'
};

const nowDate = () => new Date().toISOString().slice(0, 10);
const uid = (p) => `${p}_${Math.random().toString(36).slice(2, 8)}`;

function loadJSON(storage, key, fallback) {
  try { const v = storage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function saveJSON(storage, key, value) { storage.setItem(key, JSON.stringify(value)); }

function computeConsecutiveErrors(events = []) {
  let cur = 0; let max = 0;
  for (const e of events) {
    if (e.correct === false) { cur += 1; if (cur > max) max = cur; }
    else if (e.correct === true) cur = 0;
  }
  return max;
}

function mmss(ms) {
  const t = Math.max(0, Number(ms || 0));
  const m = Math.floor(t / 60000);
  const s = Math.floor((t % 60000) / 1000);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function createTutorStore(storage = localStorage) {
  const api = {
    storage,
    getAlumnos() { return loadJSON(storage, K.alumnos, []); },
    setAlumnos(v) { saveJSON(storage, K.alumnos, v); },
    getCuadernos() { return loadJSON(storage, K.cuadernos, []); },
    setCuadernos(v) { saveJSON(storage, K.cuadernos, v); },
    getAvisos() { return loadJSON(storage, K.avisos, []); },
    setAvisos(v) { saveJSON(storage, K.avisos, v); },
    getGrupos() { return loadJSON(storage, K.grupos, []); },
    setGrupos(v) { saveJSON(storage, K.grupos, v); },
    getCentro() { return loadJSON(storage, K.centro, { nombre:'', logopeda:'', curso:'' }); },
    setCentro(v) { saveJSON(storage, K.centro, v); },

    altaAlumno(profileId, nombre) {
      const alumnos = api.getAlumnos();
      if (alumnos.some((a) => a.profileId === profileId)) return false;
      alumnos.push({ profileId, nombre, fecha_alta: nowDate(), cuadernos_asignados: [], activo: true });
      api.setAlumnos(alumnos);
      return true;
    },

    bajaAlumno(profileId) {
      const alumnos = api.getAlumnos().map((a) => (a.profileId === profileId ? { ...a, activo: false } : a));
      api.setAlumnos(alumnos);
    },

    crearCuaderno(nombre, profileId, talleresIds) {
      const cuadernos = api.getCuadernos();
      const id = uid('cua');
      const talleres = talleresIds.map((id_taller, i) => ({ id_taller, orden: i + 1, superado: false }));
      cuadernos.push({ id_cuaderno: id, nombre, profileId, fecha_asignacion: nowDate(), talleres, estado: 'en_curso' });
      api.setCuadernos(cuadernos);

      const alumnos = api.getAlumnos().map((a) => (a.profileId === profileId
        ? { ...a, cuadernos_asignados: [...a.cuadernos_asignados, id] }
        : a));
      api.setAlumnos(alumnos);
      return id;
    },

    crearGrupo(nombre, alumnosIds) {
      const grupos = api.getGrupos();
      const g = { id_grupo: uid('grp'), nombre, alumnos: alumnosIds };
      grupos.push(g);
      api.setGrupos(grupos);
      return g;
    },

    asignarCuadernoAGrupo(grupoId, cuadernoBase) {
      const grupo = api.getGrupos().find((g) => g.id_grupo === grupoId);
      if (!grupo) return 0;
      let count = 0;
      for (const pid of grupo.alumnos) {
        api.crearCuaderno(cuadernoBase.nombre, pid, cuadernoBase.talleres.map((t) => t.id_taller));
        count += 1;
      }
      return count;
    },

    getSesion(profileId, id_taller) {
      return loadJSON(storage, `cognitiva_sesion_${profileId}_${id_taller}`, null);
    },

    setSesion(profileId, id_taller, resumen) {
      const base = {
        ...resumen,
        ts: resumen.ts || new Date().toISOString(),
        tipologia_errores: resumen.tipologia_errores || [],
        tiempos_respuesta_ms: resumen.tiempos_respuesta_ms || ((resumen.eventos || []).map((e) => e.responseMs).filter(Boolean)),
        errores_consecutivos_max: Number.isFinite(resumen.errores_consecutivos_max)
          ? resumen.errores_consecutivos_max
          : computeConsecutiveErrors(resumen.eventos || [])
      };
      saveJSON(storage, `cognitiva_sesion_${profileId}_${id_taller}`, base);
    },

    syncCuadernosConSesiones() {
      const cuadernos = api.getCuadernos();
      const alumnos = api.getAlumnos();
      const avisos = api.getAvisos();
      const avisosNew = [...avisos];

      const getAlumno = (pid) => alumnos.find((a) => a.profileId === pid);
      const addAviso = (type, msg, profileId, meta = {}) => {
        const exists = avisosNew.some((a) => !a.leido && a.type === type && a.profileId === profileId && a.msg === msg);
        if (!exists) avisosNew.push({ id: uid('av'), type, msg, profileId, meta, leido: false, fecha: new Date().toISOString() });
      };

      for (const c of cuadernos) {
        let superados = 0;
        let lastDate = null;
        for (const t of c.talleres) {
          const s = api.getSesion(c.profileId, t.id_taller);
          if (s) {
            t.superado = true;
            superados += 1;
            if (!lastDate || (s.ts || s.fecha || '') > lastDate) lastDate = s.ts || s.fecha || lastDate;

            const intentos = Number(s.intentos || 0);
            const aciertos = Number(s.aciertos || 0);
            const tasa = intentos > 0 ? (aciertos / intentos) * 100 : 0;
            const errCons = Number(s.errores_consecutivos_max || 0);
            const al = getAlumno(c.profileId);

            if (errCons >= 4) addAviso('errores_consecutivos', `⚠️ ${al?.nombre || c.profileId} ha fallado 4 veces seguidas en ${NOMBRES[t.id_taller] || t.id_taller}`, c.profileId, { id_taller: t.id_taller });
            if (intentos > 0 && tasa < 50) addAviso('baja_tasa', `📉 ${al?.nombre || c.profileId} tuvo dificultades en ${NOMBRES[t.id_taller] || t.id_taller} — considera bajar nivel`, c.profileId, { id_taller: t.id_taller });
          } else {
            t.superado = false;
          }
        }

        const pct = c.talleres.length ? (superados / c.talleres.length) * 100 : 0;
        c.porcentaje_superado = pct;
        c.fecha_ultima_sesion = lastDate;
        c.estado = superados === 0 ? 'pendiente' : (superados === c.talleres.length ? 'completado' : 'en_curso');

        if (c.estado === 'completado') {
          const al = getAlumno(c.profileId);
          addAviso('cuaderno_completado', `✅ ${al?.nombre || c.profileId} ha completado el cuaderno ${c.nombre}`, c.profileId, { id_cuaderno: c.id_cuaderno });
        }
      }

      api.setCuadernos(cuadernos);
      api.setAvisos(avisosNew);
    },

    marcarAvisoLeido(idAviso) {
      const avisos = api.getAvisos().map((a) => (a.id === idAviso ? { ...a, leido: true } : a));
      api.setAvisos(avisos);
    },

    getDashboard(profileId) {
      api.syncCuadernosConSesiones();
      const cuadernos = api.getCuadernos().filter((c) => c.profileId === profileId);
      const talleres = [];

      for (const c of cuadernos) {
        for (const t of c.talleres) {
          const s = api.getSesion(profileId, t.id_taller);
          if (!s) continue;
          const intentos = Number(s.intentos || 0);
          const aciertos = Number(s.aciertos || 0);
          const errores = Number(s.errores || 0);
          const tasa = intentos > 0 ? (aciertos / intentos) * 100 : 0;
          const tiempos = s.tiempos_respuesta_ms || [];
          const tmedio = tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : 0;
          talleres.push({
            id_taller: t.id_taller,
            aciertos, errores, intentos,
            duracion_ms: Number(s.duracion_ms || 0),
            duracion_fmt: mmss(Number(s.duracion_ms || 0)),
            tasa_exito: Number(tasa.toFixed(1)),
            tiempo_medio_respuesta_ms: Math.round(tmedio),
            ts: s.ts || null
          });
        }
      }

      const cuadernosResumen = cuadernos.map((c) => ({
        id_cuaderno: c.id_cuaderno,
        nombre: c.nombre,
        porcentaje_superado: Number((c.porcentaje_superado || 0).toFixed(1)),
        fecha_ultima_sesion: c.fecha_ultima_sesion || null,
        estado: c.estado || 'pendiente'
      }));

      return { talleres, cuadernos: cuadernosResumen, avisos: api.getAvisos().filter((a) => a.profileId === profileId && !a.leido) };
    },

    getUltimasSesiones(limit = 5) {
      const rows = [];
      const alumnosById = Object.fromEntries(api.getAlumnos().map((a) => [a.profileId, a.nombre]));
      for (let i = 0; i < storage.length; i += 1) {
        const k = storage.key(i);
        if (!k || !k.startsWith('cognitiva_sesion_')) continue;
        const parts = k.replace('cognitiva_sesion_', '').split('_');
        const id_taller = parts.pop();
        const profileId = parts.join('_');
        const s = loadJSON(storage, k, null);
        if (!s) continue;
        const intentos = Number(s.intentos || 0);
        const aciertos = Number(s.aciertos || 0);
        rows.push({
          profileId,
          alumno: alumnosById[profileId] || profileId,
          id_taller,
          tasa: intentos > 0 ? Number(((aciertos / intentos) * 100).toFixed(1)) : 0,
          fecha: s.ts || ''
        });
      }
      return rows.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '')).slice(0, limit);
    },

    exportarPlantillaCuaderno(idCuaderno) {
      const c = api.getCuadernos().find((x) => x.id_cuaderno === idCuaderno);
      if (!c) return null;
      return {
        version: '1.0',
        tipo: 'plantilla_cuaderno',
        nombre: c.nombre,
        fecha: new Date().toISOString(),
        talleres: c.talleres.map((t) => ({ id_taller: t.id_taller, orden: t.orden }))
      };
    }
  };
  return api;
}

function exportarBackup() {
  const data = {
    version: '1.0',
    fecha: new Date().toISOString(),
    alumnos: JSON.parse(localStorage.getItem('cognitiva_alumnos') || '[]'),
    cuadernos: JSON.parse(localStorage.getItem('cognitiva_cuadernos') || '[]'),
    avisos: JSON.parse(localStorage.getItem('cognitiva_avisos') || '[]'),
    grupos: JSON.parse(localStorage.getItem('cognitiva_grupos') || '[]'),
    centro: JSON.parse(localStorage.getItem('cognitiva_centro') || '{}'),
    sesiones: {}
  };
  for (let i = 0; i < localStorage.length; i += 1) {
    const k = localStorage.key(i);
    if (k && k.startsWith('cognitiva_sesion_')) {
      data.sesiones[k] = JSON.parse(localStorage.getItem(k));
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `cognitiva_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importarBackup(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target.result);
    localStorage.setItem('cognitiva_alumnos', JSON.stringify(data.alumnos || []));
    localStorage.setItem('cognitiva_cuadernos', JSON.stringify(data.cuadernos || []));
    localStorage.setItem('cognitiva_avisos', JSON.stringify(data.avisos || []));
    localStorage.setItem('cognitiva_grupos', JSON.stringify(data.grupos || []));
    localStorage.setItem('cognitiva_centro', JSON.stringify(data.centro || {}));
    for (const [k, v] of Object.entries(data.sesiones || {})) {
      localStorage.setItem(k, JSON.stringify(v));
    }
    alert('Backup restaurado correctamente.');
    location.reload();
  };
  reader.readAsText(file);
}

function downloadJSONFile(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function initUI() {
  if (typeof document === 'undefined') return;
  const store = createTutorStore(localStorage);

  const $ = (id) => document.getElementById(id);
  const tmpTalleres = [];

  function renderCentroCabecera() {
    const c = store.getCentro();
    const parts = [c.nombre, c.logopeda ? `Logopeda: ${c.logopeda}` : '', c.curso ? `Curso: ${c.curso}` : ''].filter(Boolean);
    $('centroCabecera').textContent = parts.length ? parts.join(' · ') : 'Sin datos de centro';
    $('centroNombre').value = c.nombre || '';
    $('centroLogopeda').value = c.logopeda || '';
    $('centroCurso').value = c.curso || '';
  }

  function renderSelectAlumnos() {
    const alumnos = store.getAlumnos().filter((a) => a.activo);
    const opts = alumnos.map((a) => `<option value="${a.profileId}">${a.nombre} (${a.profileId})</option>`).join('');
    $('cuadernoAlumno').innerHTML = `<option value="">Selecciona alumno</option>${opts}`;
    $('informeAlumno').innerHTML = `<option value="">Selecciona alumno</option>${opts}`;
    $('grupoAlumnos').innerHTML = opts;
  }

  function renderTalleresDisponibles() {
    $('tallerSelect').innerHTML = TALLERES_DISPONIBLES.map((t) => `<option value="${t}">${NOMBRES[t] || t} (${t})</option>`).join('');
  }

  function renderAlumnos() {
    const box = $('listaAlumnos');
    box.innerHTML = '';
    const cuadernos = store.getCuadernos();
    for (const a of store.getAlumnos()) {
      const ultimo = cuadernos
        .filter((c) => c.profileId === a.profileId)
        .sort((x, y) => (y.fecha_asignacion || '').localeCompare(x.fecha_asignacion || ''))[0];
      const badge = ultimo ? `<span class="badge ${ultimo.estado === 'completado' ? 'done' : (ultimo.estado === 'en_curso' ? 'curso' : 'pending')}">${ultimo.estado}</span>` : '<span class="badge warning">Sin cuaderno asignado</span>';

      const d = document.createElement('div');
      d.className = 'item';
      d.innerHTML = `
        <strong>${a.nombre}</strong> <span class="muted">(${a.profileId})</span>
        <div class="chips"><span class="chip">${a.activo ? 'activo' : 'baja'}</span><span class="chip">alta: ${a.fecha_alta}</span>${badge}</div>
        <div class="muted">Cuaderno actual: ${ultimo ? ultimo.nombre : '-'}</div>
        <div class="chips" style="margin-top:6px">
          <button data-act="informes" data-id="${a.profileId}">Ver informes</button>
          <button data-act="asignar" data-id="${a.profileId}">Asignar cuaderno</button>
          <button data-act="baja" data-id="${a.profileId}">Dar de baja</button>
        </div>`;
      box.appendChild(d);
    }

    box.querySelectorAll('button').forEach((b) => {
      b.addEventListener('click', () => {
        const act = b.dataset.act;
        const id = b.dataset.id;
        if (act === 'informes') { $('informeAlumno').value = id; renderDashboard(id); }
        if (act === 'asignar') { $('cuadernoAlumno').value = id; }
        if (act === 'baja') { store.bajaAlumno(id); refreshAll(); }
      });
    });
  }

  function renderTmpTalleres() {
    $('talleresTemp').innerHTML = tmpTalleres.map((t, i) => `<span class="chip">${i + 1}. ${NOMBRES[t] || t}</span>`).join('');
  }

  function renderCuadernos() {
    store.syncCuadernosConSesiones();
    const box = $('listaCuadernos');
    box.innerHTML = '';
    const cuadernos = store.getCuadernos();

    $('grupoCuadernoSelect').innerHTML = `<option value="">Selecciona cuaderno base</option>${cuadernos.map((c) => `<option value="${c.id_cuaderno}">${c.nombre} (${c.profileId})</option>`).join('')}`;

    for (const c of cuadernos) {
      const d = document.createElement('div');
      d.className = 'item';
      d.innerHTML = `<strong>${c.nombre}</strong> <span class="muted">(${c.profileId})</span>
      <div class="chips"><span class="chip">${c.estado}</span><span class="chip">${(c.porcentaje_superado || 0).toFixed(1)}%</span>
      <button data-export="${c.id_cuaderno}">Exportar plantilla</button></div>
      <div class="muted">${c.talleres.map((t) => `${t.orden}. ${NOMBRES[t.id_taller] || t.id_taller} ${t.superado ? '✅' : ''}`).join(' · ')}</div>`;
      box.appendChild(d);
    }

    box.querySelectorAll('[data-export]').forEach((b) => {
      b.addEventListener('click', () => {
        const idc = b.getAttribute('data-export');
        const plantilla = store.exportarPlantillaCuaderno(idc);
        if (!plantilla) return;
        const safe = (plantilla.nombre || 'plantilla').replace(/\s+/g, '_');
        downloadJSONFile(`cognitiva_cuaderno_${safe}.json`, plantilla);
      });
    });
  }

  function renderAvisos() {
    const box = $('avisos');
    box.innerHTML = '';
    const avisos = store.getAvisos().filter((a) => !a.leido);
    if (!avisos.length) {
      box.innerHTML = '<div class="item"><div class="muted">Sin avisos pendientes</div></div>';
      return;
    }
    for (const a of avisos) {
      const cls = a.type === 'cuaderno_completado' ? 'done' : (a.type === 'baja_tasa' ? 'danger' : 'warning');
      const d = document.createElement('div');
      d.className = `item ${cls}`;
      d.innerHTML = `<div>${a.msg}</div><button data-id="${a.id}" style="margin-top:6px">Marcar leído</button>`;
      box.appendChild(d);
    }
    box.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { store.marcarAvisoLeido(b.dataset.id); refreshAll(); }));
  }

  function renderDashboard(profileId) {
    if (!profileId) { $('dashboard').innerHTML = '<div class="muted">Selecciona alumno</div>'; return; }
    const d = store.getDashboard(profileId);
    const centro = store.getCentro();
    const box = $('dashboard');

    const talleresHtml = d.talleres.map((t) => `
      <div class="item">
        <strong>${NOMBRES[t.id_taller] || t.id_taller}</strong>
        <div class="chips"><span class="chip">Aciertos: ${t.aciertos}</span><span class="chip">Errores: ${t.errores}</span><span class="chip">Intentos: ${t.intentos}</span><span class="chip">Éxito: ${t.tasa_exito}%</span></div>
        <div class="muted">Duración: ${t.duracion_fmt} · Tiempo medio: ${t.tiempo_medio_respuesta_ms} ms</div>
      </div>`).join('');

    const cuadernosHtml = d.cuadernos.map((c) => `<div class="item"><strong>${c.nombre}</strong><div class="muted">${c.estado} · ${c.porcentaje_superado}% · última: ${c.fecha_ultima_sesion || '-'}</div></div>`).join('');

    box.innerHTML = `
      <div class="item"><strong>Centro:</strong> ${centro.nombre || '-'} · <strong>Logopeda:</strong> ${centro.logopeda || '-'} · <strong>Curso:</strong> ${centro.curso || '-'}</div>
      <h3>Por taller</h3>${talleresHtml || '<div class="muted">Sin sesiones</div>'}
      <h3>Por cuaderno</h3>${cuadernosHtml || '<div class="muted">Sin cuadernos</div>'}`;
  }

  function renderDashboardEntry() {
    const boxA = $('dashAlumnosActivos');
    const boxS = $('dashUltimasSesiones');
    const alumnos = store.getAlumnos().filter((a) => a.activo);
    const cuadernos = store.getCuadernos();

    boxA.innerHTML = alumnos.map((a) => {
      const c = cuadernos
        .filter((x) => x.profileId === a.profileId)
        .sort((x, y) => (y.fecha_asignacion || '').localeCompare(x.fecha_asignacion || ''))[0];
      const badge = c ? `<span class="badge ${c.estado === 'completado' ? 'done' : (c.estado === 'en_curso' ? 'curso' : 'pending')}">${c.estado}</span>` : '<span class="badge warning">Sin cuaderno asignado</span>';
      return `<div class="item"><strong>${a.nombre}</strong> <span class="muted">(${a.profileId})</span><div class="chips">${badge}</div><div class="muted">${c ? c.nombre : '-'}</div></div>`;
    }).join('') || '<div class="muted">Sin alumnos activos</div>';

    const sesiones = store.getUltimasSesiones(5);
    boxS.innerHTML = sesiones.length ? `
      <table>
        <thead><tr><th>Alumno</th><th>Taller</th><th>Éxito</th><th>Fecha</th></tr></thead>
        <tbody>${sesiones.map((s) => `<tr><td>${s.alumno}</td><td>${NOMBRES[s.id_taller] || s.id_taller}</td><td>${s.tasa}%</td><td>${s.fecha || '-'}</td></tr>`).join('')}</tbody>
      </table>` : '<div class="muted">Sin sesiones registradas</div>';
  }

  function renderGrupos() {
    const box = $('listaGrupos');
    const grupos = store.getGrupos();
    const alumnosById = Object.fromEntries(store.getAlumnos().map((a) => [a.profileId, a.nombre]));
    $('grupoSelect').innerHTML = `<option value="">Selecciona grupo</option>${grupos.map((g) => `<option value="${g.id_grupo}">${g.nombre}</option>`).join('')}`;

    box.innerHTML = grupos.map((g) => `<div class="item"><strong>${g.nombre}</strong> <div class="muted">${g.alumnos.map((id) => alumnosById[id] || id).join(', ')}</div></div>`).join('') || '<div class="muted">Sin grupos</div>';
  }

  function refreshAll() {
    renderCentroCabecera();
    renderSelectAlumnos();
    renderAlumnos();
    renderCuadernos();
    renderAvisos();
    renderDashboard($('informeAlumno').value);
    renderDashboardEntry();
    renderGrupos();
  }

  $('btnAlta').addEventListener('click', () => {
    const id = $('alumnoId').value.trim();
    const nombre = $('alumnoNombre').value.trim();
    if (!id || !nombre) return;
    store.altaAlumno(id, nombre);
    $('alumnoId').value = ''; $('alumnoNombre').value = '';
    refreshAll();
  });

  $('btnAddTaller').addEventListener('click', () => {
    const t = $('tallerSelect').value;
    if (t) tmpTalleres.push(t);
    renderTmpTalleres();
  });

  $('btnCrearCuaderno').addEventListener('click', () => {
    const nombre = $('cuadernoNombre').value.trim();
    const pid = $('cuadernoAlumno').value;
    if (!nombre || !pid || tmpTalleres.length === 0) return;
    store.crearCuaderno(nombre, pid, [...tmpTalleres]);
    tmpTalleres.length = 0;
    $('cuadernoNombre').value = '';
    renderTmpTalleres();
    refreshAll();
  });

  $('btnCrearGrupo').addEventListener('click', () => {
    const nombre = $('grupoNombre').value.trim();
    const alumnosIds = [...$('grupoAlumnos').selectedOptions].map((o) => o.value);
    if (!nombre || alumnosIds.length === 0) return;
    store.crearGrupo(nombre, alumnosIds);
    $('grupoNombre').value = '';
    refreshAll();
  });

  $('btnAsignarGrupo').addEventListener('click', () => {
    const gid = $('grupoSelect').value;
    const cid = $('grupoCuadernoSelect').value;
    if (!gid || !cid) return;
    const base = store.getCuadernos().find((c) => c.id_cuaderno === cid);
    if (!base) return;
    const n = store.asignarCuadernoAGrupo(gid, base);
    alert(`Cuaderno asignado a ${n} alumno(s) del grupo.`);
    refreshAll();
  });

  $('btnGuardarCentro').addEventListener('click', () => {
    store.setCentro({ nombre: $('centroNombre').value.trim(), logopeda: $('centroLogopeda').value.trim(), curso: $('centroCurso').value.trim() });
    refreshAll();
  });

  $('informeAlumno').addEventListener('change', () => renderDashboard($('informeAlumno').value));

  $('btnExportarBackup').addEventListener('click', exportarBackup);
  $('btnImportarBackup').addEventListener('click', () => $('fileBackup').click());
  $('fileBackup').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) importarBackup(f);
    e.target.value = '';
  });

  $('btnExportarPlantilla').addEventListener('click', () => {
    const pid = $('cuadernoAlumno').value;
    const c = store.getCuadernos().filter((x) => x.profileId === pid).sort((a, b) => (b.fecha_asignacion || '').localeCompare(a.fecha_asignacion || ''))[0]
      || store.getCuadernos()[0];
    if (!c) return;
    const plantilla = store.exportarPlantillaCuaderno(c.id_cuaderno);
    if (!plantilla) return;
    downloadJSONFile(`cognitiva_cuaderno_${(plantilla.nombre || 'plantilla').replace(/\s+/g, '_')}.json`, plantilla);
  });

  $('btnImportarPlantilla').addEventListener('click', () => $('filePlantilla').click());
  $('filePlantilla').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const nombre = data.nombre || 'Cuaderno importado';
        const talleres = (data.talleres || []).sort((a, b) => a.orden - b.orden).map((t) => t.id_taller);
        const pid = $('cuadernoAlumno').value;
        if (!pid || !talleres.length) return;
        store.crearCuaderno(nombre, pid, talleres);
        refreshAll();
      } catch {
        alert('Plantilla inválida');
      }
    };
    r.readAsText(f);
    e.target.value = '';
  });

  renderTalleresDisponibles();
  refreshAll();
}

if (typeof window !== 'undefined') {
  initUI();
}
