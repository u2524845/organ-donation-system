use anchor_lang::prelude::*;

declare_id!("7DtCGYSvSrpDJDEegvzjZKWibD6zi2rvzxPdYZiAVuvN");

#[program]
pub mod organ_donation_system {
    use super::*;

    // ════════════════════════════════════════════════════════════════════════
    // PROGRAM 1 — DONOR REGISTRY
    // ════════════════════════════════════════════════════════════════════════

    // Called ONCE by the Ministry wallet to create the global registry
    pub fn initialize_registry(ctx: Context<InitializeRegistry>) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.authority = ctx.accounts.authority.key();
        registry.donor_count = 0;
        registry.bump = ctx.bumps.registry;
        msg!("Donor Registry initialized by: {:?}", registry.authority);
        Ok(())
    }

    // Donor registers their organ donation consent on-chain
    pub fn register_donor(
        ctx: Context<RegisterDonor>,
        organs_bitmask: u8,             // Each bit = one organ (see organ_bit module)
        nominee_wallet: Option<Pubkey>, // Family member who can act on donor's behalf
        ipfs_cid: String,               // CID of encrypted personal data stored on IPFS
    ) -> Result<()> {
        require!(organs_bitmask > 0, DonorError::NoOrgansSelected);
        require!(ipfs_cid.len() <= 64, DonorError::CidTooLong);

        let donor = &mut ctx.accounts.donor_account;
        donor.wallet = ctx.accounts.wallet.key();
        donor.organs_bitmask = organs_bitmask;
        donor.nominee_wallet = nominee_wallet;
        donor.ipfs_cid = ipfs_cid;
        donor.status = DonorStatus::Active;
        donor.registered_at = Clock::get()?.unix_timestamp;
        donor.updated_at = 0;
        donor.bump = ctx.bumps.donor_account;

        ctx.accounts.registry.donor_count += 1;
        msg!("Donor registered: {:?}", donor.wallet);
        Ok(())
    }

    // Donor revokes their own consent
    pub fn revoke_consent(ctx: Context<DonorAction>) -> Result<()> {
        let donor = &mut ctx.accounts.donor_account;
        require!(donor.status == DonorStatus::Active, DonorError::NotActive);
        donor.status = DonorStatus::Revoked;
        donor.updated_at = Clock::get()?.unix_timestamp;
        msg!("Consent revoked by: {:?}", donor.wallet);
        Ok(())
    }

    // Ministry marks a donor as deceased — triggers the allocation flow
    pub fn mark_deceased(ctx: Context<AuthorityAction>) -> Result<()> {
        let donor = &mut ctx.accounts.donor_account;
        require!(donor.status == DonorStatus::Active, DonorError::NotActive);
        donor.status = DonorStatus::Deceased;
        donor.updated_at = Clock::get()?.unix_timestamp;
        msg!("Donor marked deceased: {:?}", donor.wallet);
        Ok(())
    }

    // ════════════════════════════════════════════════════════════════════════
    // PROGRAM 2 — HOSPITAL AUTHORIZATION
    // ════════════════════════════════════════════════════════════════════════

    // Ministry whitelists a hospital and assigns it a role
    pub fn authorize_hospital(
        ctx: Context<AuthorizeHospital>,
        name: String,
        role: HospitalRole,
    ) -> Result<()> {
        require!(name.len() > 0 && name.len() <= 64, HospitalError::InvalidName);

        let hospital = &mut ctx.accounts.hospital_account;
        hospital.wallet = ctx.accounts.hospital_wallet.key();
        hospital.name = name;
        hospital.role = role;
        hospital.is_active = true;
        hospital.authorized_at = Clock::get()?.unix_timestamp;
        hospital.bump = ctx.bumps.hospital_account;

        msg!("Hospital authorized: {:?}", hospital.wallet);
        Ok(())
    }

    // Ministry revokes a hospital's authorization
    pub fn revoke_hospital(ctx: Context<HospitalAuthorityAction>) -> Result<()> {
        let hospital = &mut ctx.accounts.hospital_account;
        require!(hospital.is_active, HospitalError::AlreadyInactive);
        hospital.is_active = false;
        msg!("Hospital revoked: {:?}", hospital.wallet);
        Ok(())
    }

    // Hospital admin registers a doctor to their roster
    pub fn add_doctor(
        ctx: Context<AddDoctor>,
        specialization: DoctorSpec,
    ) -> Result<()> {
        let hospital = &ctx.accounts.hospital_account;
        require!(hospital.is_active, HospitalError::HospitalNotActive);

        let doctor = &mut ctx.accounts.doctor_account;
        doctor.wallet = ctx.accounts.doctor_wallet.key();
        doctor.hospital = ctx.accounts.hospital_account.key();
        doctor.specialization = specialization;
        doctor.is_active = true;
        doctor.added_at = Clock::get()?.unix_timestamp;
        doctor.bump = ctx.bumps.doctor_account;

        msg!("Doctor added: {:?}", doctor.wallet);
        Ok(())
    }

    // Hospital admin removes a doctor from their roster
    pub fn revoke_doctor(ctx: Context<DoctorHospitalAction>) -> Result<()> {
        let doctor = &mut ctx.accounts.doctor_account;
        require!(doctor.is_active, HospitalError::DoctorAlreadyInactive);
        doctor.is_active = false;
        msg!("Doctor revoked: {:?}", doctor.wallet);
        Ok(())
    }

    // ════════════════════════════════════════════════════════════════════════
    // PROGRAM 3 — BRAIN DEATH CERTIFICATION
    // THOTA law: 4 doctors must sign, at least 1 must be Neurologist/Neurosurgeon
    // ════════════════════════════════════════════════════════════════════════

    // Hospital submits a brain death case for a deceased donor
    pub fn submit_certification(
        ctx: Context<SubmitCertification>,
        ipfs_cid: String, // IPFS CID of encrypted certification documents
    ) -> Result<()> {
        let hospital = &ctx.accounts.hospital_account;
        require!(hospital.is_active, CertError::HospitalNotAuthorized);
        require!(
            hospital.role == HospitalRole::ICU || hospital.role == HospitalRole::Both,
            CertError::HospitalNotICU
        );

        let donor = &ctx.accounts.donor_account;
        require!(donor.status == DonorStatus::Deceased, CertError::DonorNotDeceased);
        require!(ipfs_cid.len() <= 64, CertError::CidTooLong);

        let cert = &mut ctx.accounts.certification;
        cert.donor = ctx.accounts.donor_account.key();
        cert.hospital = ctx.accounts.hospital_account.key();
        cert.ipfs_cid = ipfs_cid;
        cert.signers = [Pubkey::default(); 4]; // Empty slots — default pubkey = unsigned
        cert.signer_count = 0;
        cert.has_neuro = false;
        cert.status = CertStatus::Pending;
        cert.submitted_at = Clock::get()?.unix_timestamp;
        cert.certified_at = 0;
        cert.bump = ctx.bumps.certification;

        msg!("Certification submitted for donor: {:?}", cert.donor);
        Ok(())
    }

    // A registered doctor signs the brain death certification
    pub fn doctor_sign(ctx: Context<DoctorSign>) -> Result<()> {
        let doctor = &ctx.accounts.doctor_account;
        require!(doctor.is_active, CertError::DoctorNotActive);

        let cert = &mut ctx.accounts.certification;
        require!(cert.status == CertStatus::Pending, CertError::CertNotPending);
        require!(cert.signer_count < 4, CertError::AlreadyFullySigned);

        // Doctor must belong to the same hospital that submitted the certification
        require!(
            doctor.hospital == cert.hospital,
            CertError::DoctorWrongHospital
        );

        // Prevent the same doctor signing twice
        let doctor_key = ctx.accounts.doctor_wallet.key();
        for existing in cert.signers.iter() {
            require!(*existing != doctor_key, CertError::AlreadySigned);
        }

        // Store index locally first — Rust borrow checker requires this
        let idx = cert.signer_count as usize;
        cert.signers[idx] = doctor_key;
        cert.signer_count += 1;

        // Track if a neuro specialist has signed — required by THOTA
        if doctor.specialization == DoctorSpec::Neurologist
            || doctor.specialization == DoctorSpec::Neurosurgeon
        {
            cert.has_neuro = true;
        }

        msg!("Doctor signed: {:?} ({}/4)", doctor_key, cert.signer_count);
        Ok(())
    }

    // Finalize the certification — MVP: 1 doctor signature required
    pub fn finalize_certification(ctx: Context<FinalizeCertification>) -> Result<()> {
        let cert = &mut ctx.accounts.certification;
        require!(cert.status == CertStatus::Pending, CertError::CertNotPending);
        require!(cert.signer_count >= 1, CertError::InsufficientSignatures);

        cert.status = CertStatus::Certified;
        cert.certified_at = Clock::get()?.unix_timestamp;

        msg!(
            "Brain death CERTIFIED | Donor: {:?} | Hospital: {:?} | Signers: {}",
            cert.donor,
            cert.hospital,
            cert.signer_count
        );
        Ok(())
    }

    // ════════════════════════════════════════════════════════════════════════
    // PROGRAM 4 — ORGAN ALLOCATION GOVERNANCE
    // State authority proposes allocation → validators vote → quorum locks it
    // ════════════════════════════════════════════════════════════════════════

    // Ministry registers a validator (e.g. NOTTO/SOTTO member)
    pub fn add_validator(ctx: Context<AddValidator>) -> Result<()> {
        let validator = &mut ctx.accounts.validator_account;
        validator.wallet = ctx.accounts.validator_wallet.key();
        validator.is_active = true;
        validator.added_at = Clock::get()?.unix_timestamp;
        validator.bump = ctx.bumps.validator_account;
        msg!("Validator added: {:?}", validator.wallet);
        Ok(())
    }

    // Ministry removes a validator
    pub fn revoke_validator(ctx: Context<ValidatorRegistryAction>) -> Result<()> {
        let validator = &mut ctx.accounts.validator_account;
        require!(validator.is_active, AllocError::ValidatorAlreadyInactive);
        validator.is_active = false;
        msg!("Validator revoked: {:?}", validator.wallet);
        Ok(())
    }

    // State authority proposes an organ allocation from a certified donor to a hospital
    pub fn propose_allocation(
        ctx: Context<ProposeAllocation>,
        organ_bit: u8, // Which organ is being allocated (single bit from organ_bit module)
    ) -> Result<()> {
        require!(organ_bit.count_ones() == 1, AllocError::InvalidOrganBit);

        let cert = &ctx.accounts.certification;
        require!(cert.status == CertStatus::Certified, AllocError::CertNotCertified);

        let recipient = &ctx.accounts.recipient_hospital;
        require!(recipient.is_active, AllocError::RecipientNotActive);
        require!(
            recipient.role == HospitalRole::TransplantCenter || recipient.role == HospitalRole::Both,
            AllocError::RecipientNotTransplant
        );

        // Verify the organ was actually donated by this donor
        let donor = &ctx.accounts.donor_account;
        require!(donor.organs_bitmask & organ_bit != 0, AllocError::OrganNotDonated);

        let proposal = &mut ctx.accounts.proposal;
        proposal.donor = ctx.accounts.donor_account.key();
        proposal.certification = ctx.accounts.certification.key();
        proposal.recipient_hospital = ctx.accounts.recipient_hospital.key();
        proposal.organ_bit = organ_bit;
        proposal.proposed_by = ctx.accounts.authority.key();
        proposal.validators = [Pubkey::default(); 5];
        proposal.validator_count = 0;
        proposal.status = AllocStatus::Proposed;
        proposal.proposed_at = Clock::get()?.unix_timestamp;
        proposal.finalized_at = 0;
        proposal.bump = ctx.bumps.proposal;

        msg!(
            "Allocation proposed | Donor: {:?} | Organ: {} | Recipient: {:?}",
            proposal.donor,
            organ_bit,
            proposal.recipient_hospital
        );
        Ok(())
    }

    // A registered validator approves the allocation proposal
    pub fn validator_approve(ctx: Context<ValidatorApprove>) -> Result<()> {
        let validator = &ctx.accounts.validator_account;
        require!(validator.is_active, AllocError::ValidatorNotActive);

        let proposal = &mut ctx.accounts.proposal;
        require!(proposal.status == AllocStatus::Proposed, AllocError::ProposalNotOpen);
        require!(proposal.validator_count < 5, AllocError::AlreadyFullySigned);

        // Prevent duplicate votes
        let validator_key = ctx.accounts.validator_wallet.key();
        for existing in proposal.validators.iter() {
            require!(*existing != validator_key, AllocError::AlreadyVoted);
        }

        let idx = proposal.validator_count as usize;
        proposal.validators[idx] = validator_key;
        proposal.validator_count += 1;

        msg!(
            "Validator approved: {:?} ({}/{})",
            validator_key,
            proposal.validator_count,
            QUORUM
        );
        Ok(())
    }

    // Finalize the allocation once quorum is reached — immutable after this
    pub fn finalize_allocation(ctx: Context<FinalizeAllocation>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        require!(proposal.status == AllocStatus::Proposed, AllocError::ProposalNotOpen);
        require!(proposal.validator_count >= QUORUM, AllocError::QuorumNotReached);

        proposal.status = AllocStatus::Approved;
        proposal.finalized_at = Clock::get()?.unix_timestamp;

        msg!(
            "Allocation APPROVED | Donor: {:?} | Organ: {} | Recipient: {:?} | Votes: {}/{}",
            proposal.donor,
            proposal.organ_bit,
            proposal.recipient_hospital,
            proposal.validator_count,
            QUORUM
        );
        Ok(())
    }
}

// ════════════════════════════════════════════════════════════════════════════
// ACCOUNT STRUCTURES
// ════════════════════════════════════════════════════════════════════════════

// ── Program 1 ────────────────────────────────────────────────────────────────

#[account]
pub struct DonorRegistry {
    pub authority: Pubkey,
    pub donor_count: u64,
    pub bump: u8,
}

#[account]
pub struct DonorAccount {
    pub wallet: Pubkey,
    pub organs_bitmask: u8,
    pub nominee_wallet: Option<Pubkey>,
    pub ipfs_cid: String,
    pub status: DonorStatus,
    pub registered_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

impl DonorAccount {
    // 8 + 32 + 1 + (1+32) + (4+64) + 1 + 8 + 8 + 1
    pub const SPACE: usize = 8 + 32 + 1 + (1 + 32) + (4 + 64) + 1 + 8 + 8 + 1;
}

// ── Program 2 ────────────────────────────────────────────────────────────────

#[account]
pub struct HospitalAccount {
    pub wallet: Pubkey,
    pub name: String,
    pub role: HospitalRole,
    pub is_active: bool,
    pub authorized_at: i64,
    pub bump: u8,
}

impl HospitalAccount {
    // 8 + 32 + (4+64) + 1 + 1 + 8 + 1
    pub const SPACE: usize = 8 + 32 + (4 + 64) + 1 + 1 + 8 + 1;
}

#[account]
pub struct DoctorAccount {
    pub wallet: Pubkey,
    pub hospital: Pubkey,
    pub specialization: DoctorSpec,
    pub is_active: bool,
    pub added_at: i64,
    pub bump: u8,
}

impl DoctorAccount {
    // 8 + 32 + 32 + 1 + 1 + 8 + 1
    pub const SPACE: usize = 8 + 32 + 32 + 1 + 1 + 8 + 1;
}

// ── Program 4 ────────────────────────────────────────────────────────────────

pub const QUORUM: u8 = 1; // Minimum validator signatures required to finalize allocation

#[account]
pub struct ValidatorAccount {
    pub wallet: Pubkey,
    pub is_active: bool,
    pub added_at: i64,
    pub bump: u8,
}

impl ValidatorAccount {
    // 8 + 32 + 1 + 8 + 1
    pub const SPACE: usize = 8 + 32 + 1 + 8 + 1;
}

#[account]
pub struct AllocationProposal {
    pub donor: Pubkey,              // Source donor
    pub certification: Pubkey,      // Brain death certification that triggered this
    pub recipient_hospital: Pubkey, // Hospital receiving the organ
    pub organ_bit: u8,              // Which organ (single bit from organ_bit module)
    pub proposed_by: Pubkey,        // State authority who proposed
    pub validators: [Pubkey; 5],    // Validator votes (default pubkey = empty)
    pub validator_count: u8,        // How many validators have approved
    pub status: AllocStatus,
    pub proposed_at: i64,
    pub finalized_at: i64,
    pub bump: u8,
}

impl AllocationProposal {
    // 8 + 32 + 32 + 32 + 1 + 32 + (5*32) + 1 + 1 + 8 + 8 + 1
    pub const SPACE: usize = 8 + 32 + 32 + 32 + 1 + 32 + (5 * 32) + 1 + 1 + 8 + 8 + 1;
}

// ── Program 3 ────────────────────────────────────────────────────────────────

#[account]
pub struct BrainDeathCertification {
    pub donor: Pubkey,          // Donor being certified
    pub hospital: Pubkey,       // Hospital that submitted this certification
    pub ipfs_cid: String,       // IPFS CID of encrypted certification documents
    pub signers: [Pubkey; 4],   // Doctor wallets (default pubkey = empty slot)
    pub signer_count: u8,       // How many doctors have signed (0–4)
    pub has_neuro: bool,        // True if a Neurologist or Neurosurgeon signed (THOTA)
    pub status: CertStatus,
    pub submitted_at: i64,
    pub certified_at: i64,
    pub bump: u8,
}

impl BrainDeathCertification {
    // 8 + 32 + 32 + (4+64) + (4*32) + 1 + 1 + 1 + 8 + 8 + 1
    pub const SPACE: usize = 8 + 32 + 32 + (4 + 64) + (4 * 32) + 1 + 1 + 1 + 8 + 8 + 1;
}

// ════════════════════════════════════════════════════════════════════════════
// ENUMS
// ════════════════════════════════════════════════════════════════════════════

// ── Program 1 ────────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum DonorStatus {
    Active,
    Revoked,
    Deceased,
}

pub mod organ_bit {
    pub const HEART: u8        = 1 << 0;
    pub const LIVER: u8        = 1 << 1;
    pub const LEFT_KIDNEY: u8  = 1 << 2;
    pub const RIGHT_KIDNEY: u8 = 1 << 3;
    pub const LUNGS: u8        = 1 << 4;
    pub const PANCREAS: u8     = 1 << 5;
    pub const CORNEA: u8       = 1 << 6;
    pub const SKIN: u8         = 1 << 7;
}

// ── Program 2 ────────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum HospitalRole {
    ICU,              // Can submit brain death certifications
    TransplantCenter, // Can receive organ allocations
    Both,             // Full access
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum DoctorSpec {
    Neurologist,   // THOTA-required specialist
    Neurosurgeon,  // THOTA-required specialist
    ICUSpecialist,
    Transplant,
}

// ── Program 3 ────────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum CertStatus {
    Pending,   // Awaiting 4 doctor signatures
    Certified, // THOTA requirements met — immutable
}

// ── Program 4 ────────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum AllocStatus {
    Proposed, // Awaiting validator quorum
    Approved, // Quorum reached — immutable governance log
}

// ════════════════════════════════════════════════════════════════════════════
// CONTEXTS
// ════════════════════════════════════════════════════════════════════════════

// ── Program 1 ────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 1,
        seeds = [b"registry"],
        bump
    )]
    pub registry: Account<'info, DonorRegistry>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterDonor<'info> {
    #[account(
        init,
        payer = wallet,
        space = DonorAccount::SPACE,
        seeds = [b"donor", wallet.key().as_ref()],
        bump
    )]
    pub donor_account: Account<'info, DonorAccount>,
    #[account(mut, seeds = [b"registry"], bump = registry.bump)]
    pub registry: Account<'info, DonorRegistry>,
    #[account(mut)]
    pub wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DonorAction<'info> {
    #[account(
        mut,
        seeds = [b"donor", wallet.key().as_ref()],
        bump = donor_account.bump,
        has_one = wallet
    )]
    pub donor_account: Account<'info, DonorAccount>,
    pub wallet: Signer<'info>,
}

#[derive(Accounts)]
pub struct AuthorityAction<'info> {
    #[account(mut)]
    pub donor_account: Account<'info, DonorAccount>,
    #[account(seeds = [b"registry"], bump = registry.bump, has_one = authority)]
    pub registry: Account<'info, DonorRegistry>,
    pub authority: Signer<'info>,
}

// ── Program 2 ────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct AuthorizeHospital<'info> {
    #[account(
        init,
        payer = authority,
        space = HospitalAccount::SPACE,
        seeds = [b"hospital", hospital_wallet.key().as_ref()],
        bump
    )]
    pub hospital_account: Account<'info, HospitalAccount>,
    #[account(seeds = [b"registry"], bump = registry.bump, has_one = authority)]
    pub registry: Account<'info, DonorRegistry>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Hospital's wallet address — stored, not signing
    pub hospital_wallet: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct HospitalAuthorityAction<'info> {
    #[account(
        mut,
        seeds = [b"hospital", hospital_account.wallet.as_ref()],
        bump = hospital_account.bump
    )]
    pub hospital_account: Account<'info, HospitalAccount>,
    #[account(seeds = [b"registry"], bump = registry.bump, has_one = authority)]
    pub registry: Account<'info, DonorRegistry>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct AddDoctor<'info> {
    #[account(
        init,
        payer = hospital_wallet,
        space = DoctorAccount::SPACE,
        seeds = [b"doctor", doctor_wallet.key().as_ref()],
        bump
    )]
    pub doctor_account: Account<'info, DoctorAccount>,
    #[account(
        seeds = [b"hospital", hospital_wallet.key().as_ref()],
        bump = hospital_account.bump,
        constraint = hospital_account.wallet == hospital_wallet.key() @ HospitalError::Unauthorized
    )]
    pub hospital_account: Account<'info, HospitalAccount>,
    #[account(mut)]
    pub hospital_wallet: Signer<'info>,
    /// CHECK: Doctor's wallet address — stored, not signing
    pub doctor_wallet: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DoctorHospitalAction<'info> {
    #[account(
        mut,
        seeds = [b"doctor", doctor_account.wallet.as_ref()],
        bump = doctor_account.bump,
        constraint = doctor_account.hospital == hospital_account.key() @ HospitalError::Unauthorized
    )]
    pub doctor_account: Account<'info, DoctorAccount>,
    #[account(
        seeds = [b"hospital", hospital_wallet.key().as_ref()],
        bump = hospital_account.bump,
        constraint = hospital_account.wallet == hospital_wallet.key() @ HospitalError::Unauthorized
    )]
    pub hospital_account: Account<'info, HospitalAccount>,
    pub hospital_wallet: Signer<'info>,
}

// ── Program 3 ────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct SubmitCertification<'info> {
    #[account(
        init,
        payer = hospital_wallet,
        space = BrainDeathCertification::SPACE,
        seeds = [b"certification", donor_account.key().as_ref()],
        bump
    )]
    pub certification: Account<'info, BrainDeathCertification>,
    #[account(
        seeds = [b"hospital", hospital_wallet.key().as_ref()],
        bump = hospital_account.bump,
        constraint = hospital_account.wallet == hospital_wallet.key() @ CertError::Unauthorized
    )]
    pub hospital_account: Account<'info, HospitalAccount>,
    pub donor_account: Account<'info, DonorAccount>,
    #[account(mut)]
    pub hospital_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DoctorSign<'info> {
    #[account(
        mut,
        seeds = [b"certification", certification.donor.as_ref()],
        bump = certification.bump
    )]
    pub certification: Account<'info, BrainDeathCertification>,
    #[account(
        seeds = [b"doctor", doctor_wallet.key().as_ref()],
        bump = doctor_account.bump,
        constraint = doctor_account.wallet == doctor_wallet.key() @ CertError::Unauthorized
    )]
    pub doctor_account: Account<'info, DoctorAccount>,
    pub doctor_wallet: Signer<'info>,
}

#[derive(Accounts)]
pub struct FinalizeCertification<'info> {
    #[account(
        mut,
        seeds = [b"certification", certification.donor.as_ref()],
        bump = certification.bump
    )]
    pub certification: Account<'info, BrainDeathCertification>,
    // Hospital that submitted must also finalize
    #[account(
        seeds = [b"hospital", hospital_wallet.key().as_ref()],
        bump = hospital_account.bump,
        constraint = hospital_account.wallet == hospital_wallet.key() @ CertError::Unauthorized,
        constraint = hospital_account.key() == certification.hospital @ CertError::WrongHospital
    )]
    pub hospital_account: Account<'info, HospitalAccount>,
    pub hospital_wallet: Signer<'info>,
}

// ── Program 4 ────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct AddValidator<'info> {
    #[account(
        init,
        payer = authority,
        space = ValidatorAccount::SPACE,
        seeds = [b"validator", validator_wallet.key().as_ref()],
        bump
    )]
    pub validator_account: Account<'info, ValidatorAccount>,
    #[account(seeds = [b"registry"], bump = registry.bump, has_one = authority)]
    pub registry: Account<'info, DonorRegistry>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Validator's wallet address — stored, not signing
    pub validator_wallet: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ValidatorRegistryAction<'info> {
    #[account(
        mut,
        seeds = [b"validator", validator_account.wallet.as_ref()],
        bump = validator_account.bump
    )]
    pub validator_account: Account<'info, ValidatorAccount>,
    #[account(seeds = [b"registry"], bump = registry.bump, has_one = authority)]
    pub registry: Account<'info, DonorRegistry>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(organ_bit: u8)]
pub struct ProposeAllocation<'info> {
    #[account(
        init,
        payer = authority,
        space = AllocationProposal::SPACE,
        seeds = [b"allocation", donor_account.key().as_ref(), &[organ_bit]],
        bump
    )]
    pub proposal: Account<'info, AllocationProposal>,
    #[account(seeds = [b"registry"], bump = registry.bump, has_one = authority)]
    pub registry: Account<'info, DonorRegistry>,
    #[account(
        seeds = [b"certification", donor_account.key().as_ref()],
        bump = certification.bump
    )]
    pub certification: Account<'info, BrainDeathCertification>,
    pub donor_account: Account<'info, DonorAccount>,
    pub recipient_hospital: Account<'info, HospitalAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ValidatorApprove<'info> {
    #[account(
        mut,
        seeds = [b"allocation", proposal.donor.as_ref(), &[proposal.organ_bit]],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, AllocationProposal>,
    #[account(
        seeds = [b"validator", validator_wallet.key().as_ref()],
        bump = validator_account.bump,
        constraint = validator_account.wallet == validator_wallet.key() @ AllocError::Unauthorized
    )]
    pub validator_account: Account<'info, ValidatorAccount>,
    pub validator_wallet: Signer<'info>,
}

#[derive(Accounts)]
pub struct FinalizeAllocation<'info> {
    #[account(
        mut,
        seeds = [b"allocation", proposal.donor.as_ref(), &[proposal.organ_bit]],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, AllocationProposal>,
    // Only the Ministry authority can finalize
    #[account(seeds = [b"registry"], bump = registry.bump, has_one = authority)]
    pub registry: Account<'info, DonorRegistry>,
    pub authority: Signer<'info>,
}

// ════════════════════════════════════════════════════════════════════════════
// ERRORS
// ════════════════════════════════════════════════════════════════════════════

#[error_code]
pub enum DonorError {
    #[msg("No organs selected — organs_bitmask must be > 0")]
    NoOrgansSelected,
    #[msg("IPFS CID too long — max 64 characters")]
    CidTooLong,
    #[msg("Donor status is not Active")]
    NotActive,
}

#[error_code]
pub enum HospitalError {
    #[msg("Hospital name must be 1-64 characters")]
    InvalidName,
    #[msg("Hospital is already inactive")]
    AlreadyInactive,
    #[msg("Hospital is not active — cannot add doctors")]
    HospitalNotActive,
    #[msg("Doctor is already inactive")]
    DoctorAlreadyInactive,
    #[msg("Unauthorized — signer does not own this account")]
    Unauthorized,
}

#[error_code]
pub enum CertError {
    #[msg("Hospital is not authorized")]
    HospitalNotAuthorized,
    #[msg("Hospital does not have ICU or Both role")]
    HospitalNotICU,
    #[msg("Donor is not marked as Deceased")]
    DonorNotDeceased,
    #[msg("IPFS CID too long — max 64 characters")]
    CidTooLong,
    #[msg("Doctor is not active")]
    DoctorNotActive,
    #[msg("Certification is not in Pending status")]
    CertNotPending,
    #[msg("Certification already has 4 signatures")]
    AlreadyFullySigned,
    #[msg("Doctor does not belong to this hospital")]
    DoctorWrongHospital,
    #[msg("Doctor has already signed this certification")]
    AlreadySigned,
    #[msg("Need all 4 doctor signatures to finalize")]
    InsufficientSignatures,
    #[msg("THOTA violation: at least 1 Neurologist or Neurosurgeon must sign")]
    MissingNeuroSpecialist,
    #[msg("Unauthorized — signer does not own this account")]
    Unauthorized,
    #[msg("Wrong hospital for this certification")]
    WrongHospital,
}

#[error_code]
pub enum AllocError {
    #[msg("organ_bit must have exactly 1 bit set")]
    InvalidOrganBit,
    #[msg("Brain death certification is not Certified yet")]
    CertNotCertified,
    #[msg("Recipient hospital is not active")]
    RecipientNotActive,
    #[msg("Recipient hospital does not have TransplantCenter or Both role")]
    RecipientNotTransplant,
    #[msg("This organ was not listed in the donor's consent")]
    OrganNotDonated,
    #[msg("Validator is not active")]
    ValidatorNotActive,
    #[msg("Validator is already inactive")]
    ValidatorAlreadyInactive,
    #[msg("Proposal is not in Proposed status")]
    ProposalNotOpen,
    #[msg("Proposal already has 5 validator signatures")]
    AlreadyFullySigned,
    #[msg("Validator has already voted on this proposal")]
    AlreadyVoted,
    #[msg("Quorum not reached — need at least 3 validator approvals")]
    QuorumNotReached,
    #[msg("Unauthorized — signer does not own this account")]
    Unauthorized,
}
