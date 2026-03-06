pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/bitify.circom";

/*
 * BloodType Compatibility Circuit
 * ─────────────────────────────────────────────────────────────
 * Proves that a donor's blood type is compatible with a
 * recipient's blood type WITHOUT revealing either blood type.
 *
 * Blood Type Encoding (3 bits):
 *   Bit 0 (A antigen):  1 if type A or AB
 *   Bit 1 (B antigen):  1 if type B or AB
 *   Bit 2 (Rh factor):  1 if positive
 *
 *   O-  = 0b000 = 0    O+  = 0b100 = 4
 *   A-  = 0b001 = 1    A+  = 0b101 = 5
 *   B-  = 0b010 = 2    B+  = 0b110 = 6
 *   AB- = 0b011 = 3    AB+ = 0b111 = 7
 *
 * Compatibility Rule:
 *   Donor is compatible with recipient if recipient has ALL
 *   of the donor's antigens (and possibly more).
 *   In bits: for each bit i, if donor has bit[i]=1 then
 *   recipient must also have bit[i]=1.
 *
 *   Constraint per bit: donorBit[i] * (1 - recipientBit[i]) == 0
 *   This means: donor cannot have an antigen the recipient lacks.
 *
 * Private inputs:
 *   donorType     — donor's blood type (0–7)
 *   recipientType — recipient's blood type (0–7)
 *
 * Public inputs:
 *   compatible    — 1 if compatible, must equal 1 for proof to pass
 *
 * What the verifier learns: the blood types ARE compatible
 * What stays private:       the actual blood types of both parties
 */
template BloodType() {
    // ── Private ──────────────────────────────────────────────
    signal input donorType;
    signal input recipientType;

    // ── Public ───────────────────────────────────────────────
    signal input compatible; // must be 1 for valid proof

    // ── Decompose into 3 bits each ───────────────────────────
    component donorBits     = Num2Bits(3);
    component recipientBits = Num2Bits(3);

    donorBits.in     <== donorType;
    recipientBits.in <== recipientType;

    // ── Check compatibility per antigen bit ───────────────────
    // For each antigen: if donor has it (=1), recipient must have it (=1)
    // donorBit * (1 - recipientBit) must equal 0 for all 3 bits

    signal incompatible[3];
    incompatible[0] <== donorBits.out[0] * (1 - recipientBits.out[0]); // A antigen
    incompatible[1] <== donorBits.out[1] * (1 - recipientBits.out[1]); // B antigen
    incompatible[2] <== donorBits.out[2] * (1 - recipientBits.out[2]); // Rh factor

    // All must be 0 for a compatible match
    incompatible[0] === 0;
    incompatible[1] === 0;
    incompatible[2] === 0;

    // Confirm the public output is 1 (compatible)
    compatible === 1;
}

component main { public [compatible] } = BloodType();
