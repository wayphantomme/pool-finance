"use client";

import { usePythPrice } from "../hooks/use-pyth-price";
import { TOKENS } from "@/lib/constants/tokens";
import { SOL_MINT } from "@/lib/jupiter";
import Image from "next/image";

export function PythPrice() {
    const { price, loading, error } = usePythPrice();

    return (
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all group overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all" />

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white/5 border border-white/5 relative shadow-lg">
                        <Image
                            src={TOKENS[SOL_MINT].logo}
                            alt="SOL"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-muted uppercase tracking-widest">Pyth Oracle</div>
                        <div className="text-sm font-semibold text-white">SOL / USDC</div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-tighter">Live</span>
                </div>
            </div>

            <div className="mt-2 relative z-10">
                {loading ? (
                    <div className="h-8 w-32 bg-white/5 animate-pulse rounded-lg" />
                ) : error ? (
                    <div className="text-red-400 text-sm font-bold">{error}</div>
                ) : (
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white tracking-tighter">
                            ${price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs font-medium text-muted">USD</span>
                    </div>
                )}
            </div>
        </div>
    );
}
