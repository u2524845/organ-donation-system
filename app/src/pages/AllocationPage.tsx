import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useProgram, getPda } from "../hooks/useProgram";

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

export default function AllocationPage() {
  const { publicKey } = useWallet();
  const program = useProgram();

  const [donorAddress,     setDonorAddress]     = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [validatorAddress, setValidatorAddress] = useState("");
  const [selectedOrgan,    setSelectedOrgan]    = useState(0);
  const [proposalInfo,     setProposalInfo]     = useState<any>(null);
  const [status,           setStatus]           = useState<string | null>(null);
  const [error,            setError]            = useState<string | null>(null);
  const [loading,          setLoading]          = useState(false);

  if (!publicKey) {
    return (
      <div className="connect-prompt">
        <span className="connect-prompt-icon">⚖️</span>
        <h2>Connect your wallet to manage organ allocation</h2>
        <p>Use the Connect Wallet button in the top right</p>
      </div>
    );
  }

  const registryPda = getPda([Buffer.from("registry")]);

  const getDonorPda = (addr: string) => {
    const key = new PublicKey(addr.trim());
    return { key, pda: getPda([Buffer.from("donor"), key.toBuffer()]) };
  };

  const getProposalPda = (donorPda: PublicKey, organBit: number) =>
    getPda([Buffer.from("allocation"), donorPda.toBuffer(), Buffer.from([organBit])]);

  const fetchProposal = async () => {
    if (!program || !donorAddress.trim()) return;
    try {
      const { pda: donorPda } = getDonorPda(donorAddress);
      const organ = ORGANS[selectedOrgan].bit;
      const proposalPda = getProposalPda(donorPda, organ);
      const info = await program.account.allocationProposal.fetch(proposalPda);
      setProposalInfo(info);
      setError(null);
    } catch {
      setProposalInfo(null);
      setError("No proposal found for this donor + organ combination.");
    }
  };

  const addValidator = async () => {
    if (!program || !validatorAddress.trim()) return;
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const valPubkey    = new PublicKey(validatorAddress.trim());
      const validatorPda = getPda([Buffer.from("validator"), valPubkey.toBuffer()]);
      await program.methods
        .addValidator()
        .accounts({
          validatorAccount: validatorPda,
          registry:         registryPda,
          authority:        publicKey,
          validatorWallet:  valPubkey,
          systemProgram:    SystemProgram.programId,
        })
        .rpc();
      setStatus(`Validator added: ${validatorAddress.slice(0, 16)}...`);
      setValidatorAddress("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const proposeAllocation = async () => {
    if (!program) return;
    if (!donorAddress.trim())     { setError("Enter donor wallet address"); return; }
    if (!recipientAddress.trim()) { setError("Enter recipient hospital address"); return; }

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const { pda: donorPda }   = getDonorPda(donorAddress);
      const certPda             = getPda([Buffer.from("certification"), donorPda.toBuffer()]);
      const recipientPubkey     = new PublicKey(recipientAddress.trim());
      const recipientHospitalPda = getPda([Buffer.from("hospital"), recipientPubkey.toBuffer()]);
      const organ               = ORGANS[selectedOrgan].bit;
      const proposalPda         = getProposalPda(donorPda, organ);

      await program.methods
        .proposeAllocation(organ)
        .accounts({
          proposal: proposalPda,
          registry: registryPda,
          certification: certPda,
          donorAccount: donorPda,
          recipientHospital: recipientHospitalPda,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setStatus(`Allocation proposed: ${ORGANS[selectedOrgan].label} → recipient hospital`);
      await fetchProposal();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const validatorApprove = async () => {
    if (!program || !donorAddress.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const { pda: donorPda } = getDonorPda(donorAddress);
      const organ             = ORGANS[selectedOrgan].bit;
      const proposalPda       = getProposalPda(donorPda, organ);
      const validatorPda      = getPda([Buffer.from("validator"), publicKey.toBuffer()]);

      await program.methods
        .validatorApprove()
        .accounts({
          proposal: proposalPda,
          validatorAccount: validatorPda,
          validatorWallet: publicKey,
        })
        .rpc();

      setStatus("Vote recorded successfully.");
      await fetchProposal();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const finalizeAllocation = async () => {
    if (!program || !donorAddress.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const { pda: donorPda } = getDonorPda(donorAddress);
      const organ             = ORGANS[selectedOrgan].bit;
      const proposalPda       = getProposalPda(donorPda, organ);

      await program.methods
        .finalizeAllocation()
        .accounts({
          proposal: proposalPda,
          registry: registryPda,
          authority: publicKey,
        })
        .rpc();

      setStatus("Allocation FINALIZED. Immutable record locked on-chain.");
      await fetchProposal();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const proposalStatusBadge = (s: any) => {
    if (s?.proposed) return <span className="badge badge-proposed">Proposed</span>;
    if (s?.approved) return <span className="badge badge-approved">Approved ✓</span>;
    return null;
  };

  return (
    <div>
      {/* Lookup */}
      <div className="card">
        <h2>Organ Allocation Governance</h2>

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

        <div className="form-group">
          <label>Organ</label>
          <select value={selectedOrgan} onChange={e => setSelectedOrgan(Number(e.target.value))}>
            {ORGANS.map((o, i) => (
              <option key={i} value={i}>{o.label} (bit {o.bit})</option>
            ))}
          </select>
        </div>

        <button className="btn btn-secondary" onClick={fetchProposal} style={{ marginBottom: "1rem" }}>
          Look Up Proposal
        </button>

        {/* Proposal status */}
        {proposalInfo && (
          <div style={{ padding: "1rem", background: "#0f1117", borderRadius: "8px" }}>
            <div className="info-row"><span>Status:</span><span>{proposalStatusBadge(proposalInfo.status)}</span></div>
            <div className="info-row"><span>Organ:</span><span>{ORGANS.find(o => o.bit === proposalInfo.organBit)?.label ?? proposalInfo.organBit}</span></div>
            <div className="info-row"><span>Validator votes:</span><span>{proposalInfo.validatorCount} / 3 required</span></div>

            {/* Quorum progress bar */}
            <div style={{ margin: "0.75rem 0 0.25rem" }}>
              <div style={{ background: "#2d3148", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                <div style={{
                  background: proposalInfo.validatorCount >= 3 ? "#4ade80" : "#7c6aff",
                  height: "100%",
                  width: `${Math.min((proposalInfo.validatorCount / 3) * 100, 100)}%`,
                  transition: "width 0.3s"
                }} />
              </div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.3rem" }}>
                {proposalInfo.validatorCount}/3 validator approvals
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add validator */}
      <div className="card">
        <h2>Add Validator (Authority Only)</h2>
        <div className="form-group">
          <label>Validator Wallet Address</label>
          <input
            type="text"
            placeholder="Validator's Solana public key"
            value={validatorAddress}
            onChange={e => setValidatorAddress(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={addValidator} disabled={loading || !validatorAddress.trim()}>
          {loading ? "Adding..." : "Add Validator"}
        </button>
      </div>

      {/* Propose allocation */}
      <div className="card">
        <h2>Propose Allocation</h2>
        <div className="alert alert-info">Requires: Ministry/authority wallet + certified brain death + donor consent</div>

        <div className="form-group">
          <label>Recipient Hospital Wallet Address</label>
          <input
            type="text"
            placeholder="Transplant centre's Solana public key"
            value={recipientAddress}
            onChange={e => setRecipientAddress(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={proposeAllocation} disabled={loading}>
          {loading ? "Proposing..." : "Propose Allocation"}
        </button>
      </div>

      {/* Validator + finalize actions */}
      <div className="card">
        <h2>Validator Actions</h2>
        <div className="alert alert-info">Connect with a registered validator wallet to vote</div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={validatorApprove} disabled={loading || !donorAddress.trim()}>
            {loading ? "Voting..." : "Approve as Validator"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={finalizeAllocation}
            disabled={loading || !donorAddress.trim() || !proposalInfo || proposalInfo?.validatorCount < 3}
          >
            {loading ? "Finalizing..." : "Finalize Allocation"}
          </button>
        </div>

        {proposalInfo && proposalInfo.validatorCount < 3 && (
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.75rem" }}>
            {3 - proposalInfo.validatorCount} more approval{3 - proposalInfo.validatorCount !== 1 ? "s" : ""} needed before finalization
          </p>
        )}
      </div>
    </div>
  );
}
