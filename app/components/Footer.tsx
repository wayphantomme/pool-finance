"use client";

import { Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full py-6 mt-auto border-t border-white/5 bg-transparent">
            <div className="max-w-6xl mx-auto px-6 flex justify-between items-center text-white/20">
                <span className="text-[10px] font-bold uppercase tracking-widest">
                    © 2025 Pool Finance. All rights reserved.
                </span>
                <a
                    href="https://github.com/wayphantomme/pool-finance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                >
                    <Github className="w-5 h-5" />
                </a>
            </div>
        </footer>
    );
}
