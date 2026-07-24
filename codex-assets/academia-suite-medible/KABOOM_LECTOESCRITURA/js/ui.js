import { ADVANCED_BOARD, LEVELS, READ_AS_IF, SLOT_TYPE, INITIAL_BOARD } from "./data.js";

function buildTeamNameInputs(count) {
  const safeCount = Math.max(1, Math.min(8, count));
  const wrapper = document.createDocumentFragment();

  for (let i = 0; i < safeCount; i += 1) {
    const label = document.createElement("label");
    label.textContent = `Equipo ${i + 1}`;

    const input = document.createElement("input");
    input.type = "text";
    input.id = `team-name-${i}`;
    input.value = safeCount === 1 ? "Jugador 1" : `Equipo ${i + 1}`;

    label.appendChild(input);
    wrapper.appendChild(label);
  }

  return wrapper;
}

function challengeMarkup(challenge) {
  if (!challenge) {
    return "Pulsa <strong>Sacar palito</strong> para empezar.";
  }

  const head = challenge.stickNumber
    ? `<p><strong>Palito ${challenge.stickNumber}</strong> · ${challenge.slotLabel}</p>`
    : `<p><strong>Ronda relámpago ${challenge.lightningRound}</strong> · ${challenge.slotLabel}</p>`;

  const instruction = `<p>${challenge.instruction}</p>`;

  if (challenge.slotType === SLOT_TYPE.WRITE_SENTENCE || challenge.slotType === SLOT_TYPE.WRITE_SENTENCE_REQUIRED) {
    return `${head}${instruction}<p><strong>Palabras obligatorias:</strong> ${challenge.metadata.requiredWords.join(", ")}</p>`;
  }

  if (challenge.slotType === SLOT_TYPE.EXPLAIN_WITHOUT_FORBIDDEN) {
    return `${head}${instruction}<p><strong>Palabra prohibida:</strong> ${challenge.metadata.forbiddenWord}</p>`;
  }

  if (challenge.slotType === SLOT_TYPE.READ_AS_IF) {
    return `${head}${instruction}<p><em>Texto de lectura: elegido por el docente/facilitador.</em></p>`;
  }

  return `${head}${instruction}`;
}

function feedbackClass(type) {
  if (type === "SUCCESS") return "success";
  if (type === "FAIL") return "fail";
  if (type === "KABOOM") return "kaboom";
  if (type === "LIGHTNING_START") return "lightning";
  return "";
}

export class KaboomUI {
  constructor() {
    this.el = {
      setupPanel: document.getElementById("setup-panel"),
      gamePanel: document.getElementById("game-panel"),
      levelSelect: document.getElementById("level-select"),
      teamsCount: document.getElementById("teams-count"),
      teamNames: document.getElementById("team-names"),
      endMode: document.getElementById("end-mode"),
      turnsLimitWrap: document.getElementById("turns-limit-wrap"),
      turnsLimit: document.getElementById("turns-limit"),
      startGame: document.getElementById("start-game"),
      drawStick: document.getElementById("draw-stick"),
      drawLightning: document.getElementById("draw-lightning"),
      success: document.getElementById("success"),
      fail: document.getElementById("fail"),
      currentTeam: document.getElementById("current-team"),
      poolStatus: document.getElementById("pool-status"),
      feedback: document.getElementById("feedback"),
      challenge: document.getElementById("challenge"),
      scoreboard: document.getElementById("scoreboard"),
      board: document.getElementById("board"),
      finishCard: document.getElementById("finish-card"),
      winnerText: document.getElementById("winner-text"),
      tieActions: document.getElementById("tie-actions"),
      keepTie: document.getElementById("keep-tie"),
      lightning: document.getElementById("lightning"),
      restart: document.getElementById("restart"),
      newConfig: document.getElementById("new-config"),
    };

    this.renderTeamInputs(2);
    this.toggleTurnsLimit();
  }

  bindSetup({ onTeamsCountChange, onEndModeChange, onStart }) {
    this.el.teamsCount.addEventListener("input", () => {
      const count = Number(this.el.teamsCount.value);
      this.renderTeamInputs(count);
      onTeamsCountChange(count);
    });

    this.el.endMode.addEventListener("change", () => {
      this.toggleTurnsLimit();
      onEndModeChange(this.el.endMode.value);
    });

    this.el.startGame.addEventListener("click", () => {
      onStart(this.readSetupValues());
    });
  }

  bindGameActions({ onDraw, onSuccess, onFail, onRestart, onNewConfig, onLightning, onKeepTie, onDrawLightning }) {
    this.el.drawStick.addEventListener("click", onDraw);
    this.el.drawLightning.addEventListener("click", onDrawLightning);
    this.el.success.addEventListener("click", onSuccess);
    this.el.fail.addEventListener("click", onFail);
    this.el.restart.addEventListener("click", onRestart);
    this.el.newConfig.addEventListener("click", onNewConfig);
    this.el.lightning.addEventListener("click", onLightning);
    this.el.keepTie.addEventListener("click", onKeepTie);
  }

  readSetupValues() {
    const count = Math.max(1, Math.min(8, Number(this.el.teamsCount.value) || 1));
    const teamNames = [];

    for (let i = 0; i < count; i += 1) {
      const input = document.getElementById(`team-name-${i}`);
      const fallback = count === 1 ? "Jugador 1" : `Equipo ${i + 1}`;
      teamNames.push(input?.value?.trim() || fallback);
    }

    return {
      level: this.el.levelSelect.value,
      teamNames,
      endMode: this.el.endMode.value,
      maxTurns: Number(this.el.turnsLimit.value),
    };
  }

  renderTeamInputs(count) {
    this.el.teamNames.innerHTML = "";
    this.el.teamNames.appendChild(buildTeamNameInputs(count));
  }

  toggleTurnsLimit() {
    const show = this.el.endMode.value === "turns";
    this.el.turnsLimitWrap.classList.toggle("hidden", !show);
  }

  showGamePanel() {
    this.el.setupPanel.classList.add("hidden");
    this.el.gamePanel.classList.remove("hidden");
  }

  showSetupPanel() {
    this.el.setupPanel.classList.remove("hidden");
    this.el.gamePanel.classList.add("hidden");
  }

  renderBoard(level, currentStickNumber = null) {
    const board = level === LEVELS.INITIAL ? INITIAL_BOARD : ADVANCED_BOARD;
    this.el.board.innerHTML = "";

    board.forEach((label, idx) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      if (currentStickNumber === idx + 1) {
        cell.classList.add("current");
      }
      cell.innerHTML = `<strong>${idx + 1}</strong><br>${label}`;
      this.el.board.appendChild(cell);
    });
  }

  renderState(state) {
    const activeName = state.Teams[state.Active_Team_Index] ?? "-";
    const currentChallenge = state.Current_Challenge;

    this.el.currentTeam.textContent = `Turno de: ${activeName}`;
    this.el.poolStatus.textContent = `Palitos restantes: ${state.Stick_Pool.length} | Numerados: ${state.Numbered_Sticks.length} | Turnos jugados: ${state.Turns_Played}`;

    this.renderBoard(state.Game_Level, state.Last_Drawn_Stick?.type === "NUMBER" ? state.Last_Drawn_Stick.value : null);

    if (state.Last_Feedback) {
      this.el.feedback.textContent = state.Last_Feedback.message;
      this.el.feedback.className = `feedback ${feedbackClass(state.Last_Feedback.type)}`;
    } else {
      this.el.feedback.textContent = "";
      this.el.feedback.className = "feedback";
    }

    this.el.challenge.innerHTML = challengeMarkup(currentChallenge);
    this.renderScoreboard(state);
    this.renderActionButtons(state);
    this.renderFinish(state);
  }

  renderScoreboard(state) {
    this.el.scoreboard.innerHTML = "";

    state.Teams.forEach((team, idx) => {
      const sticks = state.Team_Inventory[idx] ?? [];
      const card = document.createElement("div");
      card.className = "team-card";
      if (idx === state.Active_Team_Index) {
        card.classList.add("active");
      }

      const summary = sticks.length > 0 ? sticks.map((s) => (s.value == null ? "K" : s.value)).join(", ") : "Sin palitos";

      card.innerHTML = `
        <strong>${team}</strong>
        <div>Puntos (palitos): <strong>${sticks.length}</strong></div>
        <div class="stick-list">Inventario: ${summary}</div>
      `;

      this.el.scoreboard.appendChild(card);
    });
  }

  renderActionButtons(state) {
    const canResolve = state.Pending_Resolution;
    const lightningActive = state.Lightning.active;

    this.el.success.classList.toggle("hidden", !canResolve);
    this.el.fail.classList.toggle("hidden", !canResolve);

    this.el.drawStick.classList.toggle("hidden", lightningActive);
    this.el.drawStick.disabled = canResolve || state.Game_State !== "Playing";

    this.el.drawLightning.classList.toggle("hidden", !lightningActive);
    this.el.drawLightning.disabled = canResolve || state.Game_State !== "Playing";

    if (canResolve && state.Game_State === "Playing") {
      this.el.drawStick.disabled = true;
      this.el.drawLightning.disabled = true;
    }
  }

  renderFinish(state) {
    const finished = state.Game_State === "Finished";
    this.el.finishCard.classList.toggle("hidden", !finished);

    if (!finished) {
      return;
    }

    const winners = state.Winners;
    if (winners.length === 1) {
      const winner = state.Teams[winners[0]];
      this.el.winnerText.textContent = `Gana ${winner} con más palitos.`;
      this.el.keepTie.classList.add("hidden");
      this.el.lightning.classList.add("hidden");
      return;
    }

    const names = winners.map((idx) => state.Teams[idx]).join(", ");
    this.el.winnerText.textContent = `Empate entre: ${names}. Puedes mantener el empate o activar ronda relámpago.`;
    this.el.keepTie.classList.remove("hidden");
    this.el.lightning.classList.remove("hidden");
  }
}
