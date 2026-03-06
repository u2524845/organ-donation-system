/**
 * Devnet Setup Script — Organ Donation System
 *
 * Sets up the full flow on devnet using generated test keypairs:
 * - Authorizes hospital (your Phantom wallet)
 * - Generates 4 doctor keypairs + adds them
 * - Marks donor as deceased
 * - Submits brain death certification
 * - 4 doctors sign certification
 * - Finalizes certification
 * - Adds 3 validator keypairs
 * - Proposes organ allocation
 * - 3 validators approve
 * - Finalizes allocation
 *
 * Usage:
 *   node scripts/setup-devnet.js <PHANTOM_WALLET_ADDRESS> <DONOR_WALLET_ADDRESS>
 */

const anchor = require("@coral-xyz/anchor");
const { Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

// ── Config ─────────────────────────────────────────────────────────────────
const PROGRAM_ID    = new PublicKey("7DtCGYSvSrpDJDEegvzjZKWibD6zi2rvzxPdYZiAVuvN");
const CONNECTION    = new Connection("https://api.devnet.solana.com", "confirmed");
const IDL_PATH      = path.join(__dirname, "../target/idl/organ_donation_system.json");
const WALLET_PATH   = path.join(process.env.HOME, ".config/solana/id.json");

// ── Helpers ─────────────────────────────────────────────────────────────────
function getPda(seeds) {
  return PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)[0];
}

function loadWallet() {
  const raw = JSON.parse(fs.readFileSync(WALLET_PATH, "utf-8"));
  return Keypair.fromSecretKey(new Uint8Array(raw));
}

async function airdrop(pubkey, amount = 0.1) {
  try {
    const sig = await CONNECTION.requestAirdrop(pubkey, amount * LAMPORTS_PER_SOL);
    await CONNECTION.confirmTransaction(sig, "confirmed");
    console.log(`  Airdropped ${amount} SOL → ${pubkey.toBase58().slice(0,8)}...`);
  } catch {
    console.log(`  Airdrop skipped (rate limit) for ${pubkey.toBase58().slice(0,8)}...`);
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: node setup-devnet.js <PHANTOM_WALLET> <DONOR_WALLET>");
    console.error("Example: node setup-devnet.js 7xKX...abc 9mPQ...xyz");
    process.exit(1);
  }

  const phantomWallet = new PublicKey(args[0]);
  const donorWallet   = new PublicKey(args[1]);

  console.log("\n=== Organ Donation System — Devnet Setup ===\n");
  console.log("Authority (CLI wallet):   ", loadWallet().publicKey.toBase58());
  console.log("Hospital (Phantom wallet):", phantomWallet.toBase58());
  console.log("Donor wallet:             ", donorWallet.toBase58());

  // Load CLI wallet as authority
  const authority = loadWallet();
  const provider   = new anchor.AnchorProvider(CONNECTION, new anchor.Wallet(authority), { commitment: "confirmed" });
  const idl        = JSON.parse(fs.readFileSync(IDL_PATH, "utf-8"));
  const program    = new anchor.Program(idl, provider);

  // PDAs
  const registryPda  = getPda([Buffer.from("registry")]);
  const hospitalPda  = getPda([Buffer.from("hospital"), phantomWallet.toBuffer()]);
  const donorPda     = getPda([Buffer.from("donor"),    donorWallet.toBuffer()]);
  const certPda      = getPda([Buffer.from("certification"), donorPda.toBuffer()]);

  // ── Step 1: Authorize Phantom wallet as hospital (Both = ICU + Transplant) ──
  console.log("\n[1/8] Authorizing hospital...");
  try {
    await program.methods
      .authorizeHospital("Demo Hospital", { both: {} })
      .accounts({
        hospitalAccount: hospitalPda,
        registry:        registryPda,
        authority:       authority.publicKey,
        hospitalWallet:  phantomWallet,
        systemProgram:   SystemProgram.programId,
      })
      .rpc();
    console.log("  Hospital authorized:", phantomWallet.toBase58().slice(0,8), "...");
  } catch (e) {
    if (e.message?.includes("already in use")) {
      console.log("  Hospital already authorized — skipping");
    } else {
      console.error("  Error:", e.message);
    }
  }

  // ── Step 2: Generate 4 doctor keypairs and register them ──────────────────
  console.log("\n[2/8] Creating 4 doctor keypairs...");
  const specs = [
    { name: "Neurologist",    spec: { neurologist: {} } },
    { name: "Neurosurgeon",   spec: { neurosurgeon: {} } },
    { name: "ICU Specialist", spec: { icuSpecialist: {} } },
    { name: "Transplant",     spec: { transplant: {} } },
  ];
  const doctors = specs.map(s => ({ keypair: Keypair.generate(), ...s }));

  // Airdrop to all doctors
  for (const doc of doctors) {
    await airdrop(doc.keypair.publicKey, 0.05);
    await sleep(500);
  }

  // Add each doctor under the authority (acting as hospital for setup)
  for (const doc of doctors) {
    const doctorPda = getPda([Buffer.from("doctor"), doc.keypair.publicKey.toBuffer()]);
    try {
      // Authority adds doctor under the hospital
      await program.methods
        .addDoctor(doc.spec)
        .accounts({
          doctorAccount:   doctorPda,
          hospitalAccount: hospitalPda,
          hospitalWallet:  authority.publicKey,
          doctorWallet:    doc.keypair.publicKey,
          systemProgram:   SystemProgram.programId,
        })
        .rpc();
      console.log(`  Added ${doc.name}: ${doc.keypair.publicKey.toBase58().slice(0,8)}...`);
    } catch (e) {
      if (e.message?.includes("already in use")) {
        console.log(`  ${doc.name} already added — skipping`);
      } else {
        console.error(`  Error adding ${doc.name}:`, e.message);
      }
    }
    await sleep(500);
  }

  // Save doctor keypairs for reference
  const doctorKeysFile = path.join(__dirname, "doctor-keys.json");
  fs.writeFileSync(doctorKeysFile, JSON.stringify(
    doctors.map(d => ({ name: d.name, publicKey: d.keypair.publicKey.toBase58(), secretKey: Array.from(d.keypair.secretKey) })),
    null, 2
  ));
  console.log("  Doctor keys saved to scripts/doctor-keys.json");

  // ── Step 3: Mark donor as deceased ────────────────────────────────────────
  console.log("\n[3/8] Marking donor as deceased...");
  try {
    await program.methods
      .markDeceased()
      .accounts({
        donorAccount: donorPda,
        registry:     registryPda,
        authority:    authority.publicKey,
      })
      .rpc();
    console.log("  Donor marked as deceased");
  } catch (e) {
    if (e.message?.includes("already")) {
      console.log("  Donor already deceased — skipping");
    } else {
      console.error("  Error:", e.message);
    }
  }

  // ── Step 4: Submit brain death certification ───────────────────────────────
  console.log("\n[4/8] Submitting brain death certification...");
  const certCid = "QmTestCertificationCID123456789"; // test CID
  try {
    await program.methods
      .submitCertification(certCid)
      .accounts({
        certification:   certPda,
        hospitalAccount: hospitalPda,
        donorAccount:    donorPda,
        hospitalWallet:  authority.publicKey,
        systemProgram:   SystemProgram.programId,
      })
      .rpc();
    console.log("  Certification submitted, CID:", certCid);
  } catch (e) {
    if (e.message?.includes("already in use")) {
      console.log("  Certification already submitted — skipping");
    } else {
      console.error("  Error:", e.message);
    }
  }

  // ── Step 5: 4 doctors sign ────────────────────────────────────────────────
  console.log("\n[5/8] Collecting 4 doctor signatures...");
  for (const doc of doctors) {
    const doctorPda     = getPda([Buffer.from("doctor"), doc.keypair.publicKey.toBuffer()]);
    const doctorProvider = new anchor.AnchorProvider(
      CONNECTION,
      new anchor.Wallet(doc.keypair),
      { commitment: "confirmed" }
    );
    const doctorProgram  = new anchor.Program(idl, doctorProvider);

    try {
      await doctorProgram.methods
        .doctorSign()
        .accounts({
          certification: certPda,
          doctorAccount: doctorPda,
          doctorWallet:  doc.keypair.publicKey,
        })
        .rpc();
      console.log(`  ${doc.name} signed`);
    } catch (e) {
      console.error(`  Error: ${doc.name} signing:`, e.message);
    }
    await sleep(500);
  }

  // ── Step 6: Finalize certification ────────────────────────────────────────
  console.log("\n[6/8] Finalizing brain death certification...");
  try {
    await program.methods
      .finalizeCertification()
      .accounts({
        certification:   certPda,
        hospitalAccount: hospitalPda,
        hospitalWallet:  authority.publicKey,
      })
      .rpc();
    console.log("  Certification FINALIZED — brain death certified on-chain");
  } catch (e) {
    console.error("  Error:", e.message);
  }

  // ── Step 7: Add 3 validators ──────────────────────────────────────────────
  console.log("\n[7/8] Adding 3 validators...");
  const validators = [Keypair.generate(), Keypair.generate(), Keypair.generate()];

  for (const val of validators) {
    await airdrop(val.publicKey, 0.05);
    await sleep(500);
    const validatorPda = getPda([Buffer.from("validator"), val.publicKey.toBuffer()]);
    try {
      await program.methods
        .addValidator()
        .accounts({
          validatorAccount: validatorPda,
          registry:         registryPda,
          authority:        authority.publicKey,
          validatorWallet:  val.publicKey,
          systemProgram:    SystemProgram.programId,
        })
        .rpc();
      console.log(`  Validator added: ${val.publicKey.toBase58().slice(0,8)}...`);
    } catch (e) {
      console.error("  Error adding validator:", e.message);
    }
    await sleep(500);
  }

  // Save validator keys
  const valKeysFile = path.join(__dirname, "validator-keys.json");
  fs.writeFileSync(valKeysFile, JSON.stringify(
    validators.map(v => ({ publicKey: v.publicKey.toBase58(), secretKey: Array.from(v.secretKey) })),
    null, 2
  ));
  console.log("  Validator keys saved to scripts/validator-keys.json");

  // ── Step 8: Propose allocation + validator votes ──────────────────────────
  console.log("\n[8/8] Proposing organ allocation (Heart)...");
  const organBit        = 1; // Heart = bit 0 = value 1
  const proposalPda     = getPda([Buffer.from("allocation"), donorPda.toBuffer(), Buffer.from([organBit])]);
  const recipientHospPda = hospitalPda; // same hospital for demo

  try {
    await program.methods
      .proposeAllocation(organBit)
      .accounts({
        proposal:          proposalPda,
        registry:          registryPda,
        certification:     certPda,
        donorAccount:      donorPda,
        recipientHospital: recipientHospPda,
        authority:         authority.publicKey,
        systemProgram:     SystemProgram.programId,
      })
      .rpc();
    console.log("  Allocation proposed: Heart → Demo Hospital");
  } catch (e) {
    if (e.message?.includes("already in use")) {
      console.log("  Allocation already proposed — skipping");
    } else {
      console.error("  Error:", e.message);
    }
  }

  // Validators vote
  for (const val of validators) {
    const validatorPda   = getPda([Buffer.from("validator"), val.publicKey.toBuffer()]);
    const valProvider    = new anchor.AnchorProvider(CONNECTION, new anchor.Wallet(val), { commitment: "confirmed" });
    const valProgram     = new anchor.Program(idl, valProvider);

    try {
      await valProgram.methods
        .validatorApprove()
        .accounts({
          proposal:         proposalPda,
          validatorAccount: validatorPda,
          validatorWallet:  val.publicKey,
        })
        .rpc();
      console.log(`  Validator ${val.publicKey.toBase58().slice(0,8)}... approved`);
    } catch (e) {
      console.error("  Error validator vote:", e.message);
    }
    await sleep(500);
  }

  // Finalize allocation
  try {
    await program.methods
      .finalizeAllocation()
      .accounts({
        proposal:  proposalPda,
        registry:  registryPda,
        authority: authority.publicKey,
      })
      .rpc();
    console.log("  Allocation FINALIZED — immutable record on-chain");
  } catch (e) {
    console.error("  Error finalizing allocation:", e.message);
  }

  console.log("\n=== Setup Complete ===");
  console.log("\nYou can now view results in the browser at http://localhost:5173");
  console.log("Hospital page: connect Phantom — click Check to see hospital status");
  console.log("Certification: paste your donor wallet address → Look Up Certification");
  console.log("Allocation:    paste your donor wallet address → Look Up Proposal\n");
}

main().catch(console.error);
