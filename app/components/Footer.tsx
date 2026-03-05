"use client";

import Link from "next/link";
import { Github, Heart } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full py-8 mt-auto border-t border-white/5 bg-background/40 backdrop-blur-xl relative z-20">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-col items-center md:items-start gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-white" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="font-bold text-white tracking-tight">
                            Pool<span className="text-primary font-black"> Finance</span>
                        </span>
                    </div>
                    <p className="text-[10px] text-white/30 font-medium">
                        © {new Date().getFullYear()} Phantoms. All rights reserved.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <a
                        href="https://github.com/wayphantomme/pool-finance"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all hover:bg-white/10"
                    >
                        <Github className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                        <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors">GitHub</span>
                    </a>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    <span>Built with</span>
                    <Heart className="w-3 h-3 text-red-500/50 fill-red-500/10" />
                    <span>on Solana</span>
                </div>
            </div>
        </footer>
    );
}
