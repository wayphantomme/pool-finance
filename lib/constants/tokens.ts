import { SOL_MINT, USDC_MINT } from "../jupiter";

export interface TokenInfo {
    mint: string;
    symbol: string;
    name: string;
    logo: string;
    decimals: number;
}

export const TOKENS: Record<string, TokenInfo> = {
    [SOL_MINT]: {
        mint: SOL_MINT,
        symbol: "SOL",
        name: "Solana",
        logo: "/tokens/sol.svg",
        decimals: 9,
    },
    [USDC_MINT]: {
        mint: USDC_MINT,
        symbol: "USDC",
        name: "USD Coin",
        logo: "/tokens/usdc.svg",
        decimals: 6,
    },
};

// Map Mint strings to their info for easy lookup
export const getTokenByMint = (mint: string): TokenInfo | undefined => {
    // Jupiter returns SOL as 'So111...' but sometimes we use different mints
    // Ensure we match correctly
    return TOKENS[mint];
};

/**
 * Note: Changing logos here is murni frontend.
 * It does not affect blockchain logic, swap functionality, or Jupiter API.
 */
