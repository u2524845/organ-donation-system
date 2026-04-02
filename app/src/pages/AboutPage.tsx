type Page = "home" | "about" | "contact" | "portal";

interface AboutPageProps {
  onNavigate: (page: Page) => void;
}

const TEAM = [
  { name: "Akash Kumar Vanzara", role: "Blockchain Developer", initial: "A" },
];

const TECH = [
  { name: "Solana", desc: "High-throughput L1 blockchain — 65,000 TPS, sub-second finality, $0.00025 per transaction." },
  { name: "Anchor", desc: "Rust framework for building Solana programs with type-safe account validation." },
  { name: "IPFS", desc: "Decentralized file storage for encrypted donor data. Only the content hash lives on-chain." },
  { name: "React + Vite", desc: "Fast, modern frontend with TypeScript for type safety and Vite for instant hot-reload." },
];

const WHY = [
  { icon: "🔗", title: "Immutability", desc: "Once data is written to the blockchain it cannot be altered or deleted by anyone — not even us." },
  { icon: "🌐", title: "Transparency", desc: "Every action is publicly verifiable on-chain. Anyone can audit the registry without special access." },
  { icon: "⚡", title: "Speed", desc: "Solana processes transactions in under a second — critical when time literally saves lives." },
  { icon: "🔑", title: "Self-Sovereignty", desc: "Donors own their data. Encrypted off-chain, with only the key holder able to decrypt." },
];

export default function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="about-page">

      {/* Hero */}
      <section className="about-hero">
        <div className="section-tag solution-tag">Our Mission</div>
        <h1 className="about-hero-title">
          Rebuilding Trust in<br />
          <span className="hero-title-accent">Organ Donation</span>
        </h1>
        <p className="about-hero-sub">
          We believe no one should die waiting for an organ because a system failed them.
          OrganChain replaces opaque bureaucracy with cryptographic guarantees — open,
          verifiable, and incorruptible by design.
        </p>
      </section>

      {/* Why Blockchain */}
      <section className="about-why section-inner">
        <div className="section-tag">Why Blockchain?</div>
        <h2 className="section-title">Trust Through Code, Not Institutions</h2>
        <p className="section-subtitle">
          Traditional systems rely on humans to be honest. Blockchain removes that requirement entirely.
        </p>
        <div className="why-grid">
          {WHY.map(w => (
            <div key={w.title} className="why-card">
              <div className="why-icon">{w.icon}</div>
              <h3 className="why-title">{w.title}</h3>
              <p className="why-desc">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="about-team section-inner">
        <div className="section-tag">The Team</div>
        <h2 className="section-title">Who Built This</h2>
        <div className="team-grid">
          {TEAM.map(member => (
            <div key={member.name} className="team-card">
              <div className="team-avatar">{member.initial}</div>
              <div className="team-name">{member.name}</div>
              <div className="team-role">{member.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="about-tech section-inner">
        <div className="section-tag">Tech Stack</div>
        <h2 className="section-title">Built With</h2>
        <div className="tech-grid">
          {TECH.map(t => (
            <div key={t.name} className="tech-card">
              <div className="tech-name">{t.name}</div>
              <p className="tech-desc">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner" style={{ marginTop: "2rem" }}>
        <div className="cta-glow" />
        <h2 className="cta-title">Join the Mission</h2>
        <p className="cta-subtitle">Register as a donor, onboard your hospital, or reach out to get involved.</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary cta-btn" onClick={() => onNavigate("portal")}>Enter Portal →</button>
          <button className="btn btn-secondary cta-btn" onClick={() => onNavigate("contact")}>Contact Us</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="site-footer-brand">
            <span>🧬</span>
            <span className="site-footer-name">OrganChain</span>
          </div>
          <p className="site-footer-tagline">Transparent · Tamper-proof · THOTA-compliant · Built on Solana Devnet</p>
          <div className="site-footer-links">
            <button onClick={() => onNavigate("home")}>Home</button>
            <button onClick={() => onNavigate("contact")}>Contact</button>
            <button onClick={() => onNavigate("portal")}>Enter Portal</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
