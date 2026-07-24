document.addEventListener('DOMContentLoaded', () => {
    const fontSelect = document.getElementById('font-select');
    const fontSizeInput = document.getElementById('font-size');
    const highlightColorInput = document.getElementById('highlight-color');
    const highlightToggle = document.getElementById('highlight-toggle');
    const textInput = document.getElementById('text-input');
    const textOutput = document.getElementById('text-output');
    const printButton = document.getElementById('print-button');

    const lineColors = ['#E53935', '#43A047', '#1E88E5', '#FDD835', '#9C27B0', '#FF5722', '#00BCD4', '#8BC34A']; // Más colores para el ciclo

    function applyEnhancements(text, highlightColor, isHighlighting, isSentenceStart) {
        let processedText = '';
        let currentWord = '';
        let wordHasAccent = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            // Check for accented vowels for musicality mark
            if ('áéíóúÁÉÍÓÚ'.includes(char)) {
                wordHasAccent = true;
            }

            if (char.match(/\s/)) { // Space
                if (currentWord.length > 0) {
                    processedText += currentWord;
                    if (wordHasAccent) {
                        processedText += `<span class="musicality-mark">♫</span>`;
                    }
                }
                processedText += char;
                currentWord = '';
                wordHasAccent = false;
                isSentenceStart = true; // Reset for next word/sentence
            } else if ('.'.includes(char)) {
                if (currentWord.length > 0) {
                    processedText += currentWord;
                    if (wordHasAccent) {
                        processedText += `<span class="musicality-mark">♫</span>`;
                    }
                }
                processedText += `<span class="highlight-punctuation">${char}</span>`;
                currentWord = '';
                wordHasAccent = false;
                isSentenceStart = true;
            } else if (',;:'.includes(char)) {
                if (currentWord.length > 0) {
                    processedText += currentWord;
                    if (wordHasAccent) {
                        processedText += `<span class="musicality-mark">♫</span>`;
                    }
                }
                processedText += `<span class="highlight-punctuation">${char}</span>`;
                currentWord = '';
                wordHasAccent = false;
            } else if ('¡!¿?'.includes(char)) {
                if (currentWord.length > 0) {
                    processedText += currentWord;
                    if (wordHasAccent) {
                        processedText += `<span class="musicality-mark">♫</span>`;
                    }
                }
                processedText += `<span class="highlight-intonation">${char}</span>`;
                currentWord = '';
                wordHasAccent = false;
                if ('¡?'.includes(char)) isSentenceStart = true; // Only for closing intonation marks
            } else { // Regular character
                let charToProcess = char;
                if (isSentenceStart && char.match(/[a-zA-Z]/)) {
                    charToProcess = `<span class="highlight-sentence-start">${char}</span>`;
                    isSentenceStart = false;
                } else if (isHighlighting && 'bdpq'.includes(char.toLowerCase())) {
                    charToProcess = `<span class="highlight-grapheme" style="color: ${highlightColor};">${char}</span>`;
                }
                currentWord += charToProcess;
            }
        }

        // Process any remaining word at the end of the line
        if (currentWord.length > 0) {
            processedText += currentWord;
            if (wordHasAccent) {
                processedText += `<span class="musicality-mark">♫</span>`;
            }
        }

        return { html: processedText, newSentence: isSentenceStart };
    }

    function updateOutput() {
        const selectedFont = fontSelect.value;
        const fontSize = fontSizeInput.value;
        const highlightColor = highlightColorInput.value;
        const isHighlighting = highlightToggle.checked;
        const rawText = textInput.value;

        textOutput.style.fontFamily = selectedFont;
        textOutput.style.fontSize = `${fontSize}px`;
        textOutput.innerHTML = ''; // Clear previous content

        const lines = rawText.split('\n');
        let globalIsNewSentence = true; // Track sentence start across lines

        lines.forEach((line, index) => {
            const lineDiv = document.createElement('div');
            lineDiv.classList.add('output-line');
            lineDiv.style.borderBottomColor = lineColors[index % lineColors.length];
            lineDiv.style.borderBottomWidth = '4px'; // Ensure thickness
            lineDiv.style.borderBottomStyle = 'solid';
            lineDiv.style.paddingBottom = '8px'; // Space for the line
            lineDiv.style.marginBottom = '8px'; // Space between lines

            // Apply enhancements to the current line, passing globalIsNewSentence
            const result = applyEnhancements(line, highlightColor, isHighlighting, globalIsNewSentence);
            lineDiv.innerHTML = result.html || '&nbsp;';
            textOutput.appendChild(lineDiv);

            // Update globalIsNewSentence based on the last character of the processed line
            const lastCharOfLine = line.trim().slice(-1);
            if ('.!?¡¿'.includes(lastCharOfLine)) {
                globalIsNewSentence = true;
            } else {
                globalIsNewSentence = false;
            }
        });
    }

    function printOutput() {
        const printWindow = window.open('', '', 'height=800,width=600');
        printWindow.document.write('<html><head><title>Imprimir</title></head><body></body></html>');
        printWindow.document.close();

        // Copy all stylesheets from the main document
        Array.from(document.styleSheets).forEach(styleSheet => {
            try {
                const css = Array.from(styleSheet.cssRules)
                                .map(rule => rule.cssText)
                                .join('\n');
                const style = printWindow.document.createElement('style');
                style.appendChild(printWindow.document.createTextNode(css));
                printWindow.document.head.appendChild(style);
            } catch (e) {
                console.error('Error copying stylesheet:', e);
            }
        });

        // Add dynamic styles for font, font size, and highlight color
        const dynamicStyles = printWindow.document.createElement('style');
        dynamicStyles.textContent = `\n            body {\n                font-family: ${fontSelect.value} !important;\n                font-size: ${fontSizeInput.value}px !important;\n            }\n            .highlight-grapheme {\n                color: ${highlightColorInput.value} !important;\n            }\n            /* Ensure line borders are applied in print */\n            .output-line {\n                border-bottom-style: solid;\n                border-bottom-width: 4px;\n                padding-bottom: 8px;\n                margin-bottom: 8px;\n            }\n        `;
        printWindow.document.head.appendChild(dynamicStyles);

        // Clone the current textOutput content to preserve all applied styles and structure
        const clonedOutput = textOutput.cloneNode(true);
        printWindow.document.body.appendChild(clonedOutput);

        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 500);
    }

    // Event Listeners
    fontSelect.addEventListener('change', updateOutput);
    fontSizeInput.addEventListener('input', updateOutput);
    highlightColorInput.addEventListener('input', updateOutput);
    highlightToggle.addEventListener('change', updateOutput);
    textInput.addEventListener('input', updateOutput);
    printButton.addEventListener('click', printOutput);

    updateOutput();
});