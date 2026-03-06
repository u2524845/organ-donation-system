import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useProgram, getPda } from "../hooks/useProgram";

export default function CertificationPage() {
  const { publicKey } = useWallet();
  const program = useProgram();

  const [donorAddress, setDonorAddress] = useState("");
  const [ipfsCid, setIpfsCid]           = useState("");
  const [certInfo, setCertInfo]         = useState<any>(null);
  const [status, setStatus]             = useState<string | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [loading, setLoading]           = useState(false);

  if (!publicKey) {
    return (
      <div className="connect-prompt">
        <span className="connect-prompt-icon">📋</span>
        <h2>Connect your hospital wallet to manage certifications</h2>
        <p>Use the Connect Wallet button in the top right</p>
      </div>
    );
  }

  const hospitalPda = getPda([Buffer.from("hospital"), publicKey.toBuffer()]);

  const getDonorPda = (addr: string) => {
    const key = new PublicKey(addr.trim());
    return { key, pda: getPda([Buffer.from("donor"), key.toBuffer()]) };
  };

  const getCertPda = (donorPda: PublicKey) =>
    getPda([Buffer.from("certification"), donorPda.toBuffer()]);

  const fetchCert = async () => {
    if (!program || !donorAddress.trim()) return;
    try {
      const { pda: donorPda } = getDonorPda(donorAddress);
      const certPda = getCertPda(donorPda);
      const info = await program.account.brainDeathCertification.fetch(certPda);
      setCertInfo(info);
      setError(null);
    } catch {
      setCertInfo(null);
      setError("No certification found for this donor.");
    }
  };

  const submitCertification = async () => {
    if (!program) return;
    if (!donorAddress.trim()) { setError("Enter donor wallet address"); return; }
    if (!ipfsCid.trim())      { setError("Enter IPFS CID"); return; }

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const { pda: donorPda } = getDonorPda(donorAddress);
      const certPda           = getCertPda(donorPda);

      await program.methods
        .submitCertification(ipfsCid.trim())
        .accounts({
          certification: certPda,
          hospitalAccount: hospitalPda,
          donorAccount: donorPda,
          hospitalWallet: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setStatus("Certification submitted. Now collect 4 doctor signatures.");
      await fetchCert();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const doctorSign = async () => {
    if (!program || !donorAddress.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const { pda: donorPda } = getDonorPda(donorAddress);
      const certPda           = getCertPda(donorPda);
      const doctorPda         = getPda([Buffer.from("doctor"), publicKey.toBuffer()]);

      await program.methods
        .doctorSign()
        .accounts({
          certification: certPda,
          doctorAccount: doctorPda,
          doctorWallet: publicKey,
        })
        .rpc();

      setStatus("Signature recorded successfully.");
      await fetchCert();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const finalizeCertification = async () => {
    if (!program || !donorAddress.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const { pda: donorPda } = getDonorPda(donorAddress);
      const certPda           = getCertPda(donorPda);

      await program.methods
        .finalizeCertification()
        .accounts({
          certification: certPda,
          hospitalAccount: hospitalPda,
          hospitalWallet: publicKey,
        })
        .rpc();

      setStatus("Certification FINALIZED. Brain death certified on-chain.");
      await fetchCert();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const certStatusBadge = (s: any) => {
    if (s?.pending)    return <span className="badge badge-pending">Pending</span>;
    if (s?.certified)  return <span className="badge badge-certified">Certified ✓</span>;
    return null;
  };

  return (
    <div>
      {/* Lookup */}
      <div className="card">
        <h2>Brain Death Certification</h2>

        {status && <div className="alert alert-success">{status}</div>}
        {error  && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label>Donor Wallet Address</label>
          <input
            type="text"
            placeholder="Donor's Solana public key"
            value={donorAddress}
            onChange={e => setDonorAddress(e.target.value)}
          />
        </div>

        <button className="btn btn-secondary" onClick={fetchCert} style={{ marginBottom: "1rem" }}>
          Look Up Certification
        </button>

        {/* Cert status */}
        {certInfo && (
          <div style={{ margin: "1rem 0", padding: "1rem", background: "#0f1117", borderRadius: "8px" }}>
            <div className="info-row"><span>Status:</span><span>{certStatusBadge(certInfo.status)}</span></div>
            <div className="info-row"><span>Signatures:</span><span>{certInfo.signerCount} / 4</span></div>
            <div className="info-row"><span>Neuro signed:</span><span>{certInfo.hasNeuro ? "✓ Yes" : "✗ No"}</span></div>
            <div className="info-row"><span>IPFS CID:</span><span>{certInfo.ipfsCid}</span></div>

            {/* Progress bar */}
            <div style={{ margin: "0.75rem 0 0.25rem" }}>
              <div className="progress-track">
                <div className={`progress-fill ${certInfo.signerCount === 4 ? "progress-fill-green" : "progress-fill-purple"}`}
                  style={{ width: `${(certInfo.signerCount / 4) * 100}%` }} />
              </div>
              <p className="progress-label">
                {certInfo.signerCount}/4 doctors signed
                {!certInfo.hasNeuro && " — Neurologist/Neurosurgeon required"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Submit new certification */}
      <div className="card">
        <h2>Submit New Certification</h2>
        <div className="alert alert-info">Requires: authorized ICU hospital wallet + donor must be Deceased</div>

        <div className="form-group">
          <label>IPFS CID of Encrypted Certification Documents</label>
          <input
            type="text"
            placeholder="QmCertificationDocumentsCID..."
            value={ipfsCid}
            onChange={e => setIpfsCid(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={submitCertification} disabled={loading}>
          {loading ? "Submitting..." : "Submit Certification"}
        </button>
      </div>

      {/* Doctor actions */}
      <div className="card">
        <h2>Doctor Actions</h2>
        <div className="alert alert-info">Connect with a registered doctor wallet to sign or finalize</div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={doctorSign} disabled={loading || !donorAddress.trim()}>
            {loading ? "Signing..." : "Sign as Doctor"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={finalizeCertification}
            disabled={loading || !donorAddress.trim() || !certInfo || certInfo?.signerCount < 4}
          >
            {loading ? "Finalizing..." : "Finalize Certification"}
          </button>
        </div>

        {certInfo && certInfo.signerCount < 4 && (
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.75rem" }}>
            {4 - certInfo.signerCount} more signature{4 - certInfo.signerCount !== 1 ? "s" : ""} needed before finalization
          </p>
        )}
      </div>
    </div>
  );
}
