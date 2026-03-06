pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

/*
 * AgeCheck Circuit
 * ─────────────────────────────────────────────────────────────
 * Proves that a donor is at least MIN_AGE years old
 * WITHOUT revealing their actual date of birth.
 *
 * Private inputs (hidden from blockchain):
 *   birthYear  — the donor's actual birth year (e.g. 1990)
 *
 * Public inputs (visible on blockchain):
 *   currentYear — the current year (e.g. 2025)
 *   minAge      — minimum required age (18)
 *
 * What the verifier learns: donor is >= minAge years old
 * What stays private:       the actual birth year
 */
template AgeCheck() {
    // ── Private ──────────────────────────────────────────────
    signal input birthYear;

    // ── Public ───────────────────────────────────────────────
    signal input currentYear;
    signal input minAge;

    // ── Compute age ──────────────────────────────────────────
    signal age;
    age <== currentYear - birthYear;

    // ── Prove age >= minAge using GreaterEqThan ───────────────
    // 8 bits covers ages 0–255 which is more than enough
    component ageCheck = GreaterEqThan(8);
    ageCheck.in[0] <== age;
    ageCheck.in[1] <== minAge;

    // This constraint fails the proof if age < minAge
    ageCheck.out === 1;
}

component main { public [currentYear, minAge] } = AgeCheck();
