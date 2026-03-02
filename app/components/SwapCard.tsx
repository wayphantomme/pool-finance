"use client";

import { useState } from "react";
import { useWallet } from "@solana/react-hooks";
import { usePythPrice } from "../hooks/use-pyth-price";

export function SwapCard() {
    const wallet = useWallet();
    const status = wallet.status;
    const [fromAmount, setFromAmount] = useState("");
    const isConnected = status === "connected";
    const { price: solPrice } = usePythPrice();

    const toAmount = fromAmount && solPrice
        ? (parseFloat(fromAmount) * solPrice).toFixed(2)
        : "";

    const handleSwap = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fromAmount) return;
        alert(`Mock swap initiated for ${fromAmount} SOL!`);
        setFromAmount("");
    };

    return (
        <div className="w-full max-w-md mx-auto glass rounded-3xl p-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <form onSubmit={handleSwap} className="relative z-10 p-4 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between px-2 pb-2">
                    <h2 className="text-lg font-semibold text-white">Swap</h2>
                    <button type="button" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition text-muted hover:text-white">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>

                {/* You Pay Section */}
                <div className="bg-background/40 rounded-2xl p-4 border border-white/5 transition-colors focus-within:border-primary/50">
                    <label className="text-sm font-medium text-muted mb-2 block">You pay</label>
                    <div className="flex items-center justify-between gap-4">
                        <input
                            type="number"
                            placeholder="0.0"
                            value={fromAmount}
                            onChange={(e) => setFromAmount(e.target.value)}
                            className="bg-transparent text-4xl font-semibold text-white outline-none w-full placeholder:text-white/20"
                            min="0"
                            step="any"
                        />
                        <button type="button" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-full border border-white/10 shrink-0">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center self-center shadow-inner">
                                <span className="text-[10px] text-white font-bold leading-none">SOL</span>
                            </div>
                            <span className="font-semibold text-white">SOL</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-muted">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Swap Icon */}
                <div className="relative h-2 flex items-center justify-center">
                    <button type="button" className="absolute z-10 bg-card border border-white/10 p-2 rounded-xl text-white hover:bg-white/10 hover:rotate-180 transition-all duration-300">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                    </button>
                </div>

                {/* You Receive Section */}
                <div className="bg-background/40 rounded-2xl p-4 border border-white/5 transition-colors">
                    <label className="text-sm font-medium text-muted mb-2 block">You receive</label>
                    <div className="flex items-center justify-between gap-4">
                        <input
                            type="text"
                            placeholder="0.0"
                            value={toAmount}
                            disabled
                            className="bg-transparent text-4xl font-semibold text-white/50 outline-none w-full placeholder:text-white/20"
                        />
                        <button type="button" className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 transition px-4 py-2 rounded-full border border-blue-500/30 shrink-0">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center self-center shadow-inner">
                                $
                            </div>
                            <span className="font-semibold text-white">USDC</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-muted">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Rate Info */}
                {solPrice && (
                    <div className="px-2 flex items-center justify-between">
                        <span className="text-xs text-muted font-medium uppercase tracking-tighter">Current Rate</span>
                        <span className="text-xs text-white/70 font-bold">1 SOL ≈ ${solPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC</span>
                    </div>
                )}

                {/* Action Button */}
                <button
                    type="submit"
                    disabled={!isConnected || !fromAmount}
                    className="w-full mt-2 py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-xl 
            disabled:opacity-50 disabled:cursor-not-allowed
            bg-primary hover:bg-primary/90 text-white disabled:bg-white/10"
                >
                    {isConnected ? (fromAmount ? "Swap" : "Enter an amount") : "Connect Wallet"}
                </button>
            </form>
        </div>
    );
}
