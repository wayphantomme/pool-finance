"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { StakingCard } from "../components/StakingCard";
import { TrendingUp, Users, Lock, Zap } from "lucide-react";

export default function StakingPage() {
    const [tvl, setTvl] = useState(42842069.42);
    const [stakers, setStakers] = useState(12482);

    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly fluctuate TVL by a small amount
            setTvl(prev => prev + (Math.random() - 0.45) * 100);

            // Randomly add/remove a staker
            if (Math.random() > 0.8) {
                setStakers(prev => prev + (Math.random() > 0.5 ? 1 : -1));
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const formatTVL = (val: number) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
        return `$${val.toFixed(2)}`;
    };

    const formatStakers = (val: number) => {
        return val.toLocaleString();
    };
    return (
        <div className="relative min-h-screen bg-[#0a0a0b] text-white">
            <Navbar />

            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 pt-32 pb-20 px-4 max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
                    {/* Left Column: Info & Stats */}
                    <div className="flex-1 space-y-8 max-w-xl">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                                <Zap className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">High Yield Staking</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
                                Maximize Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-400">
                                    Solana Yields
                                </span>
                            </h1>
                            <p className="text-white/50 text-lg leading-relaxed">
                                Stake your SOL tokens to earn consistent rewards
                                while contributing to the network's liquidity and security.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass rounded-[32px] p-6 border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-green-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="p-2 w-fit rounded-xl bg-green-400/10 mb-4 text-green-400">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <h4 className="text-3xl font-black mb-1 tabular-nums animate-in fade-in duration-700">
                                    {formatTVL(tvl)}
                                </h4>
                                <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Total Value Locked</p>
                            </div>
                            <div className="glass rounded-[32px] p-6 border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="p-2 w-fit rounded-xl bg-primary/10 mb-4 text-primary">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h4 className="text-3xl font-black mb-1 tabular-nums animate-in fade-in duration-700">
                                    {formatStakers(stakers)}
                                </h4>
                                <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Active Stakers</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white/30 px-2">Why Stake with Pool?</h3>
                            <div className="grid gap-3">
                                {[
                                    { title: "No Lock-up Period", desc: "Withdraw your tokens anytime without penalties." },
                                    { title: "Auto-Compounding", desc: "Your rewards are automatically reinvested for maximum growth." },
                                    { title: "Protocol Security", desc: "Built with industry-leading audited smart contracts." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition">
                                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition">
                                            <Lock className="w-5 h-5 text-white/40 group-hover:text-primary transition" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-white/90">{item.title}</h5>
                                            <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Staking Card */}
                    <div className="w-full lg:w-auto flex justify-center sticky top-32">
                        <StakingCard />
                    </div>
                </div>
            </main>
        </div>
    );
}
