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
          33% { transform: rotate(-20deg); }
          66% { transform: rotate(-45deg); }
        }
        .pf-forearm { transform-origin: 62px 62px; animation: pf-bend 4s ease-in-out infinite; }
      `}</style>
      {/* Seated figure - side view */}
      {/* Chair/seat */}
      <rect x="12" y="70" width="30" height="4" rx="2" fill={MUTED} opacity="0.25" />
      <rect x="12" y="35" width="4" height="39" rx="2" fill={MUTED} opacity="0.2" />
      {/* Legs (thigh horizontal on seat) */}
      <line x1="30" y1="74" x2="48" y2="74" stroke={SKIN} strokeWidth="5" strokeLinecap="round" opacity="0.4" />
      <line x1="48" y1="74" x2="50" y2="92" stroke={SKIN} strokeWidth="4" strokeLinecap="round" opacity="0.4" />
      {/* Body (seated torso) */}
      <line x1="30" y1="40" x2="30" y2="72" stroke={SKIN} strokeWidth="5" strokeLinecap="round" opacity="0.5" />
      {/* Head */}
      <circle cx="30" cy="33" r="7" fill={SKIN} opacity="0.5" />
      {/* Upper arm resting on thigh - elbow at knee */}
      <line x1="35" y1="50" x2="48" y2="68" stroke={SKIN} strokeWidth="6" strokeLinecap="round" />
      {/* Elbow joint on thigh */}
      <circle cx="48" cy="68" r="4" fill={PRIMARY} opacity="0.6" />
      {/* Forearm being pulled (animates bending toward shoulder) */}
      <g className="pf-forearm">
        {/* Forearm */}
        <line x1="62" y1="62" x2="90" y2="62" stroke={SKIN} strokeWidth="5.5" strokeLinecap="round" />
        {/* Hand/wrist */}
        <circle cx="90" cy="62" r="3.5" fill={SKIN} />
        {/* Healthy hand gripping wrist (different opacity) */}
        <ellipse cx="87" cy="62" rx="5" ry="4" fill={SKIN} opacity="0.45" stroke={PRIMARY} strokeWidth="0.8" />
      </g>
      {/* Arrow showing pull direction toward shoulder */}
      <path d="M82 48 C75 38 65 42 58 50" stroke={PRIMARY} strokeWidth="1.5" fill="none" strokeDasharray="3 2" opacity="0.7" />
      <polygon points="58,50 61,44 55,46" fill={PRIMARY} opacity="0.7" />
      {/* Phase labels */}
      <text x="95" y="58" fontSize="7" fill={PRIMARY} fontFamily="system-ui" opacity="0.5">A</text>
      <text x="82" y="42" fontSize="7" fill={PRIMARY} fontFamily="system-ui" opacity="0.5">B</text>
      <text x="62" y="38" fontSize="7" fill={PRIMARY} fontFamily="system-ui" opacity="0.5">C</text>
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
          50% { transform: rotate(25deg); }
        }
        .gf-forearm { transform-origin: 52px 28px; animation: gf-swing 3.5s ease-in-out infinite; }
      `}</style>
      {/* Bed/surface */}
      <rect x="5" y="80" width="110" height="6" rx="2" fill={MUTED} opacity="0.3" />
      <rect x="8" y="86" width="4" height="8" rx="1" fill={MUTED} opacity="0.2" />
      <rect x="104" y="86" width="4" height="8" rx="1" fill={MUTED} opacity="0.2" />
      {/* Pillow */}
      <rect x="72" y="72" width="28" height="8" rx="4" fill={MUTED} opacity="0.15" />
      {/* Body lying on back (horizontal) */}
      <line x1="38" y1="76" x2="90" y2="76" stroke={SKIN} strokeWidth="5" strokeLinecap="round" opacity="0.5" />
      {/* Head on pillow */}
      <circle cx="93" cy="73" r="7" fill={SKIN} opacity="0.5" />
      {/* Legs */}
      <line x1="38" y1="76" x2="18" y2="76" stroke={SKIN} strokeWidth="4.5" strokeLinecap="round" opacity="0.4" />
      <line x1="18" y1="76" x2="12" y2="80" stroke={SKIN} strokeWidth="3.5" strokeLinecap="round" opacity="0.35" />
      {/* Shoulder joint */}
      <circle cx="75" cy="72" r="3" fill={PRIMARY} opacity="0.4" />
      {/* Upper arm pointing STRAIGHT UP (vertical) */}
      <line x1="75" y1="72" x2="52" y2="28" stroke={SKIN} strokeWidth="6" strokeLinecap="round" />
      {/* Elbow joint */}
      <circle cx="52" cy="28" r="4" fill={PRIMARY} opacity="0.6" />
      {/* Forearm hanging behind head due to gravity (animated swing) */}
      <g className="gf-forearm">
        <line x1="52" y1="28" x2="52" y2="58" stroke={SKIN} strokeWidth="5" strokeLinecap="round" />
        {/* Hand */}
        <circle cx="52" cy="61" r="3.5" fill={SKIN} />
        {/* Optional weight */}
        <rect x="47" y="63" width="10" height="5" rx="1.5" fill={ACCENT} opacity="0.5" />
        <text x="52" y="67" textAnchor="middle" fontSize="5" fill="white" fontFamily="system-ui" opacity="0.8">0.5</text>
      </g>
      {/* Gravity arrow */}
      <line x1="38" y1="32" x2="38" y2="56" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="4 2" />
      <polygon points="38,59 35,53 41,53" fill={ACCENT} />
      <text x="33" y="48" fontSize="7" fill={ACCENT} fontFamily="system-ui">g</text>
      {/* Hint label */}
      <text x="52" y="16" textAnchor="middle" fontSize="6.5" fill={PRIMARY} fontFamily="system-ui" opacity="0.7">Локоть в потолок</text>
      {/* Label */}
      <text x="60" y="108" textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="system-ui">Гравитация</text>
    </svg>
  )
}

function WallSlide({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes ws-lean {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }
        .ws-body { animation: ws-lean 3s ease-in-out infinite; }
      `}</style>
      {/* Wall */}
      <rect x="90" y="5" width="6" height="95" rx="1" fill={MUTED} opacity="0.3" />
      {/* Floor */}
      <rect x="10" y="98" width="86" height="3" rx="1" fill={MUTED} opacity="0.2" />
      {/* Figure facing wall */}
      <g className="ws-body">
        {/* Legs */}
        <line x1="52" y1="95" x2="47" y2="98" stroke={SKIN} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        <line x1="52" y1="95" x2="57" y2="98" stroke={SKIN} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        {/* Body */}
        <line x1="52" y1="55" x2="52" y2="95" stroke={SKIN} strokeWidth="5" strokeLinecap="round" opacity="0.6" />
        {/* Head */}
        <circle cx="52" cy="48" r="7" fill={SKIN} opacity="0.6" />
        {/* Shoulder */}
        <circle cx="58" cy="58" r="3" fill={PRIMARY} opacity="0.4" />
        {/* Arm reaching to wall */}
        <line x1="58" y1="58" x2="88" y2="65" stroke={SKIN} strokeWidth="5" strokeLinecap="round" />
        {/* Hand on wall - FINGERS POINTING DOWN */}
        <rect x="84" y="64" width="6" height="14" rx="2" fill={PRIMARY} opacity="0.5" />
        {/* Finger tips pointing down */}
        <line x1="85" y1="78" x2="85" y2="83" stroke={SKIN} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="87" y1="78" x2="87" y2="84" stroke={SKIN} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="89" y1="78" x2="89" y2="83" stroke={SKIN} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </g>
      {/* Arrow showing body lean direction toward wall */}
      <line x1="35" y1="72" x2="48" y2="72" stroke={PRIMARY} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
      <polygon points="50,72 44,69 44,75" fill={PRIMARY} opacity="0.6" />
      <text x="28" y="68" fontSize="6" fill={PRIMARY} fontFamily="system-ui" opacity="0.6">корпус</text>
      <text x="28" y="76" fontSize="6" fill={PRIMARY} fontFamily="system-ui" opacity="0.6">к стене</text>
      {/* Label */}
      <text x="55" y="112" textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="system-ui">Стена</text>
    </svg>
  )
}

function TowelAssist({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes ta-pull {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        .ta-pull-arm { animation: ta-pull 3s ease-in-out infinite; }
      `}</style>
      {/* Body */}
      <line x1="60" y1="30" x2="60" y2="85" stroke={SKIN} strokeWidth="5" strokeLinecap="round" opacity="0.6" />
      {/* Head */}
      <circle cx="60" cy="23" r="7" fill={SKIN} opacity="0.6" />
      {/* Legs */}
      <line x1="60" y1="85" x2="52" y2="98" stroke={SKIN} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <line x1="60" y1="85" x2="68" y2="98" stroke={SKIN} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      {/* Shoulder marker (injured side - right) */}
      <circle cx="68" cy="36" r="3" fill={PRIMARY} opacity="0.4" />
      {/* Towel over injured shoulder */}
      <path d="M72 32 Q74 28 72 36" stroke={ACCENT} strokeWidth="2.5" fill="none" />
      {/* Front side of towel - injured arm holds */}
      <line x1="72" y1="36" x2="78" y2="58" stroke={ACCENT} strokeWidth="2.5" />
      {/* Back side of towel - goes behind and down */}
      <line x1="72" y1="32" x2="48" y2="42" stroke={ACCENT} strokeWidth="2.5" />
      <line x1="48" y1="42" x2="40" y2="70" stroke={ACCENT} strokeWidth="2.5" />
      {/* Injured arm (right) - holds front of towel */}
      <line x1="68" y1="36" x2="78" y2="55" stroke={SKIN} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="78" cy="58" r="3" fill={SKIN} />
      {/* Healthy arm (left) - goes behind back and pulls down */}
      <g className="ta-pull-arm">
        <line x1="52" y1="36" x2="45" y2="50" stroke={SKIN} strokeWidth="4.5" strokeLinecap="round" opacity="0.7" />
        <line x1="45" y1="50" x2="40" y2="70" stroke={SKIN} strokeWidth="4.5" strokeLinecap="round" opacity="0.7" />
        <circle cx="40" cy="70" r="3" fill={SKIN} opacity="0.7" />
      </g>
      {/* Pull direction arrow - downward behind back */}
      <line x1="30" y1="55" x2="30" y2="75" stroke={PRIMARY} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
      <polygon points="30,78 27,72 33,72" fill={PRIMARY} opacity="0.6" />
      {/* Label */}
      <text x="60" y="112" textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="system-ui">Полотенце</text>
    </svg>
  )
}

function TableBooks({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes tb-sag {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2deg); }
        }
        .tb-elbow { transform-origin: 55px 55px; animation: tb-sag 4s ease-in-out infinite; }
      `}</style>
      {/* Table surface */}
      <rect x="8" y="68" width="104" height="5" rx="2" fill={MUTED} opacity="0.3" />
      {/* Book stack under wrist - progressive stacking */}
      {/* Week 1: 2 books */}
      <rect x="82" y="60" width="20" height="4" rx="1" fill="#7BAFD4" opacity="0.55" />
      <rect x="83" y="56" width="19" height="4" rx="1" fill="#D4A76A" opacity="0.55" />
      {/* Week 2: +2 books */}
      <rect x="81" y="52" width="21" height="4" rx="1" fill="#9BC4A8" opacity="0.5" />
      <rect x="82" y="48" width="20" height="4" rx="1" fill="#D4837A" opacity="0.5" />
      {/* Week 3: +2 books */}
      <rect x="80" y="44" width="22" height="4" rx="1" fill="#B8A9D4" opacity="0.45" />
      <rect x="81" y="40" width="21" height="4" rx="1" fill="#D4C97A" opacity="0.45" />
      {/* Week labels */}
      <text x="106" y="63" fontSize="5" fill={MUTED} fontFamily="system-ui" opacity="0.6">Нед.1</text>
      <text x="106" y="53" fontSize="5" fill={MUTED} fontFamily="system-ui" opacity="0.6">Нед.2</text>
      <text x="106" y="43" fontSize="5" fill={MUTED} fontFamily="system-ui" opacity="0.6">Нед.3</text>
      {/* Arm on table with elbow sagging */}
      <g className="tb-elbow">
        {/* Upper arm on table */}
        <line x1="18" y1="60" x2="55" y2="55" stroke={SKIN} strokeWidth="7" strokeLinecap="round" />
        {/* Elbow */}
        <circle cx="55" cy="55" r="4" fill={PRIMARY} opacity="0.5" />
        {/* Forearm elevated by books */}
        <line x1="55" y1="55" x2="88" y2="38" stroke={SKIN} strokeWidth="6" strokeLinecap="round" />
        {/* Hand palm up on books */}
        <ellipse cx="91" cy="36" rx="5" ry="3.5" fill={SKIN} />
      </g>
      {/* Gravity arrow on elbow */}
      <line x1="55" y1="68" x2="55" y2="84" stroke={PRIMARY} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
      <polygon points="55,87 52,81 58,81" fill={PRIMARY} opacity="0.6" />
      {/* +book label */}
      <text x="18" y="84" fontSize="7" fill={ACCENT} fontFamily="system-ui" opacity="0.7">+книжка</text>
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
