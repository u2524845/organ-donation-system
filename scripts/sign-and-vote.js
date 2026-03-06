/**
 * Sign & Vote Script — Organ Donation System
 *
 * Uses saved keypairs to:
 * - Have 4 doctors sign the brain death certification
 * - Add 3 validators
 * - Have 3 validators vote to approve the allocation proposal
 *
 * Usage:
 *   node scripts/sign-and-vote.js <DONOR_WALLET_ADDRESS> <ORGAN_BIT>
 *
 * Example (Heart = bit 1):
 *   node scripts/sign-and-vote.js 71HmyVL4cP3aM53pMCfDkXi16F6nEVAGt4hsFpLf8DLm 1
 */

const anchor = require("@coral-xyz/anchor");
const { Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const fs   = require("fs");
const path = require("path");

const PROGRAM_ID  = new PublicKey("7DtCGYSvSrpDJDEegvzjZKWibD6zi2rvzxPdYZiAVuvN");
const CONNECTION  = new Connection("https://api.devnet.solana.com", "confirmed");
const IDL_PATH    = path.join(__dirname, "../target/idl/organ_donation_system.json");
const WALLET_PATH = path.join(process.env.HOME, ".config/solana/id.json");
const DOC_KEYS    = path.join(__dirname, "doctor-keys.json");
const VAL_KEYS    = path.join(__dirname, "validator-keys.json");

function getPda(seeds) {
  return PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)[0];
}

function loadWallet() {
  return Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(WALLET_PATH))));
}

function makeProgram(keypair) {
  const idl      = JSON.parse(fs.readFileSync(IDL_PATH, "utf-8"));
  const provider = new anchor.AnchorProvider(CONNECTION, new anchor.Wallet(keypair), { commitment: "confirmed" });
  return new anchor.Program(idl, provider);
}

async function airdrop(pubkey, amount = 0.05) {
  try {
    const sig = await CONNECTION.requestAirdrop(pubkey, amount * LAMPORTS_PER_SOL);
    await CONNECTION.confirmTransaction(sig, "confirmed");
    console.log(`  Airdropped ${amount} SOL → ${pubkey.toBase58().slice(0,8)}...`);
  } catch {
    console.log(`  Airdrop skipped (rate limit) for ${pubkey.toBase58().slice(0,8)}...`);
  }
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: node sign-and-vote.js <DONOR_WALLET> <ORGAN_BIT>");
    console.error("Example: node sign-and-vote.js 71HmyV...8DLm 1");
    process.exit(1);
  }

  const donorWallet = new PublicKey(args[0]);
  const organBit    = Number(args[1]);

  console.log("\n=== Sign & Vote — Devnet ===");
  console.log("Donor wallet:", donorWallet.toBase58());
  console.log("Organ bit:   ", organBit);

  const authority   = loadWallet();
  const authProgram = makeProgram(authority);

  const registryPda = getPda([Buffer.from("registry")]);
  const donorPda    = getPda([Buffer.from("donor"),         donorWallet.toBuffer()]);
  const certPda     = getPda([Buffer.from("certification"), donorPda.toBuffer()]);
  const proposalPda = getPda([Buffer.from("allocation"),    donorPda.toBuffer(), Buffer.from([organBit])]);

  // ── 1. Doctor signatures ─────────────────────────────────────────────────
  console.log("\n[1/3] Having 4 doctors sign the certification...");
  const doctorData = JSON.parse(fs.readFileSync(DOC_KEYS, "utf-8"));

  for (const doc of doctorData) {
    const keypair   = Keypair.fromSecretKey(new Uint8Array(doc.secretKey));
    const doctorPda = getPda([Buffer.from("doctor"), keypair.publicKey.toBuffer()]);
    const prog      = makeProgram(keypair);

    // Airdrop if needed
    const bal = await CONNECTION.getBalance(keypair.publicKey);
    if (bal < 0.01 * LAMPORTS_PER_SOL) {
      await airdrop(keypair.publicKey);
      await sleep(1000);
    }

    try {
      await prog.methods
        .doctorSign()
        .accounts({ certification: certPda, doctorAccount: doctorPda, doctorWallet: keypair.publicKey })
        .rpc();
      console.log(`  ${doc.name} signed ✓`);
    } catch (e) {
      console.log(`  ${doc.name}: ${e.message?.slice(0, 60)}`);
    }
    await sleep(800);
  }

  // ── 2. Add validators ────────────────────────────────────────────────────
  console.log("\n[2/3] Adding 3 validators...");
  let validators = [];

  if (fs.existsSync(VAL_KEYS)) {
    const saved = JSON.parse(fs.readFileSync(VAL_KEYS, "utf-8"));
    validators  = saved.map(v => Keypair.fromSecretKey(new Uint8Array(v.secretKey)));
    console.log("  Loaded existing validator keypairs");
  } else {
    validators = [Keypair.generate(), Keypair.generate(), Keypair.generate()];
    fs.writeFileSync(VAL_KEYS, JSON.stringify(
      validators.map(v => ({ publicKey: v.publicKey.toBase58(), secretKey: Array.from(v.secretKey) })),
      null, 2
    ));
    console.log("  Generated new validator keypairs, saved to scripts/validator-keys.json");
  }

  for (const val of validators) {
    const bal = await CONNECTION.getBalance(val.publicKey);
    if (bal < 0.01 * LAMPORTS_PER_SOL) {
      await airdrop(val.publicKey);
      await sleep(1000);
    }

    const validatorPda = getPda([Buffer.from("validator"), val.publicKey.toBuffer()]);
    try {
      await authProgram.methods
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
      if (e.message?.includes("already in use")) {
        console.log(`  Validator already exists — skipping`);
      } else {
        console.log(`  Add validator: ${e.message?.slice(0, 60)}`);
      }
    }
    await sleep(800);
  }

  // ── 3. Validators vote ───────────────────────────────────────────────────
  console.log("\n[3/3] Validators voting to approve allocation...");
  for (const val of validators) {
    const validatorPda = getPda([Buffer.from("validator"), val.publicKey.toBuffer()]);
    const prog         = makeProgram(val);

    try {
      await prog.methods
        .validatorApprove()
        .accounts({ proposal: proposalPda, validatorAccount: validatorPda, validatorWallet: val.publicKey })
        .rpc();
      console.log(`  Validator ${val.publicKey.toBase58().slice(0,8)}... approved ✓`);
    } catch (e) {
      console.log(`  Vote: ${e.message?.slice(0, 60)}`);
    }
    await sleep(800);
  }

  console.log("\n=== Done ===");
  console.log("Now in the browser:");
  console.log("1. Certification page → Finalize Certification");
  console.log("2. Allocation page    → Finalize Allocation");
}

main().catch(console.error);
