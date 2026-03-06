pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

/*
 * DoctorLicense Circuit
 * ─────────────────────────────────────────────────────────────
 * Proves that a doctor holds a valid license registered on-chain
 * WITHOUT revealing the actual license number.
 *
 * How it works:
 *   When a doctor is registered, the Ministry stores a Poseidon
 *   hash of their license number on-chain (licenseHash).
 *   The doctor proves they know the preimage (licenseNumber)
 *   that produces that hash — without revealing the number itself.
 *
 * Private inputs (hidden from blockchain):
 *   licenseNumber — the doctor's actual license number
 *
 * Public inputs (visible on blockchain):
 *   licenseHash   — Poseidon(licenseNumber) stored on-chain
 *
 * What the verifier learns: doctor knows a valid license
 * What stays private:       the actual license number
 *
 * Poseidon is used because it is ZKP-friendly (very cheap in circuits)
 * vs SHA-256 which requires ~20,000 constraints.
 */
template DoctorLicense() {
    // ── Private ──────────────────────────────────────────────
    signal input licenseNumber;

    // ── Public ───────────────────────────────────────────────
    signal input licenseHash;

    // ── Compute Poseidon hash of license ─────────────────────
    component hasher = Poseidon(1);
    hasher.inputs[0] <== licenseNumber;

    // ── Verify hash matches the registered on-chain hash ──────
    // Proof is invalid if licenseNumber does not produce licenseHash
    hasher.out === licenseHash;
}

component main { public [licenseHash] } = DoctorLicense();
