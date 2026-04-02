export default function Heart3D() {
  return (
    <div className="heart3d-root">
      {/* Ambient glow layers */}
      <div className="heart3d-glow heart3d-glow-1" />
      <div className="heart3d-glow heart3d-glow-2" />

      {/* Orbiting ring */}
      <div className="heart3d-orbit">
        <div className="heart3d-orbit-dot" />
      </div>
      <div className="heart3d-orbit heart3d-orbit-2">
        <div className="heart3d-orbit-dot heart3d-orbit-dot-2" />
      </div>

      {/* Main heart SVG — layered for depth */}
      <div className="heart3d-wrap">
        {/* Shadow / depth layer */}
        <svg className="heart3d-shadow" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M100 160 C60 130 10 100 10 60 C10 30 30 10 55 10 C70 10 85 18 100 35 C115 18 130 10 145 10 C170 10 190 30 190 60 C190 100 140 130 100 160Z"
            fill="url(#shadowGrad)"
          />
          <defs>
            <radialGradient id="shadowGrad" cx="50%" cy="60%" r="50%">
              <stop offset="0%" stopColor="#7c6aff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* Main heart */}
        <svg className="heart3d-svg" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="heartFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#c4b5fd" />
              <stop offset="35%"  stopColor="#8b5cf6" />
              <stop offset="70%"  stopColor="#7c6aff" />
              <stop offset="100%" stopColor="#4c1d95" />
            </linearGradient>
            <linearGradient id="heartShine" x1="20%" y1="0%" x2="60%" y2="60%">
              <stop offset="0%"   stopColor="#fff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <filter id="heartGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="innerGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Main fill */}
          <path
            filter="url(#heartGlow)"
            d="M100 160 C60 130 10 100 10 60 C10 30 30 10 55 10 C70 10 85 18 100 35 C115 18 130 10 145 10 C170 10 190 30 190 60 C190 100 140 130 100 160Z"
            fill="url(#heartFill)"
          />

          {/* Shine overlay */}
          <path
            d="M100 160 C60 130 10 100 10 60 C10 30 30 10 55 10 C70 10 85 18 100 35 C115 18 130 10 145 10 C170 10 190 30 190 60 C190 100 140 130 100 160Z"
            fill="url(#heartShine)"
          />

          {/* Highlight blob top-left */}
          <ellipse cx="70" cy="50" rx="22" ry="14" fill="white" opacity="0.12" transform="rotate(-20 70 50)" />

          {/* Edge stroke for depth */}
          <path
            d="M100 160 C60 130 10 100 10 60 C10 30 30 10 55 10 C70 10 85 18 100 35 C115 18 130 10 145 10 C170 10 190 30 190 60 C190 100 140 130 100 160Z"
            stroke="#a78bfa"
            strokeWidth="1.5"
            strokeOpacity="0.4"
            fill="none"
          />
        </svg>

        {/* Pulse ring */}
        <svg className="heart3d-pulse" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M100 160 C60 130 10 100 10 60 C10 30 30 10 55 10 C70 10 85 18 100 35 C115 18 130 10 145 10 C170 10 190 30 190 60 C190 100 140 130 100 160Z"
            stroke="#c4b5fd"
            strokeWidth="2"
            strokeOpacity="0.6"
            fill="none"
          />
        </svg>
      </div>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className={`heart3d-particle heart3d-particle-${i + 1}`} />
      ))}
    </div>
  );
}
