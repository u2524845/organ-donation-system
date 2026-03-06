// ─────────────────────────────────────────────────────────────
// ZKP Proof Test Script
// Generates and verifies proofs for all 3 circuits
// Run: node scripts/test_proofs.js
// ─────────────────────────────────────────────────────────────

const snarkjs = require("snarkjs");
const path    = require("path");
const fs      = require("fs");

// ── Helpers ───────────────────────────────────────────────────

const wasmPath = (name) =>
  path.join(__dirname, `../build/${name}_js/${name}.wasm`);

const zkeyPath = (name) =>
  path.join(__dirname, `../keys/${name}_final.zkey`);

const vkeyPath = (name) =>
  path.join(__dirname, `../keys/${name}_verification_key.json`);

async function proveAndVerify(circuitName, input) {
  console.log(`\n  Testing ${circuitName}...`);
  console.log(`  Input: ${JSON.stringify(input)}`);

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    wasmPath(circuitName),
    zkeyPath(circuitName)
  );

  const vkey = JSON.parse(fs.readFileSync(vkeyPath(circuitName)));
  const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

  if (valid) {
    console.log(`  ✓ VALID proof — public signals: [${publicSignals}]`);
  } else {
    console.log(`  ✗ INVALID proof`);
    process.exit(1);
  }

  return { proof, publicSignals };
}

async function testInvalidProof(circuitName, input, reason) {
  console.log(`\n  Testing REJECTION: ${reason}...`);
  try {
    await snarkjs.groth16.fullProve(
      input,
      wasmPath(circuitName),
      zkeyPath(circuitName)
    );
    console.log(`  ✗ Should have been rejected`);
    process.exit(1);
  } catch (e) {
    console.log(`  ✓ Correctly rejected: ${e.message.slice(0, 60)}`);
  }
}

// ── Main ──────────────────────────────────────────────────────

async function main() {
  console.log("\n══════════════════════════════════════════");
  console.log("  ZKP Proof Tests — Organ Donation System");
  console.log("══════════════════════════════════════════");

  // ── Circuit 1: AgeCheck ─────────────────────────────────────
  console.log("\n── Circuit 1: AgeCheck ──");

  // Valid: born 1990, current year 2025 → age 35 >= 18 ✓
  await proveAndVerify("AgeCheck", {
    birthYear:   "1990",
    currentYear: "2025",
    minAge:      "18",
  });

  // Valid: born 2006, current year 2025 → age 19 >= 18 ✓
  await proveAndVerify("AgeCheck", {
    birthYear:   "2006",
    currentYear: "2025",
    minAge:      "18",
  });

  // Invalid: born 2010 → age 15 < 18 ✗
  await testInvalidProof(
    "AgeCheck",
    { birthYear: "2010", currentYear: "2025", minAge: "18" },
    "Donor is underage (15 < 18)"
  );

  // ── Circuit 2: DoctorLicense ────────────────────────────────
  console.log("\n── Circuit 2: DoctorLicense ──");
  console.log("  Note: Using simplified numeric hash for testing");
  console.log("  Production would use actual Poseidon hash");

  // The on-chain hash would be Poseidon(licenseNumber)
  // For testing, we need to compute Poseidon(12345) first
  // We demonstrate with a known valid pair
  const { buildPoseidon } = require("circomlibjs");
  const poseidon = await buildPoseidon();

  const licenseNumber = BigInt("123456789");
  const hashRaw       = poseidon([licenseNumber]);
  const licenseHash   = poseidon.F.toString(hashRaw);

  console.log(`\n  License Number: ${licenseNumber}`);
  console.log(`  Poseidon Hash:  ${licenseHash.slice(0, 20)}...`);

  await proveAndVerify("DoctorLicense", {
    licenseNumber: licenseNumber.toString(),
    licenseHash:   licenseHash,
  });

  // Wrong license number — hash won't match
  await testInvalidProof(
    "DoctorLicense",
    { licenseNumber: "999999999", licenseHash: licenseHash },
    "Wrong license number (hash mismatch)"
  );

  // ── Circuit 3: BloodType ────────────────────────────────────
  console.log("\n── Circuit 3: BloodType Compatibility ──");
  console.log("  Encoding: O-=0, A-=1, B-=2, AB-=3, O+=4, A+=5, B+=6, AB+=7");

  // O- donor (0) can give to AB+ recipient (7) ✓
  await proveAndVerify("BloodType", {
    donorType:     "0",  // O- (universal donor)
    recipientType: "7",  // AB+ (universal recipient)
    compatible:    "1",
  });

  // A+ donor (5) can give to AB+ recipient (7) ✓
  await proveAndVerify("BloodType", {
    donorType:     "5",  // A+
    recipientType: "7",  // AB+
    compatible:    "1",
  });

  // A+ donor (5) CANNOT give to O- recipient (0) ✗
  await testInvalidProof(
    "BloodType",
    { donorType: "5", recipientType: "0", compatible: "1" },
    "A+ cannot donate to O- (incompatible blood types)"
  );

  // B- donor (2) CANNOT give to A- recipient (1) ✗
  await testInvalidProof(
    "BloodType",
    { donorType: "2", recipientType: "1", compatible: "1" },
    "B- cannot donate to A- (incompatible blood types)"
  );

  console.log("\n══════════════════════════════════════════");
  console.log("  All ZKP tests passed! ✅");
  console.log("══════════════════════════════════════════\n");
}

main().catch(console.error);
