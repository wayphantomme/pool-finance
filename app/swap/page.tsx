"use client";

import { useEffect, useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { ArrowUpDown, Settings, Info, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { SOL_MINT, USDC_MINT, getQuote, getSwapTransaction, QuoteResponse } from "@/lib/jupiter";
import { TOKENS } from "@/lib/constants/tokens";
import Image from "next/image";

const SOL_DECIMALS = TOKENS[SOL_MINT].decimals;
const USDC_DECIMALS = TOKENS[USDC_MINT].decimals;

/**
 * SwapPage Component
 * 
 * SOLUTIONS FOR COMMON ERRORS:
 * 1. Wallet State: Root providers (app/providers.tsx) ensure useWallet() is readable across the app.
 * 2. Security verification failed: This error comes from the wallet's internal simulator (Phantom/Solflare).
 *    - Cause: Simulation fails due to slow Devnet RPCs or lack of token liquidity on Devnet.
 *    - Solution: We use sendTransaction with skipPreflight: true to bypass the initial simulation 
 *      and send the transaction directly to the blockchain.
 * 3. sendTransaction: MUST be used for a secure flow integrated with the Solana Wallet Adapter.
 */
export default function SwapPage() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction, connected, wallet } = useWallet();

    const [inputMint, setInputMint] = useState(SOL_MINT);
    const [outputMint, setOutputMint] = useState(USDC_MINT);
    const [amount, setAmount] = useState("");
    const [quote, setQuote] = useState<QuoteResponse | null>(null);
    const [isFetchingQuote, setIsFetchingQuote] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [slippage, setSlippage] = useState(0.5);
    const [swapStatus, setSwapStatus] = useState<string>("");

    const isSolToUsdc = inputMint === SOL_MINT;

    const handleSwitch = () => {
        setInputMint(outputMint);
        setOutputMint(inputMint);
        setQuote(null);
        setAmount("");
        setTxHash(null);
        setError(null);
        setSwapStatus("");
    };

    const fetchQuote = useCallback(async (val: string) => {
        if (!val || isNaN(Number(val)) || Number(val) <= 0) {
            setQuote(null);
            return;
        }

        setIsFetchingQuote(true);
        setError(null);
        try {
            const decimals = inputMint === SOL_MINT ? SOL_DECIMALS : USDC_DECIMALS;
            const rawAmount = BigInt(Math.floor(Number(val) * Math.pow(10, decimals)));

            const res = await getQuote(inputMint, outputMint, rawAmount, slippage * 100);
            setQuote(res);
        } catch (err: any) {
            console.error(err);
            setError("Failed to fetch quote. Ensure the token has liquidity on Devnet.");
        } finally {
            setIsFetchingQuote(false);
        }
    }, [inputMint, outputMint, slippage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (amount) fetchQuote(amount);
        }, 500);
        return () => clearTimeout(timer);
    }, [amount, fetchQuote]);

    const handleSwap = async () => {
        if (!connected || !publicKey || !quote) return;

        setIsSwapping(true);
        setError(null);
        setTxHash(null);
        setSwapStatus("Fetching transaction data...");

        try {
            // 1. Dapatkan base64 transaction dari Jupiter
            const swapTxBase64 = await getSwapTransaction(quote, publicKey.toString());

            setSwapStatus("Awaiting wallet approval...");

            // 2. Deserialize ke VersionedTransaction (Gunakan Uint8Array agar aman di browser)
            const binaryString = window.atob(swapTxBase64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const transaction = VersionedTransaction.deserialize(bytes);

            // 3. Eksekusi menggunakan sendTransaction
            // skipPreflight: true sangat penting untuk menghindari error "Security verification failed" 
            // karena seringkali emulator wallet gagal mensimulasikan transaksi Jupiter di Devnet.
            const signature = await sendTransaction(transaction, connection, {
                skipPreflight: true,
                preflightCommitment: "confirmed",
            });

            setSwapStatus("Sending & Awaiting On-Chain Confirmation...");

            const latestBlockHash = await connection.getLatestBlockhash();
            await connection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: signature
            }, "confirmed");

            setTxHash(signature);
            setSwapStatus("");
        } catch (err: any) {
            console.error("Swap Error:", err);

            // Penjelasan spesifik untuk error simulasi wallet
            if (err.message?.includes("Security verification failed") || err.name === "WalletSendTransactionError") {
                setError("Wallet failed to send transaction. This is often due to simulation failure on Devnet (Security Warning). Please try again or ensure you have enough balance.");
            } else {
                setError(err.message || "Failed to perform swap.");
            }
            setSwapStatus("");
        } finally {
            setIsSwapping(false);
        }
    };

    const displayOutAmount = quote
        ? (Number(quote.outAmount) / Math.pow(10, outputMint === SOL_MINT ? SOL_DECIMALS : USDC_DECIMALS)).toFixed(6)
        : "0.00";

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
                            <h1 className="text-2xl font-bold tracking-tight">Swap SOL ⇄ USDC</h1>
                            <p className="text-xs text-white/40 mt-1">Solana Devnet Aggregator</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-yellow-500 font-bold uppercase">Devnet</div>
                        </div>
                    </div>

                    <div className="glass rounded-[32px] p-4 border border-white/5 shadow-2xl space-y-2">
                        {/* Input Section */}
                        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-white/40">Pay</span>
                                {connected && <span className="text-[10px] text-white/30 truncate max-w-[150px]">Wallet: {publicKey?.toString().slice(0, 8)}...</span>}
                            </div>
                            <div className="flex gap-4 items-center">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="bg-transparent text-3xl font-semibold outline-none w-full placeholder:text-white/10"
                                />
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-2xl border border-white/10">
                                    <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center relative">
                                        <Image
                                            src={TOKENS[inputMint].logo}
                                            alt={TOKENS[inputMint].symbol}
                                            width={24}
                                            height={24}
                                            className="object-contain"
                                        />
                                    </div>
                                    <span className="font-bold">{TOKENS[inputMint].symbol}</span>
                                </div>
                            </div>
                        </div>

                        {/* Switch icon */}
                        <div className="relative h-2 flex justify-center items-center z-20">
                            <button
                                onClick={handleSwitch}
                                className="absolute bg-[#141416] border border-white/10 p-1.5 rounded-xl hover:scale-110 transition active:scale-95 text-white/80 hover:text-white"
                            >
                                <ArrowUpDown className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Output Section */}
                        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-white/40">Receive (Estimated)</span>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="text-3xl font-semibold w-full flex items-center">
                                    {isFetchingQuote ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    ) : (
                                        displayOutAmount
                                    )}
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-2xl border border-white/10">
                                    <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center relative">
                                        <Image
                                            src={TOKENS[outputMint].logo}
                                            alt={TOKENS[outputMint].symbol}
                                            width={24}
                                            height={24}
                                            className="object-contain"
                                        />
                                    </div>
                                    <span className="font-bold">{TOKENS[outputMint].symbol}</span>
                                </div>
                            </div>
                        </div>

                        {/* Price Info */}
                        {quote && (
                            <div className="px-2 py-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40">Price Impact</span>
                                    <span className={Number(quote.priceImpactPct) > 1 ? "text-red-400" : "text-green-400"}>
                                        {Number(quote.priceImpactPct).toFixed(4)}%
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40">Slippage</span>
                                    <span>{slippage}%</span>
                                </div>
                            </div>
                        )}

                        {/* Status Messages */}
                        {error && (
                            <div className="mx-2 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2 text-red-500 text-[11px] leading-relaxed">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <p className="break-words">{error}</p>
                            </div>
                        )}

                        {swapStatus && (
                            <div className="mx-2 p-3 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-2 text-primary text-xs">
                                <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                                <p className="italic">{swapStatus}</p>
                            </div>
                        )}

                        {txHash && (
                            <div className="mx-2 p-3 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col gap-2 text-green-500 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    <p className="font-bold">Swap Success!</p>
                                </div>
                                <a
                                    href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline opacity-80 hover:opacity-100 break-all font-mono text-[10px]"
                                >
                                    {txHash}
                                </a>
                            </div>
                        )}

                        {/* Action Button */}
                        <div className="pt-2">
                            <button
                                disabled={!connected || !quote || isFetchingQuote || isSwapping}
                                onClick={handleSwap}
                                className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2"
                            >
                                {!connected ? (
                                    "Connect Wallet"
                                ) : isSwapping ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : isFetchingQuote ? (
                                    "Finding Best Route..."
                                ) : !amount ? (
                                    "Enter Amount"
                                ) : (
                                    "Swap Now"
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <h4 className="text-[10px] font-bold text-white/40 uppercase mb-2">Devnet Tips</h4>
                        <p className="text-[10px] text-white/30 leading-relaxed">
                            If a "Security Verification Failed" error appears, it's a simulation warning from the wallet.
                            Try the swap button again or ensure you're using Devnet tokens with liquidity.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
