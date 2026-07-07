import { BarChart3, ChevronLeft, FileText, Star, Target, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { avatars, film, mockStudents } from '../data/demoFilm';
import {
  accuracyPercent,
  filmPercent,
  totalStars,
  useGameStore,
} from '../store/gameStore';
import type { PedagogicalObjective } from '../types';

const allObjectives: PedagogicalObjective[] = [
  'Comprensión oral',
  'Memoria narrativa',
  'Secuenciación temporal',
  'Vocabulario',
  'Inferencia emocional',
  'Atención auditiva',
  'Comprensión causa-efecto',
];

export default function ProfessionalDashboard() {
  const results = useGameStore((s) => s.results);
  const avatarId = useGameStore((s) => s.avatarId);
  const goMap = useGameStore((s) => s.goMap);

  const avatar = avatars.find((a) => a.id === avatarId) ?? avatars[0];
  const liveRow = {
    id: 'st-live',
    name: 'Tú (sesión demo)',
    emoji: avatar.emoji,
    filmPercent: filmPercent(results),
    stars: totalStars(results),
    accuracy: accuracyPercent(results),
    lastObjective: 'Comprensión oral' as PedagogicalObjective,
  };
  const students = [liveRow, ...mockStudents];
  const avgAccuracy = Math.round(students.reduce((a, s) => a + s.accuracy, 0) / students.length);
  const totalActivities = film.scenes.reduce((a, s) => a + s.activities.length, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={goMap} className="btn-secondary !px-3 !py-2 !text-base">
          <ChevronLeft size={16} /> Volver al juego
        </button>
        <span className="chip">Vista previa · datos de ejemplo</span>
      </div>

      <div className="card mb-6 p-6">
        <h1 className="font-hand text-3xl">👩‍⚕️ Panel del profesional</h1>
        <p className="text-sm font-semibold text-tinta/70">
          Seguimiento del trabajo de comprensión audiovisual por alumno. En la versión completa,
          cada película genera informes exportables por objetivo pedagógico.
        </p>
      </div>

      <dl className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={<Users size={18} />} label="Alumnos activos" value={String(students.length)} />
        <StatTile
          icon={<BarChart3 size={18} />}
          label="Precisión media"
          value={`${avgAccuracy}%`}
        />
        <StatTile icon={<FileText size={18} />} label="Actividades" value={String(totalActivities)} />
        <StatTile icon={<Target size={18} />} label="Objetivos" value={String(allObjectives.length)} />
      </dl>

      <div className="card mb-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-tinta/10 text-[11px] font-extrabold uppercase text-tinta/50">
              <th className="px-4 py-3">Alumno</th>
              <th className="px-4 py-3">Película</th>
              <th className="px-4 py-3">Estrellas</th>
              <th className="px-4 py-3">Precisión</th>
              <th className="px-4 py-3">Último objetivo trabajado</th>
            </tr>
          </thead>
          <tbody>
            {students.map((st) => (
              <tr key={st.id} className="border-b border-tinta/10 font-semibold last:border-0">
                <td className="px-4 py-3">
                  <span className="mr-2 text-xl" aria-hidden>{st.emoji}</span>
                  {st.name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-20 overflow-hidden rounded-full bg-tinta/10">
                      <div
                        className="h-full rounded-full bg-hierba"
                        style={{ width: `${st.filmPercent}%` }}
                      />
                    </div>
                    {st.filmPercent}%
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="fill-sol text-sol" /> {st.stars}
                  </span>
                </td>
                <td className="px-4 py-3">{st.accuracy}%</td>
                <td className="px-4 py-3">
                  <span className="chip">{st.lastObjective}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card mb-6 p-5">
        <h2 className="mb-3 font-hand text-2xl">Objetivos pedagógicos de esta película</h2>
        <div className="flex flex-wrap gap-2">
          {allObjectives.map((o) => (
            <span key={o} className="chip border-cielo/40 bg-cielo/10 text-cielo">
              <Target size={12} /> {o}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs font-semibold text-tinta/60">
          Cada actividad está etiquetada con su objetivo. El motor permite cargar cualquier película
          y su propio banco de preguntas sin tocar el código.
        </p>
      </div>

      <div className="card flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-hand text-2xl">Informe individual</h2>
          <p className="text-sm font-semibold text-tinta/70">
            Resultados por escena, objetivo y sesión. Exportable a PDF en la versión completa.
          </p>
        </div>
        <button className="btn-primary" onClick={() => window.alert('Disponible en la versión completa: informe PDF por alumno con resultados por objetivo pedagógico.')}>
          <FileText size={18} /> Informe listo para profesional
        </button>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="card p-4">
      <dt className="mb-1 flex items-center gap-1.5 text-[11px] font-extrabold uppercase text-tinta/50">
        {icon} {label}
      </dt>
      <dd className="font-hand text-3xl">{value}</dd>
    </div>
  );
}
