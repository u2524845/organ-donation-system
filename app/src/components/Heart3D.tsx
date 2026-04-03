const ORGANS = [
  { emoji: "🫀", label: "Heart",   color: "#f87171", glow: "rgba(248,113,113,0.3)" },
  { emoji: "🫁", label: "Lungs",   color: "#a78bfa", glow: "rgba(167,139,250,0.3)" },
  { emoji: "🧫", label: "Kidney",  color: "#34d399", glow: "rgba(52,211,153,0.3)"  },
  { emoji: "🫀", label: "Liver",   color: "#fb923c", glow: "rgba(251,146,60,0.3)"  },
  { emoji: "👁️",  label: "Cornea", color: "#60a5fa", glow: "rgba(96,165,250,0.3)"  },
  { emoji: "🧬", label: "Tissue",  color: "#c4b5fd", glow: "rgba(196,181,253,0.3)" },
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
            <div className="organ-card-emoji">{o.emoji}</div>
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
