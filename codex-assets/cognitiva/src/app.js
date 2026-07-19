(function(){
  const PIN_KEY = 'cognitiva_pin';
  const PAC_KEY = 'cognitiva_pacientes';
  const PAC_SEQ_KEY = 'cognitiva_pacientes_seq';

  const NOMBRES = {
    obj001a:'Letras', obj003a:'Sonidos', obj006a:'Vocales',
    obj015j:'Sílabas directas', obj015t:'Sílabas inversas',
    obj017b:'Palabras', obj020p:'Frases', obj031a:'Comprensión',
    obj041a:'Inferencias', obj008a:'Conciencia fonológica',
    eficiencia:'Lectura eficiente', escritura:'Escritura',
    lenguaje:'Lenguaje abstracto', ortografia:'Ortografía',
    sinfones_liq:'Sinfones líquidos', sinfones_vib:'Sinfones vibrantes'
  };

  const CATEGORIAS = {
    'Percepción':['obj001a','obj003a','obj006a'],
    'Fonología':['obj015j','obj015t','obj008a'],
    'Léxico':['obj017b','eficiencia'],
    'Sintaxis':['obj020p'],
    'Semántica':['obj031a','obj041a'],
    'Escritura':['escritura','ortografia','lenguaje'],
    'Consolidación':['sinfones_liq','sinfones_vib']
  };

  const ICONOS = {
    obj001a:'🔤', obj003a:'🔊', obj006a:'🅰️',
    obj015j:'🟦', obj015t:'🔁', obj017b:'📖',
    obj020p:'📝', obj031a:'🧩', obj041a:'💡',
    obj008a:'👂', eficiencia:'⚡', escritura:'✍️',
    lenguaje:'🌈', ortografia:'🅱️',
    sinfones_liq:'💧', sinfones_vib:'🌀'
  };

  // Descripción corta y clara para familias y terapeutas
  const DESCRIPCIONES = {
    obj001a:'Reconocer y nombrar las letras del abecedario.',
    obj003a:'Asociar cada letra con el sonido que hace.',
    obj006a:'Distinguir las vocales A, E, I, O, U.',
    obj015j:'Leer sílabas directas (consonante + vocal: sa, se, si...).',
    obj015t:'Leer sílabas inversas (vocal + consonante: as, es, is...).',
    obj008a:'Jugar con los sonidos que forman las palabras.',
    obj017b:'Reconocer y leer palabras completas.',
    eficiencia:'Leer más rápido y con más seguridad.',
    obj020p:'Comprender y construir frases.',
    obj031a:'Entender el significado de lo que se lee.',
    obj041a:'Deducir información que no aparece escrita.',
    escritura:'Escribir palabras y frases con sentido.',
    ortografia:'Escribir sin faltas (b/v y reglas básicas).',
    lenguaje:'Entender ideas y conceptos abstractos.',
    sinfones_liq:'Leer sílabas con L (PLA, BLE, CLO…): automatizar la líquida.',
    sinfones_vib:'Leer sílabas con R (PRA, BRE, TRI…): automatizar la vibrante.'
  };

  // Color cera por categoría (para el badge de cada tarjeta)
  const CAT_COLOR = {
    'Percepción':'var(--cera-azul)', 'Fonología':'var(--cera-verde)',
    'Léxico':'var(--cera-mostaza)', 'Sintaxis':'var(--cera-coral)',
    'Semántica':'var(--cera-lila)', 'Escritura':'var(--cera-mostaza)',
    'Consolidación':'var(--cera-coral)'
  };
  function catDe(eid){ for (const [c,l] of Object.entries(CATEGORIAS)) if (l.includes(eid)) return c; return ''; }

  // Talleres con estímulo temporizado (Teoría del Déficit Temporal)
  const EXPOSURE_TALLERES = ['obj001a','obj003a','obj006a','obj015j','obj015t','obj017b','sinfones_liq','sinfones_vib'];
  // Escala de velocidad (de Sensibilización a Automatización), ms de exposición
  const VELOCIDADES = [
    { label:'🐢 Muy lento', ms:1800 },
    { label:'Lento',        ms:1500 },
    { label:'Normal',       ms:1200 },
    { label:'Rápido',       ms:1000 },
    { label:'🚀 Muy rápido',ms:700  }
  ];
  function getExposure(paciente, eid){
    return paciente.config && paciente.config[eid] && paciente.config[eid].exposureMs;
  }
  function setExposure(paciente, eid, ms){
    if (!paciente.config) paciente.config = {};
    if (!paciente.config[eid]) paciente.config[eid] = {};
    if (ms) paciente.config[eid].exposureMs = ms;
    else delete paciente.config[eid].exposureMs;
  }

  const MAP_HTML = {
    obj001a:'alumno_obj001a.html',obj003a:'alumno_obj003a.html',obj006a:'alumno_obj006a_007a_012a.html',
    obj015j:'alumno_obj015j.html',obj015t:'alumno_obj015t.html',obj017b:'alumno_obj017b.html',obj020p:'alumno_obj020p.html',
    sinfones_liq:'alumno_sinfones_liquidos.html',sinfones_vib:'alumno_sinfones_vibrantes.html',
    obj031a:'alumno_obj031a.html',obj041a:'alumno_obj041a.html',obj008a:'alumno_conciencia_fonologica_obj008a.html',
    eficiencia:'alumno_eficiencia_lectora_obj003a_004a.html',escritura:'alumno_escritura_productiva.html',
    lenguaje:'alumno_lenguaje_abstracto.html',ortografia:'alumno_ortografia_bv_cloze.html'
  };

  function $(id){ return document.getElementById(id); }
  function page(){ return document.body.dataset.page || ''; }
  function params(){ return new URLSearchParams(location.search); }
  function load(k, fb){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; }catch{ return fb; } }
  function save(k, v){ localStorage.setItem(k, JSON.stringify(v)); }

  function verificarPIN(input) {
    const stored = localStorage.getItem(PIN_KEY);
    if (!stored) {
      localStorage.setItem(PIN_KEY, input);
      return true;
    }
    return input === stored;
  }

  function pedirPIN(blockTitle){
    const root = $('pinRoot');
    const app = $('appRoot');
    root.classList.remove('hidden');
    app.classList.add('hidden');
    $('pinTitle').textContent = blockTitle;
    $('pinInput').value = '';

    $('pinBtn').onclick = function(){
      const val = $('pinInput').value.trim();
      if (!/^\d{4}$/.test(val)) { $('pinMsg').textContent = 'El PIN debe tener 4 dígitos.'; return; }
      if (!verificarPIN(val)) { $('pinMsg').textContent = 'PIN incorrecto.'; return; }
      $('pinMsg').textContent = '';
      root.classList.add('hidden');
      app.classList.remove('hidden');
      if (page() === 'index') initIndex();
      if (page() === 'paciente') initPaciente();
      if (page() === 'diagnostico') initDiagnostico();
    };

    const resetBtn = $('pinResetBtn');
    if (resetBtn) {
      resetBtn.onclick = function(){
        const ok = confirm('Esto borrará solo el PIN guardado en este dispositivo. ¿Continuar?');
        if (!ok) return;
        localStorage.removeItem(PIN_KEY);
        $('pinMsg').textContent = 'PIN reiniciado. Introduce un nuevo PIN de 4 dígitos.';
        $('pinInput').value = '';
        $('pinInput').focus();
      };
    }
  }

  function getPacientes(){ return load(PAC_KEY, []); }
  function setPacientes(v){ save(PAC_KEY, v); }

  function getPacienteById(id){ return getPacientes().find((p) => p.id === id) || null; }

  function makePaciente(nombre){
    const all = getPacientes();
    const maxN = all.reduce((m, p) => {
      const n = parseInt(p.id.replace('pac_',''), 10);
      return isNaN(n) ? m : Math.max(m, n);
    }, 0);
    const lastSeq = parseInt(localStorage.getItem(PAC_SEQ_KEY) || '0', 10) || 0;
    const nextN = Math.max(maxN, lastSeq) + 1;
    localStorage.setItem(PAC_SEQ_KEY, String(nextN));
    const id = `pac_${String(nextN).padStart(3,'0')}`;
    return { id, nombre, avatar:'🧒', ejercicios:[], fecha_alta:new Date().toISOString().slice(0,10) };
  }

  function getSesion(pid, eid){
    return load(`cognitiva_sesion_${pid}_${eid}`, null);
  }

  function getEstados(paciente){
    const estados = [];
    let activeFound = false;
    for (const eid of (paciente.ejercicios || [])) {
      const ses = getSesion(paciente.id, eid);
      const done = !!ses;
      let state = 'locked';
      if (done) state = 'done';
      else if (!activeFound) { state = 'active'; activeFound = true; }
      estados.push({ eid, ses, state });
    }
    return estados;
  }

  function ultSesionPaciente(paciente){
    const sesiones = (paciente.ejercicios || []).map((eid) => ({ eid, s:getSesion(paciente.id, eid) })).filter((x) => x.s && x.s.ts);
    sesiones.sort((a,b) => (b.s.ts || '').localeCompare(a.s.ts || ''));
    return sesiones[0] || null;
  }

  function metricasPaciente(paciente){
    const estados = getEstados(paciente);
    const superados = estados.filter((e) => e.state === 'done').length;
    const total = estados.length || 1;
    const progreso = Math.round((superados / total) * 100);

    const last = ultSesionPaciente(paciente);
    if (!last) return { progreso, aciertos:0, errores:0, duracion:'0min', fecha:'-', warn:false };
    const s = last.s;
    const dur = Math.max(0, Number(s.duracion_ms || 0));
    return {
      progreso,
      aciertos:Number(s.aciertos || 0),
      errores:Number(s.errores || 0),
      duracion:`${Math.max(1, Math.round(dur / 60000))}min`,
      fecha:(s.ts || '').slice(0,10) || '-',
      warn:Number(s.errores_consecutivos_max || 0) >= 4
    };
  }

  function renderPath(container, paciente, onActiveClick, onDoneClick){
    const estados = getEstados(paciente);
    container.innerHTML = '';
    estados.forEach((it, idx) => {
      const n = document.createElement('div');
      n.className = `node ${it.state === 'done' ? 'done' : (it.state === 'active' ? 'active' : 'locked')}`;
      const icon = it.state === 'done' ? '✅' : (it.state === 'active' ? '🔵' : '🔒');
      n.innerHTML = `<div class="title">${icon} ${NOMBRES[it.eid] || it.eid}</div><div class="code">${it.eid}</div>`;
      if (typeof document !== 'undefined' && document.body.dataset.page === 'paciente') {
        const del = document.createElement('button');
        del.textContent = '✕';
        del.title = 'Eliminar ejercicio';
        del.style.cssText = 'float:right;background:none;border:none;color:#aaa;cursor:pointer;font-size:14px;padding:0';
        del.addEventListener('click', (e) => {
          e.stopPropagation();
          const pacs = getPacientes();
          const pac = pacs.find((p) => p.id === paciente.id);
          if (!pac) return;
          pac.ejercicios = pac.ejercicios.filter((x) => x !== it.eid);
          setPacientes(pacs);
          paciente.ejercicios = pac.ejercicios;
          container.innerHTML = '';
          renderPath(container, paciente, onActiveClick, onDoneClick);
        });
        n.insertBefore(del, n.firstChild);
      }
      if (it.state === 'active' && onActiveClick) n.addEventListener('click', () => onActiveClick(it));
      if (it.state === 'done' && onDoneClick) n.addEventListener('click', () => onDoneClick(it));
      container.appendChild(n);
      if (idx < estados.length - 1) {
        const a = document.createElement('div');
        a.className = 'arrow';
        a.textContent = '→';
        container.appendChild(a);
      }
    });
  }

  function initIndex(){
    const btnNew = $('btnNewPaciente');
    const grid = $('patientsGrid');

    function draw(){
      const pacientes = getPacientes();
      grid.innerHTML = '';
      pacientes.forEach((p) => {
        const m = metricasPaciente(p);
        const c = document.createElement('div');
        c.className = 'card';
        c.innerHTML = `
          <div class="patient-name">${p.avatar} ${p.nombre} ${m.warn ? '<span class="warn">⚠️</span>' : ''}</div>
          <div class="progress"><span style="width:${m.progreso}%"></span></div>
          <div class="meta"><span>${m.progreso}%</span></div>
          <div class="meta">✅ ${m.aciertos} &nbsp; ❌ ${m.errores} &nbsp; ⏱ ${m.duracion} &nbsp; 📅 ${m.fecha}</div>
          <button class="btn" data-id="${p.id}" style="margin-top:8px">Ver ficha</button>`;
        grid.appendChild(c);
      });
      grid.querySelectorAll('button[data-id]').forEach((b) => b.addEventListener('click', () => {
        location.href = `paciente.html?id=${encodeURIComponent(b.dataset.id)}`;
      }));
    }

    btnNew.onclick = function(){
      const existing = $('newPacienteForm');
      if (existing) { existing.remove(); return; }
      const form = document.createElement('div');
      form.id = 'newPacienteForm';
      form.className = 'card';
      form.style.marginTop = '12px';
      form.innerHTML = `
        <div class="row" style="align-items:center">
          <input id="newNombreInput" placeholder="Nombre del paciente" style="padding:10px;border:1px solid #c7d4e5;border-radius:9px;font:inherit" />
          <button id="btnConfirmNew" class="btn" type="button">Crear paciente</button>
        </div>`;
      $('patientsGrid').before(form);
      $('newNombreInput').focus();
      $('btnConfirmNew').onclick = function(){
        const nombre = $('newNombreInput').value.trim();
        if (!nombre) return;
        const p = makePaciente(nombre);
        const all = getPacientes();
        all.push(p);
        setPacientes(all);
        form.remove();
        location.href = `paciente.html?id=${encodeURIComponent(p.id)}`;
      };
    };

    // --- Copia de seguridad / Restaurar (export-import de todo el estado cognitiva_*) ---
    const btnBackup = $('btnBackup');
    if (btnBackup) btnBackup.onclick = function(){
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('cognitiva')) data[k] = localStorage.getItem(k);
      }
      const payload = { _app:'COGNITIVA2026CLAUDE', _fecha:new Date().toISOString(), data };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cognitiva_backup_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const btnRestore = $('btnRestore');
    const fileRestore = $('fileRestore');
    if (btnRestore && fileRestore) {
      btnRestore.onclick = () => fileRestore.click();
      fileRestore.onchange = function(){
        const file = fileRestore.files && fileRestore.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(){
          try {
            const parsed = JSON.parse(String(reader.result));
            const data = parsed && parsed.data ? parsed.data : parsed;
            if (!data || typeof data !== 'object') throw new Error('formato');
            const keys = Object.keys(data).filter((k) => k.startsWith('cognitiva'));
            if (!keys.length) throw new Error('vacío');
            if (!confirm(`Restaurar ${keys.length} claves. Esto reemplazará los datos actuales. ¿Continuar?`)) return;
            keys.forEach((k) => localStorage.setItem(k, data[k]));
            alert('Copia restaurada correctamente.');
            location.reload();
          } catch (e) {
            alert('Archivo de copia no válido.');
          }
        };
        reader.readAsText(file);
        fileRestore.value = '';
      };
    }

    draw();
  }

  function initPaciente(){
    const id = params().get('id') || '';
    const paciente = getPacienteById(id);
    if (!paciente) { $('pacienteName').textContent = 'Paciente no encontrado'; return; }

    $('pacienteName').textContent = `${paciente.avatar} ${paciente.nombre}`;
    $('btnBack').onclick = () => location.href = 'index.html';
    const btnDiag = $('btnDiag');
    if (btnDiag) btnDiag.onclick = () => location.href = `diagnostico.html?id=${encodeURIComponent(paciente.id)}`;
    $('btnDelete').onclick = () => {
      if (!confirm(`Eliminar paciente ${paciente.nombre}?`)) return;
      setPacientes(getPacientes().filter((p) => p.id !== paciente.id));
      location.href = 'index.html';
    };

    const info = $('exerciseInfo');
    const path = $('pathPaciente');

    function draw(){
      renderPath(path, paciente, (it) => {
        info.innerHTML = `<div class="card">
          <strong>${NOMBRES[it.eid] || it.eid}</strong>
          <div class="badge badge-warn" style="margin-top:6px">⏳ Pendiente — aún no realizado</div>
        </div>`;
      }, (it) => {
        const s = it.ses || getSesion(paciente.id, it.eid);
        const warn = Number(s.errores_consecutivos_max || 0) >= 4;
        info.innerHTML = `
          <div class="card">
            <strong>${NOMBRES[it.eid] || it.eid}</strong>
            <div class="meta">✅ ${Number(s.aciertos||0)} · ❌ ${Number(s.errores||0)} · ⏱ ${Math.round((Number(s.duracion_ms||0))/60000)} min · 📅 ${(s.ts||'').slice(0,10)||'-'}</div>
            ${warn ? '<div class="badge badge-danger">⚠️ 4+ errores consecutivos</div>' : ''}
          </div>`;
      });
    }

    const picker = $('exercisePicker');
    const errorPanel = $('errorPanel');

    function renderErrores(){
      if (!errorPanel) return;
      const a = analizarErrores(paciente);
      if (!a.totalErrores) {
        errorPanel.innerHTML = `<div class="card"><strong class="mano" style="font-size:1.2rem">🔍 Análisis de errores</strong>
          <p class="muted" style="margin:6px 0 0">${a.totalEventos ? 'Sin errores registrados. ¡Buen trabajo! 🎉' : 'Aún no hay sesiones con datos.'}</p></div>`;
        return;
      }
      const colorCat = { 'Inversión / rotación':'var(--cera-lila)', 'Confusión visual por forma':'var(--cera-azul)', 'Sustitución fonética':'var(--cera-mostaza)', 'Otra confusión visual':'var(--papel-2)', 'Otra sustitución fonética':'var(--papel-2)' };
      const cats = Object.entries(a.cats).sort((x,y)=>y[1]-x[1]);
      const topPares = Object.entries(a.pares).sort((x,y)=>y[1].n-x[1].n).slice(0,6);
      errorPanel.innerHTML = `
        <div class="card">
          <strong class="mano" style="font-size:1.3rem">🔍 Análisis de errores</strong>
          <p class="muted" style="margin:4px 0 10px">${a.totalErrores} errores en ${a.totalEventos} intentos.</p>
          <div class="err-cats">
            ${cats.map(([c,n]) => `<span class="badge" style="background:${colorCat[c]||'var(--papel-2)'}">${c}: ${n}</span>`).join(' ')}
          </div>
          <h3 class="mano" style="font-size:1.15rem;margin:12px 0 4px">Confusiones más frecuentes</h3>
          <ul class="muted" style="margin:0">
            ${topPares.map(([par,info]) => `<li><b>${par}</b> · ${info.n} ${info.n===1?'vez':'veces'} <em>(${info.cat})</em></li>`).join('')}
          </ul>
        </div>`;
    }

    function toggleEjercicio(eid){
      const i = paciente.ejercicios.indexOf(eid);
      if (i >= 0) paciente.ejercicios.splice(i, 1);
      else paciente.ejercicios.push(eid);
      setPacientes(getPacientes().map((p) => p.id === paciente.id ? paciente : p));
      draw();
      renderPicker();
    }

    function renderPicker(){
      picker.innerHTML = Object.entries(CATEGORIAS).map(([cat, list]) => `
        <div class="pick-cat-title">${cat}</div>
        <div class="pick-grid">
          ${list.map((eid) => {
            const added = paciente.ejercicios.includes(eid);
            const tieneVel = added && EXPOSURE_TALLERES.includes(eid);
            const expActual = getExposure(paciente, eid) || 0;
            const velCtrl = tieneVel ? `
              <div class="pick-speed" data-eid="${eid}">
                <span class="pick-speed-label">⏱ Velocidad de exposición</span>
                <div class="pick-speed-opts">
                  ${VELOCIDADES.map((v) => `<button type="button" class="vel-btn${expActual===v.ms?' on':''}" data-eid="${eid}" data-ms="${v.ms}">${v.label}<small>${v.ms}ms</small></button>`).join('')}
                </div>
              </div>` : '';
            return `<div class="pick-wrap">
              <button type="button" class="pick-card${added ? ' added' : ''}" data-eid="${eid}"
                style="--cat:${CAT_COLOR[cat]}">
                <span class="pick-icon">${ICONOS[eid] || '📘'}</span>
                <span class="pick-name">${NOMBRES[eid] || eid}</span>
                <span class="pick-desc">${DESCRIPCIONES[eid] || ''}</span>
                <span class="pick-state">${added ? '✓ Añadido' : '＋ Añadir'}</span>
              </button>${velCtrl}
            </div>`;
          }).join('')}
        </div>`).join('');
      picker.querySelectorAll('.pick-card').forEach((b) =>
        b.addEventListener('click', () => toggleEjercicio(b.dataset.eid)));
      picker.querySelectorAll('.vel-btn').forEach((b) =>
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          const eid = b.dataset.eid;
          const ms = Number(b.dataset.ms);
          const actual = getExposure(paciente, eid);
          setExposure(paciente, eid, actual === ms ? 0 : ms); // re-toque = quitar override
          setPacientes(getPacientes().map((p) => p.id === paciente.id ? paciente : p));
          renderPicker();
        }));
    }

    $('btnStartSesion').onclick = () => location.href = `sesion.html?id=${encodeURIComponent(paciente.id)}`;

    draw();
    renderPicker();
    renderErrores();
  }

  function initSesion(){
    const id = params().get('id') || '';
    const paciente = getPacienteById(id);
    if (!paciente) { $('sesionName').textContent = 'Paciente no encontrado'; return; }
    $('sesionName').textContent = `¡Hola, ${paciente.nombre.split(' ')[0]}! 👋`;

    const path = $('pathSesion');
    const celebrate = $('celebrate');
    const prevDone = new Set(getEstados(paciente).filter((x) => x.state === 'done').map((x) => x.eid));

    function draw(){
      renderPath(path, paciente, (it) => {
        const url = MAP_HTML[it.eid];
        if (!url) { alert(`No hay módulo para ${it.eid}`); return; }
        const exp = getExposure(paciente, it.eid);
        const extra = exp ? `&exp=${encodeURIComponent(exp)}` : '';
        window.open(`${url}?alumno=${encodeURIComponent(paciente.id)}${extra}`, '_blank');
      }, null);
    }

    function refreshAfterReturn(){
      const nowDone = new Set(getEstados(paciente).filter((x) => x.state === 'done').map((x) => x.eid));
      let newDone = false;
      nowDone.forEach((eid) => { if (!prevDone.has(eid)) newDone = true; });
      if (newDone) {
        celebrate.classList.remove('hidden');
        setTimeout(() => celebrate.classList.add('hidden'), 1500);
      }
      prevDone.clear();
      nowDone.forEach((x) => prevDone.add(x));
      draw();
    }

    $('btnSalir').onclick = function(){
      const pin = prompt('PIN para salir:') || '';
      if (!verificarPIN(pin)) { alert('PIN incorrecto'); return; }
      location.href = 'index.html';
    };

    window.addEventListener('focus', refreshAfterReturn);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshAfterReturn(); });
    draw();
  }

  // ===================== ANÁLISIS DE TIPOLOGÍA DE ERROR (TUTOR) =====================
  const PARES_ROTACION = [['b','d'],['b','p'],['b','q'],['d','p'],['d','q'],['p','q'],['u','n']];
  const PARES_FORMA    = [['a','e'],['f','t'],['c','o'],['v','y'],['m','n']];
  const PARES_FONETICA = [['r','l'],['r','d'],['l','d'],['p','b'],['t','d'],['k','g'],['b','v'],['g','j'],['c','z'],['s','z'],['s','c']];
  function _match(par, x, y){ return par.some(([a,b]) => (x===a&&y===b)||(x===b&&y===a)); }
  // Talleres de ruta VISUAL (el resto se interpretan como ruta auditiva/fonológica)
  const TALLERES_VISUALES = ['obj001a','obj006a'];
  // La categoría depende de la RUTA: el mismo par (p.ej. p-b) es confusión visual
  // en un taller de letras, pero sustitución fonética (sordo/sonoro) en uno auditivo.
  function clasificarError(esp, ele, visual){
    const x = String(esp||'').toLowerCase().trim();
    const y = String(ele||'').toLowerCase().trim();
    if (!x || !y) return 'Otra';
    if (visual) {
      if (_match(PARES_ROTACION, x, y)) return 'Inversión / rotación';
      if (_match(PARES_FORMA, x, y))    return 'Confusión visual por forma';
      return 'Otra confusión visual';
    }
    if (_match(PARES_FONETICA, x, y)) return 'Sustitución fonética';
    return 'Otra sustitución fonética';
  }
  // Normaliza el par (esperado, elegido) de un evento sin importar el nombre del campo
  function parDeEvento(ev){
    let esperado, elegido;
    Object.keys(ev || {}).forEach((k) => {
      if (/^selected/i.test(k)) elegido = ev[k];
      else if (/^expected/i.test(k)) esperado = ev[k];
      else if (/^model/i.test(k) && esperado === undefined) esperado = ev[k];
    });
    return { esperado, elegido };
  }
  function analizarErrores(paciente){
    const cats = {}; const pares = {}; let totalErrores = 0, totalEventos = 0;
    (paciente.ejercicios || []).forEach((eid) => {
      const visual = TALLERES_VISUALES.includes(eid);
      const ses = getSesion(paciente.id, eid);
      const eventos = (ses && ses.eventos) || [];
      eventos.forEach((ev) => {
        totalEventos++;
        if (ev.correct === false) {
          const { esperado, elegido } = parDeEvento(ev);
          if (esperado == null || elegido == null) return;
          totalErrores++;
          const cat = clasificarError(esperado, elegido, visual);
          cats[cat] = (cats[cat] || 0) + 1;
          const clave = `${esperado} → ${elegido}`;
          if (!pares[clave]) pares[clave] = { n:0, cat };
          pares[clave].n++;
        }
      });
    });
    return { cats, pares, totalErrores, totalEventos };
  }

  // ===================== TALLER DE DIAGNÓSTICO INICIAL =====================
  // Batería de cribado (12 ítems) a velocidad de prueba 1500 ms.
  const DIAG_EXP_PRUEBA = 1500;
  const BATERIA_DIAG = [
    // Ruta perceptiva — tonos puros (base sensorial)
    { ruta:'Perceptiva', tipo:'tono', prompt:'¿Suenan IGUAL o DIFERENTE?', tonos:[440,440], opciones:['Igual','Diferente'], correcta:'Igual' },
    { ruta:'Perceptiva', tipo:'tono', prompt:'¿Suenan IGUAL o DIFERENTE?', tonos:[440,660], opciones:['Igual','Diferente'], correcta:'Diferente' },
    // Ruta perceptiva — visual letras SIN similitud
    { ruta:'Perceptiva', tipo:'visual', similitud:false, prompt:'Toca la letra igual al modelo:', modelo:'A', opciones:['A','M','S'], correcta:'A' },
    { ruta:'Perceptiva', tipo:'visual', similitud:false, prompt:'Toca la letra igual al modelo:', modelo:'O', opciones:['T','O','L'], correcta:'O' },
    // Ruta perceptiva — visual letras CON similitud
    { ruta:'Perceptiva', tipo:'visual', similitud:true, prompt:'Toca la letra igual al modelo:', modelo:'b', opciones:['d','b','p'], correcta:'b' },
    { ruta:'Perceptiva', tipo:'visual', similitud:true, prompt:'Toca la letra igual al modelo:', modelo:'q', opciones:['p','g','q'], correcta:'q' },
    // Ruta fonológica — contrastados (oclusivo vs fricativo)
    { ruta:'Fonológica', tipo:'audio', prompt:'Escucha y toca la sílaba que oíste:', decir:'PA', opciones:['PA','FA','SA'], correcta:'PA' },
    { ruta:'Fonológica', tipo:'audio', prompt:'Escucha y toca la sílaba que oíste:', decir:'TO', opciones:['SO','TO','JO'], correcta:'TO' },
    // Ruta fonológica — pares mínimos (próximos)
    { ruta:'Fonológica', tipo:'audio', prompt:'Escucha y toca la sílaba que oíste:', decir:'RA', opciones:['LA','RA','DA'], correcta:'RA' },
    { ruta:'Fonológica', tipo:'audio', prompt:'Escucha y toca la sílaba que oíste:', decir:'LE', opciones:['LE','RE','DE'], correcta:'LE' },
    // Ruta léxica / semántica
    { ruta:'Léxica', tipo:'audio', prompt:'Escucha y toca la palabra que oíste:', decir:'mesa', opciones:['mesa','masa','misa'], correcta:'mesa' },
    { ruta:'Semántica', tipo:'visual', similitud:false, prompt:'El niño come pan. ¿Qué come el niño?', modelo:'🍞', opciones:['pan','agua','sol'], correcta:'pan' }
  ];

  const NIVELES_DIAG = {
    'Sensibilización': { exp:1800, secuencia:['obj001a','obj003a','obj006a'],
      msg:'Trabajar primero discriminación perceptiva básica con estímulos muy contrastados y exposición larga.' },
    'Aprendizaje':     { exp:1200, secuencia:['obj015j','obj015t','obj008a','obj017b'],
      msg:'Domina lo básico; reforzar ruta fonológica (sílabas, conciencia fonológica) y léxico visual inicial.' },
    'Consolidación':   { exp:1000, secuencia:['sinfones_liq','sinfones_vib','obj017b','obj020p','obj031a','obj041a'],
      msg:'Ejecución fluida; avanzar a léxico complejo, frases, comprensión e inferencias para automatizar.' }
  };

  function tocarTono(freqs){
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      let t = ctx.currentTime;
      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.value = f; osc.type = 'sine';
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.55);
        t += 0.65;
      });
    } catch (e) {}
  }
  function decirVoz(txt){
    try {
      if (!window.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(txt);
      u.lang = 'es-ES'; u.rate = 0.7;
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function calcularNivel(resultados){
    const total = resultados.length;
    const aciertos = resultados.filter((r) => r.correcto).length;
    const pct = Math.round((aciertos / total) * 100);
    const fallaSinSimilitud = resultados.some((r) => r.similitud === false && !r.correcto);
    let nivel;
    if (pct < 50 || fallaSinSimilitud) nivel = 'Sensibilización';
    else if (pct < 80) nivel = 'Aprendizaje';
    else nivel = 'Consolidación';
    const tiempos = resultados.map((r) => r.responseMs).filter((x) => x > 0);
    const tiempoMedio = tiempos.length ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;
    return { nivel, pct, aciertos, total, tiempoMedio };
  }

  function initDiagnostico(){
    const id = params().get('id') || '';
    const paciente = getPacienteById(id);
    const root = $('diagRoot');
    if (!paciente) { root.innerHTML = '<div class="card">Paciente no encontrado.</div>'; return; }

    let idx = 0;
    const resultados = [];
    let itemStart = 0;

    function pantallaInicio(){
      root.innerHTML = `
        <div class="card">
          <h1>🔎 Diagnóstico inicial</h1>
          <p class="muted">Cribado breve (${BATERIA_DIAG.length} retos) a velocidad de prueba ${DIAG_EXP_PRUEBA} ms.
          Sitúa al alumno en su nivel (Sensibilización · Aprendizaje · Consolidación) y propone el cuaderno.</p>
          <p class="muted">Acompaña al alumno: hay retos de oído (tonos y sílabas) y de vista (letras).</p>
          <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
            <button id="diagStart" class="btn" type="button">▶ Empezar</button>
            <button id="diagBack" class="btn btn-danger" type="button">← Volver a la ficha</button>
          </div>
        </div>`;
      $('diagStart').onclick = () => mostrarItem();
      $('diagBack').onclick = () => location.href = `paciente.html?id=${encodeURIComponent(paciente.id)}`;
    }

    function mostrarItem(){
      if (idx >= BATERIA_DIAG.length) return verInforme();
      const it = BATERIA_DIAG[idx];
      const esAudio = it.tipo === 'tono' || it.tipo === 'audio';
      root.innerHTML = `
        <div class="card">
          <div class="meta"><span>Reto ${idx + 1} / ${BATERIA_DIAG.length}</span><span>Ruta: ${it.ruta}</span></div>
          <h1 style="font-size:clamp(1.4rem,3vw,2rem);margin-top:6px">${it.prompt}</h1>
          ${it.modelo ? `<div style="font-size:4rem;text-align:center;margin:10px 0" class="mano">${it.modelo}</div>` : ''}
          ${esAudio ? `<div style="text-align:center;margin:8px 0"><button id="diagPlay" class="btn" type="button">🔊 Escuchar otra vez</button></div>` : ''}
          <div class="diag-opts">
            ${it.opciones.map((o) => `<button type="button" class="diag-opt vel-btn" data-op="${o}">${o}</button>`).join('')}
          </div>
        </div>`;
      const reproducir = () => { if (it.tipo === 'tono') tocarTono(it.tonos); else if (it.tipo === 'audio') decirVoz(it.decir); };
      if (esAudio) { $('diagPlay').onclick = reproducir; setTimeout(reproducir, 350); }
      itemStart = Date.now();
      root.querySelectorAll('.diag-opt').forEach((b) => b.addEventListener('click', () => {
        const elegido = b.dataset.op;
        const correcto = elegido === it.correcta;
        resultados.push({ ruta:it.ruta, tipo:it.tipo, similitud:it.similitud, esperado:it.correcta, elegido, correcto, responseMs:Date.now() - itemStart });
        b.classList.add(correcto ? 'diag-ok' : 'diag-bad');
        root.querySelectorAll('.diag-opt').forEach((x) => x.disabled = true);
        setTimeout(() => { idx++; mostrarItem(); }, 480);
      }));
    }

    function verInforme(){
      const r = calcularNivel(resultados);
      const info = NIVELES_DIAG[r.nivel];
      // Análisis de error por ruta
      const rutas = {};
      resultados.forEach((x) => { rutas[x.ruta] = rutas[x.ruta] || { ok:0, tot:0 }; rutas[x.ruta].tot++; if (x.correcto) rutas[x.ruta].ok++; });
      const desglose = Object.entries(rutas).map(([ru, v]) => `<li>${ru}: ${v.ok}/${v.tot}</li>`).join('');
      const errores = resultados.filter((x) => !x.correcto).map((x) => `<li>${x.ruta}: esperaba <b>${x.esperado}</b>, eligió <b>${x.elegido}</b></li>`).join('') || '<li>Sin errores 🎉</li>';
      const sec = info.secuencia.map((eid) => `${ICONOS[eid] || ''} ${NOMBRES[eid] || eid}`).join(' · ');

      // Guardar informe
      const informe = { fecha:new Date().toISOString(), nivel:r.nivel, aciertoPct:r.pct, tiempoMedioMs:r.tiempoMedio, items:resultados };
      try { localStorage.setItem(`cognitiva_diagnostico_${paciente.id}`, JSON.stringify(informe)); } catch (e) {}

      root.innerHTML = `
        <div class="card">
          <h1>📋 Informe del diagnóstico</h1>
          <p class="patient-name">${paciente.avatar} ${paciente.nombre}</p>
          <div class="badge badge-ok" style="font-size:1.1rem">Nivel: ${r.nivel}</div>
          <div class="meta" style="margin-top:8px">✅ ${r.aciertos}/${r.total} (${r.pct}%) · ⏱ tiempo medio ${r.tiempoMedio} ms</div>
          <p class="muted" style="margin-top:8px">${info.msg}</p>
          <h3 class="mano" style="font-size:1.3rem;margin:14px 0 4px">Resultado por ruta</h3>
          <ul class="muted" style="margin:0">${desglose}</ul>
          <h3 class="mano" style="font-size:1.3rem;margin:14px 0 4px">Análisis de errores</h3>
          <ul class="muted" style="margin:0">${errores}</ul>
          <h3 class="mano" style="font-size:1.3rem;margin:14px 0 4px">Cuaderno propuesto (exposición ${info.exp} ms)</h3>
          <p>${sec}</p>
          <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
            <button id="diagApply" class="btn" type="button">✅ Aplicar al cuaderno</button>
            <button id="diagRepeat" class="btn btn-danger" type="button">↻ Repetir</button>
            <button id="diagBack2" class="btn" type="button">← Volver a la ficha</button>
          </div>
        </div>`;

      $('diagApply').onclick = function(){
        if (!confirm(`Esto reemplazará el cuaderno de ${paciente.nombre} por la secuencia propuesta. ¿Continuar?`)) return;
        paciente.ejercicios = info.secuencia.slice();
        info.secuencia.forEach((eid) => { if (EXPOSURE_TALLERES.includes(eid)) setExposure(paciente, eid, info.exp); });
        setPacientes(getPacientes().map((p) => p.id === paciente.id ? paciente : p));
        alert('Cuaderno autoprogramado según el diagnóstico.');
        location.href = `paciente.html?id=${encodeURIComponent(paciente.id)}`;
      };
      $('diagRepeat').onclick = function(){ idx = 0; resultados.length = 0; pantallaInicio(); };
      $('diagBack2').onclick = () => location.href = `paciente.html?id=${encodeURIComponent(paciente.id)}`;
    }

    pantallaInicio();
  }

  function init(){
    const p = page();
    if (p === 'index') {
      pedirPIN('Introduce tu PIN (4 dígitos)');
      return;
    }
    if (p === 'paciente') {
      pedirPIN('PIN para abrir ficha de paciente');
      return;
    }
    if (p === 'sesion') {
      initSesion();
      return;
    }
    if (p === 'diagnostico') {
      pedirPIN('PIN para el diagnóstico');
      return;
    }
  }

  if (typeof window !== 'undefined') init();
})();
