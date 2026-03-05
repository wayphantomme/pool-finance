"use client";

import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { JupiterSwapCard } from "../components/JupiterSwapCard";
import { RaydiumSwapCard } from "../components/RaydiumSwapCard";

type SwapMode = "jupiter" | "raydium";

export default function SwapPage() {
    const [mode, setMode] = useState<SwapMode>("jupiter");

    return (
        <div className="relative min-h-screen bg-[#0a0a0b] text-white">
            <Navbar />

            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 pt-32 pb-20 px-4 flex flex-col items-center">
                <div className="w-full max-w-md">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold tracking-tight">Token Swap</h1>
                            <p className="text-xs text-white/40 mt-1">Multi-protocol routing</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-yellow-500 font-bold uppercase">Devnet</div>
                        </div>
                    </div>

                    {/* Mode Toggler */}
                    <div className="flex p-1 bg-white/5 rounded-2xl relative z-10 mb-6 w-full">
                        <button
                            onClick={() => setMode("jupiter")}
                            className={`flex-1 py-3 text-sm rounded-xl font-bold transition-all ${mode === "jupiter" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white"}`}
                        >
                            Jupiter Route
                        </button>
                        <button
                            onClick={() => setMode("raydium")}
                            className={`flex-1 py-3 text-sm rounded-xl font-bold transition-all ${mode === "raydium" ? "bg-blue-600 text-white shadow-lg" : "text-white/40 hover:text-white"}`}
                        >
                            Raydium Pool
                        </button>
                    </div>

                    {mode === "jupiter" ? <JupiterSwapCard /> : <RaydiumSwapCard />}

                </div>
            </main>
        </div>
    );
}
