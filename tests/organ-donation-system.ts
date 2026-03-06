import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { OrganDonationSystem } from "../target/types/organ_donation_system";
import { assert } from "chai";

describe("organ-donation-system", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .OrganDonationSystem as Program<OrganDonationSystem>;
  const connection = provider.connection;

  // ── Wallets ───────────────────────────────────────────────────────────────
  const ministry = provider.wallet as anchor.Wallet; // default local wallet = Ministry
  const hospital1Kp = anchor.web3.Keypair.generate(); // ICU hospital
  const hospital2Kp = anchor.web3.Keypair.generate(); // Transplant centre
  const doctor1Kp = anchor.web3.Keypair.generate();   // Neurologist
  const doctor2Kp = anchor.web3.Keypair.generate();   // Neurosurgeon
  const doctor3Kp = anchor.web3.Keypair.generate();   // ICU Specialist
  const doctor4Kp = anchor.web3.Keypair.generate();   // ICU Specialist
  const donor1Kp = anchor.web3.Keypair.generate();    // revoke consent test
  const donor2Kp = anchor.web3.Keypair.generate();    // full lifecycle test
  const validator1Kp = anchor.web3.Keypair.generate();
  const validator2Kp = anchor.web3.Keypair.generate();
  const validator3Kp = anchor.web3.Keypair.generate();

  // ── PDA Helpers ───────────────────────────────────────────────────────────
  const pda = (seeds: Buffer[]) =>
    anchor.web3.PublicKey.findProgramAddressSync(seeds, program.programId)[0];

  const registryPda   = pda([Buffer.from("registry")]);
  const donor1Pda     = pda([Buffer.from("donor"),     donor1Kp.publicKey.toBuffer()]);
  const donor2Pda     = pda([Buffer.from("donor"),     donor2Kp.publicKey.toBuffer()]);
  const hospital1Pda  = pda([Buffer.from("hospital"),  hospital1Kp.publicKey.toBuffer()]);
  const hospital2Pda  = pda([Buffer.from("hospital"),  hospital2Kp.publicKey.toBuffer()]);
  const doctor1Pda    = pda([Buffer.from("doctor"),    doctor1Kp.publicKey.toBuffer()]);
  const doctor2Pda    = pda([Buffer.from("doctor"),    doctor2Kp.publicKey.toBuffer()]);
  const doctor3Pda    = pda([Buffer.from("doctor"),    doctor3Kp.publicKey.toBuffer()]);
  const doctor4Pda    = pda([Buffer.from("doctor"),    doctor4Kp.publicKey.toBuffer()]);
  const certPda       = pda([Buffer.from("certification"), donor2Pda.toBuffer()]);
  const validator1Pda = pda([Buffer.from("validator"), validator1Kp.publicKey.toBuffer()]);
  const validator2Pda = pda([Buffer.from("validator"), validator2Kp.publicKey.toBuffer()]);
  const validator3Pda = pda([Buffer.from("validator"), validator3Kp.publicKey.toBuffer()]);

  const ORGAN_HEART = 1; // bit 0
  const proposalPda = pda([
    Buffer.from("allocation"),
    donor2Pda.toBuffer(),
    Buffer.from([ORGAN_HEART]),
  ]);

  // ── Airdrop Helper ────────────────────────────────────────────────────────
  const airdrop = async (pubkey: anchor.web3.PublicKey, sol = 2) => {
    const sig = await connection.requestAirdrop(
      pubkey,
      sol * anchor.web3.LAMPORTS_PER_SOL
    );
    const latest = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature: sig,
      blockhash: latest.blockhash,
      lastValidBlockHeight: latest.lastValidBlockHeight,
    });
  };

  // ── Fund all keypairs before tests run ───────────────────────────────────
  before(async () => {
    await Promise.all([
      airdrop(hospital1Kp.publicKey),
      airdrop(hospital2Kp.publicKey),
      airdrop(donor1Kp.publicKey),
      airdrop(donor2Kp.publicKey),
      airdrop(validator1Kp.publicKey),
      airdrop(validator2Kp.publicKey),
      airdrop(validator3Kp.publicKey),
    ]);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PROGRAM 1 — DONOR REGISTRY
  // ══════════════════════════════════════════════════════════════════════════

  describe("Program 1 — Donor Registry", () => {

    it("Ministry initializes the global registry", async () => {
      await program.methods
        .initializeRegistry()
        .accounts({
          registry: registryPda,
          authority: ministry.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const registry = await program.account.donorRegistry.fetch(registryPda);
      assert.ok(registry.authority.equals(ministry.publicKey), "authority should be ministry");
      assert.equal(registry.donorCount.toNumber(), 0, "donor count should start at 0");
      console.log("  ✓ Registry initialized");
    });

    it("Donor 1 registers with Heart + Left Kidney", async () => {
      const organBitmask = 1 | 4; // Heart=1, LeftKidney=4

      await program.methods
        .registerDonor(
          organBitmask,
          null,
          "QmTestCID123456789012345678901234567890123456"
        )
        .accounts({
          donorAccount: donor1Pda,
          registry: registryPda,
          wallet: donor1Kp.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([donor1Kp])
        .rpc();

      const donor = await program.account.donorAccount.fetch(donor1Pda);
      assert.equal(donor.organsBitmask, 5, "bitmask should be Heart+LeftKidney = 5");
      assert.deepEqual(donor.status, { active: {} }, "status should be Active");

      const registry = await program.account.donorRegistry.fetch(registryPda);
      assert.equal(registry.donorCount.toNumber(), 1, "donor count should be 1");
      console.log("  ✓ Donor 1 registered — organs bitmask:", organBitmask);
    });

    it("Donor 2 registers for lifecycle test (Heart + Liver)", async () => {
      const organBitmask = 1 | 2; // Heart=1, Liver=2

      await program.methods
        .registerDonor(
          organBitmask,
          null,
          "QmTestCID999999999999999999999999999999999999"
        )
        .accounts({
          donorAccount: donor2Pda,
          registry: registryPda,
          wallet: donor2Kp.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([donor2Kp])
        .rpc();

      const donor = await program.account.donorAccount.fetch(donor2Pda);
      assert.equal(donor.organsBitmask, 3, "bitmask should be Heart+Liver = 3");
      assert.deepEqual(donor.status, { active: {} });
      console.log("  ✓ Donor 2 registered for lifecycle test");
    });

    it("Rejects registration with zero organs", async () => {
      const badDonorKp = anchor.web3.Keypair.generate();
      await airdrop(badDonorKp.publicKey);
      const badDonorPda = pda([Buffer.from("donor"), badDonorKp.publicKey.toBuffer()]);

      try {
        await program.methods
          .registerDonor(0, null, "QmTest")
          .accounts({
            donorAccount: badDonorPda,
            registry: registryPda,
            wallet: badDonorKp.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([badDonorKp])
          .rpc();
        assert.fail("Should have rejected zero bitmask");
      } catch (err: any) {
        assert.include(err.message, "NoOrgansSelected");
        console.log("  ✓ Correctly rejected zero organs bitmask");
      }
    });

    it("Donor 1 revokes consent", async () => {
      await program.methods
        .revokeConsent()
        .accounts({
          donorAccount: donor1Pda,
          wallet: donor1Kp.publicKey,
        })
        .signers([donor1Kp])
        .rpc();

      const donor = await program.account.donorAccount.fetch(donor1Pda);
      assert.deepEqual(donor.status, { revoked: {} }, "status should be Revoked");
      console.log("  ✓ Donor 1 consent revoked");
    });

    it("Ministry marks Donor 2 as deceased", async () => {
      await program.methods
        .markDeceased()
        .accounts({
          donorAccount: donor2Pda,
          registry: registryPda,
          authority: ministry.publicKey,
        })
        .rpc();

      const donor = await program.account.donorAccount.fetch(donor2Pda);
      assert.deepEqual(donor.status, { deceased: {} }, "status should be Deceased");
      console.log("  ✓ Donor 2 marked as deceased");
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PROGRAM 2 — HOSPITAL AUTHORIZATION
  // ══════════════════════════════════════════════════════════════════════════

  describe("Program 2 — Hospital Authorization", () => {

    it("Ministry authorizes Hospital 1 as ICU", async () => {
      await program.methods
        .authorizeHospital("AIIMS Delhi", { icu: {} })
        .accounts({
          hospitalAccount: hospital1Pda,
          registry: registryPda,
          authority: ministry.publicKey,
          hospitalWallet: hospital1Kp.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const hospital = await program.account.hospitalAccount.fetch(hospital1Pda);
      assert.equal(hospital.name, "AIIMS Delhi");
      assert.deepEqual(hospital.role, { icu: {} });
      assert.equal(hospital.isActive, true);
      console.log("  ✓ Hospital 1 authorized as ICU");
    });

    it("Ministry authorizes Hospital 2 as Transplant Centre", async () => {
      await program.methods
        .authorizeHospital("Apollo Transplant", { transplantCenter: {} })
        .accounts({
          hospitalAccount: hospital2Pda,
          registry: registryPda,
          authority: ministry.publicKey,
          hospitalWallet: hospital2Kp.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const hospital = await program.account.hospitalAccount.fetch(hospital2Pda);
      assert.deepEqual(hospital.role, { transplantCenter: {} });
      console.log("  ✓ Hospital 2 authorized as Transplant Centre");
    });

    it("Hospital 1 adds Doctor 1 as Neurologist", async () => {
      await program.methods
        .addDoctor({ neurologist: {} })
        .accounts({
          doctorAccount: doctor1Pda,
          hospitalAccount: hospital1Pda,
          hospitalWallet: hospital1Kp.publicKey,
          doctorWallet: doctor1Kp.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([hospital1Kp])
        .rpc();

      const doctor = await program.account.doctorAccount.fetch(doctor1Pda);
      assert.deepEqual(doctor.specialization, { neurologist: {} });
      assert.equal(doctor.isActive, true);
      console.log("  ✓ Doctor 1 added as Neurologist");
    });

    it("Hospital 1 adds Doctor 2 as Neurosurgeon", async () => {
      await program.methods
        .addDoctor({ neurosurgeon: {} })
        .accounts({
          doctorAccount: doctor2Pda,
          hospitalAccount: hospital1Pda,
          hospitalWallet: hospital1Kp.publicKey,
          doctorWallet: doctor2Kp.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([hospital1Kp])
        .rpc();

      const doctor = await program.account.doctorAccount.fetch(doctor2Pda);
      assert.deepEqual(doctor.specialization, { neurosurgeon: {} });
      console.log("  ✓ Doctor 2 added as Neurosurgeon");
    });

    it("Hospital 1 adds Doctor 3 as ICU Specialist", async () => {
      await program.methods
        .addDoctor({ icuSpecialist: {} })
        .accounts({
          doctorAccount: doctor3Pda,
          hospitalAccount: hospital1Pda,
          hospitalWallet: hospital1Kp.publicKey,
          doctorWallet: doctor3Kp.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([hospital1Kp])
        .rpc();

      console.log("  ✓ Doctor 3 added as ICU Specialist");
    });

    it("Hospital 1 adds Doctor 4 as ICU Specialist", async () => {
      await program.methods
        .addDoctor({ icuSpecialist: {} })
        .accounts({
          doctorAccount: doctor4Pda,
          hospitalAccount: hospital1Pda,
          hospitalWallet: hospital1Kp.publicKey,
          doctorWallet: doctor4Kp.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([hospital1Kp])
        .rpc();

      console.log("  ✓ Doctor 4 added as ICU Specialist");
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PROGRAM 3 — BRAIN DEATH CERTIFICATION
  // ══════════════════════════════════════════════════════════════════════════

  describe("Program 3 — Brain Death Certification", () => {

    it("Hospital 1 submits brain death certification for Donor 2", async () => {
      await program.methods
        .submitCertification("QmCertCID12345678901234567890123456789012345")
        .accounts({
          certification: certPda,
          hospitalAccount: hospital1Pda,
          donorAccount: donor2Pda,
          hospitalWallet: hospital1Kp.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([hospital1Kp])
        .rpc();

      const cert = await program.account.brainDeathCertification.fetch(certPda);
      assert.deepEqual(cert.status, { pending: {} });
      assert.equal(cert.signerCount, 0);
      assert.equal(cert.hasNeuro, false);
      console.log("  ✓ Certification submitted — status: Pending");
    });

    it("Doctor 1 (Neurologist) signs — hasNeuro becomes true", async () => {
      await program.methods
        .doctorSign()
        .accounts({
          certification: certPda,
          doctorAccount: doctor1Pda,
          doctorWallet: doctor1Kp.publicKey,
        })
        .signers([doctor1Kp])
        .rpc();

      const cert = await program.account.brainDeathCertification.fetch(certPda);
      assert.equal(cert.signerCount, 1);
      assert.equal(cert.hasNeuro, true, "hasNeuro should be true after neurologist signs");
      console.log("  ✓ Doctor 1 signed (1/4) — hasNeuro: true");
    });

    it("Doctor 2 (Neurosurgeon) signs", async () => {
      await program.methods
        .doctorSign()
        .accounts({
          certification: certPda,
          doctorAccount: doctor2Pda,
          doctorWallet: doctor2Kp.publicKey,
        })
        .signers([doctor2Kp])
        .rpc();

      const cert = await program.account.brainDeathCertification.fetch(certPda);
      assert.equal(cert.signerCount, 2);
      console.log("  ✓ Doctor 2 signed (2/4)");
    });

    it("Doctor 3 (ICU Specialist) signs", async () => {
      await program.methods
        .doctorSign()
        .accounts({
          certification: certPda,
          doctorAccount: doctor3Pda,
          doctorWallet: doctor3Kp.publicKey,
        })
        .signers([doctor3Kp])
        .rpc();

      const cert = await program.account.brainDeathCertification.fetch(certPda);
      assert.equal(cert.signerCount, 3);
      console.log("  ✓ Doctor 3 signed (3/4)");
    });

    it("Rejects finalization with only 3 signatures", async () => {
      try {
        await program.methods
          .finalizeCertification()
          .accounts({
            certification: certPda,
            hospitalAccount: hospital1Pda,
            hospitalWallet: hospital1Kp.publicKey,
          })
          .signers([hospital1Kp])
          .rpc();
        assert.fail("Should have rejected with only 3 signatures");
      } catch (err: any) {
        assert.include(err.message, "InsufficientSignatures");
        console.log("  ✓ Correctly rejected — only 3/4 signatures");
      }
    });

    it("Doctor 4 (ICU Specialist) signs — all 4 complete", async () => {
      await program.methods
        .doctorSign()
        .accounts({
          certification: certPda,
          doctorAccount: doctor4Pda,
          doctorWallet: doctor4Kp.publicKey,
        })
        .signers([doctor4Kp])
        .rpc();

      const cert = await program.account.brainDeathCertification.fetch(certPda);
      assert.equal(cert.signerCount, 4);
      console.log("  ✓ Doctor 4 signed (4/4) — ready to finalize");
    });

    it("Rejects duplicate signature from Doctor 1", async () => {
      try {
        await program.methods
          .doctorSign()
          .accounts({
            certification: certPda,
            doctorAccount: doctor1Pda,
            doctorWallet: doctor1Kp.publicKey,
          })
          .signers([doctor1Kp])
          .rpc();
        assert.fail("Should have rejected duplicate signature");
      } catch (err: any) {
        assert.include(err.message, "AlreadyFullySigned");
        console.log("  ✓ Correctly rejected duplicate signature");
      }
    });

    it("Finalizes certification — THOTA rules pass", async () => {
      await program.methods
        .finalizeCertification()
        .accounts({
          certification: certPda,
          hospitalAccount: hospital1Pda,
          hospitalWallet: hospital1Kp.publicKey,
        })
        .signers([hospital1Kp])
        .rpc();

      const cert = await program.account.brainDeathCertification.fetch(certPda);
      assert.deepEqual(cert.status, { certified: {} }, "status should be Certified");
      assert.equal(cert.signerCount, 4);
      assert.equal(cert.hasNeuro, true);
      console.log("  ✓ Certification FINALIZED — status: Certified ✅");
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PROGRAM 4 — ORGAN ALLOCATION GOVERNANCE
  // ══════════════════════════════════════════════════════════════════════════

  describe("Program 4 — Organ Allocation Governance", () => {

    it("Ministry registers 3 validators", async () => {
      for (const [kp, vpda] of [
        [validator1Kp, validator1Pda],
        [validator2Kp, validator2Pda],
        [validator3Kp, validator3Pda],
      ] as [anchor.web3.Keypair, anchor.web3.PublicKey][]) {
        await program.methods
          .addValidator()
          .accounts({
            validatorAccount: vpda,
            registry: registryPda,
            authority: ministry.publicKey,
            validatorWallet: kp.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        const v = await program.account.validatorAccount.fetch(vpda);
        assert.equal(v.isActive, true);
      }
      console.log("  ✓ 3 validators registered");
    });

    it("State authority proposes Heart allocation to Hospital 2", async () => {
      await program.methods
        .proposeAllocation(ORGAN_HEART)
        .accounts({
          proposal: proposalPda,
          registry: registryPda,
          certification: certPda,
          donorAccount: donor2Pda,
          recipientHospital: hospital2Pda,
          authority: ministry.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const proposal = await program.account.allocationProposal.fetch(proposalPda);
      assert.deepEqual(proposal.status, { proposed: {} });
      assert.equal(proposal.organBit, ORGAN_HEART);
      assert.equal(proposal.validatorCount, 0);
      console.log("  ✓ Allocation proposed — Heart → Apollo Transplant");
    });

    it("Rejects proposal if organ was not consented (Skin = 128)", async () => {
      const ORGAN_SKIN = 128;
      const badProposalPda = pda([
        Buffer.from("allocation"),
        donor2Pda.toBuffer(),
        Buffer.from([ORGAN_SKIN]),
      ]);

      try {
        await program.methods
          .proposeAllocation(ORGAN_SKIN)
          .accounts({
            proposal: badProposalPda,
            registry: registryPda,
            certification: certPda,
            donorAccount: donor2Pda,
            recipientHospital: hospital2Pda,
            authority: ministry.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have rejected — Skin was not donated");
      } catch (err: any) {
        assert.include(err.message, "OrganNotDonated");
        console.log("  ✓ Correctly rejected — organ not in donor consent");
      }
    });

    it("Validator 1 approves", async () => {
      await program.methods
        .validatorApprove()
        .accounts({
          proposal: proposalPda,
          validatorAccount: validator1Pda,
          validatorWallet: validator1Kp.publicKey,
        })
        .signers([validator1Kp])
        .rpc();

      const proposal = await program.account.allocationProposal.fetch(proposalPda);
      assert.equal(proposal.validatorCount, 1);
      console.log("  ✓ Validator 1 approved (1/3)");
    });

    it("Validator 2 approves", async () => {
      await program.methods
        .validatorApprove()
        .accounts({
          proposal: proposalPda,
          validatorAccount: validator2Pda,
          validatorWallet: validator2Kp.publicKey,
        })
        .signers([validator2Kp])
        .rpc();

      const proposal = await program.account.allocationProposal.fetch(proposalPda);
      assert.equal(proposal.validatorCount, 2);
      console.log("  ✓ Validator 2 approved (2/3)");
    });

    it("Rejects finalization with only 2 approvals", async () => {
      try {
        await program.methods
          .finalizeAllocation()
          .accounts({
            proposal: proposalPda,
            registry: registryPda,
            authority: ministry.publicKey,
          })
          .rpc();
        assert.fail("Should have rejected with only 2 approvals");
      } catch (err: any) {
        assert.include(err.message, "QuorumNotReached");
        console.log("  ✓ Correctly rejected — quorum not reached (2/3)");
      }
    });

    it("Validator 3 approves — quorum reached", async () => {
      await program.methods
        .validatorApprove()
        .accounts({
          proposal: proposalPda,
          validatorAccount: validator3Pda,
          validatorWallet: validator3Kp.publicKey,
        })
        .signers([validator3Kp])
        .rpc();

      const proposal = await program.account.allocationProposal.fetch(proposalPda);
      assert.equal(proposal.validatorCount, 3);
      console.log("  ✓ Validator 3 approved (3/3) — quorum reached");
    });

    it("Finalizes allocation — immutable record locked on-chain", async () => {
      await program.methods
        .finalizeAllocation()
        .accounts({
          proposal: proposalPda,
          registry: registryPda,
          authority: ministry.publicKey,
        })
        .rpc();

      const proposal = await program.account.allocationProposal.fetch(proposalPda);
      assert.deepEqual(proposal.status, { approved: {} }, "status should be Approved");
      assert.equal(proposal.validatorCount, 3);
      console.log("  ✓ Allocation FINALIZED — status: Approved ✅");
      console.log("");
      console.log("  ══════════════════════════════════════════");
      console.log("  Full lifecycle complete:");
      console.log("  Donor registered → Deceased → Certified (THOTA) → Allocated ✅");
      console.log("  ══════════════════════════════════════════");
    });
  });
});
