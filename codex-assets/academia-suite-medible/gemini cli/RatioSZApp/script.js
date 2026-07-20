
document.addEventListener('DOMContentLoaded', () => {
    // Importar jsPDF
    const { jsPDF } = window.jspdf;

    // Elementos del DOM
    const sTimerDisplay = document.getElementById('s-timer-display');
    const zTimerDisplay = document.getElementById('z-timer-display');
    const startSBtn = document.getElementById('start-s');
    const stopSBtn = document.getElementById('stop-s');
    const startZBtn = document.getElementById('start-z');
    const stopZBtn = document.getElementById('stop-z');
    const sTimeEl = document.getElementById('s-time');
    const zTimeEl = document.getElementById('z-time');
    const calculateBtn = document.getElementById('calculate');
    const exportPdfBtn = document.getElementById('export-pdf');
    const resultSection = document.getElementById('result-section');
    const ratioValueEl = document.getElementById('ratio-value');
    const ratioInterpretationEl = document.getElementById('ratio-interpretation');

    let sTimer, zTimer;
    let sStartTime, zStartTime;
    let sMaxTime = 0, zMaxTime = 0;

    // --- Lógica de los cronómetros ---

    const startTimer = (timerType) => {
        if (timerType === 's') {
            sStartTime = Date.now();
            sTimer = setInterval(() => updateTimerDisplay(sTimerDisplay, sStartTime), 10);
            startSBtn.disabled = true;
            stopSBtn.disabled = false;
        } else {
            zStartTime = Date.now();
            zTimer = setInterval(() => updateTimerDisplay(zTimerDisplay, zStartTime), 10);
            startZBtn.disabled = true;
            stopZBtn.disabled = false;
        }
    };

    const stopTimer = (timerType) => {
        if (timerType === 's') {
            clearInterval(sTimer);
            const elapsedTime = (Date.now() - sStartTime) / 1000;
            sMaxTime = elapsedTime;
            sTimeEl.textContent = sMaxTime.toFixed(2);
            startSBtn.disabled = false;
            stopSBtn.disabled = true;
        } else {
            clearInterval(zTimer);
            const elapsedTime = (Date.now() - zStartTime) / 1000;
            zMaxTime = elapsedTime;
            zTimeEl.textContent = zMaxTime.toFixed(2);
            startZBtn.disabled = false;
            stopZBtn.disabled = true;
        }
        checkCalculationReady();
    };

    const updateTimerDisplay = (displayElement, startTime) => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        displayElement.textContent = `${elapsedTime.toFixed(2)}s`;
    };

    // --- Lógica de la aplicación ---

    const checkCalculationReady = () => {
        if (sMaxTime > 0 && zMaxTime > 0) {
            calculateBtn.disabled = false;
        } else {
            calculateBtn.disabled = true;
        }
    };

    const calculateRatio = () => {
        if (zMaxTime === 0) {
            ratioValueEl.textContent = 'Error: El tiempo de /z/ no puede ser cero.';
            ratioInterpretationEl.textContent = 'Por favor, mide el tiempo para el sonido /z/.';
            ratioInterpretationEl.className = 'invalido';
            resultSection.classList.remove('hidden');
            exportPdfBtn.disabled = true;
            return;
        }

        const ratio = sMaxTime / zMaxTime;
        ratioValueEl.textContent = `Ratio S/Z: ${ratio.toFixed(2)}`;

        let interpretation = '';
        let interpretationClass = '';

        if (ratio > 1.4) {
            interpretation = 'Resultado Patológico: Sugiere un cierre laríngeo defectuoso.';
            interpretationClass = 'patologico';
        } else if (ratio >= 0.8) {
            interpretation = 'Resultado Normal: No se observan indicios de patología.';
            interpretationClass = 'normal';
        } else {
            interpretation = 'Resultado Inválido/Atípico: Un ratio menor a 0.8 es inusual y requiere análisis clínico.';
            interpretationClass = 'invalido';
        }

        ratioInterpretationEl.textContent = interpretation;
        ratioInterpretationEl.className = interpretationClass;
        resultSection.classList.remove('hidden');
        exportPdfBtn.disabled = false;
    };

    // --- Exportación a PDF ---

    const exportToPDF = () => {
        const doc = new jsPDF();
        const ratio = (sMaxTime / zMaxTime).toFixed(2);

        doc.setFontSize(18);
        doc.text("Informe de Ratio S/Z", 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 40);

        doc.line(20, 45, 190, 45); // Separador

        doc.setFontSize(14);
        doc.text("Tiempos Registrados", 20, 55);
        doc.setFontSize(12);
        doc.text(`Tiempo máximo /s/: ${sMaxTime.toFixed(2)} segundos`, 20, 65);
        doc.text(`Tiempo máximo /z/: ${zMaxTime.toFixed(2)} segundos`, 20, 75);

        doc.line(20, 85, 190, 85); // Separador

        doc.setFontSize(14);
        doc.text("Resultado del Cálculo", 20, 95);
        doc.setFontSize(16);
        doc.setTextColor(ratio > 1.4 ? '#D32F2F' : '#388E3C');
        doc.text(`Ratio S/Z = ${ratio}`, 20, 105);

        doc.setTextColor('#000000');
        doc.setFontSize(12);
        doc.text("Interpretación:", 20, 115);
        const interpretationText = doc.splitTextToSize(ratioInterpretationEl.textContent, 170);
        doc.text(interpretationText, 20, 125);

        doc.save(`Informe_Ratio_SZ_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    // --- Asignación de eventos ---

    startSBtn.addEventListener('click', () => startTimer('s'));
    stopSBtn.addEventListener('click', () => stopTimer('s'));
    startZBtn.addEventListener('click', () => startTimer('z'));
    stopZBtn.addEventListener('click', () => stopTimer('z'));
    calculateBtn.addEventListener('click', calculateRatio);
    exportPdfBtn.addEventListener('click', exportToPDF);

    // Estado inicial de los botones
    calculateBtn.disabled = true;
});
