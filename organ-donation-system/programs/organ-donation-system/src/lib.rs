use anchor_lang::prelude::*;

declare_id!("9TnYnSbyfz6acdUGzzz8VBHdC9updyzT1AkAFh1LL1nc");

#[program]
pub mod organ_donation_system {
    use super::*;

       6  pub mod organ_donation_system {
        7      use super::*;
        8
        9 -    pub fn initialize(ctx: Context<Initialize>) -> Result<()>
          -{
       10 -        msg!("Greetings from: {:?}", ctx.program_id);
        9 +    // Called ONCE by the Ministry wallet to create the global
          + registry
       10 +    pub fn initialize_registry(ctx: Context<InitializeRegistry
          +>) -> Result<()> {
       11 +        let registry = &mut ctx.accounts.registry;
       12 +        registry.authority = ctx.accounts.authority.key();
       13 +        registry.donor_count = 0;
       14 +        registry.bump = ctx.bumps.registry;
       15 +        msg!("Donor Registry initialized by: {:?}", registry.a
          +uthority);
       16          Ok(())
       17      }
       18 +
       19 +    // Donor registers their organ donation consent on-chain
       20 +    pub fn register_donor(
       21 +        ctx: Context<RegisterDonor>,
       22 +        organs_bitmask: u8,           // Each bit = one organ
          +(see organ_bit module)
       23 +        nominee_wallet: Option<Pubkey>, // Family member who c
          +an act on donor's behalf
       24 +        ipfs_cid: String,             // CID of encrypted pers
          +onal data stored on IPFS
       25 +    ) -> Result<()> {
       26 +        require!(organs_bitmask > 0, DonorError::NoOrgansSelec
          +ted);
       27 +        require!(ipfs_cid.len() <= 64, DonorError::CidTooLong)
          +;
       28 +
       29 +        let donor = &mut ctx.accounts.donor_account;
       30 +        donor.wallet = ctx.accounts.wallet.key();
       31 +        donor.organs_bitmask = organs_bitmask;
       32 +        donor.nominee_wallet = nominee_wallet;
       33 +        donor.ipfs_cid = ipfs_cid;
       34 +        donor.status = DonorStatus::Active;
       35 +        donor.registered_at = Clock::get()?.unix_timestamp;
       36 +        donor.updated_at = 0;
       37 +        donor.bump = ctx.bumps.donor_account;
       38 +
       39 +        ctx.accounts.registry.donor_count += 1;
       40 +        msg!("Donor registered: {:?}", donor.wallet);
       41 +        Ok(())
       42 +    }
       43 +
       44 +    // Donor revokes their own consent
       45 +    pub fn revoke_consent(ctx: Context<DonorAction>) -> Result
          +<()> {
       46 +        let donor = &mut ctx.accounts.donor_account;
       47 +        require!(donor.status == DonorStatus::Active, DonorErr
          +or::NotActive);
       48 +        donor.status = DonorStatus::Revoked;
       49 +        donor.updated_at = Clock::get()?.unix_timestamp;
       50 +        msg!("Consent revoked by: {:?}", donor.wallet);
       51 +        Ok(())
       52 +    }
       53 +
       54 +    // Ministry marks a donor as deceased — triggers the alloc
          +ation flow
       55 +    pub fn mark_deceased(ctx: Context<AuthorityAction>) -> Res
          +ult<()> {
       56 +        let donor = &mut ctx.accounts.donor_account;
       57 +        require!(donor.status == DonorStatus::Active, DonorErr
          +or::NotActive);
       58 +        donor.status = DonorStatus::Deceased;
       59 +        donor.updated_at = Clock::get()?.unix_timestamp;
       60 +        msg!("Donor marked deceased: {:?}", donor.wallet);
       61 +        Ok(())
       62 +    }
       63  }
       64
       65 +// ── Account Structures ─────────────────────────────────────
          +──────────────────
       66 +
       67 +#[account]
       68 +pub struct DonorRegistry {
       69 +    pub authority: Pubkey, // Ministry wallet — only this can
          +call authority-gated functions
       70 +    pub donor_count: u64,
       71 +    pub bump: u8,
       72 +}
       73 +
       74 +#[account]
       75 +pub struct DonorAccount {
       76 +    pub wallet: Pubkey,               // Donor's Solana wallet
       77 +    pub organs_bitmask: u8,           // Bit flags for selecte
          +d organs (see organ_bit)
       78 +    pub nominee_wallet: Option<Pubkey>, // Optional family/nom
          +inee wallet
       79 +    pub ipfs_cid: String,             // IPFS CID of encrypted
          + personal data (never store PII on-chain)
       80 +    pub status: DonorStatus,
       81 +    pub registered_at: i64,           // Unix timestamp
       82 +    pub updated_at: i64,              // Unix timestamp of las
          +t status change
       83 +    pub bump: u8,
       84 +}
       85 +
       86 +impl DonorAccount {
       87 +    // 8  = discriminator
       88 +    // 32 = wallet Pubkey
       89 +    // 1  = organs_bitmask u8
       90 +    // 33 = Option<Pubkey> (1 byte tag + 32 bytes)
       91 +    // 68 = String ipfs_cid (4 byte length prefix + 64 bytes m
          +ax)
       92 +    // 1  = status enum
       93 +    // 8  = registered_at i64
       94 +    // 8  = updated_at i64
       95 +    // 1  = bump u8
       96 +    pub const SPACE: usize = 8 + 32 + 1 + (1 + 32) + (4 + 64)
          ++ 1 + 8 + 8 + 1;
       97 +}
       98 +
       99 +// ── Organ Bitmask Constants ────────────────────────────────
          +──────────────────
      100 +// Use bitwise OR to combine: e.g. HEART | LIVER = 0b00000011
          += 3
      101 +pub mod organ_bit {
      102 +    pub const HEART: u8        = 1 << 0; // 1
      103 +    pub const LIVER: u8        = 1 << 1; // 2
      104 +    pub const LEFT_KIDNEY: u8  = 1 << 2; // 4
      105 +    pub const RIGHT_KIDNEY: u8 = 1 << 3; // 8
      106 +    pub const LUNGS: u8        = 1 << 4; // 16
      107 +    pub const PANCREAS: u8     = 1 << 5; // 32
      108 +    pub const CORNEA: u8       = 1 << 6; // 64
      109 +    pub const SKIN: u8         = 1 << 7; // 128
      110 +}
      111 +
      112 +// ── Enums ──────────────────────────────────────────────────
          +──────────────────
      113 +
      114 +#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)
          +]
      115 +pub enum DonorStatus {
      116 +    Active,   // Consent given and valid
      117 +    Revoked,  // Donor withdrew consent
      118 +    Deceased, // Marked by authority — triggers organ allocati
          +on
      119 +}
      120 +
      121 +// ── Contexts (instruction account validation) ──────────────
          +──────────────────
      122 +
      123  #[derive(Accounts)]
       16 -pub struct Initialize {}
      124 +pub struct InitializeRegistry<'info> {
      125 +    #[account(
      126 +        init,
      127 +        payer = authority,
      128 +        space = 8 + 32 + 8 + 1,
      129 +        seeds = [b"registry"],
      130 +        bump
      131 +    )]
      132 +    pub registry: Account<'info, DonorRegistry>,
      133 +    #[account(mut)]
      134 +    pub authority: Signer<'info>,
      135 +    pub system_program: Program<'info, System>,
      136 +}
      137 +
      138 +#[derive(Accounts)]
      139 +pub struct RegisterDonor<'info> {
      140 +    #[account(
      141 +        init,
      142 +        payer = wallet,
      143 +        space = DonorAccount::SPACE,
      144 +        seeds = [b"donor", wallet.key().as_ref()],
      145 +        bump
      146 +    )]
      147 +    pub donor_account: Account<'info, DonorAccount>,
      148 +    #[account(mut, seeds = [b"registry"], bump = registry.bump
          +)]
      149 +    pub registry: Account<'info, DonorRegistry>,
      150 +    #[account(mut)]
      151 +    pub wallet: Signer<'info>,
      152 +    pub system_program: Program<'info, System>,
      153 +}
      154 +
      155 +#[derive(Accounts)]
      156 +pub struct DonorAction<'info> {
      157 +    #[account(
      158 +        mut,
      159 +        seeds = [b"donor", wallet.key().as_ref()],
      160 +        bump = donor_account.bump,
      161 +        has_one = wallet // ensures donor_account.wallet == wa
          +llet.key()
      162 +    )]
      163 +    pub donor_account: Account<'info, DonorAccount>,
      164 +    pub wallet: Signer<'info>,
      165 +}
      166 +
      167 +#[derive(Accounts)]
      168 +pub struct AuthorityAction<'info> {
      169 +    #[account(mut)]
      170 +    pub donor_account: Account<'info, DonorAccount>,
      171 +    #[account(
      172 +        seeds = [b"registry"],
      173 +        bump = registry.bump,
      174 +        has_one = authority // ensures registry.authority == a
          +uthority.key()
      175 +    )]
      176 +    pub registry: Account<'info, DonorRegistry>,
      177 +    pub authority: Signer<'info>,
      178 +}
      179 +
      180 +// ── Errors ─────────────────────────────────────────────────
          +──────────────────
      181 +
      182 +#[error_code]
      183 +pub enum DonorError {
      184 +    #[msg("No organs selected — organs_bitmask must be > 0")]
      185 +    NoOrgansSelected,
      186 +    #[msg("IPFS CID too long — max 64 characters")]
      187 +    CidTooLong,
      188 +    #[msg("Donor status is not Active")]
      189 +    NotActive,
      190 +}
    }
}

#[derive(Accounts)]
pub struct Initialize {}
