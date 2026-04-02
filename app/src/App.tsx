import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PortalPage from "./pages/PortalPage";
import DonorPage from "./pages/DonorPage";
import HospitalPage from "./pages/HospitalPage";
import CertificationPage from "./pages/CertificationPage";
import AllocationPage from "./pages/AllocationPage";

type Page = "home" | "about" | "contact" | "portal";
type Role = "donor" | "hospital" | "authority";

const TABS: Record<Role, { id: string; label: string; icon: string }[]> = {
  donor: [
    { id: "donor", label: "Donor Registry", icon: "🫀" },
  ],
  hospital: [
    { id: "hospital",      label: "Hospital",         icon: "🏥" },
    { id: "certification", label: "Brain Death Cert", icon: "📋" },
  ],
  authority: [
    { id: "donor",      label: "Donor Status",     icon: "🫀" },
    { id: "allocation", label: "Organ Allocation", icon: "⚖️" },
  ],
};

const ROLE_META: Record<Role, { icon: string; label: string }> = {
  donor:     { icon: "🫀", label: "Donor" },
  hospital:  { icon: "🏥", label: "Hospital / Doctor" },
  authority: { icon: "⚖️", label: "Authority" },
};

export default function App() {
  const [page, setPage]         = useState<Page>("home");
  const [role, setRole]         = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState("donor");

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectRole = (r: Role) => {
    setRole(r);
    setActiveTab(TABS[r][0].id);
  };

  const exitPortal = () => {
    setRole(null);
    setPage("portal");
  };

  // Inside the portal with a role selected — show the existing app shell
  if (role) {
    const tabs     = TABS[role];
    const roleMeta = ROLE_META[role];
    return (
      <div className="app">
        <header className="header">
          <div className="header-brand">
            <div className="header-icon">🧬</div>
            <div>
              <h1>OrganChain</h1>
              <p>{roleMeta.icon} {roleMeta.label} Portal · Solana Devnet</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button className="btn btn-secondary" onClick={exitPortal}
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

  // Public website pages
  return (
    <div className="site-wrapper">
      <Navbar currentPage={page} onNavigate={navigate} />
      {page === "home"    && <HomePage    onNavigate={navigate} />}
      {page === "about"   && <AboutPage   onNavigate={navigate} />}
      {page === "contact" && <ContactPage onNavigate={navigate} />}
      {page === "portal"  && <PortalPage  onRoleSelect={selectRole} onNavigate={navigate} />}
    </div>
  );
}
