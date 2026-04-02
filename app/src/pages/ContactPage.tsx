import { useState } from "react";

type Page = "home" | "about" | "contact" | "portal";

interface ContactPageProps {
  onNavigate: (page: Page) => void;
}

export default function ContactPage({ onNavigate }: ContactPageProps) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Please enter your name."); return; }
    if (!form.email.trim() || !form.email.includes("@")) { setError("Please enter a valid email."); return; }
    if (!form.message.trim()) { setError("Please enter a message."); return; }
    setError(null);
    setSubmitted(true);
  };

  return (
    <div className="contact-page">

      {/* Hero */}
      <section className="contact-hero">
        <div className="section-tag">Get In Touch</div>
        <h1 className="about-hero-title">Contact Us</h1>
        <p className="about-hero-sub">
          Have questions about OrganChain, want to onboard your hospital, or interested in partnering?
          We'd love to hear from you.
        </p>
      </section>

      <div className="contact-layout section-inner">

        {/* Form */}
        <div className="contact-form-wrap">
          {submitted ? (
            <div className="contact-success">
              <div className="contact-success-icon">✅</div>
              <h2>Message Sent!</h2>
              <p>Thank you for reaching out. We'll get back to you as soon as possible.</p>
              <button className="btn btn-primary" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
                Send Another
              </button>
            </div>
          ) : (
            <form className="contact-form card" onSubmit={handleSubmit}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#a5b4fc", marginBottom: "1.25rem" }}>Send a Message</h2>

              {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  placeholder="What's this about?"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  placeholder="Tell us more..."
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.25rem" }}>
                Send Message →
              </button>
            </form>
          )}
        </div>

        {/* Info sidebar */}
        <div className="contact-info">
          <div className="contact-info-card card">
            <h3>For Hospitals & Institutions</h3>
            <p>Looking to onboard your hospital to the OrganChain network? Enter the Portal and register under the Hospital role to get started.</p>
            <button className="btn btn-secondary" style={{ marginTop: "0.75rem", width: "100%" }} onClick={() => onNavigate("portal")}>
              Hospital Portal →
            </button>
          </div>

          <div className="contact-info-card card">
            <h3>For Donors</h3>
            <p>Want to register your organ donation consent on-chain? Connect your Solana wallet and register in under 2 minutes.</p>
            <button className="btn btn-secondary" style={{ marginTop: "0.75rem", width: "100%" }} onClick={() => onNavigate("portal")}>
              Donor Portal →
            </button>
          </div>

          <div className="contact-info-card card">
            <h3>For Authorities</h3>
            <p>Ministry / NOTTO officials can access the governance portal to manage allocations and validators.</p>
            <button className="btn btn-secondary" style={{ marginTop: "0.75rem", width: "100%" }} onClick={() => onNavigate("portal")}>
              Authority Portal →
            </button>
          </div>
        </div>

      </div>

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
            <button onClick={() => onNavigate("portal")}>Enter Portal</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
