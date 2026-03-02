use anchor_lang::prelude::*;
use pyth_sdk_solana::load_price_feed_from_account_info;

// Ganti ID ini dengan address program Anda setelah melakukan `anchor keys sync`
declare_id!("8z8b9Q5Kx7XvqjJ2wW3VpD9E4M3wW4K5C6b7A8a9B0C1");

#[program]
pub mod pyth_reader {
    use super::*;

    /// Instruction untuk membaca harga dari akun oracle Pyth Network
    pub fn read_price(ctx: Context<ReadPrice>) -> Result<()> {
        // 1. Mengambil referensi dari account info Pyth feed
        let price_feed_account = &ctx.accounts.price_feed;

        // 2. Membaca data price feed dari account.
        // Jika account bukan format Pyth yang benar, akan mengembalikan Error
        let price_feed = load_price_feed_from_account_info(price_feed_account)
            .map_err(|_| ErrorCode::InvalidPythAccount)?;

        // 3. Mengambil harga aktual (current price), BUKAN Exponential Moving Average (EMA).
        // Akan mengembalikan None jika harga saat ini tidak tersedia atau stale (usang).
        let current_price = price_feed.get_current_price()
            .ok_or(ErrorCode::PriceNotAvailable)?;

        // 4. Mengambil komponen harga integer dan eksponennya
        let price = current_price.price;
        let exponent = current_price.expo;

        // 5. Menghitung harga yang dinormalisasi (price * 10^expo)
        // Catatan: Floating point secara on-chain biasanya dihindari untuk deterministic compute,
        // namun untuk keperluan logging di contoh ini kita gunakan f64.
        let normalized_price = (price as f64) * 10f64.powi(exponent);

        // 6. Mencetak log (msg!)
        msg!("--- Pyth Price Feed ---");
        msg!("Harga (Integer): {}", price);
        msg!("Exponent: {}", exponent);
        msg!("Harga Normalisasi: {}", normalized_price);
        msg!("-----------------------");

        Ok(())
    }
}

/// Struktur context yang berisi akun-akun yang dibutuhkan dalam instruction `read_price`
#[derive(Accounts)]
pub struct ReadPrice<'info> {
    /// Akun oracle Pyth Network (misalnya SOL/USDC price feed)
    /// CHECK: Kita menggunakan unchecked account karena validasi kepemilikan
    /// dan isi data sudah di-handle oleh SDK `load_price_feed_from_account_info`
    pub price_feed: AccountInfo<'info>,
}

/// Custom error untuk menangani kasus gagal baca/harga kosong
#[error_code]
pub enum ErrorCode {
    #[msg("Account Pyth tidak valid atau format tidak sesuai.")]
    InvalidPythAccount,
    #[msg("Harga saat ini tidak tersedia pada oracle Pyth.")]
    PriceNotAvailable,
}
