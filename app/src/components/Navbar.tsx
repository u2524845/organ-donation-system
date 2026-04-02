import { useState } from "react";

type Page = "home" | "about" | "contact" | "portal";

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks: { label: string; page: Page }[] = [
    { label: "Home", page: "home" },
    { label: "About Us", page: "about" },
    { label: "Contact", page: "contact" },
  ];

  const handleNav = (page: Page) => {
    onNavigate(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        {/* Logo */}
        <button className="site-nav-logo" onClick={() => handleNav("home")}>
          <span className="site-nav-logo-icon">🧬</span>
          <span className="site-nav-logo-text">OrganChain</span>
        </button>

        {/* Desktop links */}
        <div className="site-nav-links">
          {navLinks.map(({ label, page }) => (
            <button
              key={page}
              className={`site-nav-link ${currentPage === page ? "active" : ""}`}
              onClick={() => handleNav(page)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* CTA + Hamburger */}
        <div className="site-nav-actions">
          <button className="btn btn-primary site-nav-cta" onClick={() => handleNav("portal")}>
            Enter Portal →
          </button>
          <button
            className="site-nav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="site-nav-mobile">
          {navLinks.map(({ label, page }) => (
            <button
              key={page}
              className={`site-nav-mobile-link ${currentPage === page ? "active" : ""}`}
              onClick={() => handleNav(page)}
            >
              {label}
            </button>
          ))}
          <button className="btn btn-primary" onClick={() => handleNav("portal")} style={{ marginTop: "0.5rem" }}>
            Enter Portal →
          </button>
        </div>
      )}
    </nav>
  );
}
