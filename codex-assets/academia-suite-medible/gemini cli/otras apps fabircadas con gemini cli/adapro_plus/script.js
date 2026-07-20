document.addEventListener("DOMContentLoaded", () => {
    const storageKey = "lectoviva-v2-state";
    const sampleText = [
        "La bruja Brenda prepara panecillos de fresa para su prima Daniela.",
        "Pablo duda porque confunde b, d, p y q cuando lee muy deprisa.",
        "Por eso sigue la linea verde, respira en las comas y marca las palabras importantes.",
        "Despues repasa con tarjetas visuales para recordar mejor."
    ].join("\n");

    const elements = {
        textInput: document.getElementById("text-input"),
        textOutput: document.getElementById("text-output"),
        fontFamily: document.getElementById("font-family"),
        fontSize: document.getElementById("font-size"),
        fontSizeValue: document.getElementById("font-size-value"),
        lineHeight: document.getElementById("line-height"),
        lineHeightValue: document.getElementById("line-height-value"),
        letterSpacing: document.getElementById("letter-spacing"),
        letterSpacingValue: document.getElementById("letter-spacing-value"),
        wordSpacing: document.getElementById("word-spacing"),
        wordSpacingValue: document.getElementById("word-spacing-value"),
        toggleGuides: document.getElementById("toggle-guides"),
        toggleActiveLine: document.getElementById("toggle-active-line"),
        toggleZebra: document.getElementById("toggle-zebra"),
        toggleFocusMask: document.getElementById("toggle-focus-mask"),
        togglePunctuation: document.getElementById("toggle-punctuation"),
        toggleAccents: document.getElementById("toggle-accents"),
        toggleSentenceStart: document.getElementById("toggle-sentence-start"),
        toggleGraphemes: document.getElementById("toggle-graphemes"),
        graphemeColor: document.getElementById("grapheme-color"),
        themeSelect: document.getElementById("theme-select"),
        toggleSyllables: document.getElementById("toggle-syllables"),
        toggleMemoryCards: document.getElementById("toggle-memory-cards"),
        memoryCount: document.getElementById("memory-count"),
        memoryCountValue: document.getElementById("memory-count-value"),
        memoryGrid: document.getElementById("memory-grid"),
        statWords: document.getElementById("stat-words"),
        statLines: document.getElementById("stat-lines"),
        statMemory: document.getElementById("stat-memory"),
        printSheet: document.getElementById("print-sheet"),
        copyText: document.getElementById("copy-text"),
        saveLocal: document.getElementById("save-local"),
        loadSample: document.getElementById("load-sample"),
        presetButtons: Array.from(document.querySelectorAll(".preset-btn"))
    };

    const lineGuideColors = [
        "#ef6f6c",
        "#f4a261",
        "#f6bd60",
        "#84a59d",
        "#5b8e7d",
        "#477998"
    ];

    let activeLineIndex = 0;

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setOutputValue(output, value, suffix = "") {
        output.textContent = `${value}${suffix}`;
    }

    function readState() {
        return {
            text: elements.textInput.value,
            fontFamily: elements.fontFamily.value,
            fontSize: elements.fontSize.value,
            lineHeight: elements.lineHeight.value,
            letterSpacing: elements.letterSpacing.value,
            wordSpacing: elements.wordSpacing.value,
            theme: elements.themeSelect.value,
            graphemeColor: elements.graphemeColor.value,
            memoryCount: elements.memoryCount.value,
            toggleGuides: elements.toggleGuides.checked,
            toggleActiveLine: elements.toggleActiveLine.checked,
            toggleZebra: elements.toggleZebra.checked,
            toggleFocusMask: elements.toggleFocusMask.checked,
            togglePunctuation: elements.togglePunctuation.checked,
            toggleAccents: elements.toggleAccents.checked,
            toggleSentenceStart: elements.toggleSentenceStart.checked,
            toggleGraphemes: elements.toggleGraphemes.checked,
            toggleSyllables: elements.toggleSyllables.checked,
            toggleMemoryCards: elements.toggleMemoryCards.checked
        };
    }

    function saveState() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(readState()));
        } catch (error) {
            console.warn("No se pudo guardar el estado local", error);
        }
    }

    function loadState() {
        let rawState = null;

        try {
            rawState = localStorage.getItem(storageKey);
        } catch (error) {
            console.warn("No se pudo leer el estado local", error);
        }

        if (!rawState) {
            elements.textInput.value = sampleText;
            return false;
        }

        try {
            const state = JSON.parse(rawState);
            if (state.text) {
                elements.textInput.value = state.text;
            }

            [
                "fontFamily",
                "fontSize",
                "lineHeight",
                "letterSpacing",
                "wordSpacing",
                "theme",
                "graphemeColor",
                "memoryCount"
            ].forEach((key) => {
                const elementKey = key === "theme" ? "themeSelect" : key;
                if (state[key] && elements[elementKey]) {
                    elements[elementKey].value = state[key];
                }
            });

            [
                "toggleGuides",
                "toggleActiveLine",
                "toggleZebra",
                "toggleFocusMask",
                "togglePunctuation",
                "toggleAccents",
                "toggleSentenceStart",
                "toggleGraphemes",
                "toggleSyllables",
                "toggleMemoryCards"
            ].forEach((key) => {
                if (typeof state[key] === "boolean" && elements[key]) {
                    elements[key].checked = state[key];
                }
            });
        } catch (error) {
            console.error("No se pudo recuperar el estado guardado", error);
            elements.textInput.value = sampleText;
            return false;
        }

        return true;
    }

    function splitWordForSyllables(word) {
        const vowels = "aeiouaeiouáéíóúüAEIOUÁÉÍÓÚÜ";
        if (word.length < 5) {
            return [word];
        }

        const chunks = [];
        let current = "";

        for (let index = 0; index < word.length; index += 1) {
            const char = word[index];
            current += char;
            const next = word[index + 1];

            if (!next) {
                chunks.push(current);
                break;
            }

            const currentIsVowel = vowels.includes(char);
            const nextIsVowel = vowels.includes(next);

            if (currentIsVowel && !nextIsVowel && current.length >= 2) {
                chunks.push(current);
                current = "";
            } else if (!currentIsVowel && nextIsVowel && current.length >= 3) {
                chunks.push(current);
                current = "";
            }
        }

        return chunks.filter(Boolean);
    }

    function decorateLetters(fragment, options, sentenceState) {
        let sentenceStartUsed = false;

        return [...fragment].map((char) => {
            let rendered = escapeHtml(char);

            if (
                options.toggleSentenceStart &&
                sentenceState.isNewSentence &&
                !sentenceStartUsed &&
                /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(char)
            ) {
                rendered = `<span class="sentence-start">${rendered}</span>`;
                sentenceState.isNewSentence = false;
                sentenceStartUsed = true;
            }

            if (options.toggleGraphemes && /[bdpqBDPQ]/.test(char)) {
                rendered = `<span class="grapheme-highlight" style="--grapheme-color:${options.graphemeColor};">${rendered}</span>`;
            }

            return rendered;
        }).join("");
    }

    function stylizeWord(word, options, sentenceState) {
        const cleanWord = word.replace(/[^A-Za-zÁÉÍÓÚáéíóúÜüÑñ]/g, "");
        if (!cleanWord) {
            return escapeHtml(word);
        }

        const chunks = options.toggleSyllables ? splitWordForSyllables(cleanWord) : [cleanWord];
        const rebuilt = chunks
            .map((chunk) => {
                const decoratedChunk = decorateLetters(chunk, options, sentenceState);
                return options.toggleSyllables && chunks.length > 1
                    ? `<span class="syllable">${decoratedChunk}</span>`
                    : decoratedChunk;
            })
            .join(options.toggleSyllables && chunks.length > 1 ? '<span class="syllable-break">·</span>' : "");

        const accentMark = options.toggleAccents && /[áéíóúÁÉÍÓÚ]/.test(cleanWord)
            ? '<span class="accent-clue" aria-hidden="true">♪</span>'
            : "";

        const punctuation = escapeHtml(word.slice(cleanWord.length));
        return rebuilt + accentMark + punctuation;
    }

    function formatLine(line, options, lineIndex, sentenceState) {
        const trimmed = line.trim();
        if (!trimmed) {
            return "&nbsp;";
        }

        const tokens = line.match(/[^\s]+|\s+/g) || [];
        const html = tokens.map((token) => {
            if (/^\s+$/.test(token)) {
                return token.replace(/ /g, "&nbsp;");
            }

            const leading = token.match(/^[¡¿"(\[]+/);
            const trailing = token.match(/[.,;:!?")\]]+$/);
            const rawPrefix = leading ? leading[0] : "";
            const rawSuffix = trailing ? trailing[0] : "";
            const prefix = escapeHtml(rawPrefix);
            const core = token.slice(rawPrefix.length, token.length - rawSuffix.length);

            if (!core) {
                return `${prefix}${options.togglePunctuation
                    ? rawSuffix.replace(/[.,;:!?]/g, (char) => `<span class="punctuation-mark">${char}</span>`)
                    : escapeHtml(rawSuffix)}`;
            }

            const stylizedCore = stylizeWord(core, options, sentenceState);
            const stylizedSuffix = options.togglePunctuation
                ? rawSuffix.replace(/[.,;:!?]/g, (char) => `<span class="punctuation-mark">${char}</span>`)
                : escapeHtml(rawSuffix);

            if (/[.!?]$/.test(token)) {
                sentenceState.isNewSentence = true;
            }

            return `${prefix}${stylizedCore}${stylizedSuffix}`;
        }).join("");

        const classes = [
            "output-line",
            options.toggleZebra ? "is-zebra" : "",
            options.toggleActiveLine && lineIndex === activeLineIndex ? "is-active" : "",
            options.toggleFocusMask && options.toggleActiveLine && lineIndex !== activeLineIndex ? "is-muted" : ""
        ].filter(Boolean).join(" ");

        const guideColor = options.toggleGuides ? lineGuideColors[lineIndex % lineGuideColors.length] : "transparent";
        return `<div class="${classes}" data-line-index="${lineIndex}" style="--guide-color:${guideColor};">${html}</div>`;
    }

    function extractMemoryCards(text, maxCards) {
        const words = text
            .toLowerCase()
            .match(/[a-záéíóúüñ]{4,}/gi) || [];

        const uniqueWords = [...new Set(words)];
        const scoredWords = uniqueWords
            .map((word) => {
                let score = word.length;
                if (/[áéíóú]/.test(word)) {
                    score += 3;
                }
                if (/[bdpq]/.test(word)) {
                    score += 4;
                }
                return { word, score };
            })
            .sort((left, right) => right.score - left.score)
            .slice(0, maxCards);

        return scoredWords.map(({ word }) => {
            const clues = [];
            if (/[bdpq]/.test(word)) {
                clues.push("Vigila b d p q");
            }
            if (/[áéíóú]/.test(word)) {
                clues.push("Tiene acento");
            }
            if (word.length >= 8) {
                clues.push("Palabra larga");
            }
            if (clues.length === 0) {
                clues.push("Repasa su lectura");
            }

            const visual = splitWordForSyllables(word).join(" · ");
            return {
                word,
                visual,
                clue: clues.join(" · ")
            };
        });
    }

    function renderMemoryCards(cards, options) {
        elements.memoryGrid.innerHTML = "";

        if (!options.toggleMemoryCards || cards.length === 0) {
            const empty = document.createElement("article");
            empty.className = "memory-card empty-card";
            empty.innerHTML = "<h4>Sin tarjetas</h4><p>Escribe mas texto o activa la opcion de tarjetas de memoria.</p>";
            elements.memoryGrid.appendChild(empty);
            elements.statMemory.textContent = "0";
            return;
        }

        cards.forEach((card) => {
            const article = document.createElement("article");
            article.className = "memory-card";
            article.innerHTML = `
                <p class="memory-word">${escapeHtml(card.word)}</p>
                <p class="memory-visual">${escapeHtml(card.visual)}</p>
                <p class="memory-clue">${escapeHtml(card.clue)}</p>
            `;
            elements.memoryGrid.appendChild(article);
        });

        elements.statMemory.textContent = String(cards.length);
    }

    function updateStats(text, cards) {
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const lines = text.length ? text.split("\n").length : 0;
        elements.statWords.textContent = String(words);
        elements.statLines.textContent = String(lines);
        elements.statMemory.textContent = String(cards.length);
    }

    function applyTheme(theme) {
        document.body.dataset.theme = theme;
    }

    function getOptions() {
        return {
            fontFamily: elements.fontFamily.value,
            fontSize: Number(elements.fontSize.value),
            lineHeight: Number(elements.lineHeight.value),
            letterSpacing: Number(elements.letterSpacing.value),
            wordSpacing: Number(elements.wordSpacing.value),
            toggleGuides: elements.toggleGuides.checked,
            toggleActiveLine: elements.toggleActiveLine.checked,
            toggleZebra: elements.toggleZebra.checked,
            toggleFocusMask: elements.toggleFocusMask.checked,
            togglePunctuation: elements.togglePunctuation.checked,
            toggleAccents: elements.toggleAccents.checked,
            toggleSentenceStart: elements.toggleSentenceStart.checked,
            toggleGraphemes: elements.toggleGraphemes.checked,
            graphemeColor: elements.graphemeColor.value,
            toggleSyllables: elements.toggleSyllables.checked,
            toggleMemoryCards: elements.toggleMemoryCards.checked,
            memoryCount: Number(elements.memoryCount.value)
        };
    }

    function updatePreview() {
        const options = getOptions();
        const text = elements.textInput.value;
        const lines = text.split("\n");
        const sentenceState = { isNewSentence: true };

        if (activeLineIndex >= lines.length) {
            activeLineIndex = Math.max(lines.length - 1, 0);
        }

        elements.textOutput.style.fontFamily = options.fontFamily;
        elements.textOutput.style.fontSize = `${options.fontSize}px`;
        elements.textOutput.style.lineHeight = String(options.lineHeight);
        elements.textOutput.style.letterSpacing = `${options.letterSpacing}em`;
        elements.textOutput.style.wordSpacing = `${options.wordSpacing}em`;

        elements.textOutput.innerHTML = lines
            .map((line, index) => formatLine(line, options, index, sentenceState))
            .join("");

        const cards = extractMemoryCards(text, options.memoryCount);
        renderMemoryCards(cards, options);
        updateStats(text, cards);
        applyTheme(elements.themeSelect.value);
        saveState();
    }

    function updateOutputs() {
        setOutputValue(elements.fontSizeValue, elements.fontSize.value, " px");
        setOutputValue(elements.lineHeightValue, Number(elements.lineHeight.value).toFixed(1));
        setOutputValue(elements.letterSpacingValue, Number(elements.letterSpacing.value).toFixed(2), " em");
        setOutputValue(elements.wordSpacingValue, Number(elements.wordSpacing.value).toFixed(2), " em");
        setOutputValue(elements.memoryCountValue, elements.memoryCount.value);
    }

    function applyPreset(name) {
        const presets = {
            focus: {
                fontSize: 30,
                lineHeight: 2.2,
                letterSpacing: 0.06,
                wordSpacing: 0.26,
                theme: "sand",
                guides: true,
                activeLine: true,
                zebra: true,
                focusMask: true,
                punctuation: true,
                graphemes: true,
                syllables: true,
                memoryCards: true
            },
            study: {
                fontSize: 28,
                lineHeight: 2,
                letterSpacing: 0.05,
                wordSpacing: 0.22,
                theme: "sky",
                guides: true,
                activeLine: true,
                zebra: true,
                focusMask: false,
                punctuation: true,
                graphemes: true,
                syllables: true,
                memoryCards: true
            },
            calm: {
                fontSize: 27,
                lineHeight: 2.3,
                letterSpacing: 0.08,
                wordSpacing: 0.32,
                theme: "forest",
                guides: false,
                activeLine: false,
                zebra: true,
                focusMask: false,
                punctuation: true,
                graphemes: false,
                syllables: false,
                memoryCards: true
            },
            print: {
                fontSize: 26,
                lineHeight: 2.1,
                letterSpacing: 0.04,
                wordSpacing: 0.2,
                theme: "sand",
                guides: true,
                activeLine: false,
                zebra: false,
                focusMask: false,
                punctuation: true,
                graphemes: true,
                syllables: true,
                memoryCards: true
            }
        };

        const preset = presets[name];
        if (!preset) {
            return;
        }

        elements.fontSize.value = preset.fontSize;
        elements.lineHeight.value = preset.lineHeight;
        elements.letterSpacing.value = preset.letterSpacing;
        elements.wordSpacing.value = preset.wordSpacing;
        elements.themeSelect.value = preset.theme;
        elements.toggleGuides.checked = preset.guides;
        elements.toggleActiveLine.checked = preset.activeLine;
        elements.toggleZebra.checked = preset.zebra;
        elements.toggleFocusMask.checked = preset.focusMask;
        elements.togglePunctuation.checked = preset.punctuation;
        elements.toggleGraphemes.checked = preset.graphemes;
        elements.toggleSyllables.checked = preset.syllables;
        elements.toggleMemoryCards.checked = preset.memoryCards;

        elements.presetButtons.forEach((button) => {
            button.classList.toggle("active", button.dataset.preset === name);
        });

        updateOutputs();
        updatePreview();
    }

    function copyAdaptedText() {
        const previewText = elements.textOutput.innerText;
        navigator.clipboard.writeText(previewText).then(() => {
            elements.copyText.textContent = "Copiado";
            setTimeout(() => {
                elements.copyText.textContent = "Copiar texto adaptado";
            }, 1200);
        }).catch(() => {
            elements.copyText.textContent = "No se pudo copiar";
            setTimeout(() => {
                elements.copyText.textContent = "Copiar texto adaptado";
            }, 1400);
        });
    }

    function printSheet() {
        const options = getOptions();
        const cards = extractMemoryCards(elements.textInput.value, options.memoryCount);
        const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1100,height=900");

        if (!printWindow) {
            return;
        }

        printWindow.opener = null;

        const memoryMarkup = cards.map((card) => `
            <article class="memory-card">
                <p class="memory-word">${escapeHtml(card.word)}</p>
                <p class="memory-visual">${escapeHtml(card.visual)}</p>
                <p class="memory-clue">${escapeHtml(card.clue)}</p>
            </article>
        `).join("");

        printWindow.document.write(`
            <html lang="es">
            <head>
                <title>LectoViva V2 - Ficha</title>
                <link rel="stylesheet" href="style.css">
                <style>
                    body { padding: 24px; background: white !important; }
                    .print-shell { max-width: 920px; margin: 0 auto; }
                    .print-shell h1 { margin-bottom: 8px; }
                    .print-shell p { margin-top: 0; }
                    .memory-grid { margin-top: 24px; }
                </style>
            </head>
            <body data-theme="${elements.themeSelect.value}">
                <div class="print-shell">
                    <h1>LectoViva V2</h1>
                    <p>Ficha de lectura e impresion adaptada</p>
                    <div class="output-area print-output" style="
                        font-family:${options.fontFamily};
                        font-size:${options.fontSize}px;
                        line-height:${options.lineHeight};
                        letter-spacing:${options.letterSpacing}em;
                        word-spacing:${options.wordSpacing}em;
                    ">
                        ${elements.textOutput.innerHTML}
                    </div>
                    <section>
                        <h2>Tarjetas de memoria</h2>
                        <div class="memory-grid">${memoryMarkup}</div>
                    </section>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 400);
    }

    function bindEvents() {
        [
            elements.textInput,
            elements.fontFamily,
            elements.fontSize,
            elements.lineHeight,
            elements.letterSpacing,
            elements.wordSpacing,
            elements.toggleGuides,
            elements.toggleActiveLine,
            elements.toggleZebra,
            elements.toggleFocusMask,
            elements.togglePunctuation,
            elements.toggleAccents,
            elements.toggleSentenceStart,
            elements.toggleGraphemes,
            elements.graphemeColor,
            elements.themeSelect,
            elements.toggleSyllables,
            elements.toggleMemoryCards,
            elements.memoryCount
        ].forEach((element) => {
            const eventName = element.tagName === "TEXTAREA" ? "input" : "input";
            element.addEventListener(eventName, () => {
                updateOutputs();
                updatePreview();
            });

            if (element.type === "checkbox" || element.tagName === "SELECT") {
                element.addEventListener("change", () => {
                    updateOutputs();
                    updatePreview();
                });
            }
        });

        elements.textOutput.addEventListener("click", (event) => {
            const line = event.target.closest(".output-line");
            if (!line) {
                return;
            }

            activeLineIndex = Number(line.dataset.lineIndex || 0);
            updatePreview();
        });

        elements.printSheet.addEventListener("click", printSheet);
        elements.copyText.addEventListener("click", copyAdaptedText);
        elements.saveLocal.addEventListener("click", () => {
            saveState();
            elements.saveLocal.textContent = "Guardado";
            setTimeout(() => {
                elements.saveLocal.textContent = "Guardar en este navegador";
            }, 1200);
        });

        elements.loadSample.addEventListener("click", () => {
            elements.textInput.value = sampleText;
            activeLineIndex = 0;
            updatePreview();
        });

        elements.presetButtons.forEach((button) => {
            button.addEventListener("click", () => applyPreset(button.dataset.preset));
        });
    }

    const restoredState = loadState();
    updateOutputs();
    bindEvents();
    if (restoredState) {
        elements.presetButtons.forEach((button) => button.classList.remove("active"));
        updatePreview();
    } else {
        applyPreset("focus");
    }
});
