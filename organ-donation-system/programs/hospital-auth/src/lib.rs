use anchor_lang::prelude::*;

  declare_id!("77ftahiZ8WbLm54m94hvsW3dVevYoQQu1eXcMSmjcmoQ");

  #[program]
  pub mod hospital_auth {
      use super::*;

      // NOTTO registers itself as the national authority
      pub fn initialize_registry(ctx: Context<InitializeRegistry>, notto_wallet:
   Pubkey) -> Result<()> {
          let registry = &mut ctx.accounts.registry;
          registry.notto = notto_wallet;
          registry.hospital_count = 0;
          registry.authority_count = 0;
          msg!("Registry initialized. NOTTO: {:?}", notto_wallet);
          Ok(())
      }

      // NOTTO registers an authority (SOTTO or ROTTO)
      pub fn register_authority(
          ctx: Context<RegisterAuthority>,
          authority_wallet: Pubkey,
          tier: AuthorityTier,
          region: String,
      ) -> Result<()> {
          require!(
              ctx.accounts.registry.notto == ctx.accounts.signer.key(),
              HospitalAuthError::Unauthorized
          );
          let authority = &mut ctx.accounts.authority;
          authority.wallet = authority_wallet;
          authority.tier = tier;
          authority.region = region;
          authority.is_active = true;
          ctx.accounts.registry.authority_count += 1;
          msg!("Authority registered: {:?}", authority_wallet);
          Ok(())
      }

      // NOTTO whitelists a hospital
      pub fn register_hospital(
          ctx: Context<RegisterHospital>,
          hospital_wallet: Pubkey,
          license_hash: String,
          role: HospitalRole,
          name: String,
      ) -> Result<()> {
          require!(
              ctx.accounts.registry.notto == ctx.accounts.signer.key(),
              HospitalAuthError::Unauthorized
          );
          let hospital = &mut ctx.accounts.hospital;
          hospital.wallet = hospital_wallet;
          hospital.license_hash = license_hash;
          hospital.role = role;
          hospital.name = name;
          hospital.is_verified = true;
          ctx.accounts.registry.hospital_count += 1;
          msg!("Hospital registered: {}", hospital.name);
          Ok(())
      }

      // NOTTO revokes a hospital
      pub fn revoke_hospital(ctx: Context<RevokeHospital>) -> Result<()> {
          require!(
              ctx.accounts.registry.notto == ctx.accounts.signer.key(),
              HospitalAuthError::Unauthorized
          );
          ctx.accounts.hospital.is_verified = false;
          msg!("Hospital revoked");
          Ok(())
      }
  }

  // ── Accounts
  ──────────────────────────────────────────────────────────────────

  #[account]
  pub struct Registry {
      pub notto: Pubkey,
      pub hospital_count: u64,
      pub authority_count: u64,
  }

  #[account]
  pub struct Authority {
      pub wallet: Pubkey,
      pub tier: AuthorityTier,
      pub region: String,
      pub is_active: bool,
  }

  #[account]
  pub struct Hospital {
      pub wallet: Pubkey,
      pub license_hash: String,
      pub role: HospitalRole,
      pub name: String,
      pub is_verified: bool,
  }

  // ── Enums
  ─────────────────────────────────────────────────────────────────────

  #[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
  pub enum AuthorityTier {
      NOTTO,
      SOTTO,
      ROTTO,
  }

  #[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
  pub enum HospitalRole {
      ICU,
      TransplantCenter,
      Both,
  }

  // ── Contexts
  ──────────────────────────────────────────────────────────────────

  #[derive(Accounts)]
  pub struct InitializeRegistry<'info> {
      #[account(init, payer = signer, space = 8 + 32 + 8 + 8)]
      pub registry: Account<'info, Registry>,
      #[account(mut)]
      pub signer: Signer<'info>,
      pub system_program: Program<'info, System>,
  }

  #[derive(Accounts)]
  #[instruction(authority_wallet: Pubkey, tier: AuthorityTier, region: String)]
  pub struct RegisterAuthority<'info> {
      #[account(mut)]
      pub registry: Account<'info, Registry>,
      #[account(
          init,
          payer = signer,
          space = 8 + 32 + 2 + 4 + 64 + 1,
          seeds = [b"authority", authority_wallet.as_ref()],
          bump
      )]
      pub authority: Account<'info, Authority>,
      #[account(mut)]
      pub signer: Signer<'info>,
      pub system_program: Program<'info, System>,
  }

  #[derive(Accounts)]
  #[instruction(hospital_wallet: Pubkey, license_hash: String, role:
  HospitalRole, name: String)]
  pub struct RegisterHospital<'info> {
      #[account(mut)]
      pub registry: Account<'info, Registry>,
      #[account(
          init,
          payer = signer,
          space = 8 + 32 + 4 + 64 + 2 + 4 + 100 + 1,
          seeds = [b"hospital", hospital_wallet.as_ref()],
          bump
      )]
      pub hospital: Account<'info, Hospital>,
      #[account(mut)]
      pub signer: Signer<'info>,
      pub system_program: Program<'info, System>,
  }

  #[derive(Accounts)]
  pub struct RevokeHospital<'info> {
      pub registry: Account<'info, Registry>,
      #[account(mut)]
      pub hospital: Account<'info, Hospital>,
      pub signer: Signer<'info>,
  }

  // ── Errors
  ────────────────────────────────────────────────────────────────────

  #[error_code]
  pub enum HospitalAuthError {
      #[msg("Only NOTTO can perform this action")]
      Unauthorized,
  }