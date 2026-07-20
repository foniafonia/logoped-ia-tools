const state = {
  catalog: null,
  currentModuleId: "module-00",
  module: null,
  quiz: null,
  challenges: null,
  currentLessonIndex: 0,
  lastComparison: null,
  moduleResourcesText: "",
  moduleDataSource: "unknown",
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
          "Incluye contexto, objetivo y formato de salida."
        ],
        example: "Actua como logopeda infantil y crea 5 actividades de vocabulario para 6 anos.",
        checklist: ["Define rol", "Define objetivo", "Define formato", "Incluye edad o nivel"]
      },
      {
        id: "lesson-00-02",
        title: "Que es un LLM",
        duration_minutes: 15,
        theory: [
          "LLM significa Large Language Model.",
          "Predice texto en funcion del contexto.",
          "Es apoyo profesional, no diagnostico automatico."
        ],
        example: "Explica a una familia como practicar conciencia fonologica en casa.",
        checklist: ["Lenguaje claro", "Limites de uso", "Revision humana"]
      },
      {
        id: "lesson-00-03",
        title: "Primeros prompts aplicados a logopedia",
        duration_minutes: 20,
        theory: [
          "Incluye edad, objetivo y duracion.",
          "Pide pasos concretos y criterio de exito.",
          "Itera y mejora el prompt en versiones."
        ],
        example: "Genera actividad para fonema /r/ de 15 minutos, nivel basico.",
        checklist: ["Objetivo medible", "Materiales", "Pasos", "Seguridad"]
      }
    ]
  },
  quiz: {
    id: "quiz-00-01",
    passing_score: 70,
    questions: [
      {
        id: "q1",
        question: "Que es un prompt?",
        options: ["Un archivo de audio", "Una instruccion para guiar la respuesta del modelo", "Un tipo de cuenta de correo", "Una base de datos clinica"],
        correct_option: 1
      },
      {
        id: "q2",
        question: "LLM significa:",
        options: ["Large Learning Memory", "Long Language Machine", "Large Language Model", "Logic Language Method"],
        correct_option: 2
      },
      {
        id: "q3",
        question: "Que mejora normalmente la calidad de una respuesta?",
        options: ["Dar instrucciones ambiguas", "Pedir muchas tareas sin orden", "Definir objetivo, contexto y formato", "No indicar publico objetivo"],
        correct_option: 2
      },
      {
        id: "q4",
        question: "En contexto logopedico, un prompt inicial debe incluir:",
        options: ["Solo el nombre del nino", "Edad y objetivo terapeutico", "Solo un titulo creativo", "Ningun dato de contexto"],
        correct_option: 1
      },
      {
        id: "q5",
        question: "Por que iteramos un prompt?",
        options: ["Para empeorar", "Para mejorar precision y utilidad", "Para evitar feedback", "No hay que iterar"],
        correct_option: 1
      }
    ]
  },
  challenges: {
    exercises: [
      {
        id: "ex-00-01",
        title: "Prompt de actividad de vocabulario",
        instruction: "Escribe un prompt para generar una actividad de vocabulario para 6 anos."
      },
      {
        id: "ex-00-02",
        title: "Prompt de explicacion para familia",
        instruction: "Escribe un prompt para explicar a una familia como reforzar conciencia fonologica en casa."
      },
      {
        id: "ex-00-03",
        title: "Prompt de imagen logopedica",
        instruction: "Escribe un prompt para generar una imagen educativa de logopedia apta para ninos."
      }
    ]
  }
};

const STORAGE_KEYS = {
  session: "logopedia_course_session",
  apiConfig: "logopedia_course_api_config",
  attempts: "logopedia_course_attempts",
  quizScore: "logopedia_course_quiz_score",
  quizScores: "logopedia_course_quiz_scores",
  moduleStatus: "logopedia_course_module_status",
};
const FIXED_API_ENDPOINT = "https://api.openai.com/v1/responses";
const CONTENT_ROOT_CANDIDATES = ["./content", "../../content", "/content"];

function byId(id) {
  return document.getElementById(id);
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
        { id: "module-07", title: "Proyecto final y profesionalizacion" }
      ],
    },
  };
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
  state.moduleDataSource = moduleData && quizData && challengeData ? "json" : "fallback";
  state.currentModuleId = moduleId;
  state.currentLessonIndex = 0;
  state.lastComparison = null;
}

function initSession() {
  const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || "null");
  const loginForm = byId("login-form");
  const sessionBox = byId("session-box");

  if (session) {
    loginForm.classList.add("hidden");
    sessionBox.classList.remove("hidden");
    byId("session-user").textContent = `Sesion activa: ${session.name} (${session.email})`;
  } else {
    loginForm.classList.remove("hidden");
    sessionBox.classList.add("hidden");
  }
}

function bindAuth() {
  byId("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = byId("student-name").value.trim();
    const email = byId("student-email").value.trim();
    if (!name || !email) return;
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ name, email }));
    initSession();
  });

  byId("logout-btn").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEYS.session);
    initSession();
  });
}

function getModuleStatusMap() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.moduleStatus) || "{}");
}

function setModuleStatusMap(map) {
  localStorage.setItem(STORAGE_KEYS.moduleStatus, JSON.stringify(map));
}

function ensureModuleStatuses() {
  const modules = state.catalog?.course?.modules || [];
  const map = getModuleStatusMap();
  if (!modules.length) return;

  modules.forEach((m, idx) => {
    if (!map[m.id]) {
      map[m.id] = idx === 0 ? "active" : "locked";
    }
  });
  setModuleStatusMap(map);
}

function statusLabel(status) {
  if (status === "completed") return "Completado";
  if (status === "active") return "Activo";
  return "Bloqueado";
}

function getCurrentModuleMetrics() {
  const allAttempts = JSON.parse(localStorage.getItem(STORAGE_KEYS.attempts) || "[]");
  const attempts = allAttempts.filter((a) => (a.module_id || "module-00") === state.currentModuleId);
  const scoreMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.quizScores) || "{}");
  const quizScore = toNumber(scoreMap[state.currentModuleId] || 0);
  const passingQuiz = toNumber(state.quiz?.passing_score || 70);
  const exerciseCount = state.challenges?.exercises?.length || 0;
  const approvedExercises = new Set(
    attempts.filter((a) => toNumber(a.scoring?.total) >= 60).map((a) => a.exercise_id)
  );
  return {
    attempts,
    quizScore,
    passingQuiz,
    exerciseCount,
    approvedExerciseCount: approvedExercises.size,
    modulePassed:
      quizScore >= passingQuiz &&
      attempts.length >= 1 &&
      approvedExercises.size >= Math.min(1, exerciseCount),
  };
}

function unlockNextModuleIfEligible() {
  const modules = state.catalog?.course?.modules || [];
  const map = getModuleStatusMap();
  const idx = modules.findIndex((m) => m.id === state.currentModuleId);
  if (idx < 0) return;
  const metrics = getCurrentModuleMetrics();
  if (!metrics.modulePassed) return;

  map[state.currentModuleId] = "completed";
  const next = modules[idx + 1];
  if (next && map[next.id] === "locked") {
    map[next.id] = "active";
  }
  setModuleStatusMap(map);
}

function renderModuleStatusText() {
  const map = getModuleStatusMap();
  const status = map[state.currentModuleId] || "active";
  const m = getCurrentModuleMetrics();
  byId("module-status-text").textContent =
    `Estado: ${statusLabel(status)} | Quiz: ${m.quizScore}/${m.passingQuiz} | Ejercicios validados: ${m.approvedExerciseCount}/${Math.min(1, m.exerciseCount)} (>=60)`;
  byId("module-data-text").textContent =
    `Contenido cargado: ${state.moduleDataSource === "json" ? "JSON del curso" : "Fallback local"} | Preguntas quiz: ${state.quiz?.questions?.length || 0} | Ejercicios: ${state.challenges?.exercises?.length || 0}`;
}

function renderModuleSelector() {
  const select = byId("module-select");
  const modules = state.catalog?.course?.modules || [];
  const statusMap = getModuleStatusMap();
  select.innerHTML = modules
    .map((m) => {
      const status = statusMap[m.id] || "locked";
      const badge = status === "completed" ? "✓" : status === "active" ? "•" : "🔒";
      const disabled = status === "locked" ? "disabled" : "";
      const selected = m.id === state.currentModuleId ? "selected" : "";
      return `<option value="${m.id}" ${selected} ${disabled}>${badge} ${m.id.toUpperCase()} - ${m.title}</option>`;
    })
    .join("");
}

function renderRoadmap() {
  const wrap = byId("module-roadmap");
  if (!wrap) return;
  const modules = state.catalog?.course?.modules || [];
  const statusMap = getModuleStatusMap();
  wrap.innerHTML = modules
    .map((m) => {
      const status = statusMap[m.id] || "locked";
      return `
        <article class="roadmap-item ${status}">
          <div class="code">${m.id.toUpperCase()}</div>
          <div class="title">${m.title}</div>
          <div class="status">${statusLabel(status)}</div>
        </article>
      `;
    })
    .join("");
}

function bindModuleSelector() {
  byId("module-select").addEventListener("change", async (e) => {
    const nextModuleId = e.target.value;
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

function forceUnlockNextModule() {
  const modules = state.catalog?.course?.modules || [];
  const map = getModuleStatusMap();
  const idx = modules.findIndex((m) => m.id === state.currentModuleId);
  if (idx < 0) return;
  const next = modules[idx + 1];
  map[state.currentModuleId] = "completed";
  if (next) map[next.id] = "active";
  setModuleStatusMap(map);
  renderModuleSelector();
  renderRoadmap();
  renderModuleStatusText();
  byId("attempt-status").textContent = next
    ? `Modulo siguiente desbloqueado: ${next.id.toUpperCase()}.`
    : "No hay mas modulos para desbloquear.";
}

function renderTheory() {
  const tabs = byId("lesson-tabs");
  tabs.innerHTML = "";

  state.module.lessons.forEach((lesson, index) => {
    const btn = document.createElement("button");
    btn.className = `tab-btn ${index === state.currentLessonIndex ? "active" : ""}`;
    btn.textContent = lesson.title;
    btn.addEventListener("click", () => {
      state.currentLessonIndex = index;
      renderTheory();
    });
    tabs.appendChild(btn);
  });

  const lesson = state.module.lessons[state.currentLessonIndex];
  const promptBaseBlock = lesson.prompt_base
    ? `<h3>Prompt base (antes)</h3><pre class="prompt-box">${lesson.prompt_base}</pre>`
    : "";
  const promptImprovedBlock = lesson.prompt_improved
    ? `<h3>Prompt mejorado (despues)</h3><pre class="prompt-box">${lesson.prompt_improved}</pre>`
    : "";
  const refinementBlock = Array.isArray(lesson.refinement_phrases) && lesson.refinement_phrases.length
    ? `<h3>Frases de refinamiento</h3><ul>${lesson.refinement_phrases.map((item) => `<li>${item}</li>`).join("")}</ul>`
    : "";
  const reflectionBlock = Array.isArray(lesson.reflection_questions) && lesson.reflection_questions.length
    ? `<h3>Preguntas de reflexion</h3><ul>${lesson.reflection_questions.map((item) => `<li>${item}</li>`).join("")}</ul>`
    : "";

  const content = byId("lesson-content");
  content.innerHTML = `
    <p><strong>Modulo:</strong> ${state.module.title}</p>
    <p><strong>Duracion estimada:</strong> ${lesson.duration_minutes} min</p>
    <h3>Ideas clave</h3>
    <ul>${lesson.theory.map((item) => `<li>${item}</li>`).join("")}</ul>
    <h3>Ejemplo</h3>
    <p>${lesson.example}</p>
    <h3>Checklist</h3>
    <ul>${lesson.checklist.map((item) => `<li>${item}</li>`).join("")}</ul>
    ${promptBaseBlock}
    ${promptImprovedBlock}
    ${refinementBlock}
    ${reflectionBlock}
    <h3>Recursos del modulo</h3>
    <pre>${state.moduleResourcesText || "Sin recursos extra para este modulo."}</pre>
  `;
}

function renderQuiz() {
  const container = byId("quiz-container");
  container.innerHTML = "";

  state.quiz.questions.forEach((q, qIndex) => {
    const wrapper = document.createElement("div");
    wrapper.className = "attempt-item";
    const optionsHtml = q.options
      .map(
        (opt, optIndex) =>
          `<label><input type="radio" name="q_${qIndex}" value="${optIndex}" /> ${opt}</label>`
      )
      .join("");

    wrapper.innerHTML = `<p><strong>${qIndex + 1}. ${q.question}</strong></p>${optionsHtml}`;
    container.appendChild(wrapper);
  });
}

function bindQuizSubmit() {
  byId("submit-quiz").addEventListener("click", () => {
    let correct = 0;
    const feedback = [];

    state.quiz.questions.forEach((q, idx) => {
      const selected = document.querySelector(`input[name=\"q_${idx}\"]:checked`);
      const selectedIndex = selected ? Number(selected.value) : -1;
      if (selected && Number(selected.value) === q.correct_option) {
        correct += 1;
      }
      const isCorrect = selectedIndex === q.correct_option;
      const selectedLabel = selectedIndex >= 0 ? q.options[selectedIndex] : "Sin responder";
      const correctLabel = q.options[q.correct_option];
      feedback.push(`
        <div class="quiz-feedback-item ${isCorrect ? "ok" : "bad"}">
          <p><strong>${idx + 1}. ${q.question}</strong></p>
          <p>Tu respuesta: ${selectedLabel}</p>
          <p>Correcta: ${correctLabel}</p>
          <p>${q.explanation || "Sin explicacion disponible."}</p>
        </div>
      `);
    });

    const score = Math.round((correct / state.quiz.questions.length) * 100);
    localStorage.setItem(STORAGE_KEYS.quizScore, String(score));
    const scoreMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.quizScores) || "{}");
    scoreMap[state.currentModuleId] = score;
    localStorage.setItem(STORAGE_KEYS.quizScores, JSON.stringify(scoreMap));

    const pass = score >= state.quiz.passing_score;
    byId("quiz-result").innerHTML =
      `<p><strong>Resultado: ${score}/100 (${correct}/${state.quiz.questions.length}) - ${
        pass ? "Aprobado" : "No aprobado"
      }</strong></p><div class=\"quiz-feedback\">${feedback.join("")}</div>`;

    unlockNextModuleIfEligible();
    renderModuleSelector();
    renderModuleStatusText();
    renderRoadmap();
    renderProgress();
  });
}

function initApiConfig() {
  const cfg = JSON.parse(localStorage.getItem(STORAGE_KEYS.apiConfig) || "{}");
  byId("api-key").value = cfg.apiKey || "";
  byId("api-model").value = cfg.model || "gpt-4.1-mini";
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

  state.challenges.exercises.forEach((ex) => {
    const opt = document.createElement("option");
    opt.value = ex.id;
    opt.textContent = ex.title;
    select.appendChild(opt);
  });

  syncExerciseInstruction();
}

function syncExerciseInstruction() {
  const ex = getSelectedExercise();
  byId("exercise-instruction").textContent = ex ? ex.instruction : "";
}

function getSelectedExercise() {
  const exId = byId("exercise-select").value;
  return state.challenges.exercises.find((ex) => ex.id === exId);
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
      for (const c of item.content) {
        if (c && typeof c.text === "string") chunks.push(c.text);
      }
    }
    if (chunks.length) return chunks.join("\n\n");
  }
  return JSON.stringify(apiResponse, null, 2);
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    return null;
  }
}

function extractJsonFromText(text) {
  if (!text) return null;
  const direct = safeJsonParse(text);
  if (direct) return direct;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  return safeJsonParse(match[0]);
}

function buildComparisonPrompt({ exerciseTitle, userPrompt, internalOutput, externalOutput }) {
  return `
Compara dos respuestas para entrenamiento de prompting en logopedia.

Contexto:
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
  "reasoning": [
    "motivo 1",
    "motivo 2",
    "motivo 3"
  ],
  "how_to_improve_prompt": [
    "mejora 1",
    "mejora 2",
    "mejora 3"
  ],
  "improved_prompt": "version mejorada del prompt del alumno para obtener una salida superior"
}
  `.trim();
}

function formatComparisonResult(result) {
  if (!result || typeof result !== "object") return "No se pudo generar comparacion estructurada.";
  const winner = result.winner || "No definido";
  const scoreA = result.scores?.A?.total ?? "n/a";
  const scoreB = result.scores?.B?.total ?? "n/a";
  const reasons = Array.isArray(result.reasoning) ? result.reasoning.map((r) => `- ${r}`).join("\n") : "- Sin razones";
  const improvements = Array.isArray(result.how_to_improve_prompt)
    ? result.how_to_improve_prompt.map((r) => `- ${r}`).join("\n")
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

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function getComparisonScores(result) {
  return {
    totalA: toNumber(result?.scores?.A?.total),
    totalB: toNumber(result?.scores?.B?.total),
  };
}

function getSemaphoreClass(totalA, totalB) {
  const diff = Math.abs(totalA - totalB);
  if (diff <= 2) return "sem-yellow";
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
  const cfg = JSON.parse(localStorage.getItem(STORAGE_KEYS.apiConfig) || "{}");
  const endpoint = FIXED_API_ENDPOINT;
  const prompt = byId("prompt-input").value.trim();
  const ex = getSelectedExercise();

  if (!cfg.apiKey) {
    byId("attempt-status").textContent = "Pega tu API key (sk-...) y guarda configuracion.";
    return;
  }
  if (!prompt) {
    byId("attempt-status").textContent = "Escribe un prompt antes de enviar.";
    return;
  }

  byId("attempt-status").textContent = "Enviando prompt a API...";

  try {
    const headers = { "Content-Type": "application/json" };
    headers.Authorization = `Bearer ${cfg.apiKey}`;

    const body = {
      model: cfg.model || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Eres un asistente de formacion en logopedia. Responde de forma clara, estructurada y segura.",
        },
        {
          role: "user",
          content: `Modulo: ${state.module.id}\nEjercicio: ${ex ? ex.id : "sin-ejercicio"}\n\n${prompt}`,
        },
      ],
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      byId("attempt-status").textContent = `Error API (${res.status}): ${errorText.slice(0, 180)}`;
      return;
    }

    const data = await res.json();
    const text = extractResponseText(data);
    byId("internal-output").value = text;
    byId("attempt-status").textContent = "Respuesta recibida.";
  } catch (error) {
    byId("attempt-status").textContent = `Error API: ${error.message}`;
  }
}

async function compareOutputs() {
  const cfg = JSON.parse(localStorage.getItem(STORAGE_KEYS.apiConfig) || "{}");
  const endpoint = FIXED_API_ENDPOINT;
  const ex = getSelectedExercise();
  const userPrompt = byId("prompt-input").value.trim();
  const internalOutput = byId("internal-output").value.trim();
  const externalOutput = byId("external-output").value.trim();

  if (!cfg.apiKey) {
    byId("attempt-status").textContent = "Pega tu API key (sk-...) y guarda configuracion.";
    return;
  }
  if (!userPrompt || !internalOutput || !externalOutput) {
    byId("attempt-status").textContent =
      "Para comparar necesitas: prompt, respuesta interna y respuesta externa.";
    return;
  }

  byId("attempt-status").textContent = "Comparando respuestas con IA...";

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    };

    const body = {
      model: cfg.model || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Eres evaluador experto de prompts en logopedia. Prioriza seguridad profesional y accionabilidad.",
        },
        {
          role: "user",
          content: buildComparisonPrompt({
            exerciseTitle: ex ? ex.title : "Sin ejercicio",
            userPrompt,
            internalOutput,
            externalOutput,
          }),
        },
      ],
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      byId("attempt-status").textContent = `Error comparacion (${res.status}): ${errorText.slice(0, 180)}`;
      return;
    }

    const data = await res.json();
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

function scorePrompt(prompt) {
  const lower = prompt.toLowerCase();

  let clarity = 0;
  if (prompt.length >= 80) clarity += 10;
  if (/(objetivo|meta|quiero que)/.test(lower)) clarity += 15;

  let clinicalRelevance = 0;
  const clinicalTerms = ["articulacion", "fonologia", "vocabulario", "comprension", "expresion", "logopedia"];
  const foundClinical = clinicalTerms.filter((t) => lower.includes(t)).length;
  clinicalRelevance = Math.min(25, foundClinical * 6);

  let structure = 0;
  const structureTerms = ["edad", "duracion", "material", "pasos", "formato"];
  const foundStructure = structureTerms.filter((t) => lower.includes(t)).length;
  structure = Math.min(25, foundStructure * 6);

  let safety = 0;
  if (/(no diagnostico|orientativo|supervision profesional|no sustituye)/.test(lower)) {
    safety = 25;
  } else {
    safety = 8;
  }

  return {
    clarity,
    clinical_relevance: clinicalRelevance,
    structure,
    safety,
    total: clarity + clinicalRelevance + structure + safety,
  };
}

function saveAttempt() {
  const ex = getSelectedExercise();
  const prompt = byId("prompt-input").value.trim();
  const internalOutput = byId("internal-output").value.trim();
  const externalOutput = byId("external-output").value.trim();
  const selfAnalysis = byId("self-analysis").value.trim();
  const comparisonOutput = byId("comparison-output").value.trim();
  const comparisonResult = state.lastComparison;

  if (!prompt) {
    byId("attempt-status").textContent = "No se puede guardar sin prompt.";
    return;
  }

  const scoring = scorePrompt(prompt);
  const record = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    module_id: state.currentModuleId,
    module_title: state.module?.title || state.currentModuleId,
    exercise_id: ex ? ex.id : "sin-ejercicio",
    exercise_title: ex ? ex.title : "Sin ejercicio",
    prompt,
    output_internal_api: internalOutput,
    output_external_reference: externalOutput,
    self_analysis: selfAnalysis,
    comparison_output: comparisonOutput,
    comparison_result: comparisonResult,
    scoring,
  };

  const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.attempts) || "[]");
  existing.unshift(record);
  localStorage.setItem(STORAGE_KEYS.attempts, JSON.stringify(existing));

  byId("attempt-status").textContent = `Intento guardado. Nota: ${scoring.total}/100`;
  unlockNextModuleIfEligible();
  renderModuleSelector();
  renderModuleStatusText();
  renderRoadmap();
  renderProgress();
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
  const idx = select.selectedIndex;
  const lastIndex = select.options.length - 1;
  if (idx < lastIndex) {
    select.selectedIndex = idx + 1;
    syncExerciseInstruction();
    clearPracticeFields();
    byId("attempt-status").textContent = "Avanzaste al siguiente ejercicio.";
  } else {
    byId("attempt-status").textContent = `Ya estas en el ultimo ejercicio de ${state.currentModuleId.toUpperCase()}.`;
  }
}

function renderProgress() {
  const allAttempts = JSON.parse(localStorage.getItem(STORAGE_KEYS.attempts) || "[]");
  const attempts = allAttempts.filter((a) => (a.module_id || "module-00") === state.currentModuleId);
  const scoreMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.quizScores) || "{}");
  const quizScore = Number(scoreMap[state.currentModuleId] ?? localStorage.getItem(STORAGE_KEYS.quizScore) ?? 0);
  const attemptList = byId("attempt-list");
  const gradeBox = byId("student-grade");
  const evolutionBars = byId("evolution-bars");

  const avgPractical = attempts.length
    ? Math.round(attempts.reduce((acc, a) => acc + a.scoring.total, 0) / attempts.length)
    : 0;

  const globalAvgPractical = allAttempts.length
    ? Math.round(allAttempts.reduce((acc, a) => acc + toNumber(a.scoring?.total), 0) / allAttempts.length)
    : 0;

  byId("progress-summary").textContent =
    `${state.currentModuleId.toUpperCase()} -> Quiz: ${quizScore}/100 | Practicas modulo: ${attempts.length} | Media modulo: ${avgPractical}/100 | Media global: ${globalAvgPractical}/100`;

  const globalGrade = Math.round((quizScore * 0.3) + (avgPractical * 0.7));
  gradeBox.textContent = `Nota global alumno: ${globalGrade}/100`;

  const last10 = attempts.slice(0, 10).reverse();
  evolutionBars.innerHTML = last10
    .map((a, i) => {
      const score = toNumber(a.scoring?.total);
      const color = score >= 70 ? "#16a34a" : score >= 50 ? "#f59e0b" : "#dc2626";
      return `
        <div class="bar-row">
          <span class="bar-label">I${i + 1}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.max(4, score)}%;background:${color};"></div></div>
          <span class="bar-value">${score}</span>
        </div>
      `;
    })
    .join("");

  attemptList.innerHTML = attempts
    .slice(0, 8)
    .map(
      (a) => `
      <article class="attempt-item">
        <p><strong>${a.exercise_title}</strong></p>
        <p>Modulo: ${a.module_id || "module-00"}</p>
        <p>Fecha: ${new Date(a.date).toLocaleString()}</p>
        <p>Nota: ${a.scoring.total}/100 (claridad ${a.scoring.clarity}, clinico ${a.scoring.clinical_relevance}, estructura ${a.scoring.structure}, seguridad ${a.scoring.safety})</p>
        <p><strong>Comparacion IA:</strong> ${a.comparison_output ? "si" : "no"}</p>
        <p><strong>Ganador comparacion:</strong> ${a.comparison_result?.winner || "n/a"}</p>
      </article>
    `
    )
    .join("");
}

function bindPractice() {
  byId("exercise-select").addEventListener("change", syncExerciseInstruction);
  byId("run-prompt").addEventListener("click", runPrompt);
  byId("compare-outputs").addEventListener("click", compareOutputs);
  byId("save-attempt").addEventListener("click", saveAttempt);
  byId("next-exercise").addEventListener("click", goToNextExercise);
  byId("unlock-next-module").addEventListener("click", forceUnlockNextModule);
}

async function init() {
  await loadCatalog();
  ensureModuleStatuses();
  await loadModuleData(state.currentModuleId);
  initSession();
  bindAuth();

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
  renderProgress();
}

init();
