"use client";

import { address } from "@solana/kit";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSolTransfer } from "@solana/react-hooks";

const LAMPORTS_PER_SOL = 1_000_000_000n;

function parseLamports(input: string) {
    const value = Number(input);
    if (!Number.isFinite(value) || value <= 0) return null;
    const lamports = BigInt(Math.floor(value * Number(LAMPORTS_PER_SOL)));
    return lamports > 0 ? lamports : null;
}

export function SolTransferCard() {
    const { connected } = useWallet();
    const { send, isSending, signature } = useSolTransfer();
    const [destination, setDestination] = useState("");
    const [amount, setAmount] = useState("0.001");
    const [error, setError] = useState<string | null>(null);

    const statusText =
        connected ? "Wallet connected" : "Wallet disconnected";

    async function sendSol() {
        if (!connected) {
            setError("Connect a wallet first.");
            return;
        }
        const lamports = parseLamports(amount);
        if (!lamports) {
            setError("Enter an amount greater than 0.");
            return;
        }
        const dest = destination.trim();
        if (!dest) {
            setError("Enter a destination address.");
            return;
        }
        setError(null);
        try {
            await send({
                destination: address(dest),
                amount: lamports,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send SOL");
            return;
        }
        setAmount("0.001");
    }

    return (
        <section className="space-y-4 rounded-3xl glass p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
            <div className="relative z-10 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">SOL Transfer</p>
                <h2 className="text-xl font-semibold text-white">Send SOL natively</h2>
                <p className="text-sm text-muted">Uses the connected signer to securely authorize a transfer.</p>
            </div>

            <div className="relative z-10 space-y-4 pt-2">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/90" htmlFor="destination">
                        Destination Address
                    </label>
                    <input
                        id="destination"
                        value={destination}
                        onChange={(event) => setDestination(event.target.value)}
                        placeholder="Wallet address"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder/60 transition"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/90" htmlFor="amount">
                        Amount (SOL)
                    </label>
                    <input
                        id="amount"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        type="number"
                        min="0"
                        step="0.001"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
                    />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <p className="text-xs font-medium text-muted">Status: <span className={connected ? "text-green-400" : "text-red-400"}>{statusText}</span></p>
                    <button
                        type="button"
                        onClick={() => void sendSol()}
                        disabled={!connected || isSending}
                        className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 transition shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                    >
                        {isSending ? "Sending…" : "Send SOL"}
                    </button>
                </div>

                {signature ? (
                    <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200 mt-4 backdrop-blur-sm">
                        <p className="font-semibold mb-1">Transfer sent successfully!</p>
                        <a
                            className="text-primary hover:text-primary-foreground underline transition"
                            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            View on Solana Explorer →
                        </a>
                    </div>
                ) : null}

                {error ? (
                    <p className="text-sm font-semibold text-red-400 mt-2 bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>
                ) : null}
            </div>
        </section>
    );
}
