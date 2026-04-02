export default function Heart3D() {
  return (
    <div className="heart3d-root">
      {/* Ambient glow */}
      <div className="heart3d-glow heart3d-glow-1" />
      <div className="heart3d-glow heart3d-glow-2" />

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className={`heart3d-particle heart3d-particle-${i + 1}`} />
      ))}

      {/* Anatomical heart */}
      <div className="heart3d-wrap">

        {/* Drop shadow */}
        <div className="heart3d-shadow-blob" />

        <svg
          className="heart3d-svg"
          viewBox="0 0 320 340"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Main organ gradient - deep red-purple to match theme */}
            <linearGradient id="organBase" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#c4b5fd" />
              <stop offset="25%"  stopColor="#8b5cf6" />
              <stop offset="60%"  stopColor="#6d28d9" />
              <stop offset="100%" stopColor="#3b0764" />
            </linearGradient>

            {/* Vessel gradient */}
            <linearGradient id="vesselGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#5b21b6" />
            </linearGradient>

            {/* Aorta gradient */}
            <linearGradient id="aortaGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%"   stopColor="#7c6aff" />
              <stop offset="100%" stopColor="#c4b5fd" />
            </linearGradient>

            {/* Highlight shine */}
            <radialGradient id="organShine" cx="35%" cy="28%" r="40%">
              <stop offset="0%"   stopColor="#ede9fe" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </radialGradient>

            {/* Dark shadow side */}
            <linearGradient id="organShadow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#1e0050" stopOpacity="0.5" />
              <stop offset="40%"  stopColor="#1e0050" stopOpacity="0" />
              <stop offset="100%" stopColor="#1e0050" stopOpacity="0.3" />
            </linearGradient>

            {/* Glow filter */}
            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Vessel glow */}
            <filter id="vesselGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <clipPath id="heartClip">
              <path d="M155 295 C100 265 42 230 28 180 C14 140 20 100 38 78 C55 57 80 52 102 58 C118 63 132 73 143 87 C148 70 158 55 172 47 C190 37 216 38 234 55 C256 76 264 112 258 152 C248 208 210 255 155 295Z" />
            </clipPath>
          </defs>

          {/* ── Aortic Arch (top-left, curves upward) ── */}
          <path
            d="M138 82 C130 60 118 40 108 28 C100 18 96 10 104 6 C112 2 120 8 126 18 C136 34 144 54 150 72"
            stroke="url(#aortaGrad)" strokeWidth="14" strokeLinecap="round" fill="none"
            filter="url(#vesselGlow)"
          />
          {/* Aorta highlight */}
          <path
            d="M136 80 C128 58 116 38 106 26 C99 17 95 10 103 7"
            stroke="#ddd6fe" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4"
          />

          {/* ── Pulmonary Artery (top-center, goes up-right) ── */}
          <path
            d="M162 75 C165 52 172 36 182 24 C190 14 200 8 208 12 C216 16 216 26 210 36 C202 48 188 58 176 70"
            stroke="url(#aortaGrad)" strokeWidth="11" strokeLinecap="round" fill="none"
            filter="url(#vesselGlow)"
          />
          <path
            d="M164 73 C167 52 174 37 184 26 C192 16 201 10 208 14"
            stroke="#ddd6fe" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.35"
          />

          {/* ── Superior Vena Cava (right side) ── */}
          <path
            d="M218 90 C228 74 236 58 240 44 C244 32 242 22 234 20 C226 18 218 26 214 38 C210 52 210 68 212 82"
            stroke="url(#vesselGrad)" strokeWidth="9" strokeLinecap="round" fill="none"
            filter="url(#vesselGlow)"
          />

          {/* ── Pulmonary veins (small, right) ── */}
          <path
            d="M238 120 C252 112 264 108 272 112 C278 116 276 126 268 130"
            stroke="url(#vesselGrad)" strokeWidth="7" strokeLinecap="round" fill="none"
          />
          <path
            d="M242 145 C258 140 270 140 276 148"
            stroke="url(#vesselGrad)" strokeWidth="6" strokeLinecap="round" fill="none"
          />

          {/* ── Small vessels left ── */}
          <path
            d="M50 130 C36 122 26 116 22 122 C18 128 24 138 34 142"
            stroke="url(#vesselGrad)" strokeWidth="6" strokeLinecap="round" fill="none"
          />
          <path
            d="M42 160 C28 156 18 156 16 164"
            stroke="url(#vesselGrad)" strokeWidth="5" strokeLinecap="round" fill="none"
          />

          {/* ── Main Heart Body ── */}
          <path
            d="M155 295 C100 265 42 230 28 180 C14 140 20 100 38 78 C55 57 80 52 102 58 C118 63 132 73 143 87 C148 70 158 55 172 47 C190 37 216 38 234 55 C256 76 264 112 258 152 C248 208 210 255 155 295Z"
            fill="url(#organBase)"
            filter="url(#softGlow)"
          />

          {/* Shine overlay */}
          <path
            d="M155 295 C100 265 42 230 28 180 C14 140 20 100 38 78 C55 57 80 52 102 58 C118 63 132 73 143 87 C148 70 158 55 172 47 C190 37 216 38 234 55 C256 76 264 112 258 152 C248 208 210 255 155 295Z"
            fill="url(#organShine)"
          />

          {/* Shadow side */}
          <path
            d="M155 295 C100 265 42 230 28 180 C14 140 20 100 38 78 C55 57 80 52 102 58 C118 63 132 73 143 87 C148 70 158 55 172 47 C190 37 216 38 234 55 C256 76 264 112 258 152 C248 208 210 255 155 295Z"
            fill="url(#organShadow)"
          />

          {/* ── Surface texture — coronary vessels on the heart ── */}
          <g clipPath="url(#heartClip)" opacity="0.55">
            {/* Left coronary artery */}
            <path
              d="M143 100 C136 116 128 138 124 162 C120 184 122 208 130 228"
              stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" fill="none"
            />
            {/* Branch */}
            <path
              d="M132 148 C118 158 106 172 100 190"
              stroke="#c4b5fd" strokeWidth="1.8" strokeLinecap="round" fill="none"
            />
            {/* Right coronary artery */}
            <path
              d="M166 102 C178 118 188 142 190 168 C192 192 186 216 174 234"
              stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" fill="none"
            />
            {/* Small branches */}
            <path
              d="M184 158 C196 164 204 176 202 190"
              stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" fill="none"
            />
            <path
              d="M155 90 C155 104 154 120 152 138"
              stroke="#ddd6fe" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"
            />
          </g>

          {/* ── Rim / edge highlight ── */}
          <path
            d="M155 295 C100 265 42 230 28 180 C14 140 20 100 38 78 C55 57 80 52 102 58 C118 63 132 73 143 87 C148 70 158 55 172 47 C190 37 216 38 234 55 C256 76 264 112 258 152 C248 208 210 255 155 295Z"
            stroke="#a78bfa" strokeWidth="1.5" strokeOpacity="0.5" fill="none"
          />

          {/* ── Pulse ring ── */}
          <path
            className="heart3d-pulse-ring"
            d="M155 295 C100 265 42 230 28 180 C14 140 20 100 38 78 C55 57 80 52 102 58 C118 63 132 73 143 87 C148 70 158 55 172 47 C190 37 216 38 234 55 C256 76 264 112 258 152 C248 208 210 255 155 295Z"
            stroke="#c4b5fd" strokeWidth="2" strokeOpacity="0.7" fill="none"
          />
        </svg>
      </div>
    </div>
  );
}
