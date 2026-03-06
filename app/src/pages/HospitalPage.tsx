import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useProgram, getPda } from "../hooks/useProgram";

const ROLES = [
  { label: "ICU",               value: { icu: {} } },
  { label: "Transplant Centre", value: { transplantCenter: {} } },
  { label: "Both",              value: { both: {} } },
];

const SPECS = [
  { label: "Neurologist",    value: { neurologist: {} } },
  { label: "Neurosurgeon",   value: { neurosurgeon: {} } },
  { label: "ICU Specialist", value: { icuSpecialist: {} } },
  { label: "Transplant",     value: { transplant: {} } },
];

export default function HospitalPage() {
  const { publicKey } = useWallet();
  const program = useProgram();

  const [hospitalInfo, setHospitalInfo] = useState<any>(null);
  const [hospitalName, setHospitalName] = useState("Demo Hospital");
  const [hospitalRole, setHospitalRole] = useState(2); // default: Both
  const [doctorWallet, setDoctorWallet] = useState("");
  const [doctorSpec, setDoctorSpec] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!publicKey) {
    return (
      <div className="connect-prompt">
        <h2>Connect your hospital wallet to manage your hospital</h2>
      </div>
    );
  }

  const registryPda  = getPda([Buffer.from("registry")]);
  const hospitalPda  = getPda([Buffer.from("hospital"), publicKey.toBuffer()]);

  const fetchHospital = async () => {
    if (!program) return;
    try {
      const info = await program.account.hospitalAccount.fetch(hospitalPda);
      setHospitalInfo(info);
    } catch {
      setHospitalInfo(null);
    }
  };

  const authorizeHospital = async () => {
    if (!program) return;
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      await program.methods
        .authorizeHospital(hospitalName, ROLES[hospitalRole].value as any)
        .accounts({
          hospitalAccount: hospitalPda,
          registry:        registryPda,
          authority:       publicKey,
          hospitalWallet:  publicKey,
          systemProgram:   SystemProgram.programId,
        })
        .rpc();
      setStatus("Hospital authorized! Click Refresh to see your status.");
      await fetchHospital();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const addDoctor = async () => {
    if (!program) return;
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const doctorPubkey = new PublicKey(doctorWallet.trim());
      const doctorPda    = getPda([Buffer.from("doctor"), doctorPubkey.toBuffer()]);

      await program.methods
        .addDoctor(SPECS[doctorSpec].value as any)
        .accounts({
          doctorAccount: doctorPda,
          hospitalAccount: hospitalPda,
          hospitalWallet: publicKey,
          doctorWallet: doctorPubkey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setStatus(`Doctor added: ${doctorWallet.slice(0, 16)}...`);
      setDoctorWallet("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const revokeDoctor = async (doctorWalletAddress: string) => {
    if (!program) return;
    setLoading(true);
    setError(null);

    try {
      const doctorPubkey  = new PublicKey(doctorWalletAddress);
      const doctorPda     = getPda([Buffer.from("doctor"), doctorPubkey.toBuffer()]);

      await program.methods
        .revokeDoctor()
        .accounts({
          doctorAccount: doctorPda,
          hospitalAccount: hospitalPda,
          hospitalWallet: publicKey,
        })
        .rpc();

      setStatus("Doctor revoked.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = (role: any) => {
    if (role?.icu)              return "ICU";
    if (role?.transplantCenter) return "Transplant Centre";
    if (role?.both)             return "Both";
    return "Unknown";
  };

  return (
    <div>
      {/* Hospital status */}
      <div className="card">
        <h2>My Hospital</h2>
        {hospitalInfo ? (
          <>
            <div className="info-row"><span>Name:</span><span>{hospitalInfo.name}</span></div>
            <div className="info-row"><span>Role:</span><span>{roleLabel(hospitalInfo.role)}</span></div>
            <div className="info-row">
              <span>Status:</span>
              <span>
                {hospitalInfo.isActive
                  ? <span className="badge badge-active">Active</span>
                  : <span className="badge badge-revoked">Inactive</span>}
              </span>
            </div>
          </>
        ) : (
          <div>
            <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Not registered as a hospital yet. Authorize your wallet below.
            </p>
            {status && <div className="alert alert-success">{status}</div>}
            {error  && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label>Hospital Name</label>
              <input type="text" value={hospitalName} onChange={e => setHospitalName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={hospitalRole} onChange={e => setHospitalRole(Number(e.target.value))}>
                {ROLES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn btn-primary" onClick={authorizeHospital} disabled={loading}>
                {loading ? "Authorizing..." : "Authorize as Hospital"}
              </button>
              <button className="btn btn-secondary" onClick={fetchHospital} style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}>
                Check
              </button>
            </div>
          </div>
        )}
        {hospitalInfo && (
          <button className="btn btn-secondary" onClick={fetchHospital} style={{ marginTop: "1rem", padding: "0.35rem 0.9rem", fontSize: "0.8rem" }}>
            Refresh
          </button>
        )}
      </div>

      {/* Add doctor */}
      <div className="card">
        <h2>Add Doctor</h2>

        {status && <div className="alert alert-success">{status}</div>}
        {error  && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label>Doctor Wallet Address</label>
          <input
            type="text"
            placeholder="Doctor's Solana public key"
            value={doctorWallet}
            onChange={e => setDoctorWallet(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Specialization</label>
          <select value={doctorSpec} onChange={e => setDoctorSpec(Number(e.target.value))}>
            {SPECS.map((s, i) => (
              <option key={i} value={i}>{s.label}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={addDoctor} disabled={loading || !doctorWallet.trim()}>
          {loading ? "Adding..." : "Add Doctor"}
        </button>
      </div>

      {/* Revoke doctor */}
      <div className="card">
        <h2>Revoke Doctor</h2>
        <div className="form-group">
          <label>Doctor Wallet Address to Revoke</label>
          <input
            type="text"
            placeholder="Doctor's Solana public key"
            value={doctorWallet}
            onChange={e => setDoctorWallet(e.target.value)}
          />
        </div>
        <button className="btn btn-danger" onClick={() => revokeDoctor(doctorWallet)} disabled={loading || !doctorWallet.trim()}>
          {loading ? "Revoking..." : "Revoke Doctor"}
        </button>
      </div>
    </div>
  );
}
