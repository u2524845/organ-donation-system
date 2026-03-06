import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram } from "@solana/web3.js";
import { useProgram, getPda } from "../hooks/useProgram";
import { generateKey, exportKeyHex, encryptData } from "../utils/encrypt";
import { uploadToIPFS, ipfsGatewayUrl } from "../utils/ipfs";

const ORGANS = [
  { label: "Heart",        bit: 1 << 0 },
  { label: "Liver",        bit: 1 << 1 },
  { label: "Left Kidney",  bit: 1 << 2 },
  { label: "Right Kidney", bit: 1 << 3 },
  { label: "Lungs",        bit: 1 << 4 },
  { label: "Pancreas",     bit: 1 << 5 },
  { label: "Cornea",       bit: 1 << 6 },
  { label: "Skin",         bit: 1 << 7 },
];

export default function DonorPage() {
  const { publicKey } = useWallet();
  const program = useProgram();

  // Personal data fields (never sent on-chain raw)
  const [fullName,   setFullName]   = useState("");
  const [dob,        setDob]        = useState("");
  const [aadhaar,    setAadhaar]    = useState("");
  const [bloodType,  setBloodType]  = useState("");

  const [selectedOrgans, setSelectedOrgans] = useState<number[]>([]);
  const [step,    setStep]    = useState<"form" | "uploading" | "signing" | "done">("form");
  const [status,  setStatus]  = useState<string | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [cid,     setCid]     = useState<string | null>(null);
  const [donorInfo, setDonorInfo] = useState<any>(null);
  const [registryReady, setRegistryReady] = useState<boolean | null>(null);

  if (!publicKey) {
    return (
      <div className="connect-prompt">
        <span className="connect-prompt-icon">🫀</span>
        <h2>Connect your Phantom wallet to register as a donor</h2>
        <p>Use the Connect Wallet button in the top right</p>
      </div>
    );
  }

  const registryPda = getPda([Buffer.from("registry")]);
  const donorPda    = getPda([Buffer.from("donor"), publicKey.toBuffer()]);

  const toggleOrgan = (bit: number) => {
    setSelectedOrgans(prev =>
      prev.includes(bit) ? prev.filter(b => b !== bit) : [...prev, bit]
    );
  };

  const organsBitmask = selectedOrgans.reduce((acc, bit) => acc | bit, 0);

  const checkRegistry = async () => {
    if (!program) return;
    try {
      await program.account.registry.fetch(registryPda);
      setRegistryReady(true);
    } catch {
      setRegistryReady(false);
    }
  };

  const initializeRegistry = async () => {
    if (!program) return;
    try {
      setStatus("Initializing registry — please sign in Phantom...");
      await program.methods
        .initializeRegistry()
        .accounts({
          registry:      registryPda,
          authority:     publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      setRegistryReady(true);
      setStatus("Registry initialized! You can now register as a donor.");
    } catch (e: any) {
      setError(e.message);
    }
  };

  const fetchDonorInfo = async () => {
    if (!program) return;
    try {
      const info = await program.account.donorAccount.fetch(donorPda);
      setDonorInfo(info);
    } catch {
      setDonorInfo(null);
    }
  };

  const registerDonor = async () => {
    if (!program) return;
    if (!fullName.trim())  { setError("Enter your full name"); return; }
    if (!dob.trim())       { setError("Enter your date of birth"); return; }
    if (!aadhaar.trim())   { setError("Enter your Aadhaar number"); return; }
    if (organsBitmask === 0){ setError("Select at least one organ"); return; }

    setError(null);
    setStatus(null);

    try {
      // ── Step 1: Encrypt personal data in browser ──────────
      setStep("uploading");
      setStatus("Encrypting your personal data...");

      const key    = await generateKey();
      const keyHex = await exportKeyHex(key);

      const { encryptedBase64, ivHex } = await encryptData(
        { fullName, dob, aadhaar, bloodType, wallet: publicKey.toBase58() },
        key
      );

      // ── Step 2: Upload encrypted blob to IPFS ─────────────
      setStatus("Uploading encrypted data to IPFS...");

      const ipfsCid = await uploadToIPFS(
        {
          encryptedData: encryptedBase64,
          iv:            ivHex,
          timestamp:     Date.now(),
          dataType:      "donor_registration",
        },
        `donor_${publicKey.toBase58().slice(0, 8)}`
      );

      setCid(ipfsCid);
      setSavedKey(keyHex);

      // ── Step 3: Register on-chain with the CID ────────────
      setStep("signing");
      setStatus("Please sign the transaction in Phantom...");

      await program.methods
        .registerDonor(organsBitmask, null, ipfsCid)
        .accounts({
          donorAccount: donorPda,
          registry:     registryPda,
          wallet:       publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setStep("done");
      setStatus("Registered successfully!");
      await fetchDonorInfo();

    } catch (e: any) {
      setError(e.message);
      setStep("form");
    }
  };

  const markDeceased = async () => {
    if (!program) return;
    try {
      await program.methods
        .markDeceased()
        .accounts({ donorAccount: donorPda, registry: registryPda, authority: publicKey })
        .rpc();
      setStatus("Donor marked as deceased.");
      await fetchDonorInfo();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const revokeConsent = async () => {
    if (!program) return;
    try {
      await program.methods
        .revokeConsent()
        .accounts({ donorAccount: donorPda, wallet: publicKey })
        .rpc();
      setStatus("Consent revoked.");
      await fetchDonorInfo();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const statusBadge = (s: any) => {
    if (s?.active)   return <span className="badge badge-active">Active</span>;
    if (s?.revoked)  return <span className="badge badge-revoked">Revoked</span>;
    if (s?.deceased) return <span className="badge badge-deceased">Deceased</span>;
    return null;
  };

  const organNames = (bitmask: number) =>
    ORGANS.filter(o => bitmask & o.bit).map(o => o.label).join(", ") || "None";

  return (
    <div>
      {/* Current status */}
      <div className="card">
        <h2>🫀 My Donor Status</h2>
        <div className="info-row"><span>Wallet</span><span>{publicKey.toBase58().slice(0, 20)}...</span></div>
        {donorInfo ? (
          <>
            <div className="info-row"><span>Status</span><span>{statusBadge(donorInfo.status)}</span></div>
            <div className="info-row"><span>Organs</span><span style={{ fontFamily: "Inter", fontSize: "0.82rem" }}>{organNames(donorInfo.organsBitmask)}</span></div>
            <div className="info-row"><span>IPFS CID</span><span>{donorInfo.ipfsCid?.slice(0, 20)}...</span></div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
              {donorInfo.status?.active && (
                <button className="btn btn-danger" onClick={revokeConsent}>Revoke Consent</button>
              )}
              {(donorInfo.status?.active || donorInfo.status?.revoked) && (
                <button className="btn btn-secondary" onClick={markDeceased}>Mark Deceased</button>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginTop: "0.25rem" }}>
            <p style={{ color: "#475569", fontSize: "0.85rem" }}>Not registered yet.</p>
            <button className="btn btn-secondary" onClick={fetchDonorInfo} style={{ padding: "0.3rem 0.9rem", fontSize: "0.78rem" }}>
              Check Status
            </button>
          </div>
        )}
      </div>

      {/* Success screen */}
      {step === "done" && savedKey && cid && (
        <div className="card">
          <h2>✅ Registration Complete</h2>
          <div className="alert alert-success">Donor registered successfully on Solana Devnet.</div>

          <div className="alert alert-error" style={{ marginTop: "0.75rem" }}>
            ⚠️ Save your encryption key — it is the only way to decrypt your data later.
          </div>

          <div className="divider" />

          <div className="form-group">
            <label>Encryption Key — save this securely</label>
            <input className="copy-input" type="text" readOnly value={savedKey}
              onClick={e => (e.target as HTMLInputElement).select()} />
          </div>

          <div className="form-group">
            <label>IPFS CID — stored on-chain</label>
            <input className="copy-input" type="text" readOnly value={cid} />
            <a href={ipfsGatewayUrl(cid)} target="_blank" rel="noreferrer"
              style={{ fontSize: "0.78rem", color: "#7c6aff", marginTop: "0.5rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              View on IPFS Gateway →
            </a>
          </div>

          <button className="btn btn-secondary" onClick={() => setStep("form")} style={{ marginTop: "0.25rem" }}>
            Register Another
          </button>
        </div>
      )}

      {/* Registry init — only needed once on first deploy */}
      {registryReady === false && (
        <div className="card">
          <h2>One-Time Setup Required</h2>
          <div className="alert alert-info" style={{ marginBottom: "1rem" }}>
            The registry contract needs to be initialized once before donors can register.
          </div>
          {status && <div className="alert alert-info">{status}</div>}
          {error  && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary" onClick={initializeRegistry}>
            Initialize Registry
          </button>
        </div>
      )}
      {registryReady === null && (
        <div className="card">
          <button className="btn btn-secondary" onClick={checkRegistry}>
            Check Registry Status
          </button>
        </div>
      )}

      {/* Registration form */}
      {step !== "done" && registryReady === true && (
        <div className="card">
          <h2>📝 Register as Donor</h2>

          {status && step !== "form" && <div className="alert alert-info">{status}</div>}
          {error  && <div className="alert alert-error">{error}</div>}

          <div className="alert alert-info" style={{ marginBottom: "1.25rem" }}>
            🔒 Your personal data is encrypted in your browser using AES-256-GCM before upload. Only an IPFS CID is stored on-chain — never your raw data.
          </div>

          {/* Personal data — encrypted before upload */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="As per Aadhaar" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Aadhaar Number</label>
              <input type="text" placeholder="XXXX XXXX XXXX" value={aadhaar} onChange={e => setAadhaar(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Blood Type</label>
              <select value={bloodType} onChange={e => setBloodType(e.target.value)}>
                <option value="">Select</option>
                {["O-","O+","A-","A+","B-","B+","AB-","AB+"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Organ selection */}
          <div className="form-group">
            <label>Organs to Donate</label>
            <div className="organ-grid">
              {ORGANS.map(organ => (
                <label key={organ.bit} className="organ-check">
                  <input
                    type="checkbox"
                    checked={selectedOrgans.includes(organ.bit)}
                    onChange={() => toggleOrgan(organ.bit)}
                  />
                  {organ.label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              className="btn btn-primary"
              onClick={registerDonor}
              disabled={step !== "form"}
            >
              {step === "uploading" ? "Encrypting & Uploading..." :
               step === "signing"   ? "Sign in Phantom..." :
               "Register Consent"}
            </button>
            {organsBitmask > 0 && (
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                {selectedOrgans.length} organ{selectedOrgans.length !== 1 ? "s" : ""} selected
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
