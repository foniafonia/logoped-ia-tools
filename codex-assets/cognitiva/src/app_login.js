const KEY_HASH_PROG = 'cognitiva_hash_programador';
const KEY_HASH_TUTOR = 'cognitiva_hash_tutor';
const KEY_ALUMNOS = 'cognitiva_alumnos';

function hashPassword(pwd) {
  let h = 0xcbf29ce484222325n;
  for (const c of new TextEncoder().encode(pwd)) {
    h ^= BigInt(c);
    h = BigInt.asUintN(64, h * 0x100000001b3n);
  }
  return h.toString(16).padStart(16, '0');
}

function getHashKey(role) {
  return role === 'programador' ? KEY_HASH_PROG : KEY_HASH_TUTOR;
}

function accessWithPassword(role, redirectUrl) {
  const key = getHashKey(role);
  const currentHash = localStorage.getItem(key);
  const pwd = window.prompt(`Contraseña ${role}:`) || '';
  if (!pwd) return { ok: false, reason: 'empty' };
  const hash = hashPassword(pwd);

  if (!currentHash) {
    localStorage.setItem(key, hash);
    window.location.href = redirectUrl;
    return { ok: true, mode: 'first_set' };
  }

  if (hash === currentHash) {
    window.location.href = redirectUrl;
    return { ok: true, mode: 'validated' };
  }

  window.alert('Contraseña incorrecta.');
  return { ok: false, reason: 'invalid' };
}

function getActiveAlumnos() {
  const list = JSON.parse(localStorage.getItem(KEY_ALUMNOS) || '[]');
  return list.filter(a => a.activo);
}

function renderAlumnoPanel() {
  const panel = document.getElementById('alumnoPanel');
  const sel = document.getElementById('alumnoSelect');
  const msg = document.getElementById('alumnoMsg');
  panel.classList.remove('hidden');

  const alumnos = getActiveAlumnos();
  if (alumnos.length === 0) {
    sel.innerHTML = '';
    sel.disabled = true;
    document.getElementById('btnAbrirAlumno').disabled = true;
    msg.textContent = 'El Tutor debe dar de alta alumnos primero';
    return;
  }

  sel.disabled = false;
  document.getElementById('btnAbrirAlumno').disabled = false;
  sel.innerHTML = alumnos.map(a => `<option value="${a.profileId}">${a.nombre} (${a.profileId})</option>`).join('');
  msg.textContent = '';
}

function openAlumno() {
  const sel = document.getElementById('alumnoSelect');
  const pid = sel.value;
  if (!pid) return;
  window.location.href = `./perfil_alumno.html?alumno=${encodeURIComponent(pid)}`;
}

function init() {
  if (typeof document === 'undefined') return;
  document.getElementById('btnProgramador').addEventListener('click', () => {
    accessWithPassword('programador', './perfil_programador.html');
  });
  document.getElementById('btnTutor').addEventListener('click', () => {
    accessWithPassword('tutor', './perfil_tutor.html');
  });
  document.getElementById('btnAlumno').addEventListener('click', renderAlumnoPanel);
  document.getElementById('btnAbrirAlumno').addEventListener('click', openAlumno);
}

init();

