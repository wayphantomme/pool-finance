"use client";

import { Navbar } from "../components/Navbar";
import { VaultCard } from "../components/vault-card";
import { useWallet } from "@solana/wallet-adapter-react";
import { useBalance, useSplToken } from "@solana/react-hooks";
import { SolTransferCard } from "../components/sol-transfer-card";
import { PythPrice } from "../components/PythPrice";
import { usePythPrice } from "../hooks/use-pyth-price";
import { TOKENS } from "@/lib/constants/tokens";
import { SOL_MINT, USDC_MINT } from "@/lib/jupiter";
import Image from "next/image";

export default function DashboardPage() {
    const { publicKey, connected } = useWallet();
    const { price: solPrice } = usePythPrice();

    // Get real SOL balance
    const walletAddress = connected && publicKey ? publicKey.toString() : undefined;
    const { lamports } = useBalance(walletAddress);

    const solAmount = lamports ? Number(lamports) / 1_000_000_000 : 0;
    const solValueUsd = solPrice ? solAmount * solPrice : 0;

    // Get real USDC balance
    const { balance: usdcBalance } = useSplToken(USDC_MINT, { owner: walletAddress });
    const usdcAmount = usdcBalance ? Number(usdcBalance.amount) / Math.pow(10, usdcBalance.decimals) : 0;
    const usdcValueUsd = usdcAmount; // 1:1 for USDC

    const totalBalance = solValueUsd + usdcValueUsd;

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
                                    <div className="text-muted text-xs uppercase tracking-widest font-bold mb-2">Total Balance</div>
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
                                                        <Image
                                                            src={TOKENS[SOL_MINT].logo}
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
                                                <div className="text-right">
                                                    <div className="font-bold text-white text-lg">{solAmount.toFixed(4)}</div>
                                                    <div className="text-sm text-muted font-medium">
                                                        ${solValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* USDC Item */}
                                            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition cursor-pointer group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white/5 border border-white/5 relative shadow-lg group-hover:scale-105 transition-transform">
                                                        <Image
                                                            src={TOKENS[USDC_MINT].logo}
                                                            alt="USDC"
                                                            width={48}
                                                            height={48}
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-lg">USDC</div>
                                                        <div className="text-sm text-muted font-medium">USD Coin</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-white text-lg">{usdcAmount.toFixed(2)}</div>
                                                    <div className="text-sm text-muted font-medium">${usdcValueUsd.toFixed(2)}</div>
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
