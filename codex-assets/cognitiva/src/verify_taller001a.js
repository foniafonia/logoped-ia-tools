
function runDemo() {
  const motor = new MotorGestion('alu_001', { sessionMs: 100000 });
  motor.startSession();

  const controller = createTaller001aController(motor, {
    modelLetter: 'a',
    optionsCount: 6,
    correctCount: 2
  });

  const round = controller.nextRound();
  const wrong = round.options.find((o) => !o.isCorrect);
  const right = round.options.find((o) => o.isCorrect);

  const r1 = controller.clickOption(wrong.id);
  const r2 = controller.clickOption(right.id);

  const summary = controller.getSessionSummary();

  if (summary.intentos < 2) throw new Error('No registró intentos');
  if (summary.aciertos < 1) throw new Error('No registró aciertos');
  if (summary.errores < 1) throw new Error('No registró errores');

  return {
    feedbackError: r1.feedback.message,
    feedbackAcierto: r2.feedback.message,
    metricas: {
      aciertos: summary.aciertos,
      errores: summary.errores,
      intentos: summary.intentos
    }
  };
}

console.log(JSON.stringify(runDemo(), null, 2));
