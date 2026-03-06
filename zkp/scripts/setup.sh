#!/bin/bash
# ─────────────────────────────────────────────────────────────
# ZKP Setup Script
# Compiles all circuits and generates proving/verification keys
# Run from: ~/organ-donation-system/zkp/
# ─────────────────────────────────────────────────────────────

set -e
cd "$(dirname "$0")/.."

echo ""
echo "══════════════════════════════════════════"
echo "  Organ Donation ZKP Setup"
echo "══════════════════════════════════════════"

CIRCUITS=("AgeCheck" "DoctorLicense" "BloodType")

# ── Step 1: Compile all circuits ──────────────────────────────
echo ""
echo "Step 1: Compiling circuits..."

for CIRCUIT in "${CIRCUITS[@]}"; do
  echo "  → Compiling $CIRCUIT..."
  circom circuits/$CIRCUIT.circom \
    --r1cs \
    --wasm \
    --sym \
    -o build/ \
    -l node_modules
  echo "    ✓ $CIRCUIT compiled"
done

# ── Step 2: Powers of Tau ceremony (trusted setup) ────────────
echo ""
echo "Step 2: Powers of Tau trusted setup..."

if [ ! -f "build/pot12_final.ptau" ]; then
  snarkjs powersoftau new bn128 12 build/pot12_0000.ptau -v
  snarkjs powersoftau contribute build/pot12_0000.ptau build/pot12_0001.ptau \
    --name="Organ Donation Setup" -e="organ donation zkp entropy" -v
  snarkjs powersoftau prepare phase2 build/pot12_0001.ptau build/pot12_final.ptau -v
  echo "  ✓ Powers of Tau ready"
else
  echo "  ✓ Powers of Tau already exists — skipping"
fi

# ── Step 3: Generate zkeys for each circuit ───────────────────
echo ""
echo "Step 3: Generating circuit zkeys..."

for CIRCUIT in "${CIRCUITS[@]}"; do
  echo "  → Setting up $CIRCUIT..."
  snarkjs groth16 setup \
    build/${CIRCUIT}.r1cs \
    build/pot12_final.ptau \
    keys/${CIRCUIT}_0000.zkey

  snarkjs zkey contribute \
    keys/${CIRCUIT}_0000.zkey \
    keys/${CIRCUIT}_final.zkey \
    --name="Organ Donation Key" \
    -e="${CIRCUIT} entropy contribution"

  snarkjs zkey export verificationkey \
    keys/${CIRCUIT}_final.zkey \
    keys/${CIRCUIT}_verification_key.json

  echo "  ✓ $CIRCUIT keys ready"
done

echo ""
echo "══════════════════════════════════════════"
echo "  Setup complete!"
echo "  Verification keys: zkp/keys/*_verification_key.json"
echo "  WASM files:        zkp/build/*.wasm"
echo "  ZKeys:             zkp/keys/*_final.zkey"
echo "══════════════════════════════════════════"
echo ""
