/**
 * Ilustraciones SVG estilo crayon para cada escena.
 * Se usan como póster del reproductor, miniatura del mapa y fondo de recompensas.
 */

interface Props {
  sceneId: string;
  className?: string;
}

export default function SceneArt({ sceneId, className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 320 180"
      className={`block h-full w-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {ART[sceneId] ?? ART['escena-1']}
    </svg>
  );
}

/* Paleta cera compartida */
const C = {
  tinta: '#3B3024',
  sol: '#F7B32B',
  cereza: '#E4572E',
  hierba: '#5F9E3E',
  hierbaClara: '#86c95f',
  cielo: '#3E7CB1',
  cieloClaro: '#8fc3e8',
  calabaza: '#E8891D',
  crema: '#FFFBF0',
  noche: '#274a70',
  nocheOscura: '#1a3352',
};

function Stars({ seed = 0 }: { seed?: number }) {
  const pts = [
    [30, 25], [70, 15], [120, 35], [180, 18], [230, 30], [280, 22], [300, 45], [45, 50],
  ];
  return (
    <g fill={C.crema}>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={(x + seed * 13) % 320} cy={y} r={i % 3 === 0 ? 2.4 : 1.5} opacity={0.9} />
      ))}
    </g>
  );
}

function Hills({ front = C.hierba, back = C.hierbaClara }: { front?: string; back?: string }) {
  return (
    <g>
      <path d="M-5 150 Q 60 110 130 140 T 325 135 V 185 H -5 Z" fill={back} />
      <path d="M-5 165 Q 90 130 170 158 T 325 155 V 185 H -5 Z" fill={front} />
    </g>
  );
}

function Sun({ x = 268, y = 38 }: { x?: number; y?: number }) {
  return (
    <g stroke={C.calabaza} strokeWidth="4" strokeLinecap="round">
      <circle cx={x} cy={y} r="17" fill={C.sol} stroke="none" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * 23}
            y1={y + Math.sin(a) * 23}
            x2={x + Math.cos(a) * 30}
            y2={y + Math.sin(a) * 30}
          />
        );
      })}
    </g>
  );
}

function Cloud({ x, y, s = 1, tone = '#ffffff' }: { x: number; y: number; s?: number; tone?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={tone}>
      <ellipse cx="0" cy="0" rx="24" ry="12" />
      <ellipse cx="-16" cy="4" rx="16" ry="9" />
      <ellipse cx="17" cy="4" rx="15" ry="8" />
    </g>
  );
}

function Face({
  x,
  y,
  color,
  size = 20,
  mouth = 'smile',
}: {
  x: number;
  y: number;
  color: string;
  size?: number;
  mouth?: 'smile' | 'open' | 'oh';
}) {
  return (
    <g>
      <circle cx={x} cy={y} r={size} fill={color} stroke={C.tinta} strokeWidth="3" />
      <circle cx={x - size * 0.35} cy={y - size * 0.15} r={size * 0.11} fill={C.tinta} />
      <circle cx={x + size * 0.35} cy={y - size * 0.15} r={size * 0.11} fill={C.tinta} />
      {mouth === 'smile' && (
        <path
          d={`M ${x - size * 0.4} ${y + size * 0.25} Q ${x} ${y + size * 0.6} ${x + size * 0.4} ${y + size * 0.25}`}
          fill="none"
          stroke={C.tinta}
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
      {mouth === 'open' && <ellipse cx={x} cy={y + size * 0.35} rx={size * 0.22} ry={size * 0.3} fill={C.tinta} />}
      {mouth === 'oh' && <circle cx={x} cy={y + size * 0.35} r={size * 0.16} fill={C.tinta} />}
    </g>
  );
}

function Sparkle({ x, y, s = 1, color = C.sol }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z"
      fill={color}
    />
  );
}

const ART: Record<string, JSX.Element> = {
  /* Cap. 1 — El misterio comienza: noche, bola de cristal brillante */
  'escena-1': (
    <g>
      <rect width="320" height="180" fill={C.noche} />
      <rect width="320" height="90" fill={C.nocheOscura} />
      <Stars />
      <circle cx="272" cy="34" r="18" fill={C.crema} />
      <circle cx="265" cy="30" r="17" fill={C.nocheOscura} />
      <Hills front="#2d5b38" back="#3d7448" />
      {/* mesa */}
      <rect x="115" y="128" width="90" height="12" rx="5" fill="#7a5230" stroke={C.tinta} strokeWidth="3" />
      <rect x="130" y="140" width="10" height="24" fill="#5f3f24" />
      <rect x="180" y="140" width="10" height="24" fill="#5f3f24" />
      {/* halo */}
      <circle cx="160" cy="95" r="46" fill={C.cieloClaro} opacity="0.25" />
      <circle cx="160" cy="95" r="34" fill={C.cieloClaro} opacity="0.3" />
      {/* bola de cristal */}
      <circle cx="160" cy="95" r="28" fill={C.cielo} stroke={C.tinta} strokeWidth="3.5" />
      <path d="M146 84 Q 152 74 165 76" fill="none" stroke={C.crema} strokeWidth="4" strokeLinecap="round" opacity="0.85" />
      <path d="M150 100 Q 160 108 172 100" fill="none" stroke={C.cieloClaro} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <path d="M143 123 h34 l6 8 h-46 Z" fill="#7a5230" stroke={C.tinta} strokeWidth="3" strokeLinejoin="round" />
      <Sparkle x={120} y={70} s={0.9} />
      <Sparkle x={202} y={62} s={1.2} />
      <Sparkle x={190} y={120} s={0.7} color={C.cieloClaro} />
      <text x="160" y="101" fontSize="20" textAnchor="middle">❓</text>
    </g>
  ),

  /* Cap. 2 — La pista escondida: día, camino con huellas y lupa gigante */
  'escena-2': (
    <g>
      <rect width="320" height="180" fill={C.cieloClaro} />
      <Sun />
      <Cloud x={70} y={35} />
      <Cloud x={175} y={22} s={0.7} />
      <Hills />
      {/* camino */}
      <path d="M40 180 Q 100 140 170 150 T 320 130 L 320 180 Z" fill="#d9b678" stroke={C.tinta} strokeWidth="3" />
      {/* huellas */}
      <g fill={C.tinta} opacity="0.65">
        <ellipse cx="105" cy="163" rx="5" ry="8" transform="rotate(-15 105 163)" />
        <ellipse cx="130" cy="152" rx="5" ry="8" transform="rotate(12 130 152)" />
        <ellipse cx="158" cy="158" rx="5" ry="8" transform="rotate(-10 158 158)" />
        <ellipse cx="185" cy="147" rx="5" ry="8" transform="rotate(14 185 147)" />
      </g>
      {/* arbusto con papel escondido */}
      <circle cx="52" cy="128" r="20" fill={C.hierba} stroke={C.tinta} strokeWidth="3" />
      <circle cx="70" cy="134" r="14" fill={C.hierbaClara} stroke={C.tinta} strokeWidth="3" />
      <rect x="60" y="112" width="16" height="20" rx="2" fill={C.crema} stroke={C.tinta} strokeWidth="2.5" transform="rotate(12 68 122)" />
      {/* lupa gigante */}
      <g stroke={C.tinta} strokeLinecap="round">
        <circle cx="225" cy="92" r="34" fill="#ffffff" opacity="0.45" strokeWidth="6" />
        <circle cx="225" cy="92" r="34" fill="none" strokeWidth="6" stroke={C.cereza} />
        <line x1="250" y1="118" x2="280" y2="150" strokeWidth="11" stroke={C.cereza} />
        <line x1="250" y1="118" x2="280" y2="150" strokeWidth="5" stroke={C.calabaza} />
      </g>
      <text x="225" y="100" fontSize="24" textAnchor="middle">📜</text>
      <Sparkle x={262} y={60} s={0.8} />
    </g>
  ),

  /* Cap. 3 — Los personajes se conocen: pradera, arcoíris, tres amigos */
  'escena-3': (
    <g>
      <rect width="320" height="180" fill={C.cieloClaro} />
      <Sun x={40} y={34} />
      {/* arcoíris */}
      <g fill="none" strokeLinecap="round">
        <path d="M95 120 A 85 85 0 0 1 265 120" stroke={C.cereza} strokeWidth="9" />
        <path d="M105 120 A 75 75 0 0 1 255 120" stroke={C.sol} strokeWidth="9" />
        <path d="M115 120 A 65 65 0 0 1 245 120" stroke={C.hierba} strokeWidth="9" />
        <path d="M125 120 A 55 55 0 0 1 235 120" stroke={C.cielo} strokeWidth="9" />
      </g>
      <Cloud x={95} y={118} s={0.9} />
      <Cloud x={265} y={118} s={0.9} />
      <Hills />
      {/* tres amigos de la mano */}
      <g stroke={C.tinta} strokeWidth="3.5" strokeLinecap="round">
        <line x1="118" y1="152" x2="143" y2="152" />
        <line x1="177" y1="152" x2="202" y2="152" />
      </g>
      <Face x={102} y={138} color={C.cereza} size={19} mouth="smile" />
      <rect x="94" y="155" width="16" height="18" rx="6" fill={C.cereza} stroke={C.tinta} strokeWidth="3" />
      <Face x={160} y={132} color={C.sol} size={22} mouth="open" />
      <rect x="151" y="152" width="18" height="21" rx="6" fill={C.sol} stroke={C.tinta} strokeWidth="3" />
      <Face x={218} y={138} color={C.cielo} size={19} mouth="smile" />
      <rect x="210" y="155" width="16" height="18" rx="6" fill={C.cielo} stroke={C.tinta} strokeWidth="3" />
      {/* flores */}
      <g>
        <circle cx="45" cy="165" r="4" fill={C.cereza} />
        <circle cx="60" cy="172" r="3.5" fill={C.sol} />
        <circle cx="275" cy="168" r="4" fill={C.cereza} />
        <circle cx="292" cy="160" r="3.5" fill={C.sol} />
      </g>
    </g>
  ),

  /* Cap. 4 — El gran problema: tormenta sobre la casita */
  'escena-4': (
    <g>
      <rect width="320" height="180" fill="#5a6d84" />
      <rect width="320" height="70" fill="#46586e" />
      {/* nubes de tormenta */}
      <Cloud x={110} y={42} s={1.5} tone="#3b4a5c" />
      <Cloud x={210} y={32} s={1.2} tone="#33414f" />
      <Cloud x={62} y={30} s={0.9} tone="#3b4a5c" />
      {/* rayo */}
      <path
        d="M168 55 L150 92 L166 92 L146 132 L186 84 L168 84 L184 55 Z"
        fill={C.sol}
        stroke={C.tinta}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* lluvia */}
      <g stroke={C.cieloClaro} strokeWidth="3" strokeLinecap="round" opacity="0.8">
        <line x1="60" y1="70" x2="54" y2="88" />
        <line x1="95" y1="82" x2="89" y2="100" />
        <line x1="235" y1="70" x2="229" y2="88" />
        <line x1="268" y1="84" x2="262" y2="102" />
        <line x1="120" y1="60" x2="114" y2="78" />
      </g>
      <Hills front="#3f6d2c" back="#4f8438" />
      {/* casita */}
      <g stroke={C.tinta} strokeWidth="3.5" strokeLinejoin="round">
        <rect x="222" y="118" width="58" height="42" fill={C.crema} />
        <path d="M214 120 L251 92 L288 120 Z" fill={C.cereza} />
        <rect x="243" y="136" width="16" height="24" fill="#7a5230" />
        <rect x="230" y="126" width="12" height="12" fill={C.cieloClaro} />
        <rect x="262" y="126" width="12" height="12" fill={C.cieloClaro} />
      </g>
      {/* personaje preocupado */}
      <Face x={70} y={140} color={C.sol} size={18} mouth="oh" />
      <rect x="62" y="156" width="16" height="17" rx="6" fill={C.sol} stroke={C.tinta} strokeWidth="3" />
    </g>
  ),

  /* Cap. 5 — La decisión importante: atardecer, bombilla y caminos que se bifurcan */
  'escena-5': (
    <g>
      <rect width="320" height="180" fill="#f5b47a" />
      <rect width="320" height="70" fill="#ef9a55" />
      <circle cx="160" cy="72" r="26" fill={C.cereza} opacity="0.85" />
      <Cloud x={60} y={30} s={0.8} tone="#ffd9ae" />
      <Cloud x={255} y={40} s={0.9} tone="#ffd9ae" />
      <Hills front="#7a9e3e" back="#94b957" />
      {/* caminos bifurcados */}
      <path d="M160 180 L150 150 Q 120 120 78 118 L 82 108 Q 130 112 158 140 Z" fill="#d9b678" stroke={C.tinta} strokeWidth="3" strokeLinejoin="round" />
      <path d="M160 180 L170 150 Q 200 120 242 118 L 238 108 Q 190 112 162 140 Z" fill="#d9b678" stroke={C.tinta} strokeWidth="3" strokeLinejoin="round" />
      {/* bombilla gigante */}
      <g stroke={C.tinta} strokeLinejoin="round">
        <circle cx="160" cy="74" r="30" fill={C.sol} strokeWidth="4" />
        <path d="M150 98 h20 v10 a10 10 0 0 1 -20 0 Z" fill="#b9c0c9" strokeWidth="3.5" />
        <path d="M152 68 Q 160 60 168 68 L 164 84 h-8 Z" fill={C.crema} strokeWidth="2.5" opacity="0.9" />
      </g>
      <text x="160" y="82" fontSize="18" textAnchor="middle">❤️</text>
      {/* rayos de la idea */}
      <g stroke={C.sol} strokeWidth="4" strokeLinecap="round">
        <line x1="118" y1="50" x2="128" y2="58" />
        <line x1="202" y1="50" x2="192" y2="58" />
        <line x1="160" y1="30" x2="160" y2="40" />
      </g>
      {/* personaje decidiendo */}
      <Face x={160} y={140} color={C.cielo} size={17} mouth="oh" />
      <rect x="152" y="155" width="16" height="18" rx="6" fill={C.cielo} stroke={C.tinta} strokeWidth="3" />
      <Sparkle x={110} y={90} s={0.8} />
      <Sparkle x={215} y={86} s={0.8} />
    </g>
  ),

  /* Cap. 6 — El final desbloqueado: estreno de cine, focos y trofeo */
  'escena-6': (
    <g>
      <rect width="320" height="180" fill={C.noche} />
      <Stars seed={3} />
      {/* focos */}
      <path d="M40 180 L95 40 L135 40 L90 180 Z" fill={C.sol} opacity="0.3" />
      <path d="M280 180 L225 40 L185 40 L230 180 Z" fill={C.sol} opacity="0.3" />
      <Hills front="#8a2f4f" back="#a84a68" />
      {/* alfombra roja */}
      <path d="M120 180 L145 120 H175 L200 180 Z" fill={C.cereza} stroke={C.tinta} strokeWidth="3" strokeLinejoin="round" />
      {/* podio */}
      <rect x="130" y="120" width="60" height="18" rx="3" fill="#7a5230" stroke={C.tinta} strokeWidth="3" />
      {/* trofeo */}
      <g stroke={C.tinta} strokeWidth="3.5" strokeLinejoin="round">
        <path d="M145 78 h30 v14 a15 15 0 0 1 -30 0 Z" fill={C.sol} />
        <path d="M145 82 q-14 2 -6 16 q4 6 8 4" fill="none" strokeLinecap="round" />
        <path d="M175 82 q14 2 6 16 q-4 6 -8 4" fill="none" strokeLinecap="round" />
        <rect x="154" y="104" width="12" height="8" fill={C.calabaza} />
        <rect x="148" y="112" width="24" height="8" rx="2" fill={C.calabaza} />
      </g>
      <Sparkle x={160} y={58} s={1.3} />
      {/* confeti */}
      <g>
        <rect x="70" y="60" width="6" height="6" fill={C.sol} transform="rotate(20 73 63)" />
        <rect x="250" y="72" width="6" height="6" fill={C.hierbaClara} transform="rotate(-15 253 75)" />
        <rect x="105" y="90" width="5" height="5" fill={C.cieloClaro} transform="rotate(40 107 92)" />
        <rect x="215" y="55" width="5" height="5" fill={C.cereza} transform="rotate(-30 217 57)" />
        <rect x="90" y="45" width="5" height="5" fill="#ffffff" transform="rotate(10 92 47)" />
      </g>
      {/* amigos celebrando */}
      <Face x={95} y={150} color={C.cereza} size={14} mouth="open" />
      <Face x={225} y={150} color={C.cielo} size={14} mouth="open" />
      <text x="160" y="170" fontSize="16" textAnchor="middle">🎉</text>
    </g>
  ),
};
