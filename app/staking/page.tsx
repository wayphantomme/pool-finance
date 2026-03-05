"use client";

import { Navbar } from "../components/Navbar";
import { StakingCard } from "../components/StakingCard";

export default function StakingPage() {
    return (
        <div className="relative min-h-screen bg-[#0a0a0b] text-white">
            <Navbar />

            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 pt-32 pb-20 px-4 max-w-6xl mx-auto flex items-center justify-center">
                <div className="w-full lg:w-auto flex justify-center">
                    <StakingCard />
                </div>
            </main>
        </div>
    );
}
