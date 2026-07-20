const state = {
  catalog: null,
  activityCatalog: null,
  catalogQuery: "",
  catalogKind: "all",
  currentModuleId: "module-00",
  module: null,
  quiz: null,
  challenges: null,
  currentLessonIndex: 0,
  lastComparison: null,
  moduleResourcesText: "",
};

const FALLBACK_DATA = {
  module: {
    id: "module-00",
    title: "Fundamentos absolutos: Prompt y LLM en logopedia",
    lessons: [
      {
        id: "lesson-00-01",
        title: "Que es un prompt",
        duration_minutes: 12,
        theory: [
          "Un prompt es una instruccion para que el modelo haga una tarea.",
          "Cuanto mas claro sea el prompt, mejor suele ser la respuesta.",
          "Incluye contexto, objetivo y formato de salida.",
        ],
        example: "Actua como logopeda infantil y crea 5 actividades de vocabulario para 6 anos.",
        checklist: ["Define rol", "Define objetivo", "Define formato", "Incluye edad o nivel"],
      },
      {
        id: "lesson-00-02",
        title: "Que es un LLM",
        duration_minutes: 15,
        theory: [
          "LLM significa Large Language Model.",
          "Predice texto en funcion del contexto.",
          "Es apoyo profesional, no diagnostico automatico.",
        ],
        example: "Explica a una familia como practicar conciencia fonologica en casa.",
        checklist: ["Lenguaje claro", "Limites de uso", "Revision humana"],
      },
      {
        id: "lesson-00-03",
        title: "Primeros prompts aplicados a logopedia",
        duration_minutes: 20,
        theory: [
          "Incluye edad, objetivo y duracion.",
          "Pide pasos concretos y criterio de exito.",
          "Itera y mejora el prompt en versiones.",
        ],
        example: "Genera actividad para fonema /r/ de 15 minutos, nivel basico.",
        checklist: ["Objetivo medible", "Materiales", "Pasos", "Seguridad"],
      },
    ],
  },
  quiz: {
    id: "quiz-00-01",
    passing_score: 70,
    questions: [
      {
        id: "q1",
        question: "Que es un prompt?",
        options: [
          "Un archivo de audio",
          "Una instruccion para guiar la respuesta del modelo",
          "Un tipo de cuenta de correo",
          "Una base de datos clinica",
        ],
        correct_option: 1,
      },
      {
        id: "q2",
        question: "LLM significa:",
        options: [
          "Large Learning Memory",
          "Long Language Machine",
          "Large Language Model",
          "Logic Language Method",
        ],
        correct_option: 2,
      },
      {
        id: "q3",
        question: "Que mejora normalmente la calidad de una respuesta?",
        options: [
          "Dar instrucciones ambiguas",
          "Pedir muchas tareas a la vez sin orden",
          "Definir objetivo, contexto y formato",
          "No indicar publico objetivo",
        ],
        correct_option: 2,
      },
      {
        id: "q4",
        question: "En contexto logopedico, un prompt inicial debe incluir:",
        options: [
          "Solo el nombre del nino",
          "Edad y objetivo terapeutico",
          "Solo un titulo creativo",
          "Ningun dato de contexto",
        ],
        correct_option: 1,
      },
      {
        id: "q5",
        question: "Cual de estas es una buena practica de seguridad?",
        options: [
          "Usar la IA como diagnostico automatico",
          "Evitar revision profesional",
          "Anadir limite: material orientativo, no diagnostico",
          "Publicar datos sensibles",
        ],
        correct_option: 2,
      },
      {
        id: "q6",
        question: "Por que iteramos un prompt?",
        options: [
          "Para empeorar la salida",
          "Para mejorar precision y utilidad",
          "Para evitar feedback",
          "No hay que iterar",
        ],
        correct_option: 1,
      },
      {
        id: "q7",
        question: "Que formato suele ayudar en resultados accionables?",
        options: [
          "Sin estructura",
          "Lista de pasos y criterio de exito",
          "Texto aleatorio",
          "Respuesta de una palabra",
        ],
        correct_option: 1,
      },
      {
        id: "q8",
        question: "Cuando se compara salida interna vs externa, el objetivo es:",
        options: [
          "Copiar literalmente",
          "Aprender diferencias y mejorar",
          "Evitar analizar",
          "Elegir la mas larga siempre",
        ],
        correct_option: 1,
      },
      {
        id: "q9",
        question: "Que NO debe contener un prompt para entrenamiento basico?",
        options: [
          "Objetivo de sesion",
          "Duracion estimada",
          "Datos sensibles identificables",
          "Nivel del ejercicio",
        ],
        correct_option: 2,
      },
      {
        id: "q10",
        question: "Resultado esperado del modulo 00:",
        options: [
          "Diagnosticar automaticamente",
          "Escribir prompts basicos utiles y seguros",
          "Eliminar supervision humana",
          "Sustituir la intervencion logopedica",
        ],
        correct_option: 1,
      },
    ],
  },
  challenges: {
    exercises: [
      {
        id: "ex-00-01",
        title: "Prompt de actividad de vocabulario",
        instruction: "Escribe un prompt para generar una actividad de vocabulario para 6 anos, 10 minutos, materiales caseros.",
      },
      {
        id: "ex-00-02",
        title: "Prompt de explicacion para familia",
        instruction: "Escribe un prompt para explicar a una familia como reforzar conciencia fonologica en casa en lenguaje simple.",
      },
      {
        id: "ex-00-03",
        title: "Prompt de imagen logopedica",
        instruction: "Escribe un prompt para generar una imagen educativa de logopedia (escena de articulacion guiada, estilo claro, apta para ninos).",
      },
    ],
  },
};

const FALLBACK_ACTIVITY_CATALOG = {
  generated_at: "2026-03-30T00:00:00Z",
  source_root: ".",
  activities: [
    {
      id: "poe-lupas-y-linternas",
      title: "Detective de Palabras",
      summary: "Juego medible de busqueda visual con tiempos, errores y progresion por dificultad.",
      kind: "game",
      source: "POE",
      rel_path: "POE/lupas y linternas/index.html",
      web_path: "/POE/lupas%20y%20linternas/index.html",
      tags: ["atencion", "busqueda visual", "lectoescritura"],
      focus_areas: ["atencion", "lectoescritura"],
      age_range: "5-12",
      difficulty: "media",
      integration_status: "prioridad-alta",
    },
    {
      id: "poe-letra-crush",
      title: "Letra Crush",
      summary: "Juego tipo match-3 para trabajar letras, fonemas, silabas e imagenes con lectura funcional y control ejecutivo.",
      kind: "game",
      source: "POE",
      rel_path: "POE/letra-crush/index.html",
      web_path: "/POE/letra-crush/index.html",
      tags: ["dislexia", "conciencia fonologica", "lectoescritura", "semantica"],
      focus_areas: ["lectoescritura", "fonologia", "atencion", "funciones ejecutivas"],
      age_range: "5-12",
      difficulty: "media-alta",
      integration_status: "prioridad-alta",
    },
    {
      id: "poe-encuentra-el-nuevo",
      title: "Encuentra el Nuevo",
      summary: "Juego de memoria y deteccion de novedad para terapia fonologica con seguimiento de reaccion, errores y carga de memoria.",
      kind: "game",
      source: "POE",
      rel_path: "POE/encuentra-el-nuevo/index.html",
      web_path: "/POE/encuentra-el-nuevo/index.html",
      tags: ["articulacion", "memoria de trabajo", "deteccion de novedad", "fonologia"],
      focus_areas: ["articulacion", "fonologia", "atencion", "memoria"],
      age_range: "4-10",
      difficulty: "media",
      integration_status: "prioridad-alta",
    },
    {
      id: "poe-letrablaster-demo",
      title: "LetraBlaster Demo",
      summary: "Shooter educativo de letras, silabas y palabras integrado como demo jugable en fase de desarrollo.",
      kind: "game",
      source: "POE",
      rel_path: "POE/letrablaster-demo/index.html",
      web_path: "/POE/letrablaster-demo/index.html",
      tags: ["lectoescritura", "letras", "silabas", "palabras", "demo"],
      focus_areas: ["lectoescritura", "atencion", "velocidad de respuesta"],
      age_range: "5-10",
      difficulty: "media",
      integration_status: "en-desarrollo",
    },
    {
      id: "poe-letrapang-demo",
      title: "LetraPang Demo",
      summary: "Versión demo de LetraPang para exploración jugable en fase de construcción, fuera de la capa clínica principal.",
      kind: "game",
      source: "POE",
      rel_path: "POE/letrapang-demo/index.html",
      web_path: "/POE/letrapang-demo/index.html",
      tags: ["lectoescritura", "burbujas", "letras", "silabas", "demo"],
      focus_areas: ["lectoescritura", "atencion", "velocidad de respuesta"],
      age_range: "5-10",
      difficulty: "media",
      integration_status: "en-desarrollo",
    },
    {
      id: "external-lectoviva-v2-demo",
      title: "LectoViva v2",
      summary: "Demo externo endurecido publicado en GitHub Pages, visible en la zona de pruebas y en desarrollo del ecosistema.",
      kind: "game",
      source: "external",
      rel_path: "externo · GitHub Pages",
      web_path: "https://foniafonia.github.io/lectoviva-v2/",
      repo_url: "https://github.com/foniafonia/lectoviva-v2",
      tags: ["lectoescritura", "demo", "externo", "pruebas"],
      focus_areas: ["lectoescritura", "pruebas", "prototipos"],
      age_range: "5-12",
      difficulty: "media",
      integration_status: "en-desarrollo",
    },
  ],
};

const STORAGE_KEYS = {
  session: "logopedia_course_session",
  apiConfig: "logopedia_course_api_config",
  attempts: "logopedia_course_attempts",
  quizScore: "logopedia_course_quiz_score",
  quizScores: "logopedia_course_quiz_scores",
  moduleStatus: "logopedia_course_module_status",
  patients: "logopedia_course_patients",
  activePatientId: "logopedia_course_active_patient_id",
  suiteEvents: "logopedia_suite_events",
};

const FIXED_API_ENDPOINT = "https://api.openai.com/v1/responses";
const CONTENT_ROOT_CANDIDATES = ["./content", "content", "../../content", "/codexgptcurso/content", "/content"];
const DEMO_SCENARIOS = {
  default: {
    prompt:
      "Actua como logopeda infantil. Disena 5 actividades para nino de 6 anos con objetivo de vocabulario semantico (animales), sesion 15 minutos, materiales caseros, pasos claros y criterio de exito.",
    internal:
      "Plan de sesion (15 min)\n1) Activacion (3 min): tarjetas de animales con nombrado guiado.\n2) Clasificacion (4 min): separar animales de granja y selva.\n3) Frase funcional (4 min): construir frase con sujeto+verbo+objeto.\n4) Juego de turnos (3 min): preguntas cortas con apoyo visual.\n5) Cierre (1 min): repaso de 5 palabras objetivo.\n\nCriterio de exito: nombra al menos 8/10 palabras y formula 3 frases con apoyo minimo.\nSeguridad: material orientativo, no diagnostico.",
    external:
      "Lista de animales: perro, gato, vaca, leon, tigre, oveja, caballo, pato, cerdo, conejo.",
    selfAnalysis:
      "La respuesta interna es mas util para sesion real porque tiene estructura, tiempos y criterio de exito. La externa es valida pero demasiado generica.",
    comparison: {
      winner: "A",
      scores: {
        A: { clarity: 9, clinical_utility: 9, structure: 9, safety: 8, total: 35 },
        B: { clarity: 5, clinical_utility: 3, structure: 2, safety: 7, total: 17 },
      },
      reasoning: [
        "A presenta secuencia de sesion aplicable de inmediato.",
        "A incluye criterio de exito observable y limite profesional.",
        "B ofrece solo listado sin guia terapeutica accionable.",
      ],
      how_to_improve_prompt: [
        "Indica edad exacta y tiempo total de sesion.",
        "Pide pasos con objetivo y criterio de exito.",
        "Solicita adaptaciones por nivel (basico/intermedio).",
      ],
      improved_prompt:
        "Actua como logopeda infantil y crea una sesion de 15 minutos para nino de 6 anos sobre vocabulario de animales. Incluye objetivos, materiales, pasos con tiempos, adaptaciones por nivel y criterio de exito. Cierra con una advertencia: material orientativo, no diagnostico.",
    },
  },
  "ex-00-03": {
    prompt:
      "Genera prompt para imagen educativa de logopedia: terapeuta y nino practicando /r/, estilo infantil claro, colores suaves, cartel de apoyo articulatorio, sin texto medico.",
    internal:
      "Prompt imagen optimizado:\nIlustracion educativa de logopedia infantil en consulta luminosa. Logopeda mostrando posicion lingual para fonema /r/ a nino de 6 anos. Estilo amigable, colores pastel, laminas de apoyo visual en pared, expresion positiva, composicion limpia, alta legibilidad, sin logos ni texto clinico.",
    external: "Imagen de una logopeda con un nino en una sala.",
    selfAnalysis:
      "El prompt interno controla estilo, contexto, seguridad visual y detalles utiles para material didactico.",
    comparison: {
      winner: "A",
      scores: {
        A: { clarity: 9, clinical_utility: 8, structure: 9, safety: 9, total: 35 },
        B: { clarity: 4, clinical_utility: 3, structure: 2, safety: 6, total: 15 },
      },
      reasoning: [
        "A especifica escena, objetivo fonetico y estilo visual.",
        "A evita ambiguedad y produce salida reutilizable.",
        "B es demasiado corto y no orienta al modelo de imagen.",
      ],
      how_to_improve_prompt: [
        "Define edad objetivo y fonema exacto.",
        "Pide estilo visual y paleta concreta.",
        "Indica elementos obligatorios en la escena.",
      ],
      improved_prompt:
        "Crea una ilustracion educativa de logopedia infantil: nino de 6 anos practicando fonema /r/ con logopeda, consulta acogedora, colores suaves, apoyo visual articulatorio, estilo claro tipo material escolar, sin texto tecnico.",
    },
  },
};

const DEMO_SUITE_BLUEPRINT = {
  patient: {
    name: "Mario Demo",
    age: 7,
    level: "intermedio",
    goals: ["articulacion", "erre", "lectoescritura", "fluidez"],
    tags: ["seguimiento intensivo", "motivacion alta"],
    notes: "Caso demo con progreso transversal entre varios recursos del ecosistema.",
  },
  quizScores: {
    "module-00": 86,
    "module-01": 82,
    "module-02": 78,
  },
  attempts: [
    {
      module_id: "module-00",
      module_title: "Fundamentos: prompt y LLM",
      exercise_id: "ex-00-01",
      exercise_title: "Prompt de actividad de vocabulario",
      scoring: { clarity: 18, clinical_relevance: 20, structure: 18, safety: 22, personalization: 8, total: 86 },
      days_ago: 10,
    },
    {
      module_id: "module-01",
      module_title: "Anatomia del prompt profesional",
      exercise_id: "ex-01-01",
      exercise_title: "Prompt de sesion de erre",
      scoring: { clarity: 17, clinical_relevance: 22, structure: 20, safety: 20, personalization: 9, total: 88 },
      days_ago: 8,
    },
    {
      module_id: "module-02",
      module_title: "Aplicaciones logopedicas reales",
      exercise_id: "ex-02-01",
      exercise_title: "Adaptacion para lectoescritura",
      scoring: { clarity: 16, clinical_relevance: 20, structure: 16, safety: 22, personalization: 8, total: 82 },
      days_ago: 5,
    },
  ],
  suiteEvents: [
    {
      activity_id: "poe-194rrr",
      activity_title: "Nave de la erre",
      area: "articulacion",
      status: "in_progress",
      level_index: 1,
      level_label: "Nivel 1 superado",
      score: 84,
      accuracy: 81,
      duration_minutes: 9,
      notes: "Disparo correcto en silabas directas /ra-re-ri-ro-ru/ y buen control de impulsividad.",
      days_ago: 6,
    },
    {
      activity_id: "poe-194rrr",
      activity_title: "Nave de la erre",
      area: "articulacion",
      status: "in_progress",
      level_index: 2,
      level_label: "Nivel 2 desbloqueado",
      score: 79,
      accuracy: 76,
      duration_minutes: 11,
      notes: "Empieza a fallar en grupos consonanticos con /r/ trabada.",
      days_ago: 4,
    },
    {
      activity_id: "anamnesis-ia",
      activity_title: "Anamnesis IA",
      area: "evaluacion",
      status: "completed",
      level_index: 1,
      level_label: "Perfil inicial registrado",
      score: 100,
      accuracy: 100,
      duration_minutes: 14,
      notes: "Anamnesis completa con hitos evolutivos y contexto familiar.",
      days_ago: 12,
    },
    {
      activity_id: "poe-kaboom-lectoescritura-premium",
      activity_title: "Kaboom Lectoescritura",
      area: "lectoescritura",
      status: "completed",
      level_index: 3,
      level_label: "Bloque silabico dominado",
      score: 91,
      accuracy: 89,
      duration_minutes: 16,
      notes: "Progreso claro en conciencia silabica y precision lectora.",
      days_ago: 3,
    },
    {
      activity_id: "chatbot-familias-logopedia-landing",
      activity_title: "Chatbot de familias",
      area: "familias",
      status: "completed",
      level_index: 1,
      level_label: "Plan domiciliario enviado",
      score: 88,
      accuracy: 88,
      duration_minutes: 6,
      notes: "Se genero orientacion para casa alineada con objetivos del paciente.",
      days_ago: 2,
    },
    {
      activity_id: "poe-midiendo-con-la-s-y-la-z-definitivo",
      activity_title: "S y Z",
      area: "articulacion",
      status: "completed",
      level_index: 2,
      level_label: "Contraste /s/-/z/ estabilizado",
      score: 85,
      accuracy: 83,
      duration_minutes: 8,
      notes: "Menos sustituciones y mejor discriminacion auditiva.",
      days_ago: 1,
    },
  ],
};

function byId(id) {
  return document.getElementById(id);
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function encodePathSegments(relPath) {
  return String(relPath || "")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    return null;
  }
}

async function fetchJsonWithFallback(relativePath) {
  for (const root of CONTENT_ROOT_CANDIDATES) {
    try {
      const res = await fetch(`${root}/${relativePath}`);
      if (!res.ok) continue;
      return await res.json();
    } catch (_) {
      // Try next path.
    }
  }
  return null;
}

async function fetchTextWithFallback(relativePath) {
  for (const root of CONTENT_ROOT_CANDIDATES) {
    try {
      const res = await fetch(`${root}/${relativePath}`);
      if (!res.ok) continue;
      return await res.text();
    } catch (_) {
      // Try next path.
    }
  }
  return "";
}

async function loadCatalog() {
  const catalog = await fetchJsonWithFallback("catalog.json");
  if (catalog) {
    state.catalog = catalog;
    return;
  }

  state.catalog = {
    course: {
      id: "curso-gpt-logopedia",
      title: "Curso GPT para Logopedia",
      modules: [
        { id: "module-00", title: "Fundamentos: prompt y LLM" },
        { id: "module-01", title: "Anatomia del prompt profesional" },
        { id: "module-02", title: "Aplicaciones logopedicas reales" },
        { id: "module-03", title: "Practica con API (texto e imagen)" },
        { id: "module-04", title: "Evaluacion, rubricas e iteracion" },
        { id: "module-05", title: "Casos integradores" },
        { id: "module-06", title: "Productividad y profesionalizacion" },
        { id: "module-07", title: "Proyecto final y profesionalizacion" },
      ],
    },
  };
}

async function loadActivityCatalog() {
  const catalog = await fetchJsonWithFallback("activity-catalog.generated.json");
  state.activityCatalog = catalog || FALLBACK_ACTIVITY_CATALOG;
}

function moduleNumber(moduleId) {
  return (moduleId || "module-00").split("-")[1] || "00";
}

async function loadModuleData(moduleId) {
  const num = moduleNumber(moduleId);
  const [moduleData, quizData, challengeData, resourceText] = await Promise.all([
    fetchJsonWithFallback(`modules/${moduleId}.json`),
    fetchJsonWithFallback(`quizzes/quiz-${num}-01.json`),
    fetchJsonWithFallback(`challenges/challenge-${num}-01.json`),
    fetchTextWithFallback(`resources/${moduleId}.md`),
  ]);

  state.module = moduleData || FALLBACK_DATA.module;
  state.quiz = quizData || FALLBACK_DATA.quiz;
  state.challenges = challengeData || FALLBACK_DATA.challenges;
  state.moduleResourcesText = resourceText || "";
  state.currentModuleId = moduleId;
  state.currentLessonIndex = 0;
  state.lastComparison = null;
}

function getSession() {
  return safeJsonParse(localStorage.getItem(STORAGE_KEYS.session) || "null");
}

function syncSessionWithPatient(patient) {
  if (!patient?.name) return;
  const current = getSession() || {};
  localStorage.setItem(
    STORAGE_KEYS.session,
    JSON.stringify({
      name: patient.name,
      email: current.email || "",
    })
  );
  initSession();
}

function initSession() {
  const session = getSession();
  const loginForm = byId("login-form");
  const sessionBox = byId("session-box");

  if (session) {
    loginForm.classList.add("hidden");
    sessionBox.classList.remove("hidden");
    byId("session-user").textContent = session.email
      ? `Sesion activa: ${session.name} (${session.email})`
      : `Sesion activa: ${session.name}`;
  } else {
    loginForm.classList.remove("hidden");
    sessionBox.classList.add("hidden");
  }
}

function getPatients() {
  return safeJsonParse(localStorage.getItem(STORAGE_KEYS.patients) || "[]") || [];
}

function savePatients(patients) {
  localStorage.setItem(STORAGE_KEYS.patients, JSON.stringify(patients));
}

function getSuiteEvents() {
  return safeJsonParse(localStorage.getItem(STORAGE_KEYS.suiteEvents) || "[]") || [];
}

function saveSuiteEvents(events) {
  localStorage.setItem(STORAGE_KEYS.suiteEvents, JSON.stringify(events));
}

function getActivePatientId() {
  return localStorage.getItem(STORAGE_KEYS.activePatientId) || "";
}

function setActivePatientId(patientId) {
  localStorage.setItem(STORAGE_KEYS.activePatientId, patientId || "");
}

function getActivePatient() {
  const patientId = getActivePatientId();
  return getPatients().find((patient) => patient.id === patientId) || null;
}

function getPatientSuiteEvents(patientId) {
  if (!patientId) return [];
  return getSuiteEvents().filter((event) => event.patient_id === patientId);
}

function getEventActivityKind(event) {
  return getActivityById(event?.activity_id)?.kind || "game";
}

function normalizeTagList(value) {
  return (value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function parseAgeRange(ageRangeText) {
  const match = String(ageRangeText || "").match(/(\d+)\D+(\d+)/);
  if (!match) return null;
  return { min: Number(match[1]), max: Number(match[2]) };
}

function patientMatchesAge(patient, activity) {
  if (!patient || !patient.age || !activity?.age_range) return true;
  const parsed = parseAgeRange(activity.age_range);
  if (!parsed) return true;
  return patient.age >= parsed.min && patient.age <= parsed.max;
}

function ensureSeedPatient() {
  const patients = getPatients();
  if (patients.length) {
    if (!getActivePatientId()) {
      setActivePatientId(patients[0].id);
    }
    return;
  }

  const session = getSession();
  if (!session) return;

  const patient = {
    id: crypto.randomUUID(),
    name: session.name,
    age: 6,
    level: "basico",
    goals: ["lenguaje", "articulacion"],
    tags: ["seguimiento inicial"],
    notes: "Paciente demo creado desde acceso local.",
    created_at: new Date().toISOString(),
  };

  savePatients([patient]);
  setActivePatientId(patient.id);
}

function bindAuth() {
  byId("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = byId("student-name").value.trim();
    const email = byId("student-email").value.trim();
    if (!name || !email) return;

    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ name, email }));
    ensureSeedPatient();
    initSession();
    renderPatientPanel();
  });

  byId("logout-btn").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEYS.session);
    initSession();
  });
}

function getModuleStatusMap() {
  return safeJsonParse(localStorage.getItem(STORAGE_KEYS.moduleStatus) || "{}") || {};
}

function setModuleStatusMap(map) {
  localStorage.setItem(STORAGE_KEYS.moduleStatus, JSON.stringify(map));
}

function ensureModuleStatuses() {
  const modules = state.catalog?.course?.modules || [];
  const map = getModuleStatusMap();
  if (!modules.length) return;

  modules.forEach((moduleItem, index) => {
    if (!map[moduleItem.id]) {
      map[moduleItem.id] = index === 0 ? "active" : "locked";
    }
  });

  setModuleStatusMap(map);
}

function statusLabel(status) {
  if (status === "completed") return "Completado";
  if (status === "active") return "Activo";
  return "Bloqueado";
}

function getAllAttempts() {
  return safeJsonParse(localStorage.getItem(STORAGE_KEYS.attempts) || "[]") || [];
}

function getAttemptsForCurrentPatient() {
  const patient = getActivePatient();
  if (!patient) return [];
  return getAllAttempts().filter((attempt) => attempt.patient_id === patient.id);
}

function getCurrentModuleMetrics() {
  const allAttempts = getAttemptsForCurrentPatient();
  const attempts = allAttempts.filter((attempt) => (attempt.module_id || "module-00") === state.currentModuleId);
  const scoreMap = safeJsonParse(localStorage.getItem(STORAGE_KEYS.quizScores) || "{}") || {};
  const patient = getActivePatient();
  const quizScore = toNumber(scoreMap[`${patient?.id || "global"}::${state.currentModuleId}`] || 0);
  const passingQuiz = toNumber(state.quiz?.passing_score || 70);
  const exerciseCount = state.challenges?.exercises?.length || 0;
  const approvedExercises = new Set(
    attempts.filter((attempt) => toNumber(attempt.scoring?.total) >= 60).map((attempt) => attempt.exercise_id)
  );

  return {
    attempts,
    quizScore,
    passingQuiz,
    exerciseCount,
    approvedExerciseCount: approvedExercises.size,
    modulePassed:
      quizScore >= passingQuiz &&
      exerciseCount > 0 &&
      approvedExercises.size >= Math.min(3, exerciseCount),
  };
}

function unlockNextModuleIfEligible() {
  const modules = state.catalog?.course?.modules || [];
  const map = getModuleStatusMap();
  const index = modules.findIndex((moduleItem) => moduleItem.id === state.currentModuleId);
  if (index < 0) return;

  const metrics = getCurrentModuleMetrics();
  if (!metrics.modulePassed) return;

  map[state.currentModuleId] = "completed";
  const next = modules[index + 1];
  if (next && map[next.id] === "locked") {
    map[next.id] = "active";
  }

  setModuleStatusMap(map);
}

function renderModuleStatusText() {
  const map = getModuleStatusMap();
  const status = map[state.currentModuleId] || "active";
  const metrics = getCurrentModuleMetrics();
  const patient = getActivePatient();
  byId("module-status-text").textContent =
    `Paciente: ${patient?.name || "sin seleccionar"} | Estado: ${statusLabel(status)} | Quiz: ${metrics.quizScore}/${metrics.passingQuiz} | Ejercicios validados: ${metrics.approvedExerciseCount}/${Math.min(3, metrics.exerciseCount)} (>=60)`;
}

function renderModuleSelector() {
  const select = byId("module-select");
  const modules = state.catalog?.course?.modules || [];
  const statusMap = getModuleStatusMap();

  select.innerHTML = modules
    .map((moduleItem) => {
      const status = statusMap[moduleItem.id] || "locked";
      const badge = status === "completed" ? "✓" : status === "active" ? "•" : "🔒";
      const disabled = status === "locked" ? "disabled" : "";
      const selected = moduleItem.id === state.currentModuleId ? "selected" : "";
      return `<option value="${moduleItem.id}" ${selected} ${disabled}>${badge} ${moduleItem.id.toUpperCase()} - ${moduleItem.title}</option>`;
    })
    .join("");
}

function renderRoadmap() {
  const wrap = byId("module-roadmap");
  if (!wrap) return;
  const modules = state.catalog?.course?.modules || [];
  const statusMap = getModuleStatusMap();

  wrap.innerHTML = modules
    .map((moduleItem) => {
      const status = statusMap[moduleItem.id] || "locked";
      return `
        <article class="roadmap-item ${status}">
          <div class="code">${moduleItem.id.toUpperCase()}</div>
          <div class="title">${moduleItem.title}</div>
          <div class="status">${statusLabel(status)}</div>
        </article>
      `;
    })
    .join("");
}

function bindModuleSelector() {
  byId("module-select").addEventListener("change", async (event) => {
    const nextModuleId = event.target.value;
    const status = getModuleStatusMap()[nextModuleId] || "locked";
    if (status === "locked") {
      byId("attempt-status").textContent = "Modulo bloqueado. Completa el modulo anterior para desbloquearlo.";
      return;
    }

    await loadModuleData(nextModuleId);
    renderTheory();
    renderQuiz();
    renderExercises();
    clearPracticeFields();
    byId("quiz-result").textContent = "";
    renderProgress();
    renderModuleStatusText();
    renderRoadmap();
  });
}

function renderTheory() {
  const tabs = byId("lesson-tabs");
  tabs.innerHTML = "";

  state.module.lessons.forEach((lesson, index) => {
    const button = document.createElement("button");
    button.className = `tab-btn ${index === state.currentLessonIndex ? "active" : ""}`;
    button.textContent = lesson.title;
    button.addEventListener("click", () => {
      state.currentLessonIndex = index;
      renderTheory();
    });
    tabs.appendChild(button);
  });

  const lesson = state.module.lessons[state.currentLessonIndex];
  byId("lesson-content").innerHTML = `
    <p><strong>Modulo:</strong> ${state.module.title}</p>
    <p><strong>Duracion estimada:</strong> ${lesson.duration_minutes} min</p>
    <h3>Ideas clave</h3>
    <ul>${lesson.theory.map((item) => `<li>${item}</li>`).join("")}</ul>
    <h3>Ejemplo</h3>
    <p>${lesson.example}</p>
    <h3>Checklist</h3>
    <ul>${lesson.checklist.map((item) => `<li>${item}</li>`).join("")}</ul>
    <h3>Recursos del modulo</h3>
    <pre>${state.moduleResourcesText || "Sin recursos extra para este modulo."}</pre>
  `;
}

function renderQuiz() {
  const container = byId("quiz-container");
  container.innerHTML = "";

  state.quiz.questions.forEach((question, questionIndex) => {
    const wrapper = document.createElement("div");
    wrapper.className = "attempt-item";
    wrapper.innerHTML = `
      <p><strong>${questionIndex + 1}. ${question.question}</strong></p>
      ${question.options
        .map(
          (option, optionIndex) =>
            `<label><input type="radio" name="q_${questionIndex}" value="${optionIndex}" /> ${option}</label>`
        )
        .join("")}
    `;
    container.appendChild(wrapper);
  });
}

function bindQuizSubmit() {
  byId("submit-quiz").addEventListener("click", () => {
    const patient = getActivePatient();
    if (!patient) {
      byId("quiz-result").textContent = "Selecciona o crea un paciente antes de guardar resultados.";
      return;
    }

    let correct = 0;

    state.quiz.questions.forEach((question, index) => {
      const selected = document.querySelector(`input[name="q_${index}"]:checked`);
      if (selected && Number(selected.value) === question.correct_option) {
        correct += 1;
      }
    });

    const score = Math.round((correct / state.quiz.questions.length) * 100);
    const scoreMap = safeJsonParse(localStorage.getItem(STORAGE_KEYS.quizScores) || "{}") || {};
    scoreMap[`${patient.id}::${state.currentModuleId}`] = score;
    localStorage.setItem(STORAGE_KEYS.quizScores, JSON.stringify(scoreMap));

    const pass = score >= state.quiz.passing_score;
    byId("quiz-result").textContent =
      `Resultado de ${patient.name}: ${score}/100 (${correct}/${state.quiz.questions.length}) - ${pass ? "Aprobado" : "No aprobado"}`;

    unlockNextModuleIfEligible();
    renderModuleSelector();
    renderModuleStatusText();
    renderRoadmap();
    renderProgress();
    renderPatientPanel();
  });
}

function initApiConfig() {
  const config = safeJsonParse(localStorage.getItem(STORAGE_KEYS.apiConfig) || "{}") || {};
  byId("api-key").value = config.apiKey || "";
  byId("api-model").value = config.model || "gpt-4.1-mini";
}

function bindApiConfig() {
  byId("save-api").addEventListener("click", () => {
    const apiKey = byId("api-key").value.trim();
    const model = byId("api-model").value.trim();

    localStorage.setItem(STORAGE_KEYS.apiConfig, JSON.stringify({ apiKey, model }));
    byId("api-status").textContent = "Configuracion API guardada en localStorage.";
  });
}

function renderExercises() {
  const select = byId("exercise-select");
  select.innerHTML = "";

  state.challenges.exercises.forEach((exercise) => {
    const option = document.createElement("option");
    option.value = exercise.id;
    option.textContent = exercise.title;
    select.appendChild(option);
  });

  syncExerciseInstruction();
}

function getSelectedExercise() {
  const exerciseId = byId("exercise-select").value;
  return state.challenges.exercises.find((exercise) => exercise.id === exerciseId) || null;
}

function buildAdaptationPlan(patient, exercise) {
  if (!patient || !exercise) {
    return "Selecciona un paciente para generar una recomendacion clinica inicial.";
  }

  const goals = patient.goals.length ? patient.goals.join(", ") : "objetivos sin definir";
  const tags = patient.tags.length ? patient.tags.join(", ") : "sin etiquetas";

  const suggestions = [
    `Paciente activo: ${patient.name}, ${patient.age || "edad no definida"} anos, nivel ${patient.level}.`,
    `Objetivos prioritarios: ${goals}.`,
    `Etiquetas clinicas o de seguimiento: ${tags}.`,
    `Actividad actual: ${exercise.title}. Empieza con apoyo visual y modelado explicito si el rendimiento baja del 60%.`,
    "Registra aciertos, ayudas necesarias y fatiga. Si aparecen bloqueos, reduce longitud de tarea y aumenta refuerzo positivo.",
  ];

  if (patient.tags.some((tag) => tag.includes("tartam"))) {
    suggestions.push("Incluye ritmo lento, turnos previsibles y evita feedback punitivo sobre fluidez.");
  }
  if (patient.tags.some((tag) => tag.includes("dislexia") || tag.includes("lecto"))) {
    suggestions.push("Usa tamano visual grande, menos distractores y repeticiones breves con control de carga lectora.");
  }
  if (patient.tags.some((tag) => tag.includes("tea") || tag.includes("autismo"))) {
    suggestions.push("Anticipa la secuencia con pictos o pasos visibles y mantiene una estructura muy estable.");
  }

  return suggestions.join("\n");
}

function syncExerciseInstruction() {
  const exercise = getSelectedExercise();
  byId("exercise-instruction").textContent = exercise ? exercise.instruction : "";
  byId("patient-adaptation").textContent = buildAdaptationPlan(getActivePatient(), exercise);
}

function extractResponseText(apiResponse) {
  if (typeof apiResponse === "string") return apiResponse;
  if (apiResponse.output_text) return apiResponse.output_text;
  if (apiResponse.answer) return apiResponse.answer;
  if (apiResponse.content) return apiResponse.content;
  if (Array.isArray(apiResponse.output)) {
    const chunks = [];
    for (const item of apiResponse.output) {
      if (!item || !Array.isArray(item.content)) continue;
      for (const contentItem of item.content) {
        if (contentItem && typeof contentItem.text === "string") chunks.push(contentItem.text);
      }
    }
    if (chunks.length) return chunks.join("\n\n");
  }
  return JSON.stringify(apiResponse, null, 2);
}

function extractJsonFromText(text) {
  if (!text) return null;
  const direct = safeJsonParse(text);
  if (direct) return direct;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  return safeJsonParse(match[0]);
}

function buildComparisonPrompt({ exerciseTitle, userPrompt, internalOutput, externalOutput, patient }) {
  return `
Compara dos respuestas para entrenamiento de prompting en logopedia.

Contexto del paciente:
- Nombre: ${patient?.name || "sin paciente"}
- Edad: ${patient?.age || "no definida"}
- Nivel: ${patient?.level || "sin nivel"}
- Objetivos: ${(patient?.goals || []).join(", ") || "sin objetivos"}
- Etiquetas: ${(patient?.tags || []).join(", ") || "sin etiquetas"}

Contexto de tarea:
- Ejercicio: ${exerciseTitle}
- Prompt original del alumno:
${userPrompt}

Respuesta A (API interna):
${internalOutput}

Respuesta B (GPT externo del alumno):
${externalOutput}

Evalua con estos criterios (0-10):
1) claridad
2) utilidad logopedica
3) estructura accionable
4) seguridad y limites profesionales

Devuelve SOLO JSON valido con este formato:
{
  "winner": "A" o "B" o "Empate",
  "scores": {
    "A": { "clarity": 0, "clinical_utility": 0, "structure": 0, "safety": 0, "total": 0 },
    "B": { "clarity": 0, "clinical_utility": 0, "structure": 0, "safety": 0, "total": 0 }
  },
  "reasoning": ["motivo 1", "motivo 2", "motivo 3"],
  "how_to_improve_prompt": ["mejora 1", "mejora 2", "mejora 3"],
  "improved_prompt": "version mejorada del prompt del alumno para obtener una salida superior"
}
  `.trim();
}

function formatComparisonResult(result) {
  if (!result || typeof result !== "object") return "No se pudo generar comparacion estructurada.";

  const winner = result.winner || "No definido";
  const scoreA = result.scores?.A?.total ?? "n/a";
  const scoreB = result.scores?.B?.total ?? "n/a";
  const reasons = Array.isArray(result.reasoning) ? result.reasoning.map((item) => `- ${item}`).join("\n") : "- Sin razones";
  const improvements = Array.isArray(result.how_to_improve_prompt)
    ? result.how_to_improve_prompt.map((item) => `- ${item}`).join("\n")
    : "- Sin mejoras";
  const improvedPrompt = result.improved_prompt || "No disponible";

  return [
    `Ganador: ${winner}`,
    `Puntuacion total A (interna): ${scoreA}`,
    `Puntuacion total B (externa): ${scoreB}`,
    "",
    "Por que:",
    reasons,
    "",
    "Como mejorar el prompt del alumno:",
    improvements,
    "",
    "Prompt mejorado propuesto:",
    improvedPrompt,
  ].join("\n");
}

function getDemoScenario() {
  const exercise = getSelectedExercise();
  if (exercise && DEMO_SCENARIOS[exercise.id]) return DEMO_SCENARIOS[exercise.id];
  return DEMO_SCENARIOS.default;
}

function runDemoMode() {
  const demo = getDemoScenario();
  byId("prompt-input").value = demo.prompt;
  byId("internal-output").value = demo.internal;
  byId("external-output").value = demo.external;
  byId("self-analysis").value = demo.selfAnalysis;
  state.lastComparison = demo.comparison;
  byId("comparison-output").value = formatComparisonResult(demo.comparison);
  renderSemaphore(demo.comparison);
  byId("attempt-status").textContent = "Demo cargada: ya puedes revisar el analisis, guardar intento y ver evolucion.";
}

function getComparisonScores(result) {
  return {
    totalA: toNumber(result?.scores?.A?.total),
    totalB: toNumber(result?.scores?.B?.total),
  };
}

function getSemaphoreClass(totalA, totalB) {
  const difference = Math.abs(totalA - totalB);
  if (difference <= 2) return "sem-yellow";
  return totalA > totalB ? "sem-green" : "sem-red";
}

function renderSemaphore(result) {
  const box = byId("comparison-semaphore");
  if (!result) {
    box.className = "semaphore hidden";
    box.textContent = "";
    return;
  }

  const { totalA, totalB } = getComparisonScores(result);
  const semClass = getSemaphoreClass(totalA, totalB);
  const winner = result.winner || "No definido";
  box.className = `semaphore ${semClass}`;
  box.textContent = `Semaforo comparativo -> A: ${totalA} | B: ${totalB} | Ganador: ${winner}`;
}

async function runPrompt() {
  const config = safeJsonParse(localStorage.getItem(STORAGE_KEYS.apiConfig) || "{}") || {};
  const prompt = byId("prompt-input").value.trim();
  const exercise = getSelectedExercise();
  const patient = getActivePatient();

  if (!patient) {
    byId("attempt-status").textContent = "Crea o selecciona un paciente antes de lanzar actividades.";
    return;
  }
  if (!config.apiKey) {
    byId("attempt-status").textContent = "Pega tu API key (sk-...) y guarda configuracion.";
    return;
  }
  if (!prompt) {
    byId("attempt-status").textContent = "Escribe un prompt antes de enviar.";
    return;
  }

  byId("attempt-status").textContent = "Enviando prompt a API...";

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    };

    const body = {
      model: config.model || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Eres un asistente de formacion en logopedia. Responde de forma clara, estructurada y segura.",
        },
        {
          role: "user",
          content: [
            `Modulo: ${state.module.id}`,
            `Ejercicio: ${exercise ? exercise.id : "sin-ejercicio"}`,
            `Paciente: ${patient.name}`,
            `Edad: ${patient.age || "n/d"}`,
            `Nivel: ${patient.level}`,
            `Objetivos: ${patient.goals.join(", ") || "sin objetivos"}`,
            `Etiquetas: ${patient.tags.join(", ") || "sin etiquetas"}`,
            "",
            prompt,
          ].join("\n"),
        },
      ],
    };

    const response = await fetch(FIXED_API_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      byId("attempt-status").textContent = `Error API (${response.status}): ${errorText.slice(0, 180)}`;
      return;
    }

    const data = await response.json();
    byId("internal-output").value = extractResponseText(data);
    byId("attempt-status").textContent = "Respuesta recibida.";
  } catch (error) {
    byId("attempt-status").textContent = `Error API: ${error.message}`;
  }
}

async function compareOutputs() {
  const config = safeJsonParse(localStorage.getItem(STORAGE_KEYS.apiConfig) || "{}") || {};
  const exercise = getSelectedExercise();
  const patient = getActivePatient();
  const userPrompt = byId("prompt-input").value.trim();
  const internalOutput = byId("internal-output").value.trim();
  const externalOutput = byId("external-output").value.trim();

  if (!patient) {
    byId("attempt-status").textContent = "Selecciona un paciente antes de comparar resultados.";
    return;
  }
  if (!config.apiKey) {
    byId("attempt-status").textContent = "Pega tu API key (sk-...) y guarda configuracion.";
    return;
  }
  if (!userPrompt || !internalOutput || !externalOutput) {
    byId("attempt-status").textContent = "Para comparar necesitas: prompt, respuesta interna y respuesta externa.";
    return;
  }

  byId("attempt-status").textContent = "Comparando respuestas con IA...";

  try {
    const response = await fetch(FIXED_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "Eres evaluador experto de prompts en logopedia. Prioriza seguridad profesional y accionabilidad.",
          },
          {
            role: "user",
            content: buildComparisonPrompt({
              exerciseTitle: exercise ? exercise.title : "Sin ejercicio",
              userPrompt,
              internalOutput,
              externalOutput,
              patient,
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      byId("attempt-status").textContent = `Error comparacion (${response.status}): ${errorText.slice(0, 180)}`;
      return;
    }

    const data = await response.json();
    const rawText = extractResponseText(data);
    const parsed = extractJsonFromText(rawText);
    const finalText = parsed ? formatComparisonResult(parsed) : rawText;

    state.lastComparison = parsed;
    byId("comparison-output").value = finalText;
    renderSemaphore(parsed);
    byId("attempt-status").textContent = "Comparacion completada.";
  } catch (error) {
    byId("attempt-status").textContent = `Error comparacion: ${error.message}`;
  }
}

function scorePrompt(prompt, patient) {
  const lower = prompt.toLowerCase();
  let clarity = 0;
  if (prompt.length >= 80) clarity += 10;
  if (/(objetivo|meta|quiero que)/.test(lower)) clarity += 15;

  const clinicalTerms = ["articulacion", "fonologia", "vocabulario", "comprension", "expresion", "logopedia"];
  const foundClinical = clinicalTerms.filter((term) => lower.includes(term)).length;
  const clinicalRelevance = Math.min(25, foundClinical * 6);

  const structureTerms = ["edad", "duracion", "material", "pasos", "formato"];
  const foundStructure = structureTerms.filter((term) => lower.includes(term)).length;
  const structure = Math.min(25, foundStructure * 6);

  const safety = /(no diagnostico|orientativo|supervision profesional|no sustituye)/.test(lower) ? 25 : 8;

  const patientAlignmentTerms = [...(patient?.goals || []), ...(patient?.tags || [])];
  const alignedCount = patientAlignmentTerms.filter((term) => lower.includes(term.toLowerCase())).length;
  const personalization = Math.min(10, alignedCount * 4);

  return {
    clarity,
    clinical_relevance: clinicalRelevance,
    structure,
    safety,
    personalization,
    total: Math.min(100, clarity + clinicalRelevance + structure + safety + personalization),
  };
}

function saveAttempt() {
  const patient = getActivePatient();
  const exercise = getSelectedExercise();
  const prompt = byId("prompt-input").value.trim();
  const internalOutput = byId("internal-output").value.trim();
  const externalOutput = byId("external-output").value.trim();
  const selfAnalysis = byId("self-analysis").value.trim();
  const comparisonOutput = byId("comparison-output").value.trim();

  if (!patient) {
    byId("attempt-status").textContent = "Selecciona un paciente antes de guardar.";
    return;
  }
  if (!prompt) {
    byId("attempt-status").textContent = "No se puede guardar sin prompt.";
    return;
  }

  const scoring = scorePrompt(prompt, patient);
  const record = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    patient_id: patient.id,
    patient_name: patient.name,
    patient_snapshot: patient,
    module_id: state.currentModuleId,
    module_title: state.module?.title || state.currentModuleId,
    exercise_id: exercise ? exercise.id : "sin-ejercicio",
    exercise_title: exercise ? exercise.title : "Sin ejercicio",
    prompt,
    output_internal_api: internalOutput,
    output_external_reference: externalOutput,
    self_analysis: selfAnalysis,
    comparison_output: comparisonOutput,
    comparison_result: state.lastComparison,
    adaptation_plan: buildAdaptationPlan(patient, exercise),
    scoring,
  };

  const existing = getAllAttempts();
  existing.unshift(record);
  localStorage.setItem(STORAGE_KEYS.attempts, JSON.stringify(existing));

  const linkedActivity = getDefaultSuiteActivityForPatient(patient);
  if (linkedActivity) {
    const suiteEvents = getSuiteEvents();
    suiteEvents.unshift(
      createSuiteEvent({
        patient,
        activityId: linkedActivity.id,
        activityTitle: linkedActivity.title,
        area: linkedActivity.focus_areas?.[0] || "general",
        status: scoring.total >= 80 ? "completed" : "in_progress",
        levelIndex: Math.max(1, Math.round(scoring.total / 25)),
        levelLabel: scoring.total >= 80 ? "Sesion consolidada" : "Sesion en progreso",
        score: scoring.total,
        accuracy: Math.max(scoring.total - 4, 0),
        durationMinutes: 12,
        notes: `Intento guardado desde el hub central con foco en ${exercise ? exercise.title : "practica general"}.`,
      })
    );
    saveSuiteEvents(suiteEvents);
  }

  byId("attempt-status").textContent = `Intento guardado para ${patient.name}. Nota: ${scoring.total}/100`;
  unlockNextModuleIfEligible();
  renderModuleSelector();
  renderModuleStatusText();
  renderRoadmap();
  renderProgress();
  renderPatientPanel();
  renderSuiteDashboard();
}

function clearPracticeFields() {
  byId("prompt-input").value = "";
  byId("internal-output").value = "";
  byId("external-output").value = "";
  byId("self-analysis").value = "";
  byId("comparison-output").value = "";
  state.lastComparison = null;
  renderSemaphore(null);
}

function goToNextExercise() {
  const select = byId("exercise-select");
  const index = select.selectedIndex;
  const lastIndex = select.options.length - 1;
  if (index < lastIndex) {
    select.selectedIndex = index + 1;
    syncExerciseInstruction();
    clearPracticeFields();
    byId("attempt-status").textContent = "Avanzaste al siguiente ejercicio.";
    return;
  }

  byId("attempt-status").textContent = `Ya estas en el ultimo ejercicio de ${state.currentModuleId.toUpperCase()}.`;
}

function getPatientQuizScore(patient, moduleId) {
  const scoreMap = safeJsonParse(localStorage.getItem(STORAGE_KEYS.quizScores) || "{}") || {};
  return toNumber(scoreMap[`${patient.id}::${moduleId}`] || 0);
}

function createSuiteEvent({
  patient,
  activityId,
  activityTitle,
  area,
  status,
  levelIndex,
  levelLabel,
  score,
  accuracy,
  durationMinutes,
  notes,
  date,
}) {
  return {
    id: crypto.randomUUID(),
    patient_id: patient.id,
    patient_name: patient.name,
    activity_id: activityId,
    activity_title: activityTitle,
    area: area || "general",
    status: status || "completed",
    level_index: levelIndex || 1,
    level_label: levelLabel || "Hito guardado",
    score: toNumber(score),
    accuracy: toNumber(accuracy || score),
    duration_minutes: toNumber(durationMinutes),
    notes: notes || "",
    date: date || new Date().toISOString(),
  };
}

function getActivityById(activityId) {
  return (state.activityCatalog?.activities || []).find((activity) => activity.id === activityId) || null;
}

function buildMeasuredResourceUrl(activity) {
  if (!activity?.id) return "#";
  return `./resource-player.html?activity=${encodeURIComponent(activity.id)}`;
}

function buildSourceResourceUrl(activity) {
  if (!activity?.rel_path) return "#";
  return `../../${encodePathSegments(activity.rel_path)}`;
}

function getActivityTheme(activity) {
  if (activity?.kind === "assessment") {
    return { coverClass: "is-assessment", icon: "📊", badge: "Evaluacion Pro" };
  }
  if (activity?.kind === "chatbot") {
    return { coverClass: "is-chatbot", icon: "💬", badge: "Orientacion" };
  }
  if (activity?.kind === "tool" || activity?.kind === "app") {
    return { coverClass: "is-tool", icon: "🧠", badge: "Herramienta Clinica" };
  }
  return { coverClass: "is-game", icon: "🎮", badge: "Juego Terapeutico" };
}

function getActivityFeaturePills(activity) {
  const base = [];
  const focusAreas = (activity?.focus_areas || []).filter(Boolean);
  const tags = (activity?.tags || []).filter(Boolean);

  if (focusAreas[0]) base.push(`🧩 ${focusAreas[0]}`);
  if (focusAreas[1]) base.push(`📚 ${focusAreas[1]}`);
  if (activity?.age_range) base.push(`👦 ${activity.age_range}`);
  if (activity?.difficulty) base.push(`⚡ ${activity.difficulty}`);

  for (const tag of tags) {
    if (base.length >= 6) break;
    if (!base.some((item) => item.toLowerCase().includes(tag.toLowerCase()))) {
      base.push(`✨ ${tag}`);
    }
  }

  return base.slice(0, 6);
}

function getActivityProgressLabel(latest) {
  if (!latest) return "Aun sin recorrido en este paciente";
  return `${latest.level_label} · ${toNumber(latest.score)}/100`;
}

function buildActivityCard(activity, patientEvents) {
  const events = patientEvents.filter((event) => event.activity_id === activity.id);
  const latest = [...events].sort((left, right) => new Date(right.date) - new Date(left.date))[0];
  const theme = getActivityTheme(activity);
  const pills = getActivityFeaturePills(activity);
  const progressPercent = latest
    ? Math.max(16, Math.min(100, toNumber(latest.level_index) * 24 + Math.round(toNumber(latest.score) * 0.4)))
    : 8;

  return `
    <article class="activity-card">
      <div class="activity-cover ${theme.coverClass}">
        <span class="cover-badge">${theme.badge}</span>
        <span class="cover-orb">${theme.icon}</span>
        <div class="cover-title">${escapeHtml(activity.title)}</div>
      </div>
      <div class="activity-body">
        <div class="activity-top">
          <span class="pill">${escapeHtml(activity.kind || "recurso")}</span>
          <span class="pill neutral">${escapeHtml(activity.integration_status || "catalogado")}</span>
        </div>
        <h3>${escapeHtml(activity.title)}</h3>
        <p>${escapeHtml(activity.summary || "Sin resumen todavia.")}</p>
        <div class="feature-pills">
          ${pills.map((pill) => `<span class="feature-pill">${escapeHtml(pill)}</span>`).join("")}
        </div>
        <div class="activity-status-box">
          <p><strong>Estado actual:</strong> ${escapeHtml(getActivityProgressLabel(latest))}</p>
          <div class="mini-progress"><span style="width:${progressPercent}%"></span></div>
          <p class="small"><strong>Ruta:</strong> ${escapeHtml(activity.rel_path || "sin origen")}</p>
        </div>
        <div class="activity-actions">
          <button class="action-btn secondary" type="button" data-open-patient-sheet="${escapeHtml(activity.id)}">Ver ficha</button>
          <a class="action-btn primary" href="${buildMeasuredResourceUrl(activity)}" target="_blank" rel="noreferrer">Usar Ahora</a>
        </div>
      </div>
    </article>
  `;
}

function buildDevelopmentCard(activity) {
  const theme = getActivityTheme(activity);
  const pills = getActivityFeaturePills(activity);
  return `
    <article class="activity-card is-development is-demo-shadow">
      <div class="activity-cover ${theme.coverClass}">
        <span class="cover-badge">Demo · en construccion</span>
        <span class="cover-orb">${theme.icon}</span>
        <div class="cover-title">${escapeHtml(activity.title)}</div>
      </div>
      <div class="activity-body">
        <div class="activity-top">
          <span class="pill">${escapeHtml(activity.kind || "demo")}</span>
          <span class="pill neutral">${escapeHtml(activity.integration_status || "en-desarrollo")}</span>
        </div>
        <h3>${escapeHtml(activity.title)}</h3>
        <p>${escapeHtml(activity.summary || "Demo jugable pendiente de integrar a la capa medible.")}</p>
        <div class="feature-pills">
          ${pills.map((pill) => `<span class="feature-pill">${escapeHtml(pill)}</span>`).join("")}
        </div>
        <p class="development-note"><strong>Estado:</strong> demo jugable con medicion local propia. No guarda en la suite clinica ni afecta al perfil del alumno.</p>
        <div class="activity-actions">
          ${activity.repo_url ? `<a class="action-btn secondary" href="${escapeHtml(activity.repo_url)}" target="_blank" rel="noreferrer">Ver repo</a>` : ""}
          <a class="action-btn primary" href="${escapeHtml(activity.web_path || '#')}${String(activity.web_path || "").includes("?") ? "&" : "?"}refresh=20260412f" target="_blank" rel="noreferrer">Abrir demo</a>
        </div>
      </div>
    </article>
  `;
}

function getDefaultSuiteActivityForPatient(patient) {
  if (!patient) return null;
  const activities = recommendActivities(patient);
  return activities[0] || null;
}

function buildRecentSessionSummary(events) {
  if (!events.length) return '<p class="small">Sin datos aun.</p>';
  const recent = [...events].sort((left, right) => new Date(right.date) - new Date(left.date)).slice(0, 3);
  return `
    <div class="suite-session-summary">
      ${recent
        .map((event) => {
          const averageTime = toNumber(event.measurement_data?.average_time_ms);
          const timeLabel = averageTime ? `${Math.round(averageTime / 100) / 10}s` : `${toNumber(event.duration_minutes) || 0} min`;
          return `
            <div class="suite-session-row">
              <span>${new Date(event.date).toLocaleDateString()}</span>
              <strong>${toNumber(event.score)}/100</strong>
              <em>${escapeHtml(timeLabel)}</em>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function getStrongestArea(events) {
  const totals = {};
  for (const event of events) {
    const key = event.area || "general";
    if (!totals[key]) totals[key] = { total: 0, count: 0 };
    totals[key].total += toNumber(event.score);
    totals[key].count += 1;
  }
  const ranked = Object.entries(totals)
    .map(([area, value]) => ({ area, avg: Math.round(value.total / value.count) }))
    .sort((left, right) => right.avg - left.avg);
  return ranked[0] || null;
}

function collectSuiteMeasurementInsights(events) {
  const insight = {
    workedDimensions: {},
    visualSimilarity: [],
    auditorySimilarity: [],
    visualLoad: [],
    averageTimeSec: [],
    averageErrors: [],
    consistency: [],
  };

  for (const event of events) {
    const data = event.measurement_data;
    if (!data || typeof data !== "object") continue;

    for (const dimension of data.worked_dimensions || []) {
      if (!dimension) continue;
      insight.workedDimensions[dimension] = (insight.workedDimensions[dimension] || 0) + 1;
    }

    if (Number.isFinite(toNumber(data.visual_similarity))) insight.visualSimilarity.push(toNumber(data.visual_similarity));
    if (Number.isFinite(toNumber(data.auditory_similarity))) insight.auditorySimilarity.push(toNumber(data.auditory_similarity));
    if (Number.isFinite(toNumber(data.visual_load))) insight.visualLoad.push(toNumber(data.visual_load));
    if (Number.isFinite(toNumber(data.average_time_ms))) insight.averageTimeSec.push(Math.round(toNumber(data.average_time_ms) / 100) / 10);
    if (Number.isFinite(toNumber(data.average_errors))) insight.averageErrors.push(toNumber(data.average_errors));
    if (Number.isFinite(toNumber(data.reaction_consistency))) insight.consistency.push(toNumber(data.reaction_consistency));
  }

  return insight;
}

function averageOf(values) {
  if (!values.length) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function buildSuiteAreaViews(events) {
  const insight = collectSuiteMeasurementInsights(events);
  const workedDimensions = Object.entries(insight.workedDimensions)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8);

  const perceptionRows = [
    { label: "Sim visual", value: averageOf(insight.visualSimilarity), suffix: "%" },
    { label: "Sim auditiva", value: averageOf(insight.auditorySimilarity), suffix: "%" },
    { label: "Carga visual", value: averageOf(insight.visualLoad), suffix: "%" },
  ];

  const executionRows = [
    { label: "Tiempo medio", value: averageOf(insight.averageTimeSec), suffix: "s", scale: 12 },
    { label: "Errores", value: averageOf(insight.averageErrors), suffix: "", scale: 6 },
    { label: "Consistencia", value: averageOf(insight.consistency), suffix: "%", scale: 100 },
  ];

  return `
    <article class="suite-insight-card">
      <h3>Areas trabajadas</h3>
      <p class="small">Vista funcional de las dimensiones que mas se han ejercitado en la suite.</p>
      <div class="insight-chip-row">
        ${
          workedDimensions.length
            ? workedDimensions.map(([label, count]) => `<span class="insight-chip">${escapeHtml(label)} · ${count}</span>`).join("")
            : `<span class="insight-chip">Sin areas detectadas aun</span>`
        }
      </div>
    </article>
    <article class="suite-insight-card">
      <h3>Perfil perceptivo</h3>
      <p class="small">Como de parecidos eran los distractores y cuanta carga perceptiva implicaba la tarea.</p>
      <div class="insight-bars">
        ${perceptionRows
          .map((row) => `
            <div class="insight-bar-row">
              <span>${row.label}</span>
              <div class="insight-bar-track"><span class="insight-bar-fill" style="width:${Math.max(6, Math.min(100, row.value || 0))}%"></span></div>
              <span>${row.value ? `${row.value}${row.suffix}` : "n/d"}</span>
            </div>
          `)
          .join("")}
      </div>
    </article>
    <article class="suite-insight-card">
      <h3>Perfil de ejecucion</h3>
      <p class="small">Otra lectura del mismo progreso: velocidad, errores y estabilidad entre rondas.</p>
      <div class="insight-bars">
        ${executionRows
          .map((row) => {
            const scale = row.scale || 100;
            const width = row.value ? Math.max(6, Math.min(100, (row.value / scale) * 100)) : 0;
            return `
              <div class="insight-bar-row">
                <span>${row.label}</span>
                <div class="insight-bar-track"><span class="insight-bar-fill" style="width:${width}%"></span></div>
                <span>${row.value ? `${row.value}${row.suffix}` : "n/d"}</span>
              </div>
            `;
          })
          .join("")}
      </div>
    </article>
  `;
}

function getTopWorkedDimensions(events, limit = 3) {
  return Object.entries(collectSuiteMeasurementInsights(events).workedDimensions)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label]) => label);
}

function buildSuiteTrendBadge(label, current, previous, options = {}) {
  const { suffix = "", lowerIsBetter = false, decimals = 0 } = options;
  const currentSafe = Number.isFinite(current) ? current : null;
  const previousSafe = Number.isFinite(previous) ? previous : null;
  let status = "estable";

  if (currentSafe !== null && previousSafe !== null && currentSafe !== previousSafe) {
    const improved = lowerIsBetter ? currentSafe < previousSafe : currentSafe > previousSafe;
    status = improved ? "mejora" : "alerta";
  }

  const formatValue = (value) => {
    if (!Number.isFinite(value)) return "n/d";
    const fixed = decimals ? value.toFixed(decimals) : Math.round(value).toString();
    return `${fixed}${suffix}`;
  };

  return `
    <span class="trend-badge is-${status}">
      <strong>${escapeHtml(label)}</strong>
      <span>${formatValue(currentSafe)}</span>
      <em>${previousSafe === null ? "Sin referencia previa" : `Antes ${formatValue(previousSafe)}`}</em>
    </span>
  `;
}

function buildSuiteGraphPanels(events, groupedEntries) {
  if (!events.length) {
    return `
      <article class="suite-graph-card">
        <h3>Evolucion y lecturas clinicas</h3>
        <p class="small">Todavia no hay sesiones medidas para construir graficas y comparativas.</p>
      </article>
    `;
  }

  const sortedEvents = [...events].sort((left, right) => new Date(left.date) - new Date(right.date));
  const midpoint = Math.max(1, Math.floor(sortedEvents.length / 2));
  const early = sortedEvents.slice(0, midpoint);
  const recent = sortedEvents.slice(midpoint);
  const recentWindow = sortedEvents.slice(-6);
  const areas = Object.entries(
    sortedEvents.reduce((acc, event) => {
      const key = event.area || "general";
      if (!acc[key]) acc[key] = { score: 0, count: 0, minutes: 0 };
      acc[key].score += toNumber(event.score);
      acc[key].count += 1;
      acc[key].minutes += toNumber(event.duration_minutes);
      return acc;
    }, {})
  )
    .map(([label, value]) => ({
      label,
      avg: Math.round(value.score / Math.max(1, value.count)),
      count: value.count,
      minutes: value.minutes,
    }))
    .sort((left, right) => right.avg - left.avg)
    .slice(0, 5);

  const getAvg = (collection, key, mapper) => {
    const values = collection
      .map((item) => (mapper ? mapper(item[key]) : item[key]))
      .map((value) => toNumber(value))
      .filter((value) => Number.isFinite(value) && value > 0);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : NaN;
  };

  const scoreRecent = getAvg(recent.length ? recent : sortedEvents, "score");
  const scoreEarly = getAvg(early, "score");
  const timeRecent = getAvg(recent.length ? recent : sortedEvents, "measurement_data", (value) => toNumber(value?.average_time_ms) / 1000);
  const timeEarly = getAvg(early, "measurement_data", (value) => toNumber(value?.average_time_ms) / 1000);
  const errorsRecent = getAvg(recent.length ? recent : sortedEvents, "measurement_data", (value) => value?.average_errors);
  const errorsEarly = getAvg(early, "measurement_data", (value) => value?.average_errors);
  const consistencyRecent = getAvg(recent.length ? recent : sortedEvents, "measurement_data", (value) => value?.reaction_consistency);
  const consistencyEarly = getAvg(early, "measurement_data", (value) => value?.reaction_consistency);

  return `
    <article class="suite-graph-card">
      <h3>Evolucion reciente</h3>
      <p class="small">Comparativa entre las primeras sesiones y el bloque mas reciente para ver si mejora, se estabiliza o necesita apoyo.</p>
      <div class="trend-badges">
        ${buildSuiteTrendBadge("Score", scoreRecent, scoreEarly, { suffix: "/100" })}
        ${buildSuiteTrendBadge("Tiempo", timeRecent, timeEarly, { suffix: "s", lowerIsBetter: true, decimals: 1 })}
        ${buildSuiteTrendBadge("Errores", errorsRecent, errorsEarly, { lowerIsBetter: true, decimals: 1 })}
        ${buildSuiteTrendBadge("Consistencia", consistencyRecent, consistencyEarly, { suffix: "%", decimals: 1 })}
      </div>
      <div class="session-lane">
        ${recentWindow
          .map((event) => {
            const score = Math.max(8, Math.min(100, toNumber(event.score)));
            return `
              <div class="session-pill">
                <span class="session-pill-date">${new Date(event.date).toLocaleDateString()}</span>
                <strong>${escapeHtml(event.activity_title || "Actividad")}</strong>
                <div class="session-pill-bar"><span style="width:${score}%"></span></div>
                <small>${toNumber(event.score)}/100 · ${toNumber(event.duration_minutes) || 0} min</small>
              </div>
            `;
          })
          .join("")}
      </div>
    </article>
    <article class="suite-graph-card">
      <h3>Lectura por areas</h3>
      <p class="small">Otra vista del progreso: que area se ha trabajado mas, con que rendimiento y cuanto tiempo acumula.</p>
      <div class="area-evolution-list">
        ${
          areas.length
            ? areas
                .map(
                  (area) => `
                    <div class="area-evolution-row">
                      <div>
                        <strong>${escapeHtml(area.label)}</strong>
                        <small>${area.count} sesiones · ${area.minutes || 0} min</small>
                      </div>
                      <div class="area-evolution-track"><span style="width:${Math.max(10, Math.min(100, area.avg))}%"></span></div>
                      <strong>${area.avg}/100</strong>
                    </div>
                  `
                )
                .join("")
            : `<p class="small">Sin areas suficientes para comparar todavia.</p>`
        }
      </div>
      <p class="small">
        Recursos principales en juego: ${
          groupedEntries
            .slice(0, 3)
            .map((entry) => entry.latest.activity_title || entry.activity?.title || "Actividad")
            .join(" · ") || "n/d"
        }.
      </p>
    </article>
  `;
}

function deriveLogopediaSkillSignals(event) {
  const data = event.measurement_data || {};
  const signals = {};
  const activityId = event.activity_id || "";
  const labels = [...(data.labels_small || []), ...(data.worked_dimensions || [])].map((item) => String(item || "").toLowerCase());

  const push = (key, value) => {
    if (!Number.isFinite(value)) return;
    if (!signals[key]) signals[key] = [];
    signals[key].push(value);
  };

  if (activityId === "poe-letra-crush") {
    if (data.mode === "letters") push("reconocimiento de grafia", data.score);
    if (data.mode === "syllables") push("reconocimiento de silaba", data.score);
    if (data.mode === "images") push("denominacion", data.score);
    if (data.mode === "phonemes") push("conciencia fonologica", data.score);
    push("control inhibitorio", 100 - toNumber(data.support_dependency));
    push("planificacion", toNumber(data.move_efficiency));
  }

  if (activityId === "poe-lupas-y-linternas") {
    if (data.search_type === "words") push("reconocimiento de grafia", toNumber(data.search_efficiency || data.score));
    if (data.search_type === "syllables") push("reconocimiento de silaba", toNumber(data.search_efficiency || data.score));
    if (data.search_type === "categories") push("denominacion", toNumber(data.score));
    if (data.search_type === "phonemes") push("conciencia fonologica", toNumber(data.score));
    push("atencion sostenida", toNumber(data.sustained_attention || data.reaction_consistency));
  }

  if (activityId === "poe-encuentra-el-nuevo") {
    push("articulacion objetivo", toNumber(data.score));
    push("memoria de trabajo", toNumber(data.memory_load));
    push("deteccion de novedad", toNumber(data.novelty_detection));
    push("denominacion", Math.max(0, 100 - toNumber(data.support_dependency)));
  }

  if (labels.some((item) => item.includes("grafem"))) push("reconocimiento de grafia", toNumber(data.score));
  if (labels.some((item) => item.includes("silab"))) push("reconocimiento de silaba", toNumber(data.score));
  if (labels.some((item) => item.includes("denomin"))) push("denominacion", toNumber(data.score));

  return signals;
}

function buildSuiteHeatmap(events) {
  if (!events.length) {
    return `
      <article class="heatmap-card">
        <h3>Mapa de calor logopedico</h3>
        <p class="small">Sin sesiones suficientes para construir el mapa de habilidades.</p>
      </article>
    `;
  }

  const totals = {};
  for (const event of events) {
    const signals = deriveLogopediaSkillSignals(event);
    for (const [key, values] of Object.entries(signals)) {
      if (!totals[key]) totals[key] = [];
      totals[key].push(...values.filter((value) => Number.isFinite(value)));
    }
  }

  const cells = Object.entries(totals)
    .map(([label, values]) => ({
      label,
      avg: Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length)),
      count: values.length,
    }))
    .sort((left, right) => right.avg - left.avg);

  return `
    <article class="heatmap-card">
      <h3>Mapa de calor logopedico</h3>
      <p class="small">Vista rapida por habilidades: grafia, silaba, denominacion, memoria, articulacion y control ejecutivo.</p>
      <div class="heatmap-grid">
        ${
          cells.length
            ? cells
                .map(
                  (cell) => `
                    <div class="heatmap-cell">
                      <strong>${escapeHtml(cell.label)}</strong>
                      <small>${cell.count} registros</small>
                      <div class="heatmap-intensity"><span style="width:${Math.max(8, Math.min(100, cell.avg))}%"></span></div>
                      <strong>${cell.avg}/100</strong>
                    </div>
                  `
                )
                .join("")
            : `<p class="small">Sin datos suficientes para el mapa.</p>`
        }
      </div>
    </article>
  `;
}

function renderSuiteDashboard() {
  const patient = getActivePatient();
  const events = patient ? getPatientSuiteEvents(patient.id) : [];
  const summary = byId("suite-summary");
  const latestSave = byId("suite-latest-save");
  const metrics = byId("suite-metrics");
  const areaViews = byId("suite-area-views");
  const clinicalSheet = byId("suite-clinical-sheet");
  const resourceHistory = byId("suite-resource-history");
  const heatmapPreview = byId("suite-heatmap-preview");
  const heatmap = byId("suite-heatmap");
  const map = byId("suite-map");
  const graph = byId("suite-graph");
  const timeline = byId("suite-timeline");

  if (!patient) {
    summary.textContent = "Selecciona un paciente para ver la suite conectada.";
    latestSave.textContent = "Sin paciente activo, asi que no hay guardado que mostrar.";
    metrics.innerHTML = "";
    areaViews.innerHTML = "";
    clinicalSheet.innerHTML = "";
    resourceHistory.innerHTML = "";
    heatmapPreview.innerHTML = "";
    heatmap.innerHTML = "";
    map.innerHTML = "";
    graph.innerHTML = "";
    timeline.innerHTML = "";
    return;
  }

  const grouped = {};
  for (const event of events) {
    if (!grouped[event.activity_id]) grouped[event.activity_id] = [];
    grouped[event.activity_id].push(event);
  }

  const groupedEntries = Object.entries(grouped)
    .map(([activityId, activityEvents]) => {
      const sorted = [...activityEvents].sort((left, right) => new Date(left.date) - new Date(right.date));
      const latest = sorted[sorted.length - 1];
      const avg = Math.round(sorted.reduce((sum, item) => sum + toNumber(item.score), 0) / sorted.length);
      return {
        activityId,
        activity: getActivityById(activityId),
        events: sorted,
        latest,
        avg,
        progress: Math.min(100, toNumber(latest.level_index) * 25 + Math.round(avg * 0.4)),
      };
    })
    .sort((left, right) => right.progress - left.progress);

  const strongestArea = getStrongestArea(events);
  const averageScore = events.length
    ? Math.round(events.reduce((sum, item) => sum + toNumber(item.score), 0) / events.length)
    : 0;
  const levelsPassed = events.filter((event) => /superado|dominad|estabilizado|registrado|enviado/i.test(event.level_label)).length;

  summary.textContent = events.length
    ? `${patient.name} ya se mueve por la suite completa: ${groupedEntries.length} recursos usados, ${levelsPassed} hitos consolidados y una media transversal de ${averageScore}/100.`
    : `Aun no hay datos transversales para ${patient.name}. Pulsa "Cargar modo demo integral" para ver el ecosistema completo en accion.`;

  metrics.innerHTML = [
    { label: "Recursos usados", value: groupedEntries.length || 0 },
    { label: "Hitos superados", value: levelsPassed || 0 },
    { label: "Media global", value: `${averageScore}/100` },
    { label: "Area fuerte", value: strongestArea ? `${strongestArea.area} (${strongestArea.avg})` : "n/d" },
  ]
    .map(
      (item) => `
        <article class="metric-card">
          <span class="metric-label">${item.label}</span>
          <span class="metric-value">${item.value}</span>
        </article>
      `
    )
    .join("");

  areaViews.innerHTML = buildSuiteAreaViews(events);
  clinicalSheet.innerHTML = buildSuiteClinicalSheet(patient);
  resourceHistory.innerHTML = buildSuiteResourceHistory(patient);
  const heatmapHtml = buildSuiteHeatmap(events);
  heatmap.innerHTML = heatmapHtml;
  if (heatmapPreview) heatmapPreview.innerHTML = heatmapHtml;

  map.innerHTML = groupedEntries.length
    ? groupedEntries
        .slice(0, 6)
        .map(({ activity, latest, avg, progress, events: activityEvents }) => {
          const title = latest.activity_title || activity?.title || "Actividad";
          const path = buildMeasuredResourceUrl(activity);
          return `
            <article class="suite-node">
              <div class="activity-top">
                <span class="pill">${latest.area || "general"}</span>
                <span class="pill neutral">${latest.status || "completed"}</span>
              </div>
              <h3>${title}</h3>
              <p class="small">Ultimo hito: ${latest.level_label}</p>
              <div class="mini-progress"><span style="width:${progress}%"></span></div>
              <p class="small"><strong>Media:</strong> ${avg}/100 | <strong>Ultima precision:</strong> ${toNumber(latest.accuracy)}/100</p>
              <div class="suite-node-summary">
                <p class="small"><strong>Ultimas sesiones</strong></p>
                ${buildRecentSessionSummary(activityEvents)}
              </div>
              <div class="activity-actions">
                <a class="link-btn" href="${path}" target="_blank" rel="noreferrer">Entrar y medir</a>
              </div>
            </article>
          `;
        })
        .join("")
    : `<p class="small">La suite todavia no tiene hitos guardados para este paciente.</p>`;

  const recentEvents = [...events]
    .sort((left, right) => new Date(right.date) - new Date(left.date))
    .slice(0, 8);

  latestSave.innerHTML = recentEvents.length
    ? `
      <p><strong>Ultima accion guardada:</strong> ${recentEvents[0].activity_title}</p>
      <p class="small">${recentEvents[0].level_label} | ${toNumber(recentEvents[0].score)}/100 | ${new Date(recentEvents[0].date).toLocaleString()}</p>
      <p class="small">${recentEvents[0].notes || "Sin observaciones."}</p>
    `
    : "Todavia no hay una accion registrada en la suite.";

  graph.innerHTML = buildSuiteGraphPanels(events, groupedEntries);

  timeline.innerHTML = recentEvents.length
    ? recentEvents
        .map(
          (event) => `
            <article class="timeline-item">
              <div class="timeline-date">${new Date(event.date).toLocaleDateString()}</div>
              <div class="timeline-body">
                <p><strong>${event.activity_title}</strong> -> ${event.level_label}</p>
                <p class="small">Area: ${event.area} | Score: ${toNumber(event.score)}/100 | Precision: ${toNumber(event.accuracy)}/100</p>
                <p class="small">${event.notes || ""}</p>
              </div>
            </article>
          `
        )
        .join("")
    : `<p class="small">Sin timeline todavia.</p>`;
}

function loadSuiteDemo() {
  const patients = getPatients();
  let patient = patients.find((item) => item.name === DEMO_SUITE_BLUEPRINT.patient.name);
  if (!patient) {
    patient = {
      id: crypto.randomUUID(),
      ...DEMO_SUITE_BLUEPRINT.patient,
      created_at: new Date().toISOString(),
    };
    patients.unshift(patient);
    savePatients(patients);
  }

  setActivePatientId(patient.id);

  const scoreMap = safeJsonParse(localStorage.getItem(STORAGE_KEYS.quizScores) || "{}") || {};
  Object.entries(DEMO_SUITE_BLUEPRINT.quizScores).forEach(([moduleId, score]) => {
    scoreMap[`${patient.id}::${moduleId}`] = score;
  });
  localStorage.setItem(STORAGE_KEYS.quizScores, JSON.stringify(scoreMap));

  const attempts = getAllAttempts().filter((item) => item.patient_id !== patient.id);
  DEMO_SUITE_BLUEPRINT.attempts.forEach((attempt, index) => {
    attempts.unshift({
      id: crypto.randomUUID(),
      date: new Date(Date.now() - attempt.days_ago * 24 * 60 * 60 * 1000).toISOString(),
      patient_id: patient.id,
      patient_name: patient.name,
      patient_snapshot: patient,
      module_id: attempt.module_id,
      module_title: attempt.module_title,
      exercise_id: attempt.exercise_id,
      exercise_title: attempt.exercise_title,
      prompt: `Demo ${index + 1}: adaptacion clinica para ${patient.name}.`,
      output_internal_api: "Salida demo interna",
      output_external_reference: "Salida demo externa",
      self_analysis: "Comparativa demo generada para mostrar la suite.",
      comparison_output: "Comparacion demo con ventaja de la respuesta estructurada.",
      comparison_result: { winner: "A" },
      adaptation_plan: `Plan demo: reforzar ${patient.goals.join(", ")} con sesiones cortas y feedback visual.`,
      scoring: attempt.scoring,
    });
  });
  localStorage.setItem(STORAGE_KEYS.attempts, JSON.stringify(attempts));

  const suiteEvents = getSuiteEvents().filter((item) => item.patient_id !== patient.id);
  DEMO_SUITE_BLUEPRINT.suiteEvents.forEach((event) => {
    suiteEvents.unshift(
      createSuiteEvent({
        patient,
        activityId: event.activity_id,
        activityTitle: event.activity_title,
        area: event.area,
        status: event.status,
        levelIndex: event.level_index,
        levelLabel: event.level_label,
        score: event.score,
        accuracy: event.accuracy,
        durationMinutes: event.duration_minutes,
        notes: event.notes,
        date: new Date(Date.now() - event.days_ago * 24 * 60 * 60 * 1000).toISOString(),
      })
    );
  });
  saveSuiteEvents(suiteEvents);

  byId("attempt-status").textContent = "Modo demo integral cargado: ya puedes navegar por la suite y revisar el progreso conectado.";
  renderPatientPanel();
  renderProgress();
  renderRoadmap();
  renderModuleSelector();
  renderSuiteDashboard();
  byId("tab-suite")?.click();
}

function getPatientAssessmentSummary(patient) {
  if (!patient) {
    return "Sin paciente activo. Crea uno para empezar a personalizar actividades y resultados.";
  }

  const attempts = getAllAttempts().filter((attempt) => attempt.patient_id === patient.id);
  if (!attempts.length) {
    return `Todavia no hay sesiones guardadas para ${patient.name}. Empieza por anamnesis y una actividad breve de calibracion.`;
  }

  const avg = Math.round(
    attempts.reduce((accumulator, attempt) => accumulator + toNumber(attempt.scoring?.total), 0) / attempts.length
  );
  const last = attempts[0];

  if (avg >= 80) {
    return `${patient.name} muestra una base estable (${avg}/100). Conviene aumentar complejidad y generalizacion en contextos nuevos.`;
  }
  if (avg >= 60) {
    return `${patient.name} progresa de forma funcional (${avg}/100). Mantendria apoyos visuales y repeticion corta antes de subir dificultad.`;
  }
  return `${patient.name} necesita tareas mas graduadas (${avg}/100). Recomiendo sesiones cortas, mas modelado y registro de ayudas por intento.`;
}

function getAreaRanking(events) {
  const totals = {};
  for (const event of events) {
    const area = event.area || "general";
    if (!totals[area]) totals[area] = { total: 0, count: 0 };
    totals[area].total += toNumber(event.score);
    totals[area].count += 1;
  }
  return Object.entries(totals)
    .map(([area, value]) => ({ area, avg: Math.round(value.total / value.count), count: value.count }))
    .sort((left, right) => right.avg - left.avg);
}

function summarizeAssessmentMeasurement(event) {
  const data = event?.measurement_data;
  if (!data || typeof data !== "object") return event?.notes || "Sin detalle cuantitativo adicional.";

  const parts = [];
  if (Number.isFinite(toNumber(data.intelligibility))) {
    parts.push(`Inteligibilidad ${toNumber(data.intelligibility)}%`);
  }
  if (Number.isFinite(toNumber(data.pct_fonemas)) && toNumber(data.pct_fonemas) > 0) {
    parts.push(`Fonemas correctos ${toNumber(data.pct_fonemas)}%`);
  }
  if (Number.isFinite(toNumber(data.grbas_total))) {
    parts.push(`GRBAS ${toNumber(data.grbas_total)}/15`);
  }
  if (Number.isFinite(toNumber(data.current_step))) {
    parts.push(`Paso ${toNumber(data.current_step)}/15`);
  }
  if (Number.isFinite(toNumber(data.duration_seconds))) {
    parts.push(`Tiempo ${Math.max(1, Math.round(toNumber(data.duration_seconds) / 60))} min`);
  }
  return parts.join(" · ") || event?.notes || "Sin detalle cuantitativo adicional.";
}

function getPatientResourceProfiles(patient) {
  if (!patient) return [];
  const events = getPatientSuiteEvents(patient.id);
  const grouped = {};

  for (const event of events) {
    if (!grouped[event.activity_id]) grouped[event.activity_id] = [];
    grouped[event.activity_id].push(event);
  }

  return Object.entries(grouped)
    .map(([activityId, activityEvents]) => {
      const sorted = [...activityEvents].sort((left, right) => new Date(right.date) - new Date(left.date));
      const latest = sorted[0];
      const scores = sorted.map((event) => toNumber(event.score)).filter((value) => Number.isFinite(value));
      const totalMinutes = sorted.reduce((sum, event) => sum + toNumber(event.duration_minutes), 0);

      return {
        activityId,
        activity: getActivityById(activityId),
        latest,
        count: sorted.length,
        avg: scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 0,
        best: scores.length ? Math.max(...scores) : 0,
        totalMinutes,
      };
    })
    .sort((left, right) => {
      if (right.count !== left.count) return right.count - left.count;
      return right.avg - left.avg;
    });
}

function buildPatientLearningModel(patient) {
  const events = patient ? getPatientSuiteEvents(patient.id) : [];
  const skillTotals = {};
  const gamePlans = [];

  for (const event of events) {
    const signals = deriveLogopediaSkillSignals(event);
    for (const [skill, values] of Object.entries(signals)) {
      if (!skillTotals[skill]) skillTotals[skill] = [];
      skillTotals[skill].push(...values.filter((value) => Number.isFinite(value)));
    }
  }

  const skills = Object.entries(skillTotals)
    .map(([skill, values]) => ({
      skill,
      avg: Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length)),
      count: values.length,
    }))
    .sort((left, right) => right.avg - left.avg);

  const strengths = skills.filter((item) => item.avg >= 75).slice(0, 4);
  const watchouts = skills.filter((item) => item.avg > 0 && item.avg < 65).slice(0, 4);
  const supportDependency = Math.round(averageMeasurementMetric(events, "support_dependency") || 0);
  const consistency = Math.round(averageMeasurementMetric(events, "reaction_consistency") || 0);
  const memoryLoad = Math.round(averageMeasurementMetric(events, "memory_load") || 0);
  const scoreAvg = Math.round(averageMeasurementMetric(events, "score") || 0);
  const lastByActivity = getPatientResourceProfiles(patient).slice(0, 8);

  for (const profile of lastByActivity) {
    const data = profile.latest.measurement_data || {};
    const title = profile.latest.activity_title || profile.activity?.title || "Actividad";

    if (profile.activityId === "poe-lupas-y-linternas") {
      const plan =
        toNumber(data.first_attempt_rate) < 70 || toNumber(data.distractor_resistance) < 65
          ? "Bajar distractores, mantener pocas rondas y reforzar reconocimiento visual/semantico antes de subir dificultad."
          : "Subir dificultad, aumentar similitud entre distractores y pedir menos ayudas externas.";
      gamePlans.push({ title, plan });
    } else if (profile.activityId === "poe-letra-crush") {
      const plan =
        toNumber(data.support_dependency) > 45 || toNumber(data.invalid_swaps) > toNumber(data.valid_swaps)
          ? "Reducir apoyos y complejidad de tablero; insistir en anticipacion, planificacion del intercambio y bloque corto de exito."
          : "Subir complejidad o cambiar de modo para generalizar grafia, silaba o fonema manteniendo autonomia.";
      gamePlans.push({ title, plan });
    } else if (profile.activityId === "poe-encuentra-el-nuevo") {
      const plan =
        toNumber(data.novelty_detection) < 70 || toNumber(data.memory_load) < 45
          ? "Reducir numero de elementos, ampliar tiempo de memorizacion y reforzar nombrado guiado del item nuevo."
          : "Aumentar numero de elementos y variar posicion/fonema para consolidar memoria visual y articulacion.";
      gamePlans.push({ title, plan });
    }
  }

  const dischargeScore =
    Math.round(
      scoreAvg * 0.45 +
        Math.max(0, 100 - supportDependency) * 0.2 +
        consistency * 0.15 +
        Math.max(0, 100 - Math.max(0, 60 - memoryLoad)) * 0.2
    ) || 0;

  const dischargeStage =
    dischargeScore >= 82 && watchouts.length <= 1
      ? "candidato_alta"
      : dischargeScore >= 68
        ? "seguimiento_reducido"
        : "intervencion_activa";

  return {
    events,
    strengths,
    watchouts,
    supportDependency,
    consistency,
    memoryLoad,
    scoreAvg,
    gamePlans,
    dischargeScore,
    dischargeStage,
  };
}

function buildDischargeRecommendation(patient) {
  const model = buildPatientLearningModel(patient);
  const statusLabel =
    model.dischargeStage === "candidato_alta"
      ? "Candidato a alta"
      : model.dischargeStage === "seguimiento_reducido"
        ? "Seguimiento reducido"
        : "Intervencion activa";

  const rationale = [];
  if (model.strengths.length) rationale.push(`Fortalezas: ${model.strengths.map((item) => item.skill).join(", ")}.`);
  if (model.watchouts.length) rationale.push(`Vigilar: ${model.watchouts.map((item) => item.skill).join(", ")}.`);
  rationale.push(
    model.dischargeStage === "candidato_alta"
      ? "El rendimiento global y la autonomia sugieren consolidacion suficiente para plantear alta con seguimiento puntual."
      : model.dischargeStage === "seguimiento_reducido"
        ? "Hay mejora funcional, pero conviene mantener revision espaciada y generalizacion en contexto."
        : "Aun se necesita intervencion porque persisten apoyos altos o habilidades inestables."
  );

  return {
    score: model.dischargeScore,
    status: model.dischargeStage,
    label: statusLabel,
    rationale: rationale.join(" "),
  };
}

function buildFinalClinicalReport(patient) {
  const model = buildPatientLearningModel(patient);
  const discharge = buildDischargeRecommendation(patient);
  const nextSession = buildNextSessionRecommendation(patient);
  return {
    summary: `Media funcional ${model.scoreAvg}/100 con ${model.supportDependency}% de dependencia de apoyo y consistencia ${model.consistency}%.`,
    evaluation:
      model.watchouts.length
        ? `Las areas mas sensibles siguen siendo ${model.watchouts.map((item) => item.skill).join(", ")}.`
        : "No aparecen areas debiles claras en los registros actuales.",
    intervention:
      model.gamePlans.length
        ? model.gamePlans.map((item) => `${item.title}: ${item.plan}`).join(" ")
        : "Todavia no hay suficientes juegos medidos para proponer ajustes por recurso.",
    discharge,
    nextSession,
  };
}

function buildNextSessionRecommendation(patient) {
  if (!patient) return null;
  const events = getPatientSuiteEvents(patient.id);
  const ranking = getAreaRanking(events);
  const model = buildPatientLearningModel(patient);
  const weakArea = ranking[ranking.length - 1]?.area || patient.goals[0] || patient.tags[0] || "articulacion";
  const strongArea = ranking[0]?.area || patient.goals[0] || "general";
  const recommended = recommendActivities(patient)
    .filter((activity) => (activity.focus_areas || []).includes(weakArea) || (activity.tags || []).includes(weakArea))
    .slice(0, 3);
  const duration = patient.age && patient.age <= 6 ? "10-12 min" : patient.age && patient.age <= 10 ? "12-18 min" : "18-25 min";
  const totalMinutes = events.reduce((sum, event) => sum + toNumber(event.duration_minutes), 0);
  const supportNeed = ranking[ranking.length - 1]?.avg < 65 ? "alto modelado y tareas muy guiadas" : "menos ayudas y mas generalizacion";
  const blockPlan = [
    `3-4 min de activacion en ${strongArea}`,
    `${duration} de trabajo principal en ${weakArea}`,
    "2-3 min de cierre con registro de errores, ayudas y logro final",
  ];

  return {
    weakArea,
    strongArea,
    duration,
    recommended,
    supportNeed,
    blockPlan,
    totalMinutes,
    gamePlans: model.gamePlans.slice(0, 3),
  };
}

function buildSuiteClinicalSheet(patient) {
  if (!patient) return `<p class="small">Selecciona un paciente para activar la ficha clinica resumida.</p>`;

  const events = getPatientSuiteEvents(patient.id);
  const profiles = getPatientResourceProfiles(patient);
  const assessments = events.filter((event) => getEventActivityKind(event) === "assessment");
  const interventions = events.filter((event) => getEventActivityKind(event) !== "assessment");
  const nextSession = buildNextSessionRecommendation(patient);
  const finalReport = buildFinalClinicalReport(patient);
  const latestAssessment = [...assessments].sort((left, right) => new Date(right.date) - new Date(left.date))[0];
  const latestIntervention = [...interventions].sort((left, right) => new Date(right.date) - new Date(left.date))[0];
  const totalMinutes = events.reduce((sum, event) => sum + toNumber(event.duration_minutes), 0);
  const topDimensions = getTopWorkedDimensions(events, 4);

  return `
    <article class="suite-sheet-card">
      <h3>Evaluacion</h3>
      <p><strong>${escapeHtml(latestAssessment?.activity_title || "Sin evaluacion registrada")}</strong></p>
      <p class="small">${escapeHtml(latestAssessment?.level_label || "Aun no hay paso clinico consolidado.")}</p>
      <p class="small">${escapeHtml(latestAssessment ? summarizeAssessmentMeasurement(latestAssessment) : getPatientAssessmentSummary(patient))}</p>
    </article>
    <article class="suite-sheet-card">
      <h3>Intervencion</h3>
      <p><strong>${escapeHtml(latestIntervention?.activity_title || "Sin juego o herramienta registrada")}</strong></p>
      <p class="small">${escapeHtml(latestIntervention?.level_label || "Todavia no hay sesion de intervencion medida.")}</p>
      <p class="small">Recursos distintos usados: ${profiles.length} · Tiempo total medido: ${totalMinutes ? `${totalMinutes} min` : "n/d"}.</p>
      <p class="small">Areas trabajadas: ${escapeHtml(topDimensions.join(", ") || "sin dimensiones detectadas aun")}.</p>
    </article>
    <article class="suite-sheet-card">
      <h3>Proxima sesion</h3>
      <p><strong>${escapeHtml(nextSession?.duration || "12-15 min")}</strong></p>
      <p class="small">Foco principal: ${escapeHtml(nextSession?.weakArea || "general")}.</p>
      <p class="small">${escapeHtml(nextSession?.blockPlan?.join(" · ") || "Activacion, tarea principal y cierre con registro.")}</p>
    </article>
    <article class="suite-sheet-card">
      <h3>Alta orientativa</h3>
      <p><strong>${escapeHtml(finalReport.discharge.label)}</strong></p>
      <p class="small">Indice de alta: ${finalReport.discharge.score}/100.</p>
      <p class="small">${escapeHtml(finalReport.discharge.rationale)}</p>
    </article>
  `;
}

function buildSuiteResourceHistory(patient) {
  if (!patient) return `<p class="small">Sin paciente activo.</p>`;

  const profiles = getPatientResourceProfiles(patient).slice(0, 10);
  if (!profiles.length) {
    return `
      <h3>Historial por recurso</h3>
      <p class="small">Todavia no hay recursos medidos para este paciente.</p>
    `;
  }

  return `
    <h3>Historial por recurso</h3>
    <p class="small">Resumen real de uso, resultados y tiempo acumulado por juego o herramienta.</p>
    <div class="suite-resource-table">
      <div class="suite-resource-row is-head">
        <span>Recurso</span>
        <span>Usos</span>
        <span>Media</span>
        <span>Mejor</span>
        <span>Tiempo</span>
      </div>
      ${profiles
        .map(
          (profile) => `
            <div class="suite-resource-row">
              <div>
                <strong>${escapeHtml(profile.latest.activity_title || profile.activity?.title || "Actividad")}</strong>
                <span class="small">${escapeHtml(profile.latest.level_label || profile.latest.area || "sin hito")}</span>
              </div>
              <span>${profile.count}</span>
              <span>${profile.avg ? `${profile.avg}/100` : "n/d"}</span>
              <span>${profile.best ? `${profile.best}/100` : "n/d"}</span>
              <span>${profile.totalMinutes ? `${profile.totalMinutes} min` : "n/d"}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function buildPatientClinicalPanel(patient) {
  if (!patient) return "";

  const events = getPatientSuiteEvents(patient.id);
  const assessments = events.filter((event) => getEventActivityKind(event) === "assessment");
  const interventions = events.filter((event) => getEventActivityKind(event) !== "assessment");
  const nextSession = buildNextSessionRecommendation(patient);
  const finalReport = buildFinalClinicalReport(patient);
  const latestAssessment = assessments.sort((left, right) => new Date(right.date) - new Date(left.date))[0];
  const latestIntervention = interventions.sort((left, right) => new Date(right.date) - new Date(left.date))[0];
  const measuredMinutes = events.reduce((sum, event) => sum + toNumber(event.duration_minutes), 0);
  const interventionAvg = interventions.length
    ? Math.round(interventions.reduce((sum, event) => sum + toNumber(event.score), 0) / interventions.length)
    : 0;
  const recentResources = [...new Set(interventions.slice(0, 4).map((event) => event.activity_title).filter(Boolean))];

  return `
    <div class="attempt-item">
      <p><strong>Evaluacion actual</strong></p>
      <p class="small">${latestAssessment ? `${latestAssessment.activity_title} · ${latestAssessment.level_label}` : "Sin evaluacion registrada todavia."}</p>
      <p class="small">${latestAssessment ? summarizeAssessmentMeasurement(latestAssessment) : getPatientAssessmentSummary(patient)}</p>
      <p class="small">${getPatientAssessmentSummary(patient)}</p>
    </div>
    <div class="attempt-item">
      <p><strong>Intervencion y seguimiento</strong></p>
      <p class="small">Ultima herramienta usada: ${escapeHtml(latestIntervention?.activity_title || "sin sesiones de intervencion")}.</p>
      <p class="small">Media de intervencion: ${interventionAvg ? `${interventionAvg}/100` : "n/d"} · Tiempo medido acumulado: ${measuredMinutes ? `${measuredMinutes} min` : "n/d"}.</p>
      <p class="small">Recursos recientes: ${escapeHtml(recentResources.join(", ") || "sin recorrido todavia")}.</p>
    </div>
    <div class="attempt-item">
      <p><strong>Proxima sesion sugerida</strong></p>
      <p class="small">Area a reforzar: ${escapeHtml(nextSession?.weakArea || "general")} | Area mas consolidada: ${escapeHtml(nextSession?.strongArea || "general")}.</p>
      <p class="small">Duracion recomendada: ${escapeHtml(nextSession?.duration || "12-15 min")} con ${escapeHtml(nextSession?.supportNeed || "registro de ayudas")}.</p>
      <p class="small">${escapeHtml(nextSession?.blockPlan?.join(" · ") || "Estructura breve de activacion, trabajo principal y cierre.")}</p>
    </div>
    <div class="attempt-item">
      <p><strong>Juegos sugeridos para la proxima sesion</strong></p>
      ${
        nextSession?.recommended?.length
          ? nextSession.recommended
              .map(
                (activity) => `
                  <p class="small">• ${escapeHtml(activity.title)} · ${(activity.focus_areas || []).join(", ") || activity.kind}</p>
                `
              )
              .join("")
          : `<p class="small">Aun no hay suficientes datos para recomendar juegos concretos.</p>`
      }
    </div>
    <div class="attempt-item">
      <p><strong>Informe final y alta</strong></p>
      <p class="small">${escapeHtml(finalReport.summary)}</p>
      <p class="small">${escapeHtml(finalReport.evaluation)}</p>
      <p class="small"><strong>${escapeHtml(finalReport.discharge.label)}</strong> · ${finalReport.discharge.score}/100.</p>
      <p class="small">${escapeHtml(finalReport.discharge.rationale)}</p>
    </div>
  `;
}

function buildLearningTagSummary(events, key, limit = 6) {
  const totals = {};
  for (const event of events) {
    const tags = event.measurement_data?.[key];
    if (!Array.isArray(tags)) continue;
    for (const tag of tags) {
      if (!tag) continue;
      totals[tag] = (totals[tag] || 0) + 1;
    }
  }
  return Object.entries(totals)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit);
}

function averageMeasurementMetric(events, key) {
  const values = events
    .map((event) => {
      const data = event.measurement_data;
      if (!data || typeof data !== "object") return null;
      if (key === "average_time_seconds") return toNumber(data.average_time_ms) / 1000;
      if (key === "error_load") {
        const invalid = toNumber(data.invalid_swaps);
        const avgErrors = toNumber(data.average_errors);
        const hints = toNumber(data.hints_used);
        const total = [invalid, avgErrors, hints].filter((value) => Number.isFinite(value)).reduce((sum, value) => sum + value, 0);
        return total;
      }
      return toNumber(data[key]);
    })
    .filter((value) => Number.isFinite(value) && value >= 0);

  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildComparisonBars(rows) {
  if (!rows.length) return "";
  const max = Math.max(...rows.flatMap((row) => [row.left, row.right]), 1);
  return rows
    .map(
      (row) => `
        <div class="patient-graph-row">
          <span>${escapeHtml(row.label)}</span>
          <div class="patient-graph-track"><span style="width:${Math.max(6, (row.left / max) * 100)}%; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);"></span></div>
          <strong>${row.left}/${row.right}</strong>
        </div>
      `
    )
    .join("");
}

function buildClinicalBalanceRows(rows) {
  if (!rows.length) return `<p class="small">Sin comparativas suficientes todavia.</p>`;
  return `
    <div class="clinical-balance-grid">
      ${rows
        .map((row) => {
          const current = Math.max(0, Math.min(100, row.current || 0));
          return `
            <div class="clinical-balance-row">
              <div class="clinical-balance-top">
                <strong>${escapeHtml(row.label)}</strong>
                <span>${current}/100</span>
              </div>
              <div class="clinical-balance-track">
                <span class="clinical-balance-marker" style="left:${Math.max(8, Math.min(96, current))}%"></span>
              </div>
              <div class="clinical-balance-labels">
                <span>${escapeHtml(row.lowLabel || "Necesita apoyo")}</span>
                <span>${escapeHtml(row.highLabel || "Consolidado")}</span>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function buildPatientSkillRows(events) {
  if (!events.length) return [];
  const totals = {};
  for (const event of events) {
    const signals = deriveLogopediaSkillSignals(event);
    for (const [label, values] of Object.entries(signals)) {
      const validValues = values.filter((value) => Number.isFinite(value));
      if (!validValues.length) continue;
      if (!totals[label]) totals[label] = [];
      totals[label].push(...validValues);
    }
  }

  return Object.entries(totals)
    .map(([label, values]) => ({
      label,
      avg: Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length)),
      count: values.length,
    }))
    .sort((left, right) => right.avg - left.avg);
}

function buildPatientSkillTable(events) {
  const rows = buildPatientSkillRows(events).slice(0, 8);
  if (!rows.length) return `<p class="small">Sin habilidades suficientes para interpretar todavia.</p>`;
  return `
    <div class="patient-skill-table">
      ${rows
        .map(
          (row) => `
            <div class="patient-skill-row">
              <span>${escapeHtml(row.label)}</span>
              <div class="patient-graph-track"><span style="width:${Math.max(8, Math.min(100, row.avg))}%"></span></div>
              <strong>${row.avg}/100</strong>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function buildPatientSessionTable(events) {
  const recentEvents = [...events].sort((left, right) => new Date(right.date) - new Date(left.date)).slice(0, 6);
  if (!recentEvents.length) return `<p class="small">Sin sesiones recientes.</p>`;
  return `
    <table class="patient-session-table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Juego</th>
          <th>Resultado</th>
          <th>Tiempo</th>
          <th>Foco</th>
        </tr>
      </thead>
      <tbody>
        ${recentEvents
          .map((event) => {
            const data = event.measurement_data || {};
            const timeSeconds = Number.isFinite(toNumber(data.average_time_ms))
              ? `${Math.round(toNumber(data.average_time_ms) / 100) / 10}s`
              : `${toNumber(event.duration_minutes) || 0} min`;
            const focus = (data.labels_large || data.worked_dimensions || []).slice(0, 2).join(", ") || event.area || "general";
            return `
              <tr>
                <td>${new Date(event.date).toLocaleDateString()}</td>
                <td>${escapeHtml(event.activity_title || "Actividad")}</td>
                <td><span class="patient-session-badge">${toNumber(event.score)}/100</span></td>
                <td>${escapeHtml(timeSeconds)}</td>
                <td class="smallish">${escapeHtml(focus)}</td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function buildPatientInsightReport(patient) {
  if (!patient) return "";

  const events = getPatientSuiteEvents(patient.id);
  if (!events.length) {
    return `
      <div class="patient-report-grid">
        <article class="patient-report-card">
          <h3>Informe visual</h3>
          <p class="small">Aun no hay sesiones medidas para construir graficas e interpretaciones del perfil.</p>
        </article>
      </div>
    `;
  }

  const largeTags = buildLearningTagSummary(events, "labels_large", 4);
  const smallTags = buildLearningTagSummary(events, "labels_small", 8);
  const scoreAvg = Math.round(averageMeasurementMetric(events, "score") || 0);
  const accuracyAvg = Math.round(averageMeasurementMetric(events, "accuracy") || 0);
  const timeAvg = averageMeasurementMetric(events, "average_time_seconds");
  const errorLoad = averageMeasurementMetric(events, "error_load");
  const visualLoad = Math.round(averageMeasurementMetric(events, "visual_load") || 0);
  const executiveLoad = Math.round(averageMeasurementMetric(events, "executive_load") || 0);
  const phonologicalLoad = Math.round(averageMeasurementMetric(events, "phonological_load") || 0);
  const semanticLoad = Math.round(averageMeasurementMetric(events, "semantic_load") || 0);
  const attentionAvg = Math.round(averageMeasurementMetric(events, "reaction_consistency") || 0);
  const supportDependency = Math.round(averageMeasurementMetric(events, "support_dependency") || 0);
  const perseverance = Math.round(averageMeasurementMetric(events, "perseverance_index") || 0);
  const flexibility = Math.round(averageMeasurementMetric(events, "flexibility_index") || 0);
  const distractorResistance = Math.round(averageMeasurementMetric(events, "distractor_resistance") || 0);
  const nextSession = buildNextSessionRecommendation(patient);
  const finalReport = buildFinalClinicalReport(patient);
  const topDimensions = getTopWorkedDimensions(events, 5);
  const sortedEvents = [...events].sort((left, right) => new Date(left.date) - new Date(right.date));
  const recentEvents = sortedEvents.slice(-6);
  const firstWindow = sortedEvents.slice(0, Math.max(1, Math.min(3, Math.ceil(sortedEvents.length / 2))));
  const lastWindow = sortedEvents.slice(-Math.max(1, Math.min(3, Math.ceil(sortedEvents.length / 2))));

  const metricRows = [
    { label: "Rendimiento", value: scoreAvg, suffix: "/100" },
    { label: "Precision", value: accuracyAvg, suffix: "%" },
    { label: "Atencion estable", value: attentionAvg, suffix: "%" },
    { label: "Resiste distractor", value: distractorResistance, suffix: "%" },
    { label: "Tiempo medio", value: timeAvg ? Number(timeAvg.toFixed(1)) : null, suffix: "s", scale: 12 },
    { label: "Carga de error", value: errorLoad ? Number(errorLoad.toFixed(1)) : null, suffix: "", scale: 8, lowerIsBetter: true },
  ];

  const loadRows = [
    { label: "Visual", value: visualLoad },
    { label: "Ejecutiva", value: executiveLoad },
    { label: "Fonologica", value: phonologicalLoad },
    { label: "Semantica", value: semanticLoad },
    { label: "Flexibilidad", value: flexibility },
    { label: "Perseverancia", value: perseverance },
    { label: "Apoyo", value: supportDependency },
  ];

  const narrative = [
    `El perfil esta aprendiendo sobre todo en ${largeTags.map(([tag]) => tag).join(", ") || "general"}.`,
    topDimensions.length ? `Las dimensiones mas trabajadas son ${topDimensions.join(", ")}.` : null,
    errorLoad != null && errorLoad > 3 ? "Se observa una carga de error relevante, por lo que conviene mantener apoyos visuales y anticipacion de respuesta." : "El control del error empieza a ser funcional y permite subir complejidad poco a poco.",
    supportDependency > 45 ? "La dependencia de ayudas es alta; interesa reducir pistas y apoyos de forma muy gradual." : "La dependencia de ayudas esta contenida y permite tareas algo mas autonomas.",
    timeAvg != null && timeAvg > 4 ? "El tiempo de respuesta sigue siendo lento; interesa priorizar velocidad con pocos distractores." : "La velocidad de ejecucion es aceptable para aumentar densidad o complejidad en la proxima sesion.",
    nextSession?.weakArea ? `La siguiente sesion deberia insistir en ${nextSession.weakArea} durante ${nextSession.duration}.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const renderMetricRow = (row) => {
    const scale = row.scale || 100;
    const normalized = row.value == null ? 0 : row.lowerIsBetter ? Math.max(0, 100 - (row.value / scale) * 100) : (row.value / scale) * 100;
    return `
      <div class="patient-graph-row">
        <span>${escapeHtml(row.label)}</span>
        <div class="patient-graph-track"><span style="width:${Math.max(6, Math.min(100, normalized || 0))}%"></span></div>
        <strong>${row.value == null ? "n/d" : `${row.value}${row.suffix}`}</strong>
      </div>
    `;
  };

  const periodAverage = (collection, getter) => {
    const values = collection
      .map((item) => getter(item))
      .map((value) => toNumber(value))
      .filter((value) => Number.isFinite(value) && value >= 0);
    if (!values.length) return 0;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  };

  const scoreStart = periodAverage(firstWindow, (event) => event.score);
  const scoreCurrent = periodAverage(lastWindow, (event) => event.score);
  const timeStart = periodAverage(firstWindow, (event) => (event.measurement_data?.average_time_ms || 0) / 1000);
  const timeCurrent = periodAverage(lastWindow, (event) => (event.measurement_data?.average_time_ms || 0) / 1000);
  const supportStart = periodAverage(firstWindow, (event) => event.measurement_data?.support_dependency);
  const supportCurrent = periodAverage(lastWindow, (event) => event.measurement_data?.support_dependency);
  const errorStart = periodAverage(firstWindow, (event) => event.measurement_data?.average_errors);
  const errorCurrent = periodAverage(lastWindow, (event) => event.measurement_data?.average_errors);

  const clinicalBalanceRows = [
    {
      label: "Rendimiento actual",
      current: scoreCurrent,
      lowLabel: `Inicio ${scoreStart}/100`,
      highLabel: "Objetivo 85+",
    },
    {
      label: "Autonomia",
      current: Math.max(0, 100 - supportCurrent),
      lowLabel: `Apoyo inicial ${supportStart}%`,
      highLabel: "Menos ayuda",
    },
    {
      label: "Control del error",
      current: Math.max(0, 100 - Math.min(100, errorCurrent * 20)),
      lowLabel: `Errores inicio ${errorStart}`,
      highLabel: "Menos errores",
    },
    {
      label: "Velocidad funcional",
      current: Math.max(0, 100 - Math.min(100, (timeCurrent / 8) * 100)),
      lowLabel: `Inicio ${timeStart || 0}s`,
      highLabel: "Mas agil",
    },
  ];

  return `
    <div class="patient-report-grid">
      <article class="patient-report-card">
        <h3>Modo informe</h3>
        <p class="small">${escapeHtml(narrative)}</p>
        <p class="small"><strong>Lectura final:</strong> ${escapeHtml(finalReport.summary)}</p>
        <p class="small"><strong>Intervencion:</strong> ${escapeHtml(finalReport.intervention)}</p>
        <p class="small"><strong>Alta:</strong> ${escapeHtml(finalReport.discharge.label)} · ${finalReport.discharge.score}/100.</p>
        <div class="report-chip-row">
          ${largeTags.length ? largeTags.map(([tag, count]) => `<span class="report-chip is-large">${escapeHtml(tag)} · ${count}</span>`).join("") : `<span class="report-chip is-large">Sin perfil dominante aun</span>`}
        </div>
        <div class="report-chip-row">
          ${smallTags.length ? smallTags.map(([tag, count]) => `<span class="report-chip">${escapeHtml(tag)} · ${count}</span>`).join("") : `<span class="report-chip">Sin items finos aun</span>`}
        </div>
      </article>
      <article class="patient-report-card">
        <h3>Graficas clinicas</h3>
        <div class="patient-graph-list">
          ${metricRows.map(renderMetricRow).join("")}
        </div>
      </article>
      <article class="patient-report-card">
        <h3>Cargas trabajadas</h3>
        <div class="patient-load-grid">
          ${loadRows
            .map(
              (row) => `
                <div class="patient-load-item">
                  <span>${escapeHtml(row.label)}</span>
                  <strong>${row.value || 0}%</strong>
                </div>
              `
            )
            .join("")}
        </div>
      </article>
      <article class="patient-report-card">
        <h3>Evolucion clara</h3>
        <div class="patient-chart-grid">
          <div class="patient-chart-card">
            <h4>Balance clinico</h4>
            ${buildClinicalBalanceRows(clinicalBalanceRows)}
            <div class="chart-caption">Lectura directa entre inicio, estado actual y criterio funcional.</div>
          </div>
          <div class="patient-chart-card">
            <h4>Habilidades trabajadas</h4>
            ${buildPatientSkillTable(events)}
            <div class="chart-caption">Grafia, silaba, denominacion, articulacion, memoria y control ejecutivo.</div>
          </div>
          <div class="patient-chart-card">
            <h4>Sesiones recientes</h4>
            ${buildPatientSessionTable(events)}
            <div class="chart-caption">Ultimos resultados para entender que paso y con que foco.</div>
          </div>
        </div>
      </article>
      <article class="patient-report-card">
        <h3>Mejoras por juego</h3>
        ${
          nextSession?.gamePlans?.length
            ? nextSession.gamePlans.map((item) => `<p class="small"><strong>${escapeHtml(item.title)}:</strong> ${escapeHtml(item.plan)}</p>`).join("")
            : `<p class="small">Todavia no hay suficientes sesiones por juego para generar mejoras especificas.</p>`
        }
      </article>
    </div>
  `;
}

function recommendActivities(patient) {
  const activities = state.activityCatalog?.activities || [];
  if (!patient) {
    return [...activities].sort((left, right) => {
      const priorityLeft = left.integration_status === "prioridad-alta" ? 1 : 0;
      const priorityRight = right.integration_status === "prioridad-alta" ? 1 : 0;
      if (priorityLeft !== priorityRight) return priorityRight - priorityLeft;
      return (left.title || "").localeCompare(right.title || "", "es");
    });
  }

  const patientKeywords = new Set([...patient.goals, ...patient.tags].map((item) => item.toLowerCase()));

  return [...activities]
    .map((activity) => {
      let score = 0;
      if (patientMatchesAge(patient, activity)) score += 3;
      if (activity.integration_status === "prioridad-alta") score += 2;
      const activityKeywords = [...(activity.tags || []), ...(activity.focus_areas || [])].map((item) =>
        item.toLowerCase()
      );
      for (const keyword of activityKeywords) {
        if (patientKeywords.has(keyword)) score += 5;
        if ([...patientKeywords].some((item) => keyword.includes(item) || item.includes(keyword))) score += 2;
      }
      if (patient.level === "basico" && activity.difficulty === "baja") score += 2;
      if (patient.level === "intermedio" && activity.difficulty === "media") score += 2;
      if (patient.level === "avanzado" && activity.difficulty === "alta") score += 2;
      return { ...activity, recommendation_score: score };
    })
    .sort((left, right) => {
      if (right.recommendation_score !== left.recommendation_score) {
        return right.recommendation_score - left.recommendation_score;
      }
      const priorityLeft = left.integration_status === "prioridad-alta" ? 1 : 0;
      const priorityRight = right.integration_status === "prioridad-alta" ? 1 : 0;
      if (priorityLeft !== priorityRight) return priorityRight - priorityLeft;
      return (left.title || "").localeCompare(right.title || "", "es");
    });
}

function getFilteredCatalogActivities(activities) {
  const query = state.catalogQuery.trim().toLowerCase();
  const kind = state.catalogKind || "all";

  return activities.filter((activity) => {
    if (kind !== "all" && (activity.kind || "game") !== kind) {
      return false;
    }

    if (!query) return true;

    const haystack = [
      activity.title,
      activity.summary,
      activity.rel_path,
      ...(activity.tags || []),
      ...(activity.focus_areas || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

function renderActivityCatalog() {
  const patient = getActivePatient();
  const activities = recommendActivities(patient);
  const visibleActivities = getFilteredCatalogActivities(activities);
  const stableActivities = visibleActivities.filter((activity) => activity.integration_status !== "en-desarrollo");
  const allActivities = state.activityCatalog?.activities || FALLBACK_ACTIVITY_CATALOG.activities || [];
  const developmentActivities = allActivities.filter((activity) => activity.integration_status === "en-desarrollo");
  const patientEvents = patient ? getPatientSuiteEvents(patient.id) : [];
  const stats = byId("activity-catalog-stats");
  const list = byId("activity-catalog-list");
  const developmentStats = byId("development-games-stats");
  const developmentList = byId("development-games-list");
  const featuredStats = byId("featured-games-stats");
  const featuredList = byId("featured-games-list");
  const suiteDemoShortcut = byId("suite-demo-shortcut");
  const total = state.activityCatalog?.activities?.length || 0;
  const sourceDate = state.activityCatalog?.generated_at || "sin fecha";
  const featuredActivities = stableActivities.slice(0, 6);

  if (stats) {
    stats.textContent = `Mostrando ${stableActivities.length} de ${total} recursos activos | Generado: ${new Date(sourceDate).toLocaleString()}`;
  }
  if (developmentStats) {
    developmentStats.textContent = developmentActivities.length
      ? `${developmentActivities.length} demos y prototipos visibles en esta zona`
      : "Sin demos en desarrollo por ahora.";
  }
  if (featuredStats) {
    featuredStats.textContent = `${featuredActivities.length} recursos destacados listos para explorar`;
  }
  if (featuredList) {
    featuredList.innerHTML = featuredActivities.length
      ? featuredActivities.map((activity) => buildActivityCard(activity, patientEvents)).join("")
      : `<p class="small">Todavia no hay recursos destacados.</p>`;
  }
  if (developmentList) {
    developmentList.innerHTML = developmentActivities.length
      ? developmentActivities.map((activity) => buildDevelopmentCard(activity)).join("")
      : `<p class="small">Todavia no hay demos en desarrollo.</p>`;
  }
  if (suiteDemoShortcut) {
    suiteDemoShortcut.innerHTML = developmentActivities.length
      ? `
        <article class="suite-demo-card">
          <div>
            <p class="section-kicker">Demos y pruebas</p>
            <h3>Zona separada para prototipos</h3>
            <p class="small">${developmentActivities.length} demos visibles aparte de los recursos funcionales. LectoViva v2 vive aqui.</p>
          </div>
          <div class="suite-demo-chip-row">
            ${developmentActivities.slice(0, 4).map((activity) => `<span class="suite-demo-chip">${escapeHtml(activity.title)}</span>`).join("")}
          </div>
          <button id="suite-open-demos-inline" class="secondary" type="button">Abrir demos</button>
        </article>
      `
      : "";
  }

  if (!list) {
    renderSuiteResourceIndex();
    return;
  }

  if (!stableActivities.length) {
    list.innerHTML = `<p class="small">Todavia no hay actividades activas catalogadas.</p>`;
    renderSuiteResourceIndex();
    return;
  }

  list.innerHTML = stableActivities.map((activity) => buildActivityCard(activity, patientEvents)).join("");
  renderSuiteResourceIndex();
}

function renderSuiteResourceIndex() {
  const container = byId("suite-resource-index");
  if (!container) return;

  const patient = getActivePatient();
  const activities = recommendActivities(patient).slice(0, 8);
  const patientEvents = patient ? getPatientSuiteEvents(patient.id) : [];

  container.innerHTML = activities.length
    ? activities
        .map((activity) => {
          const latest = [...patientEvents]
            .filter((event) => event.activity_id === activity.id)
            .sort((left, right) => new Date(right.date) - new Date(left.date))[0];
          return `
            <a class="suite-resource-link" href="${buildMeasuredResourceUrl(activity)}" target="_blank" rel="noreferrer">
              <div>
                <strong>${escapeHtml(activity.title)}</strong>
                <span>${escapeHtml(latest ? latest.level_label : (activity.focus_areas || []).join(", ") || "sin recorrido")}</span>
              </div>
              <span>${escapeHtml(activity.kind || "recurso")}</span>
            </a>
          `;
        })
        .join("")
    : `<p class="small">Sin recursos recomendados todavia.</p>`;
}

function renderPatientPanel() {
  const patients = getPatients();
  const activePatient = getActivePatient();
  const selector = byId("patient-select");
  const ribbon = byId("suite-patient-ribbon");

  selector.innerHTML = [`<option value="">Selecciona paciente...</option>`]
    .concat(
      patients.map((patient) => {
        const selected = activePatient && patient.id === activePatient.id ? "selected" : "";
        return `<option value="${patient.id}" ${selected}>${patient.name} (${patient.age || "n/d"} anos)</option>`;
      })
    )
    .join("");

  const attempts = activePatient ? getAllAttempts().filter((attempt) => attempt.patient_id === activePatient.id) : [];
  const suiteEvents = activePatient ? getPatientSuiteEvents(activePatient.id) : [];
  const avg = attempts.length
    ? Math.round(attempts.reduce((accumulator, attempt) => accumulator + toNumber(attempt.scoring?.total), 0) / attempts.length)
    : 0;
  const suiteAvg = suiteEvents.length
    ? Math.round(suiteEvents.reduce((accumulator, event) => accumulator + toNumber(event.score), 0) / suiteEvents.length)
    : 0;
  const lastModuleQuiz = activePatient ? getPatientQuizScore(activePatient, state.currentModuleId) : 0;

  byId("patient-summary").innerHTML = activePatient
    ? `
      <p><strong>${activePatient.name}</strong> | ${activePatient.age || "n/d"} anos | nivel ${activePatient.level}</p>
      <p><strong>Objetivos:</strong> ${activePatient.goals.join(", ") || "sin definir"}</p>
      <p><strong>Etiquetas:</strong> ${activePatient.tags.join(", ") || "sin definir"}</p>
      <p><strong>Sesiones GPT:</strong> ${attempts.length} | <strong>Media GPT:</strong> ${avg ? `${avg}/100` : "n/d"} | <strong>Eventos medibles:</strong> ${suiteEvents.length} | <strong>Media suite:</strong> ${suiteAvg ? `${suiteAvg}/100` : "n/d"} | <strong>Quiz modulo actual:</strong> ${lastModuleQuiz}/100</p>
      <p class="small"><strong>Persistencia:</strong> todo lo que hagas en esta suite se guarda en este navegador por paciente.</p>
      <p class="small">${getPatientAssessmentSummary(activePatient)}</p>
      <div class="patient-summary-actions">
        <button class="action-btn secondary" type="button" data-open-patient-create="1">Nuevo paciente</button>
      </div>
      ${buildPatientInsightReport(activePatient)}
      ${buildPatientClinicalPanel(activePatient)}
    `
    : `
      <p class="small">Crea un paciente para empezar a registrar progreso individual y recomendar actividades.</p>
      <div class="patient-summary-actions">
        <button class="action-btn primary" type="button" data-open-patient-create="1">Crear paciente ahora</button>
      </div>
    `;

  const patientReportView = byId("patient-report-view");
  if (patientReportView) {
    patientReportView.innerHTML = activePatient
      ? `${buildPatientInsightReport(activePatient)}${buildPatientClinicalPanel(activePatient)}`
      : `
        <p class="small">Selecciona o crea un paciente para ver su informe resumido.</p>
        <div class="patient-summary-actions">
          <button class="action-btn primary" type="button" data-open-patient-create="1">Crear paciente ahora</button>
        </div>
      `;
  }

  if (ribbon) {
    ribbon.innerHTML = activePatient
      ? `
        <p><strong>${activePatient.name}</strong> · ${activePatient.age || "n/d"} anos · nivel ${activePatient.level}</p>
        <p class="small">Objetivos: ${activePatient.goals.join(", ") || "sin definir"} | Etiquetas: ${activePatient.tags.join(", ") || "sin definir"}</p>
        <p class="small">Todo lo medible se guarda sobre este paciente y alimenta la suite central. Recursos usados: ${suiteEvents.length} · media: ${suiteAvg ? `${suiteAvg}/100` : "n/d"}.</p>
      `
      : `Sin paciente activo. Abre el panel de pacientes para crear o seleccionar uno y ver todo el progreso asociado.`;
  }

  renderActivityCatalog();
  renderSuiteDashboard();
  renderModuleStatusText();
  syncExerciseInstruction();
}

function activateSubtab(targetId, scope = document) {
  if (!targetId) return;
  const panel = scope.querySelector(`#${targetId}`);
  if (!panel) return;
  scope.querySelectorAll(".subtab-btn").forEach((item) => item.classList.remove("active"));
  scope.querySelectorAll(".subtab-panel").forEach((item) => item.classList.remove("active"));
  const button = scope.querySelector(`.subtab-btn[data-subtab-target="${targetId}"]`);
  button?.classList.add("active");
  panel.classList.add("active");
}

function initSubtabs() {
  document.querySelectorAll(".subtab-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.subtabTarget;
      if (!target) return;
      const scope = button.closest(".card, .patient-tab-shell") || document;
      activateSubtab(target, scope);
    });
  });
}

function bindPatientPanel() {
  byId("patient-select").addEventListener("change", async (event) => {
    setActivePatientId(event.target.value);
    syncSessionWithPatient(getActivePatient());
    renderPatientPanel();
    renderProgress();
    byId("quiz-result").textContent = "";
    setPatientDrawerOpen(false);
  });

  byId("patient-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = byId("patient-name").value.trim();
    if (!name) return;

    const patient = {
      id: crypto.randomUUID(),
      name,
      age: toNumber(byId("patient-age").value || 0),
      level: byId("patient-level").value || "basico",
      goals: normalizeTagList(byId("patient-goals").value),
      tags: normalizeTagList(byId("patient-tags").value),
      notes: byId("patient-notes").value.trim(),
      created_at: new Date().toISOString(),
    };

    const patients = getPatients();
    patients.unshift(patient);
    savePatients(patients);
    setActivePatientId(patient.id);
    syncSessionWithPatient(patient);

    byId("patient-form").reset();
    renderPatientPanel();
    renderProgress();
    setPatientDrawerOpen(false);
  });
}

function renderProgress() {
  const patient = getActivePatient();
  const allAttempts = getAllAttempts();
  const patientAttempts = patient ? allAttempts.filter((attempt) => attempt.patient_id === patient.id) : [];
  const suiteEvents = patient ? getPatientSuiteEvents(patient.id) : [];
  const moduleAttempts = patientAttempts.filter((attempt) => (attempt.module_id || "module-00") === state.currentModuleId);
  const attemptList = byId("attempt-list");
  const gradeBox = byId("student-grade");
  const evolutionBars = byId("evolution-bars");
  const quizScore = patient ? getPatientQuizScore(patient, state.currentModuleId) : 0;

  const avgPractical = moduleAttempts.length
    ? Math.round(moduleAttempts.reduce((accumulator, attempt) => accumulator + attempt.scoring.total, 0) / moduleAttempts.length)
    : 0;

  const globalAvgPractical = patientAttempts.length
    ? Math.round(patientAttempts.reduce((accumulator, attempt) => accumulator + toNumber(attempt.scoring?.total), 0) / patientAttempts.length)
    : 0;
  const suiteAvg = suiteEvents.length
    ? Math.round(suiteEvents.reduce((accumulator, event) => accumulator + toNumber(event.score), 0) / suiteEvents.length)
    : 0;

  byId("progress-summary").textContent = patient
    ? `${patient.name} -> ${state.currentModuleId.toUpperCase()} | Quiz: ${quizScore}/100 | Practicas modulo: ${moduleAttempts.length} | Eventos suite: ${suiteEvents.length} | Media modulo: ${avgPractical}/100 | Media suite: ${suiteAvg}/100`
    : "Sin paciente activo.";

  const globalGrade = moduleAttempts.length || quizScore ? Math.round(quizScore * 0.3 + avgPractical * 0.7) : suiteAvg;
  gradeBox.textContent = patient ? `Nota global paciente: ${globalGrade || 0}/100` : "Nota global: n/a";

  const progressItems = moduleAttempts.length
    ? moduleAttempts.slice(0, 10).reverse().map((attempt, index) => ({
        label: `I${index + 1}`,
        score: toNumber(attempt.scoring?.total),
      }))
    : suiteEvents.slice(0, 10).reverse().map((event, index) => ({
        label: `S${index + 1}`,
        score: toNumber(event.score),
      }));

  evolutionBars.innerHTML = progressItems
    .map((item) => {
      const score = item.score;
      const color = score >= 70 ? "#16a34a" : score >= 50 ? "#f59e0b" : "#dc2626";
      return `
        <div class="bar-row">
          <span class="bar-label">${item.label}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.max(4, score)}%;background:${color};"></div></div>
          <span class="bar-value">${score}</span>
        </div>
      `;
    })
    .join("");

  attemptList.innerHTML = moduleAttempts.length
    ? moduleAttempts
        .slice(0, 8)
        .map(
          (attempt) => `
            <article class="attempt-item">
              <p><strong>${attempt.exercise_title}</strong></p>
              <p>Paciente: ${attempt.patient_name}</p>
              <p>Fecha: ${new Date(attempt.date).toLocaleString()}</p>
              <p>Nota: ${attempt.scoring.total}/100 (claridad ${attempt.scoring.clarity}, clinico ${attempt.scoring.clinical_relevance}, estructura ${attempt.scoring.structure}, seguridad ${attempt.scoring.safety}, personalizacion ${attempt.scoring.personalization || 0})</p>
              <p><strong>Comparacion IA:</strong> ${attempt.comparison_output ? "si" : "no"} | <strong>Ganador:</strong> ${attempt.comparison_result?.winner || "n/a"}</p>
              <pre>${attempt.adaptation_plan || ""}</pre>
            </article>
          `
        )
        .join("")
    : suiteEvents.length
      ? suiteEvents
          .slice(0, 8)
          .map(
            (event) => `
              <article class="attempt-item">
                <p><strong>${event.activity_title}</strong></p>
                <p>Fecha: ${new Date(event.date).toLocaleString()}</p>
                <p>Estado: ${event.status || "n/d"} | Hito: ${event.level_label || "n/d"}</p>
                <p>Score: ${toNumber(event.score)}/100 | Precision: ${toNumber(event.accuracy)}/100 | Duracion: ${toNumber(event.duration_minutes || 0)} min</p>
                <p class="small">${event.notes || ""}</p>
              </article>
            `
          )
          .join("")
      : `<p class="small">Aun no hay intentos o eventos guardados para este paciente.</p>`;
}

function bindPractice() {
  byId("exercise-select").addEventListener("change", syncExerciseInstruction);
  byId("run-prompt").addEventListener("click", runPrompt);
  byId("run-demo").addEventListener("click", runDemoMode);
  byId("compare-outputs").addEventListener("click", compareOutputs);
  byId("save-attempt").addEventListener("click", saveAttempt);
  byId("next-exercise").addEventListener("click", goToNextExercise);
}

function bindSuiteActions() {
  byId("load-suite-demo").addEventListener("click", loadSuiteDemo);
}

function bindCatalogControls() {
  byId("catalog-search")?.addEventListener("input", (event) => {
    state.catalogQuery = event.target.value || "";
    renderActivityCatalog();
  });

  document.querySelectorAll(".catalog-filter").forEach((button) => {
    button.addEventListener("click", () => {
      state.catalogKind = button.dataset.kind || "all";
      document.querySelectorAll(".catalog-filter").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderActivityCatalog();
    });
  });
}

function setPatientDrawerOpen(isOpen) {
  byId("patient-drawer")?.classList.toggle("hidden", !isOpen);
  byId("patient-drawer-backdrop")?.classList.toggle("hidden", !isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
}

function openPatientDrawerWithTab(targetId) {
  setPatientDrawerOpen(true);
  const shell = byId("patient-drawer");
  if (shell && targetId) activateSubtab(targetId, shell);
}

function openPatientSheet(activityId) {
  byId("tab-suite")?.click();
  byId("suite-clinic")?.scrollIntoView({ behavior: "smooth", block: "start" });
  openPatientDrawerWithTab(getActivePatient() ? "patient-overview-panel" : "patient-create-panel");

  const patientSummary = byId("patient-summary");
  const activity = getActivityById(activityId);
  if (patientSummary) {
    patientSummary.scrollIntoView({ behavior: "smooth", block: "start" });
    patientSummary.classList.add("focus-pulse");
    window.setTimeout(() => patientSummary.classList.remove("focus-pulse"), 1200);
  }

  if (!getActivePatient()) {
    byId("attempt-status").textContent = "Abre o crea un paciente para ver su ficha clinica y guardar datos del recurso.";
    return;
  }

  if (activity) {
    byId("attempt-status").textContent = `Ficha abierta para ${getActivePatient().name}. Revisa objetivos, seguimiento e intervencion alrededor de ${activity.title}.`;
  }
}

function bindPatientDrawer() {
  ["open-patient-drawer", "open-patient-drawer-hero", "open-patient-drawer-suite"].forEach((id) => {
    byId(id)?.addEventListener("click", () => {
      openPatientDrawerWithTab(getPatients().length ? "patient-overview-panel" : "patient-create-panel");
    });
  });
  ["open-patient-create", "open-patient-create-drawer"].forEach((id) => {
    byId(id)?.addEventListener("click", () => openPatientDrawerWithTab("patient-create-panel"));
  });

  byId("close-patient-drawer")?.addEventListener("click", () => setPatientDrawerOpen(false));
  byId("patient-drawer-backdrop")?.addEventListener("click", () => setPatientDrawerOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setPatientDrawerOpen(false);
  });
}

function bindActivityDetailButtons() {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-patient-sheet]");
    if (!trigger) return;
    event.preventDefault();
    openPatientSheet(trigger.dataset.openPatientSheet || "");
  });
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-patient-create]");
    if (!trigger) return;
    event.preventDefault();
    openPatientDrawerWithTab("patient-create-panel");
  });
}

function bindWorkspaceTabs() {
  document.querySelectorAll(".workspace-tab").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.tabTarget;
      document.querySelectorAll(".workspace-tab").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".workspace-panel").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      byId(targetId)?.classList.add("active");
    });
  });

  byId("tab-switch-suite")?.addEventListener("click", () => {
    byId("tab-suite")?.click();
    byId("suite-clinic")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  ["tab-switch-games", "tab-switch-games-inline"].forEach((id) => {
    byId(id)?.addEventListener("click", () => {
      byId("tab-games")?.click();
      byId("suite-clinic")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  ["open-demos-hub", "suite-open-demos-inline"].forEach((id) => {
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest(`#${id}`);
      if (!trigger) return;
      byId("tab-demos")?.click();
      byId("suite-clinic")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  byId("nav-patients-link")?.addEventListener("click", (event) => {
    event.preventDefault();
    setPatientDrawerOpen(true);
  });
}

function bindClinicalFocusToggle() {
  const button = byId("toggle-public-view");
  const syncLabel = () => {
    if (!button) return;
    button.textContent = document.body.classList.contains("clinical-focus") ? "Ver web completa" : "Ver modo clinico";
  };

  syncLabel();

  button?.addEventListener("click", () => {
    document.body.classList.toggle("clinical-focus");
    syncLabel();
    if (document.body.classList.contains("clinical-focus")) {
      byId("tab-suite")?.click();
      byId("suite-clinic")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

async function init() {
  if (window.location.protocol === "file:") {
    byId("attempt-status").textContent =
      "Estas abriendo el HTML con file://. Para ver el inventario completo y abrir actividades integradas, sirve la carpeta raiz con python3 -m http.server.";
  }

  await Promise.all([loadCatalog(), loadActivityCatalog()]);
  ensureModuleStatuses();
  ensureSeedPatient();
  await loadModuleData(state.currentModuleId);

  if (getActivePatient()) {
    syncSessionWithPatient(getActivePatient());
  } else {
    initSession();
  }
  bindAuth();
  bindPatientPanel();
  bindPatientDrawer();
  bindActivityDetailButtons();
  bindSuiteActions();
  bindCatalogControls();
  bindWorkspaceTabs();
  bindClinicalFocusToggle();
  initSubtabs();

  renderModuleSelector();
  renderRoadmap();
  bindModuleSelector();
  renderTheory();
  renderModuleStatusText();
  renderQuiz();
  bindQuizSubmit();

  initApiConfig();
  bindApiConfig();

  renderExercises();
  bindPractice();
  renderPatientPanel();
  renderProgress();
  renderSuiteDashboard();

  if (document.body.classList.contains("clinical-focus")) {
    byId("tab-suite")?.click();
    byId("suite-clinic")?.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

init();
