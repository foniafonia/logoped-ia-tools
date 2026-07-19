/* COGNITIVA — Override de tiempo de exposición (Teoría del Déficit Temporal).
   Lee ?exp=MS de la URL del taller y construye la config para MotorGestion.
   - Solo afecta a los talleres con estímulo temporizado (ExposureMs).
   - Si no hay ?exp, devuelve {} → el motor usa sus valores por defecto (1000/700/1800).
   - NO interfiere con la adaptación dinámica del motor (±100/150 por acierto/error);
     solo fija el punto de partida y amplía el rango admisible a 700–2500 ms. */
(function(){
  window.COG_EXP = function(){
    try {
      var p = new URLSearchParams(window.location.search);
      var exp = parseInt(p.get('exp'), 10);
      if (!exp || isNaN(exp)) return {};
      exp = Math.max(700, Math.min(2500, exp)); // límites clínicos admisibles
      return { defaultExposureMs: exp, minExposureMs: 700, maxExposureMs: 2500 };
    } catch (e) {
      return {};
    }
  };
})();
