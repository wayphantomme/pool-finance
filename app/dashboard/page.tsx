"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { VaultCard } from "../components/vault-card";
import { useWallet } from "@solana/wallet-adapter-react";
import { useBalance, useSplToken } from "@solana/react-hooks";
import { SolTransferCard } from "../components/sol-transfer-card";
import { PythPrice } from "../components/PythPrice";
import { usePythPrice } from "../hooks/use-pyth-price";

// Devnet Tokens
const DUSDC_MINT = "USDCoctVLVnvTXBEuP9s8hntucdJokbo17RwHuNXemT";
const DRAY_MINT = "DRay3aNHKdjZ4P4DoRnyxdKh6jBrf4HpjfDkQF7MFPpR";

const DUSDC_LOGO = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png";
const DRAY_LOGO = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png";
const SOL_LOGO = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";

// Mainnet Equivalents for accurate price feeds
const MAINNET_RAY = "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R";

export default function DashboardPage() {
    const { publicKey, connected } = useWallet();
    const { price: pythSolPrice } = usePythPrice();

    const [prices, setPrices] = useState<{ [key: string]: number }>({});

    // Fetch live prices via Jupiter API
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                // Fetching RAY price (Since USDC is pegged to 1)
                const res = await fetch(`https://price.jup.ag/v6/price?ids=${MAINNET_RAY}`);
                const data = await res.json();
                if (data.data) {
                    setPrices({
                        RAY: data.data[MAINNET_RAY]?.price || 0
                    });
                }
            } catch (error) {
                console.error("Error fetching Jupiter prices:", error);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 30000); // 30s update
        return () => clearInterval(interval);
    }, []);

    // Get real SOL balance
    const walletAddress = connected && publicKey ? publicKey.toString() : undefined;
    const { lamports } = useBalance(walletAddress);

    const solAmount = lamports ? Number(lamports) / 1_000_000_000 : 0;
    const solPrice = pythSolPrice || 0;
    const solValueUsd = solAmount * solPrice;

    // Get real dUSDC balance
    const { balance: usdcBalance } = useSplToken(DUSDC_MINT, { owner: walletAddress });
    const usdcAmount = usdcBalance ? Number(usdcBalance.amount) / Math.pow(10, usdcBalance.decimals) : 0;
    const usdcValueUsd = usdcAmount; // 1:1 for USDC inherently

    // Get real dRAY balance
    const { balance: rayBalance } = useSplToken(DRAY_MINT, { owner: walletAddress });
    const rayAmount = rayBalance ? Number(rayBalance.amount) / Math.pow(10, rayBalance.decimals) : 0;
    const rayPrice = prices.RAY || 0;
    const rayValueUsd = rayAmount * rayPrice;

    const totalBalance = solValueUsd + usdcValueUsd + rayValueUsd;

    return (
        <div className="relative min-h-screen pt-24 pb-12 overflow-x-hidden">
            <Navbar />

            <main className="max-w-6xl mx-auto px-6 mt-12">
                <h1 className="text-3xl font-bold mb-8 tracking-tight text-white drop-shadow-md">
                    Dashboard
                </h1>

                {connected ? (
                    <div className="flex flex-col gap-8">
                        {/* Stats Row: Balance & Oracle aligned side-by-side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Balance Card */}
                            <div className="glass rounded-3xl p-6 relative overflow-hidden flex flex-col justify-center min-h-[140px] group transition-all hover:bg-white/5 border border-white/10 hover:border-primary/30">
                                <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all" />
                                <div className="relative z-10">
                                    <div className="text-muted text-xs uppercase tracking-widest font-bold mb-2">Total Balance (Live Oracle)</div>
                                    <div className="text-4xl font-black text-white tracking-tighter">
                                        ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                            {/* Oracle Card */}
                            <PythPrice />
                        </div>

                        {/* Layout Grid: Assets/Vault (Left) | Interactive Widgets (Right) */}
                        <div className="grid md:grid-cols-[1fr_400px] gap-8 items-start">
                            {/* Left Column */}
                            <div className="flex flex-col gap-8">
                                {/* Assets Container */}
                                <div>
                                    <h2 className="text-xl font-semibold mb-4 text-white/90">Your Assets</h2>
                                    <div className="glass rounded-3xl p-6 relative overflow-hidden">
                                        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />

                                        <div className="space-y-3 relative z-10">
                                            {/* SOL Item */}
                                            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition cursor-pointer group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white/5 border border-white/5 relative shadow-lg group-hover:scale-105 transition-transform">
                                                        <img
                                                            src={SOL_LOGO}
                                                            alt="SOL"
                                                            width={48}
                                                            height={48}
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-lg">SOL</div>
                                                        <div className="text-sm text-muted font-medium">Solana</div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <div className="font-bold text-white text-lg">{solAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
                                                    <div className="text-sm text-muted font-medium flex items-center gap-1">
                                                        {solPrice > 0 && <span className="text-[10px] text-white/30">(@ ${solPrice.toFixed(2)})</span>}
                                                        ${solValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* USDC Item */}
                                            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition cursor-pointer group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white/5 border border-white/5 relative shadow-lg group-hover:scale-105 transition-transform">
                                                        <img
                                                            src={DUSDC_LOGO}
                                                            alt="dUSDC"
                                                            width={48}
                                                            height={48}
                                                            className="object-contain p-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-lg">dUSDC</div>
                                                        <div className="text-sm text-muted font-medium">USD Coin (Devnet)</div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <div className="font-bold text-white text-lg">{usdcAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                                    <div className="text-sm text-muted font-medium flex items-center gap-1">
                                                        <span className="text-[10px] text-white/30">(@ $1.00)</span>
                                                        ${usdcValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* RAY Item */}
                                            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition cursor-pointer group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white/5 border border-white/5 relative shadow-lg group-hover:scale-105 transition-transform">
                                                        <img
                                                            src={DRAY_LOGO}
                                                            alt="dRAY"
                                                            width={48}
                                                            height={48}
                                                            className="object-contain p-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-lg">dRAY</div>
                                                        <div className="text-sm text-muted font-medium">Raydium Token (Devnet)</div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <div className="font-bold text-white text-lg">{rayAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                                    <div className="text-sm text-muted font-medium flex items-center gap-1">
                                                        {rayPrice > 0 && <span className="text-[10px] text-white/30">(@ ${rayPrice.toFixed(2)})</span>}
                                                        ${rayValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Vault Interactions */}
                                <div>
                                    <h2 className="text-xl font-semibold mb-4 text-white/90">Smart Contract (Vault)</h2>
                                    <div className="[&>div]:border-white/5 [&>div]:bg-white/5 [&>div]:backdrop-blur-xl [&>div]:text-white">
                                        <VaultCard />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column (Sidebar) */}
                            <div className="sticky top-28 flex flex-col gap-8">
                                <SolTransferCard />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center glass rounded-3xl mx-auto max-w-2xl border-dashed border-2 border-white/10">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-muted">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v4M9 13h6" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-white">Wallet Not Connected</h2>
                        <p className="text-muted text-lg max-w-md mx-auto mb-8">
                            Connect a Solana wallet to access your portfolio, trade tokens, and interact with the vault.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
