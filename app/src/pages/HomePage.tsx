import { Suspense, lazy, useEffect, useRef } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

type Page = "home" | "about" | "contact" | "portal";

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

const PROBLEMS = [
  {
    stat: "10,000+",
    label: "Organ Trafficking Cases",
    desc: "Reported annually by WHO. Desperate patients turn to black markets due to lack of a trustworthy system.",
  },
  {
    stat: "500,000+",
    label: "Patients on Waiting Lists",
    desc: "Globally awaiting organ transplants, many of whom will never receive one in time.",
  },
  {
    stat: "21",
    label: "People Die Daily (India)",
    desc: "Every single day in India alone, patients die waiting — not because organs don't exist, but because the system fails them.",
  },
];

const SOLUTIONS = [
  { icon: "🔒", title: "Immutable Registry", desc: "Donor consent is stored directly on the Solana blockchain. Once registered, it cannot be altered, deleted, or tampered with by any party." },
  { icon: "🔐", title: "AES-256-GCM Encryption", desc: "Personal data is encrypted in your browser before upload. Only an IPFS content hash is stored on-chain — your raw data never touches the blockchain." },
  { icon: "⚡", title: "Real-Time Allocation", desc: "Authorities propose allocation and validators approve via multi-signature — a process that takes minutes, not days of bureaucratic delay." },
  { icon: "📋", title: "Full Audit Trail", desc: "Every action — registration, brain-death certification, allocation approval — is permanently logged on-chain with timestamp and signer identity." },
];

const STEPS = [
  { num: "01", title: "Donor Registers", desc: "Donor encrypts personal data in-browser, uploads to IPFS, and registers consent on-chain via their wallet." },
  { num: "02", title: "Hospital Certifies", desc: "Multiple doctors sign brain-death certification on-chain. No single point of authority — multi-sig required." },
  { num: "03", title: "Authority Allocates", desc: "NOTTO/Ministry proposes organ allocation. Validators review and approve on-chain in real time." },
  { num: "04", title: "Chain of Custody", desc: "Every handoff, from donor hospital to recipient, is recorded permanently. Zero paperwork. Zero forgery." },
];

const FAQS = [
  { q: "Is my personal data stored on the blockchain?", a: "No. Your personal data (name, Aadhaar, DOB) is encrypted with AES-256-GCM in your browser before anything is uploaded. Only an IPFS content identifier (CID) is stored on-chain — never your raw data." },
  { q: "Which wallets are supported?", a: "Phantom, Solflare, Coinbase Wallet, Ledger, Trust Wallet, Coin98, MathWallet, and Torus. Any wallet that supports Solana will work." },
  { q: "What is Solana Devnet?", a: "Devnet is Solana's test network used for development. All transactions here use test SOL (no real money). The production system would run on Solana Mainnet." },
  { q: "How is organ allocation decided?", a: "Allocation is proposed by authorized NOTTO/Ministry accounts and approved by multiple on-chain validators via multi-signature. No single person can unilaterally approve an allocation." },
  { q: "Is this THOTA compliant?", a: "The system is designed around THOTA (Transplantation of Human Organs and Tissues Act) regulations — requiring multi-doctor certification, authority oversight, and full audit trails." },
];

function CountUpStat({ target, label }: { target: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("counted");
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="impact-stat" ref={ref}>
      <div className="impact-stat-value">{target}</div>
      <div className="impact-stat-label">{label}</div>
    </div>
  );
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const rolesRef = useRef<HTMLElement>(null);

  const scrollToRoles = () => {
    rolesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="homepage">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">Built on Solana · THOTA Compliant</div>
          <h1 className="hero-title">
            Saving Lives Through<br />
            <span className="hero-title-accent">Blockchain Transparency</span>
          </h1>
          <p className="hero-subtitle">
            A decentralized organ donation registry that eliminates corruption,
            reduces wait times, and puts trust back into a broken system —
            secured by cryptography, governed by code.
          </p>
          <div className="hero-chips">
            <span className="hero-chip">500K+ Waiting</span>
            <span className="hero-chip hero-chip-red">21 Deaths/Day</span>
            <span className="hero-chip hero-chip-orange">10K+ Trafficking Cases</span>
          </div>
          <div className="hero-actions">
            <button className="btn btn-primary hero-btn-primary" onClick={() => onNavigate("portal")}>
              Enter Portal →
            </button>
            <button className="btn btn-secondary hero-btn-secondary" onClick={scrollToRoles}>
              Learn More ↓
            </button>
          </div>
        </div>

        <div className="hero-3d">
          <Suspense fallback={<div className="heart-placeholder">🫀</div>}>
            <Spline
              scene="https://prod.spline.design/KN2VRFL0rbxWggNm/scene.splinecode"
              style={{ background: "transparent", width: "100%", height: "100%" }}
            />
          </Suspense>
        </div>

        <div className="hero-3d-mobile">
          <div className="heart-mobile-glow">🫀</div>
        </div>
      </section>

      {/* ── The Problem ──────────────────────────────────────── */}
      <section className="problem-section" ref={rolesRef as any}>
        <div className="section-inner">
          <div className="section-tag problem-tag">The Crisis</div>
          <h2 className="section-title">The Current System Is Broken</h2>
          <p className="section-subtitle">
            Organ donation should save lives. Instead, a lack of transparency,
            accountability, and trust has created a global crisis.
          </p>

          <div className="problem-stats">
            {PROBLEMS.map((p) => (
              <div key={p.stat} className="problem-stat-card">
                <div className="problem-stat-number">{p.stat}</div>
                <div className="problem-stat-label">{p.label}</div>
                <p className="problem-stat-desc">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="problem-bullets">
            <div className="problem-bullet">
              <span className="problem-bullet-icon">⚠️</span>
              <div>
                <strong>No Unified Registry</strong>
                <p>Patient and donor data is scattered across hospitals, states, and countries — with no single source of truth.</p>
              </div>
            </div>
            <div className="problem-bullet">
              <span className="problem-bullet-icon">💰</span>
              <div>
                <strong>Black Market & Corruption</strong>
                <p>Desperate patients pay criminal networks for organs. Corrupt officials manipulate waitlists for bribes.</p>
              </div>
            </div>
            <div className="problem-bullet">
              <span className="problem-bullet-icon">📄</span>
              <div>
                <strong>Forgeable Paper Trails</strong>
                <p>Manual documentation is easily altered. Deaths go uncertified. Allocations happen behind closed doors.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="howitworks-section">
        <div className="section-inner">
          <div className="section-tag">How It Works</div>
          <h2 className="section-title">End-to-End on the Blockchain</h2>
          <p className="section-subtitle">Every step of the organ donation process is cryptographically secured and permanently recorded.</p>

          <div className="steps-grid">
            {STEPS.map((step, i) => (
              <div key={step.num} className="step-card">
                <div className="step-connector" style={{ display: i === STEPS.length - 1 ? "none" : undefined }} />
                <div className="step-num">{step.num}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Solution ─────────────────────────────────────── */}
      <section className="solution-section">
        <div className="section-inner">
          <div className="section-tag solution-tag">Our Solution</div>
          <h2 className="section-title">Blockchain Makes It Trustworthy</h2>
          <p className="section-subtitle">Four pillars of security and transparency that the current system completely lacks.</p>

          <div className="solution-grid">
            {SOLUTIONS.map((s) => (
              <div key={s.title} className="solution-card">
                <div className="solution-icon">{s.icon}</div>
                <h3 className="solution-title">{s.title}</h3>
                <p className="solution-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Impact ───────────────────────────────────────────── */}
      <section className="impact-section">
        <div className="section-inner">
          <div className="section-tag solution-tag">Impact</div>
          <h2 className="section-title">Built to Scale</h2>
          <p className="section-subtitle">Designed for national deployment with real-time performance on Solana's high-throughput network.</p>
          <div className="impact-grid">
            <CountUpStat target="∞" label="Tamper-Proof Records" />
            <CountUpStat target="<1s" label="Transaction Finality" />
            <CountUpStat target="$0.00025" label="Cost Per Transaction" />
            <CountUpStat target="65,000+" label="TPS on Solana" />
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="faq-section">
        <div className="section-inner faq-inner">
          <div className="section-tag">FAQ</div>
          <h2 className="section-title">Common Questions</h2>

          <div className="faq-list">
            {FAQS.map((faq) => (
              <details key={faq.q} className="faq-item">
                <summary className="faq-question">{faq.q}</summary>
                <p className="faq-answer">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="cta-banner">
        <div className="cta-glow" />
        <h2 className="cta-title">Ready to Make a Difference?</h2>
        <p className="cta-subtitle">Register your consent, onboard your hospital, or govern the network — all secured on Solana.</p>
        <button className="btn btn-primary cta-btn" onClick={() => onNavigate("portal")}>
          Enter Portal →
        </button>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="site-footer-brand">
            <span>🧬</span>
            <span className="site-footer-name">OrganChain</span>
          </div>
          <p className="site-footer-tagline">Transparent · Tamper-proof · THOTA-compliant · Built on Solana Devnet</p>
          <div className="site-footer-links">
            <button onClick={() => onNavigate("about")}>About Us</button>
            <button onClick={() => onNavigate("contact")}>Contact</button>
            <button onClick={() => onNavigate("portal")}>Enter Portal</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
