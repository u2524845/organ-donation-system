import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import DonorPage from "./pages/DonorPage";
import HospitalPage from "./pages/HospitalPage";
import CertificationPage from "./pages/CertificationPage";
import AllocationPage from "./pages/AllocationPage";

type Role = "donor" | "hospital" | "authority";

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

const TABS: Record<Role, { id: string; label: string; icon: string }[]> = {
  donor: [
    { id: "donor", label: "Donor Registry", icon: "🫀" },
  ],
  hospital: [
    { id: "hospital",      label: "Hospital",         icon: "🏥" },
    { id: "certification", label: "Brain Death Cert", icon: "📋" },
  ],
  authority: [
    { id: "donor",      label: "Donor Status",      icon: "🫀" },
    { id: "allocation", label: "Organ Allocation",  icon: "⚖️" },
  ],
};

function Landing({ onSelect }: { onSelect: (r: Role) => void }) {
  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="landing-logo">🧬</div>
        <h1 className="landing-title">Blockchain Organ Donation System</h1>
        <p className="landing-subtitle">
          Transparent · Tamper-proof · THOTA-compliant · Built on Solana
        </p>
      </div>

      <div className="role-grid">
        {ROLES.map(role => (
          <div key={role.id} className="role-card" style={{ "--role-color": role.color } as any}>
            <div className="role-card-icon">{role.icon}</div>
            <div className="role-card-title">{role.title}</div>
            <div className="role-card-subtitle">{role.subtitle}</div>
            <p className="role-card-desc">{role.description}</p>
            <button className="role-card-btn" onClick={() => onSelect(role.id)}>
              Enter Portal →
            </button>
          </div>
        ))}
      </div>

      <p className="landing-footer">
        Connect your Phantom wallet after selecting your role
      </p>
    </div>
  );
}

export default function App() {
  const [role, setRole]         = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState("donor");

  const selectRole = (r: Role) => {
    setRole(r);
    setActiveTab(TABS[r][0].id);
  };

  if (!role) return <Landing onSelect={selectRole} />;

  const tabs     = TABS[role];
  const roleInfo = ROLES.find(r => r.id === role)!;

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <div className="header-icon">🧬</div>
          <div>
            <h1>Blockchain Organ Donation System</h1>
            <p>{roleInfo.icon} {roleInfo.title} Portal · Solana Devnet</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button className="btn btn-secondary" onClick={() => setRole(null)}
            style={{ fontSize: "0.78rem", padding: "0.4rem 0.9rem" }}>
            ← Switch Role
          </button>
          <WalletMultiButton />
        </div>
      </header>

      <nav className="nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {activeTab === "donor"         && <DonorPage />}
        {activeTab === "hospital"      && <HospitalPage />}
        {activeTab === "certification" && <CertificationPage />}
        {activeTab === "allocation"    && <AllocationPage />}
      </main>
    </div>
  );
}
