type Role = "donor" | "hospital" | "authority";
type Page = "home" | "about" | "contact" | "portal";

interface PortalPageProps {
  onRoleSelect: (role: Role) => void;
  onNavigate: (page: Page) => void;
}

const ROLES = [
  {
    id: "donor" as Role,
    icon: "🫀",
    title: "Donor",
    subtitle: "Register Consent",
    description: "Register your organ donation consent securely on-chain. Your personal data is encrypted and stored on IPFS — never raw on the blockchain.",
    color: "#7c6aff",
  },
  {
    id: "hospital" as Role,
    icon: "🏥",
    title: "Hospital / Doctor",
    subtitle: "Clinical Portal",
    description: "Authorize your hospital, manage doctors, submit and sign brain death certifications in compliance with THOTA regulations.",
    color: "#06b6d4",
  },
  {
    id: "authority" as Role,
    icon: "⚖️",
    title: "Authority",
    subtitle: "Governance Portal",
    description: "Ministry / NOTTO authority portal. Manage donor status, add validators, propose and finalize organ allocation on-chain.",
    color: "#10b981",
  },
];

export default function PortalPage({ onRoleSelect, onNavigate }: PortalPageProps) {
  return (
    <div className="portal-page">
      <section className="portal-hero">
        <div className="section-tag solution-tag">Secure Access</div>
        <h1 className="about-hero-title">Enter Your Portal</h1>
        <p className="about-hero-sub">
          Connect your Solana wallet and select your role to access the OrganChain platform.
          All actions are secured on-chain.
        </p>
      </section>

      <div className="role-grid portal-role-grid">
        {ROLES.map(role => (
          <div key={role.id} className="role-card" style={{ "--role-color": role.color } as React.CSSProperties}>
            <div className="role-card-icon">{role.icon}</div>
            <div className="role-card-title">{role.title}</div>
            <div className="role-card-subtitle">{role.subtitle}</div>
            <p className="role-card-desc">{role.description}</p>
            <button className="role-card-btn" onClick={() => onRoleSelect(role.id)}>
              Enter Portal →
            </button>
          </div>
        ))}
      </div>

      <p className="portal-hint">
        Connect your wallet after selecting your role using the Connect Wallet button in the top right.
      </p>

      {/* Footer */}
      <footer className="site-footer" style={{ marginTop: "3rem" }}>
        <div className="site-footer-inner">
          <div className="site-footer-brand">
            <span>🧬</span>
            <span className="site-footer-name">OrganChain</span>
          </div>
          <p className="site-footer-tagline">Transparent · Tamper-proof · THOTA-compliant · Built on Solana Devnet</p>
          <div className="site-footer-links">
            <button onClick={() => onNavigate("home")}>Home</button>
            <button onClick={() => onNavigate("about")}>About</button>
            <button onClick={() => onNavigate("contact")}>Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
