import { Navbar } from "./components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen pt-24 overflow-x-hidden flex flex-col">
      <Navbar hideWalletButton={true} />

      <main className="flex-1 flex flex-col pt-16 px-6 relative z-10 w-full max-w-6xl mx-auto items-center text-center">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border-primary/30">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium text-white/80">Solana Devnet Live</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
          The Premium Web3 <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-sky-400 drop-shadow-lg">
            Liquidity Protocol
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
          Swap tokens seamlessly, manage your portfolio, and earn yields with lightning-fast execution on the Solana blockchain.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link href="/dashboard" className="px-8 py-4 w-full sm:w-auto rounded-full bg-primary text-white font-bold text-lg hover:bg-primary/90 transition shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(139,92,246,0.7)] group">
            Launch App
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <a href="#features" className="px-8 py-4 w-full sm:w-auto rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition backdrop-blur-md hover:-translate-y-1">
            Learn More
          </a>
        </div>

        {/* Mock Stats */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 w-full border-t border-white/5 pt-12 pb-20">
          <div className="glass rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-4xl font-black text-white mb-2 tracking-tighter">$2.4B+</div>
            <div className="text-muted text-xs uppercase tracking-widest font-bold">Total Volume</div>
          </div>
          <div className="glass rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-4xl font-black text-white mb-2 tracking-tighter">100k+</div>
            <div className="text-muted text-xs uppercase tracking-widest font-bold">Active Users</div>
          </div>
          <div className="glass rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-4xl font-black text-white mb-2 tracking-tighter">&lt; 0.1s</div>
            <div className="text-muted text-xs uppercase tracking-widest font-bold">Execution Time</div>
          </div>
          <div className="glass rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-4xl font-black text-white mb-2 tracking-tighter">$0.001</div>
            <div className="text-muted text-xs uppercase tracking-widest font-bold">Avg Tx Cost</div>
          </div>
        </div>
      </main>
    </div>
  );
}
