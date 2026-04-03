function HeartIcon() {
  return (
    <svg viewBox="0 0 64 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 52C32 52 6 36 6 19C6 10.7 12.7 4 21 4C25.5 4 29.5 6.2 32 9.6C34.5 6.2 38.5 4 43 4C51.3 4 58 10.7 58 19C58 36 32 52 32 52Z" fill="#f87171" opacity="0.9"/>
      <path d="M32 46C32 46 10 32 10 19C10 12.9 15 8 21 8C25 8 28.5 10 30.5 13" stroke="#fca5a5" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <ellipse cx="22" cy="17" rx="6" ry="4" fill="white" opacity="0.15" transform="rotate(-20 22 17)"/>
    </svg>
  );
}

function LungsIcon() {
  return (
    <svg viewBox="0 0 64 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Trachea */}
      <rect x="29" y="2" width="6" height="14" rx="3" fill="#a78bfa"/>
      {/* Left bronchus */}
      <path d="M29 14 C20 14 14 16 12 22" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Right bronchus */}
      <path d="M35 14 C44 14 50 16 52 22" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Left lung */}
      <path d="M6 26 C6 20 10 18 14 20 C16 14 20 12 24 14 C26 10 28 10 29 14 L29 50 C26 54 20 56 14 52 C8 48 6 40 6 26Z" fill="#a78bfa" opacity="0.85"/>
      {/* Right lung */}
      <path d="M58 26 C58 20 54 18 50 20 C48 14 44 12 40 14 C38 10 36 10 35 14 L35 50 C38 54 44 56 50 52 C56 48 58 40 58 26Z" fill="#a78bfa" opacity="0.85"/>
      {/* Highlights */}
      <ellipse cx="17" cy="30" rx="4" ry="8" fill="white" opacity="0.12" transform="rotate(-10 17 30)"/>
      <ellipse cx="47" cy="30" rx="4" ry="8" fill="white" opacity="0.12" transform="rotate(10 47 30)"/>
    </svg>
  );
}

function KidneyIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Kidney bean shape */}
      <path d="M44 8 C54 10 60 20 58 32 C56 46 46 58 36 58 C28 58 24 52 26 44 C28 38 34 36 34 30 C34 24 28 22 26 16 C24 8 32 6 44 8Z" fill="#34d399" opacity="0.9"/>
      {/* Inner concave */}
      <path d="M26 16 C22 20 20 28 22 36 C24 44 28 50 36 52" stroke="#6ee7b7" strokeWidth="2" fill="none" opacity="0.6"/>
      {/* Hilum (inner notch) */}
      <path d="M26 28 C24 30 24 34 26 36" stroke="#065f46" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>
      {/* Ureter */}
      <path d="M27 32 C18 32 14 36 14 46" stroke="#34d399" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Highlight */}
      <ellipse cx="42" cy="24" rx="5" ry="10" fill="white" opacity="0.13" transform="rotate(20 42 24)"/>
    </svg>
  );
}

function LiverIcon() {
  return (
    <svg viewBox="0 0 72 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Liver — large wedge shape, wider on right */}
      <path d="M4 28 C4 16 12 6 26 4 C36 2 52 4 62 12 C70 18 70 28 64 36 C58 44 46 48 34 48 C20 48 10 44 6 38 C4 35 4 32 4 28Z" fill="#fb923c" opacity="0.9"/>
      {/* Left lobe division */}
      <path d="M30 6 C26 16 26 28 28 40" stroke="#fed7aa" strokeWidth="1.5" fill="none" opacity="0.5"/>
      {/* Gallbladder hint */}
      <ellipse cx="40" cy="42" rx="7" ry="5" fill="#fbbf24" opacity="0.6"/>
      {/* Highlight */}
      <ellipse cx="22" cy="18" rx="8" ry="5" fill="white" opacity="0.15" transform="rotate(-15 22 18)"/>
      {/* Portal vein lines */}
      <path d="M36 20 C42 18 50 20 56 26" stroke="#fed7aa" strokeWidth="1.5" fill="none" opacity="0.4"/>
      <path d="M36 20 C32 24 28 30 30 38" stroke="#fed7aa" strokeWidth="1.5" fill="none" opacity="0.4"/>
    </svg>
  );
}

function CorneaIcon() {
  return (
    <svg viewBox="0 0 64 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Eye white */}
      <path d="M4 26 C12 10 20 4 32 4 C44 4 52 10 60 26 C52 42 44 48 32 48 C20 48 12 42 4 26Z" fill="#1e3a5f" opacity="0.8"/>
      {/* Iris */}
      <circle cx="32" cy="26" r="13" fill="#60a5fa" opacity="0.9"/>
      {/* Cornea highlight (the clear dome) */}
      <circle cx="32" cy="26" r="13" fill="none" stroke="#93c5fd" strokeWidth="2" opacity="0.6"/>
      {/* Pupil */}
      <circle cx="32" cy="26" r="6" fill="#0f172a"/>
      {/* Iris detail lines */}
      <line x1="32" y1="13" x2="32" y2="16" stroke="#93c5fd" strokeWidth="1" opacity="0.4"/>
      <line x1="32" y1="36" x2="32" y2="39" stroke="#93c5fd" strokeWidth="1" opacity="0.4"/>
      <line x1="19" y1="26" x2="22" y2="26" stroke="#93c5fd" strokeWidth="1" opacity="0.4"/>
      <line x1="42" y1="26" x2="45" y2="26" stroke="#93c5fd" strokeWidth="1" opacity="0.4"/>
      {/* Specular highlight */}
      <circle cx="26" cy="21" r="3" fill="white" opacity="0.35"/>
      <circle cx="38" cy="31" r="1.5" fill="white" opacity="0.2"/>
    </svg>
  );
}

function PancreasIcon() {
  return (
    <svg viewBox="0 0 72 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Pancreas — elongated lumpy shape */}
      <path d="M8 20 C8 14 14 10 22 10 C28 10 30 14 36 14 C42 14 44 10 52 10 C62 10 68 14 66 22 C64 28 58 32 50 30 C44 28 42 24 36 24 C30 24 28 28 22 28 C14 28 8 26 8 20Z" fill="#c4b5fd" opacity="0.9"/>
      {/* Head (right side, larger) */}
      <ellipse cx="56" cy="20" rx="10" ry="10" fill="#a78bfa" opacity="0.6"/>
      {/* Duct line */}
      <path d="M20 20 C30 20 42 20 58 20" stroke="#ede9fe" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="3 2"/>
      {/* Highlight */}
      <ellipse cx="28" cy="16" rx="8" ry="3" fill="white" opacity="0.15" transform="rotate(-5 28 16)"/>
    </svg>
  );
}

const ORGANS = [
  { Icon: HeartIcon,   label: "Heart",    color: "#f87171", glow: "rgba(248,113,113,0.3)" },
  { Icon: LungsIcon,   label: "Lungs",    color: "#a78bfa", glow: "rgba(167,139,250,0.3)" },
  { Icon: KidneyIcon,  label: "Kidney",   color: "#34d399", glow: "rgba(52,211,153,0.3)"  },
  { Icon: LiverIcon,   label: "Liver",    color: "#fb923c", glow: "rgba(251,146,60,0.3)"  },
  { Icon: CorneaIcon,  label: "Cornea",   color: "#60a5fa", glow: "rgba(96,165,250,0.3)"  },
  { Icon: PancreasIcon,label: "Pancreas", color: "#c4b5fd", glow: "rgba(196,181,253,0.3)" },
];

export default function Heart3D() {
  return (
    <div className="organ-visual">
      <div className="organ-visual-title">
        <span className="organ-visual-dot" />
        Organs Registered On-Chain
      </div>
      <div className="organ-grid-visual">
        {ORGANS.map((o, i) => (
          <div
            key={i}
            className="organ-card-visual"
            style={{ "--organ-glow": o.glow, "--organ-color": o.color, animationDelay: `${i * 0.15}s` } as React.CSSProperties}
          >
            <div className="organ-card-emoji">
              <o.Icon />
            </div>
            <div className="organ-card-name">{o.label}</div>
          </div>
        ))}
      </div>
      <div className="organ-visual-footer">
        Secured on Solana · THOTA Compliant
      </div>
    </div>
  );
}
