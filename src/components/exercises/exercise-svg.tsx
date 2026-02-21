'use client'

interface ExerciseSVGProps {
  exerciseId: string
  size?: number
}

const SKIN = '#E8D5C0'
const PRIMARY = 'var(--color-primary, #5B8A72)'
const ACCENT = 'var(--color-accent, #D4A76A)'
const MUTED = 'var(--color-text-muted, #9C9690)'

function PassiveFlexion({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes pf-bend {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-45deg); }
        }
        .pf-forearm { transform-origin: 60px 65px; animation: pf-bend 3s ease-in-out infinite; }
      `}</style>
      {/* Table surface */}
      <rect x="10" y="75" width="100" height="6" rx="2" fill={MUTED} opacity="0.3" />
      {/* Upper arm (fixed on table) */}
      <line x1="20" y1="65" x2="60" y2="65" stroke={SKIN} strokeWidth="8" strokeLinecap="round" />
      {/* Elbow joint */}
      <circle cx="60" cy="65" r="5" fill={PRIMARY} opacity="0.6" />
      {/* Forearm (animates bending) */}
      <g className="pf-forearm">
        <line x1="60" y1="65" x2="100" y2="65" stroke={SKIN} strokeWidth="7" strokeLinecap="round" />
        {/* Hand */}
        <circle cx="100" cy="65" r="4" fill={SKIN} />
      </g>
      {/* Bend arrow */}
      <path d="M85 45 C75 35 65 40 60 50" stroke={PRIMARY} strokeWidth="1.5" fill="none" strokeDasharray="3 2" opacity="0.7" />
      <polygon points="60,50 63,44 57,46" fill={PRIMARY} opacity="0.7" />
      {/* Label */}
      <text x="60" y="108" textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="system-ui">Сгибание</text>
    </svg>
  )
}

function GravityFlexion({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes gf-swing {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg); }
        }
        .gf-arm { transform-origin: 50px 35px; animation: gf-swing 4s ease-in-out infinite; }
      `}</style>
      {/* Chair back */}
      <rect x="20" y="25" width="6" height="65" rx="2" fill={MUTED} opacity="0.25" />
      <rect x="20" y="65" width="40" height="5" rx="2" fill={MUTED} opacity="0.25" />
      {/* Body (seated torso) */}
      <line x1="40" y1="25" x2="40" y2="65" stroke={SKIN} strokeWidth="6" strokeLinecap="round" opacity="0.6" />
      {/* Head */}
      <circle cx="40" cy="18" r="8" fill={SKIN} opacity="0.6" />
      {/* Shoulder */}
      <circle cx="50" cy="35" r="4" fill={PRIMARY} opacity="0.4" />
      {/* Arm hangs down, swings */}
      <g className="gf-arm">
        {/* Upper arm */}
        <line x1="50" y1="35" x2="50" y2="60" stroke={SKIN} strokeWidth="6" strokeLinecap="round" />
        {/* Elbow */}
        <circle cx="50" cy="60" r="4" fill={PRIMARY} opacity="0.6" />
        {/* Forearm */}
        <line x1="50" y1="60" x2="50" y2="90" stroke={SKIN} strokeWidth="5" strokeLinecap="round" />
        {/* Hand */}
        <circle cx="50" cy="93" r="3.5" fill={SKIN} />
      </g>
      {/* Gravity arrow */}
      <line x1="70" y1="50" x2="70" y2="85" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="4 2" />
      <polygon points="70,88 67,82 73,82" fill={ACCENT} />
      <text x="78" y="70" fontSize="8" fill={ACCENT} fontFamily="system-ui">g</text>
      {/* Label */}
      <text x="60" y="108" textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="system-ui">Гравитация</text>
    </svg>
  )
}

function WallSlide({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes ws-slide {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        .ws-hand { animation: ws-slide 3s ease-in-out infinite; }
      `}</style>
      {/* Wall */}
      <rect x="80" y="5" width="6" height="100" rx="1" fill={MUTED} opacity="0.3" />
      {/* Floor */}
      <rect x="10" y="98" width="100" height="3" rx="1" fill={MUTED} opacity="0.2" />
      {/* Figure - legs */}
      <line x1="50" y1="95" x2="45" y2="98" stroke={SKIN} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <line x1="50" y1="95" x2="55" y2="98" stroke={SKIN} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      {/* Body */}
      <line x1="50" y1="55" x2="50" y2="95" stroke={SKIN} strokeWidth="5" strokeLinecap="round" opacity="0.6" />
      {/* Head */}
      <circle cx="50" cy="48" r="7" fill={SKIN} opacity="0.6" />
      {/* Shoulder */}
      <circle cx="55" cy="58" r="3" fill={PRIMARY} opacity="0.4" />
      {/* Arm reaching to wall - hand slides */}
      <g className="ws-hand">
        <line x1="55" y1="58" x2="78" y2="55" stroke={SKIN} strokeWidth="5" strokeLinecap="round" />
        {/* Hand on wall */}
        <circle cx="80" cy="55" r="4" fill={PRIMARY} opacity="0.5" />
      </g>
      {/* Slide arrows */}
      <line x1="90" y1="65" x2="90" y2="40" stroke={PRIMARY} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
      <polygon points="90,37 87,43 93,43" fill={PRIMARY} opacity="0.6" />
      {/* Label */}
      <text x="50" y="112" textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="system-ui">Стена</text>
    </svg>
  )
}

function TowelAssist({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes ta-pull {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .ta-towel { animation: ta-pull 3s ease-in-out infinite; }
      `}</style>
      {/* Body */}
      <line x1="60" y1="45" x2="60" y2="90" stroke={SKIN} strokeWidth="5" strokeLinecap="round" opacity="0.6" />
      {/* Head */}
      <circle cx="60" cy="38" r="7" fill={SKIN} opacity="0.6" />
      {/* Legs */}
      <line x1="60" y1="90" x2="52" y2="100" stroke={SKIN} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <line x1="60" y1="90" x2="68" y2="100" stroke={SKIN} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      {/* Towel loop over neck */}
      <g className="ta-towel">
        <path d="M50 38 Q60 30 70 38" stroke={ACCENT} strokeWidth="2.5" fill="none" />
        {/* Left side of towel (healthy hand pulls) */}
        <line x1="50" y1="38" x2="42" y2="65" stroke={ACCENT} strokeWidth="2" />
        {/* Right side of towel (injured arm being pulled) */}
        <line x1="70" y1="38" x2="78" y2="60" stroke={ACCENT} strokeWidth="2" />
        {/* Healthy arm (left) pulling towel */}
        <line x1="55" y1="55" x2="42" y2="65" stroke={SKIN} strokeWidth="4.5" strokeLinecap="round" />
        {/* Injured arm (right) being pulled up */}
        <line x1="65" y1="55" x2="78" y2="60" stroke={SKIN} strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="42" cy="65" r="3" fill={SKIN} />
        <circle cx="78" cy="60" r="3" fill={SKIN} />
      </g>
      {/* Pull arrow */}
      <line x1="35" y1="70" x2="35" y2="50" stroke={PRIMARY} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
      <polygon points="35,47 32,53 38,53" fill={PRIMARY} opacity="0.6" />
      {/* Label */}
      <text x="60" y="112" textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="system-ui">Полотенце</text>
    </svg>
  )
}

function TableBooks({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes tb-ext {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-3deg); }
        }
        .tb-arm { transform-origin: 55px 58px; animation: tb-ext 4s ease-in-out infinite; }
      `}</style>
      {/* Table surface */}
      <rect x="10" y="68" width="100" height="5" rx="2" fill={MUTED} opacity="0.3" />
      {/* Books stack under wrist */}
      <rect x="80" y="55" width="18" height="5" rx="1" fill={ACCENT} opacity="0.6" />
      <rect x="82" y="50" width="16" height="5" rx="1" fill={ACCENT} opacity="0.4" />
      <rect x="81" y="60" width="17" height="5" rx="1" fill={ACCENT} opacity="0.5" />
      {/* Arm on table */}
      <g className="tb-arm">
        {/* Upper arm */}
        <line x1="20" y1="60" x2="55" y2="58" stroke={SKIN} strokeWidth="7" strokeLinecap="round" />
        {/* Elbow area */}
        <circle cx="55" cy="58" r="4" fill={PRIMARY} opacity="0.5" />
        {/* Forearm (elevated at wrist by books) */}
        <line x1="55" y1="58" x2="88" y2="50" stroke={SKIN} strokeWidth="6" strokeLinecap="round" />
        {/* Hand palm up */}
        <ellipse cx="92" cy="48" rx="5" ry="3.5" fill={SKIN} />
      </g>
      {/* Gravity arrow on elbow */}
      <line x1="55" y1="72" x2="55" y2="88" stroke={PRIMARY} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
      <polygon points="55,91 52,85 58,85" fill={PRIMARY} opacity="0.6" />
      {/* Label */}
      <text x="60" y="108" textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="system-ui">Книжки</text>
    </svg>
  )
}

function GravityExtension({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes ge-pendulum {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        .ge-arm { transform-origin: 65px 40px; animation: ge-pendulum 4s ease-in-out infinite; }
      `}</style>
      {/* Floor */}
      <rect x="10" y="98" width="100" height="3" rx="1" fill={MUTED} opacity="0.2" />
      {/* Legs */}
      <line x1="55" y1="80" x2="50" y2="98" stroke={SKIN} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <line x1="55" y1="80" x2="60" y2="98" stroke={SKIN} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      {/* Body */}
      <line x1="55" y1="35" x2="55" y2="80" stroke={SKIN} strokeWidth="5" strokeLinecap="round" opacity="0.6" />
      {/* Head */}
      <circle cx="55" cy="28" r="7" fill={SKIN} opacity="0.6" />
      {/* Left arm (relaxed at side) */}
      <line x1="48" y1="42" x2="42" y2="70" stroke={SKIN} strokeWidth="4" strokeLinecap="round" opacity="0.4" />
      {/* Right arm - hangs and swings gently */}
      <g className="ge-arm">
        <line x1="65" y1="40" x2="68" y2="85" stroke={SKIN} strokeWidth="5" strokeLinecap="round" />
        <circle cx="68" cy="88" r="3.5" fill={SKIN} />
      </g>
      {/* Gravity arrow */}
      <line x1="82" y1="50" x2="82" y2="82" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="4 2" />
      <polygon points="82,85 79,79 85,79" fill={ACCENT} />
      {/* Label */}
      <text x="60" y="112" textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="system-ui">Маятник</text>
    </svg>
  )
}

function Rotation({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes rot-turn {
          0% { transform: scaleX(1); }
          25% { transform: scaleX(0.2); }
          50% { transform: scaleX(-1); }
          75% { transform: scaleX(0.2); }
          100% { transform: scaleX(1); }
        }
        .rot-hand { transform-origin: 60px 65px; animation: rot-turn 3s ease-in-out infinite; }
      `}</style>
      {/* Top-down view label */}
      <text x="60" y="18" textAnchor="middle" fontSize="8" fill={MUTED} fontFamily="system-ui" opacity="0.6">вид сверху</text>
      {/* Forearm (fixed, top-down) */}
      <rect x="25" y="55" width="35" height="14" rx="6" fill={SKIN} opacity="0.7" />
      {/* Elbow dot */}
      <circle cx="25" cy="62" r="5" fill={PRIMARY} opacity="0.4" />
      {/* Wrist area */}
      <circle cx="60" cy="62" r="4" fill={MUTED} opacity="0.3" />
      {/* Hand rotating (scaleX animation for pronation/supination) */}
      <g className="rot-hand">
        <rect x="58" y="52" width="30" height="20" rx="8" fill={SKIN} />
        {/* Fingers */}
        <rect x="86" y="54" width="8" height="4" rx="2" fill={SKIN} opacity="0.8" />
        <rect x="87" y="59" width="9" height="4" rx="2" fill={SKIN} opacity="0.8" />
        <rect x="87" y="64" width="8" height="4" rx="2" fill={SKIN} opacity="0.8" />
        <rect x="85" y="69" width="6" height="3" rx="1.5" fill={SKIN} opacity="0.7" />
        {/* Palm indicator */}
        <circle cx="72" cy="62" r="2" fill={PRIMARY} opacity="0.5" />
      </g>
      {/* Rotation arrows */}
      <path d="M60 40 A15 15 0 0 1 80 45" stroke={PRIMARY} strokeWidth="1.5" fill="none" strokeDasharray="3 2" opacity="0.6" />
      <polygon points="80,45 76,40 78,48" fill={PRIMARY} opacity="0.6" />
      <path d="M60 84 A15 15 0 0 1 40 79" stroke={PRIMARY} strokeWidth="1.5" fill="none" strokeDasharray="3 2" opacity="0.6" />
      <polygon points="40,79 44,84 42,76" fill={PRIMARY} opacity="0.6" />
      {/* Labels */}
      <text x="85" y="38" fontSize="7" fill={PRIMARY} fontFamily="system-ui" opacity="0.7">супинация</text>
      <text x="15" y="95" fontSize="7" fill={PRIMARY} fontFamily="system-ui" opacity="0.7">пронация</text>
      <text x="60" y="108" textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="system-ui">Ротация</text>
    </svg>
  )
}

function WristRehab({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes wr-circle {
          0% { transform: translate(0, -6px); }
          25% { transform: translate(6px, 0); }
          50% { transform: translate(0, 6px); }
          75% { transform: translate(-6px, 0); }
          100% { transform: translate(0, -6px); }
        }
        .wr-hand { transform-origin: 60px 55px; animation: wr-circle 2.5s ease-in-out infinite; }
      `}</style>
      {/* Table edge */}
      <rect x="10" y="58" width="45" height="5" rx="2" fill={MUTED} opacity="0.3" />
      {/* Forearm on table */}
      <line x1="15" y1="52" x2="55" y2="52" stroke={SKIN} strokeWidth="7" strokeLinecap="round" />
      {/* Wrist joint */}
      <circle cx="55" cy="52" r="4" fill={PRIMARY} opacity="0.5" />
      {/* Hand making circles */}
      <g className="wr-hand">
        <rect x="55" y="44" width="22" height="16" rx="6" fill={SKIN} />
        {/* Fingers */}
        <rect x="75" y="46" width="7" height="3" rx="1.5" fill={SKIN} opacity="0.8" />
        <rect x="76" y="50" width="8" height="3" rx="1.5" fill={SKIN} opacity="0.8" />
        <rect x="76" y="54" width="7" height="3" rx="1.5" fill={SKIN} opacity="0.8" />
        <rect x="74" y="58" width="5" height="2.5" rx="1" fill={SKIN} opacity="0.7" />
      </g>
      {/* Circle path indicator */}
      <circle cx="72" cy="55" r="12" stroke={PRIMARY} strokeWidth="1" fill="none" strokeDasharray="4 3" opacity="0.4" />
      {/* Circular arrow */}
      <path d="M84 55 A12 12 0 0 1 72 43" stroke={ACCENT} strokeWidth="1.5" fill="none" />
      <polygon points="72,43 75,48 69,46" fill={ACCENT} />
      {/* Label */}
      <text x="55" y="108" textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="system-ui">Запястье</text>
    </svg>
  )
}

function FineMotor({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes fm-squeeze {
          0%, 100% { transform: scale(1); }
          40% { transform: scale(0.85); }
        }
        @keyframes fm-fingers {
          0%, 100% { transform: scaleX(1); }
          40% { transform: scaleX(0.92); }
        }
        .fm-ball { animation: fm-squeeze 2s ease-in-out infinite; transform-origin: 60px 55px; }
        .fm-hand { animation: fm-fingers 2s ease-in-out infinite; transform-origin: 60px 55px; }
      `}</style>
      {/* Forearm */}
      <line x1="15" y1="60" x2="42" y2="55" stroke={SKIN} strokeWidth="7" strokeLinecap="round" />
      {/* Hand */}
      <g className="fm-hand">
        {/* Palm */}
        <rect x="40" y="42" width="22" height="22" rx="8" fill={SKIN} />
        {/* Fingers wrapping around ball */}
        <rect x="60" y="44" width="12" height="4" rx="2" fill={SKIN} opacity="0.9" />
        <rect x="61" y="49" width="14" height="4" rx="2" fill={SKIN} opacity="0.9" />
        <rect x="61" y="54" width="13" height="4" rx="2" fill={SKIN} opacity="0.9" />
        <rect x="59" y="59" width="10" height="3.5" rx="1.5" fill={SKIN} opacity="0.8" />
        {/* Thumb */}
        <ellipse cx="42" cy="44" rx="5" ry="4" fill={SKIN} opacity="0.9" transform="rotate(-20 42 44)" />
      </g>
      {/* Ball */}
      <g className="fm-ball">
        <circle cx="65" cy="55" r="11" fill={PRIMARY} opacity="0.35" />
        <circle cx="65" cy="55" r="11" stroke={PRIMARY} strokeWidth="1.5" fill="none" opacity="0.6" />
        {/* Shine */}
        <circle cx="62" cy="51" r="2.5" fill="white" opacity="0.3" />
      </g>
      {/* Squeeze arrows */}
      <path d="M50 35 L57 42" stroke={ACCENT} strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
      <path d="M80 35 L73 42" stroke={ACCENT} strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
      <path d="M50 75 L57 68" stroke={ACCENT} strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
      <path d="M80 75 L73 68" stroke={ACCENT} strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
      {/* Label */}
      <text x="60" y="108" textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="system-ui">Моторика</text>
    </svg>
  )
}

const SVG_MAP: Record<string, React.FC<{ size: number }>> = {
  ex_passive_flexion: PassiveFlexion,
  ex_gravity_flexion: GravityFlexion,
  ex_wall_slide: WallSlide,
  ex_towel_assist: TowelAssist,
  ex_table_books: TableBooks,
  ex_gravity_extension: GravityExtension,
  ex_rotation: Rotation,
  ex_wrist_rehab: WristRehab,
  ex_fine_motor: FineMotor,
}

export function ExerciseSVG({ exerciseId, size = 120 }: ExerciseSVGProps) {
  const SvgComponent = SVG_MAP[exerciseId]

  if (!SvgComponent) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="100" height="100" rx="12" fill={MUTED} opacity="0.1" />
        <text x="60" y="65" textAnchor="middle" fontSize="10" fill={MUTED} fontFamily="system-ui">
          Упражнение
        </text>
      </svg>
    )
  }

  return <SvgComponent size={size} />
}
