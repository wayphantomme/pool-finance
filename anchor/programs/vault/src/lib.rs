use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("AGMkTMHFaAXMgnA2cCcb5sy6y4YofXcTbjujaaCGHJ1Z");

#[program]
pub mod vault {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        let vault_state = &mut ctx.accounts.vault_state;
        vault_state.is_initialized = true;
        Ok(())
    }

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        let user_state = &mut ctx.accounts.user_state;
        user_state.is_initialized = true;
        user_state.amount_staked = 0;
        user_state.owner = ctx.accounts.signer.key();
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, VaultError::InvalidAmount);

        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.signer.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
            ),
            amount,
        )?;

        let user_state = &mut ctx.accounts.user_state;
        user_state.amount_staked = user_state.amount_staked.checked_add(amount).unwrap();

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, VaultError::InvalidAmount);
        let user_state = &mut ctx.accounts.user_state;
        require!(user_state.amount_staked >= amount, VaultError::InsufficientStake);

        let bump = ctx.bumps.vault;
        let signer_seeds: &[&[&[u8]]] = &[&[b"vault", &[bump]]];

        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.signer.to_account_info(),
                },
                signer_seeds,
            ),
            amount,
        )?;

        user_state.amount_staked = user_state.amount_staked.checked_sub(amount).unwrap();

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    
    /// CHECK: This is a system account to hold SOL, verified by seeds
    #[account(
        mut,
        seeds = [b"vault"],
        bump,
    )]
    pub vault: AccountInfo<'info>,
    
    #[account(
        init,
        payer = signer,
        space = 8 + 1,
        seeds = [b"vault_state"],
        bump
    )]
    pub vault_state: Account<'info, VaultState>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    
    #[account(
        init,
        payer = signer,
        space = 8 + 1 + 8 + 32,
        seeds = [b"user_state", signer.key().as_ref()],
        bump
    )]
    pub user_state: Account<'info, UserState>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    
    /// CHECK: This is a system account to hold SOL, verified by seeds
    #[account(
        mut,
        seeds = [b"vault"],
        bump,
    )]
    pub vault: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [b"user_state", signer.key().as_ref()],
        bump
    )]
    pub user_state: Account<'info, UserState>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    
    /// CHECK: This is a system account to hold SOL, verified by seeds
    #[account(
        mut,
        seeds = [b"vault"],
        bump,
    )]
    pub vault: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [b"user_state", signer.key().as_ref()],
        bump
    )]
    pub user_state: Account<'info, UserState>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct VaultState {
    pub is_initialized: bool,
}

#[account]
pub struct UserState {
    pub is_initialized: bool,
    pub amount_staked: u64,
    pub owner: Pubkey,
}

#[error_code]
pub enum VaultError {
    #[msg("Vault already exists")]
    VaultAlreadyExists,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient stake")]
    InsufficientStake,
}
