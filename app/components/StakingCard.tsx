"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction, PublicKey, LAMPORTS_PER_SOL, TransactionInstruction, SystemProgram } from "@solana/web3.js";
import { TrendingUp, Info, Loader2, CheckCircle2, AlertCircle, Gift, ExternalLink, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import { TOKENS } from "@/lib/constants/tokens";
import { SOL_MINT } from "@/lib/jupiter";

const VAULT_PROGRAM_ID = new PublicKey("AGMkTMHFaAXMgnA2cCcb5sy6y4YofXcTbjujaaCGHJ1Z");

// Derived PDAs based on the updated program logic
const [GLOBAL_VAULT_PDA] = PublicKey.findProgramAddressSync([Buffer.from("vault")], VAULT_PROGRAM_ID);
const [VAULT_STATE_PDA] = PublicKey.findProgramAddressSync([Buffer.from("vault_state")], VAULT_PROGRAM_ID);

type TxStatus = "idle" | "preparing" | "signing" | "sending" | "confirming" | "success" | "error";

export function StakingCard() {
    const { connection } = useConnection();
    const { connected, publicKey, sendTransaction } = useWallet();

    const [amount, setAmount] = useState("");
    const [txStatus, setTxStatus] = useState<TxStatus>("idle");
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [status, setStatus] = useState<"stake" | "unstake">("stake");
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [solBalance, setSolBalance] = useState<number>(0);
    const [userStatePda, setUserStatePda] = useState<PublicKey | null>(null);

    // Initialization States
    const [isVaultInitialized, setIsVaultInitialized] = useState<boolean | null>(null);
    const [isUserInitialized, setIsUserInitialized] = useState<boolean | null>(null);

    // Actual Staked Balance (from User State PDA)
    const [stakedBalance, setStakedBalance] = useState<number>(0);
    const [rewards, setRewards] = useState<number>(0);

    const token = TOKENS[SOL_MINT];

    // Fetch SOL Balance and Derive User State PDA
    useEffect(() => {
        if (!connected || !publicKey) {
            setSolBalance(0);
            setUserStatePda(null);
            setIsUserInitialized(null);
            return;
        }

        const fetchBalance = async () => {
            try {
                const balance = await connection.getBalance(publicKey);
                setSolBalance(balance / LAMPORTS_PER_SOL);

                // Derive User State PDA: [b"user_state", signer]
                const [pda] = PublicKey.findProgramAddressSync(
                    [Buffer.from("user_state"), publicKey.toBuffer()],
                    VAULT_PROGRAM_ID
                );
                setUserStatePda(pda);
            } catch (e) {
                console.error("Failed to fetch balance or derive PDA", e);
            }
        };

        fetchBalance();
        const id = connection.onAccountChange(publicKey, (info) => {
            setSolBalance(info.lamports / LAMPORTS_PER_SOL);
        });

        return () => {
            connection.removeAccountChangeListener(id).catch(console.error);
        };
    }, [connected, publicKey, connection]);

    // Check Vault State Initialization
    useEffect(() => {
        const checkVault = async () => {
            try {
                const info = await connection.getAccountInfo(VAULT_STATE_PDA);
                setIsVaultInitialized(info !== null);
            } catch (e) {
                setIsVaultInitialized(false);
            }
        };
        checkVault();

        const id = connection.onAccountChange(VAULT_STATE_PDA, (info) => {
            setIsVaultInitialized(true);
        });

        return () => {
            connection.removeAccountChangeListener(id).catch(console.error);
        };
    }, [connection]);

    // Fetch User State Balance & Initialization status
    useEffect(() => {
        if (!userStatePda) {
            setStakedBalance(0);
            setIsUserInitialized(null);
            return;
        }

        const fetchUserState = async () => {
            try {
                const accountInfo = await connection.getAccountInfo(userStatePda);
                if (accountInfo) {
                    setIsUserInitialized(true);
                    // State layout: 8 bytes discriminator + 1 byte (is_initialized) + 8 bytes (amount_staked, u64)
                    const amountBytes = accountInfo.data.subarray(9, 17);
                    let staked = 0n;
                    for (let i = 0; i < 8; i++) {
                        staked += BigInt(amountBytes[i]) << BigInt(i * 8);
                    }
                    setStakedBalance(Number(staked) / LAMPORTS_PER_SOL);
                } else {
                    setIsUserInitialized(false);
                    setStakedBalance(0);
                }
            } catch (e) {
                console.error("Failed to fetch user state", e);
                setIsUserInitialized(false);
                setStakedBalance(0);
            }
        };

        fetchUserState();
        const id = connection.onAccountChange(userStatePda, (info) => {
            setIsUserInitialized(true);
            const amountBytes = info.data.subarray(9, 17);
            let staked = 0n;
            for (let i = 0; i < 8; i++) {
                staked += BigInt(amountBytes[i]) << BigInt(i * 8);
            }
            setStakedBalance(Number(staked) / LAMPORTS_PER_SOL);
        });

        return () => {
            connection.removeAccountChangeListener(id).catch(console.error);
        };
    }, [userStatePda, connection]);

    // Reward Simulation (ticks every second)
    useEffect(() => {
        if (stakedBalance <= 0) {
            setRewards(0);
            return;
        }

        const interval = setInterval(() => {
            // Simulate 7.2% APY rewards per second
            const apy = 0.072;
            const rewardPerSecond = (stakedBalance * apy) / (365 * 24 * 60 * 60);
            setRewards(prev => prev + rewardPerSecond);
        }, 1000);

        return () => clearInterval(interval);
    }, [stakedBalance]);

    const encodeAmount = (lamports: number): Buffer => {
        const amountBuffer = Buffer.alloc(8);
        const amountBI = BigInt(lamports);
        for (let i = 0; i < 8; i++) {
            amountBuffer[i] = Number((amountBI >> BigInt(i * 8)) & 0xFFn);
        }
        return amountBuffer;
    };

    const handleError = (err: any) => {
        console.error("Transaction Error:", err);
        setTxStatus("error");
        if (err.name === "WalletSendTransactionError" || err.message?.includes("rejected") || err.message?.includes("User rejected")) {
            setError("Transaction cancelled by user.");
            setStatusMessage("Cancelled");
        } else {
            setError(err.message || "Failed to complete transaction.");
            setStatusMessage("Transaction Failed");
        }
    };

    const handleInitializeVault = async () => {
        if (!connected || !publicKey) return;
        setTxStatus("preparing");
        setStatusMessage("Preparing transaction...");
        setTxHash(null);
        setError(null);

        try {
            const tx = new Transaction().add(
                new TransactionInstruction({
                    keys: [
                        { pubkey: publicKey, isSigner: true, isWritable: true },
                        { pubkey: GLOBAL_VAULT_PDA, isSigner: false, isWritable: true },
                        { pubkey: VAULT_STATE_PDA, isSigner: false, isWritable: true },
                        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
                    ],
                    programId: VAULT_PROGRAM_ID,
                    data: Buffer.from([48, 191, 163, 44, 71, 129, 63, 164]) // initialize_vault format
                })
            );

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;
            tx.feePayer = publicKey;

            setTxStatus("signing");
            setStatusMessage("Please confirm in wallet...");
            const signature = await sendTransaction(tx, connection);

            setTxStatus("confirming");
            setStatusMessage("Confirming on Blockchain...");
            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature }, "confirmed");

            setTxHash(signature);
            setTxStatus("success");
            setStatusMessage("Vault Initialized Successfully!");
            setIsVaultInitialized(true);
        } catch (e) {
            const err = e as any;
            handleError(err);
        }
    };

    const handleInitializeUser = async () => {
        if (!connected || !publicKey || !userStatePda) return;
        setTxStatus("preparing");
        setStatusMessage("Preparing transaction...");
        setTxHash(null);
        setError(null);

        try {
            const tx = new Transaction().add(
                new TransactionInstruction({
                    keys: [
                        { pubkey: publicKey, isSigner: true, isWritable: true },
                        { pubkey: userStatePda, isSigner: false, isWritable: true },
                        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
                    ],
                    programId: VAULT_PROGRAM_ID,
                    data: Buffer.from([111, 17, 185, 250, 60, 122, 38, 254]) // initialize_user
                })
            );

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;
            tx.feePayer = publicKey;

            setTxStatus("signing");
            setStatusMessage("Please confirm in wallet...");
            const signature = await sendTransaction(tx, connection);

            setTxStatus("confirming");
            setStatusMessage("Confirming on Blockchain...");
            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature }, "confirmed");

            setTxHash(signature);
            setTxStatus("success");
            setStatusMessage("Stake Account Created!");
            setIsUserInitialized(true);
        } catch (e) {
            const err = e as any;
            handleError(err);
        }
    };

    const handleAction = async () => {
        if (!connected || !publicKey || !userStatePda || !amount) {
            setError("Wallet not connected or amount missing");
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        setTxStatus("preparing");
        setStatusMessage("Preparing transaction...");
        setTxHash(null);
        setError(null);

        try {
            const lamports = Math.floor(numAmount * LAMPORTS_PER_SOL);
            const transaction = new Transaction();

            if (status === "stake") {
                const discriminator = Buffer.from([242, 35, 198, 137, 82, 225, 242, 182]); // deposit
                transaction.add(
                    new TransactionInstruction({
                        keys: [
                            { pubkey: publicKey, isSigner: true, isWritable: true },
                            { pubkey: GLOBAL_VAULT_PDA, isSigner: false, isWritable: true },
                            { pubkey: userStatePda, isSigner: false, isWritable: true },
                            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                        ],
                        programId: VAULT_PROGRAM_ID,
                        data: Buffer.concat([discriminator, encodeAmount(lamports)]),
                    })
                );
            } else {
                const discriminator = Buffer.from([183, 18, 70, 156, 148, 109, 161, 34]); // withdraw
                transaction.add(
                    new TransactionInstruction({
                        keys: [
                            { pubkey: publicKey, isSigner: true, isWritable: true },
                            { pubkey: GLOBAL_VAULT_PDA, isSigner: false, isWritable: true },
                            { pubkey: userStatePda, isSigner: false, isWritable: true },
                            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                        ],
                        programId: VAULT_PROGRAM_ID,
                        data: Buffer.concat([discriminator, encodeAmount(lamports)]),
                    })
                );
            }

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            setTxStatus("signing");
            setStatusMessage("Please confirm in wallet...");

            // Send transaction through wallet (simulation is ON by default unless skipPreflight is passed)
            const signature = await sendTransaction(transaction, connection);

            setTxStatus("sending");
            setStatusMessage("Sending to Network...");

            setTxStatus("confirming");
            setStatusMessage("Confirming on Blockchain...");
            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature }, "confirmed");

            setTxHash(signature);
            setTxStatus("success");
            setStatusMessage(`${status === "stake" ? "Staked" : "Unstaked"} Successfully!`);
            setAmount("");
        } catch (e) {
            const err = e as any;
            handleError(err);
        }
    };

    const handleClaim = () => {
        if (rewards <= 0) return;
        setRewards(0);
        setTxHash("REWARDS_CLAIMED_MOCK_" + Math.random().toString(36).substring(7));
        setTxStatus("success");
        setStatusMessage("Rewards Claimed Successfully!");
    };

    const isPending = txStatus === "preparing" || txStatus === "signing" || txStatus === "sending" || txStatus === "confirming";

    // --- Dynamic Render Logic ---

    // If Vault is NOT initialized
    if (connected && isVaultInitialized === false) {
        return (
            <div className="glass rounded-[32px] p-8 border border-white/5 shadow-2xl space-y-6 w-full max-w-md text-center">
                <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Vault Not Initialized</h3>
                <p className="text-white/60 text-sm">The global staking vault has not been created yet. Please initialize it first.</p>

                {txStatus !== "idle" && (
                    <div className={`p-4 rounded-xl border text-sm ${txStatus === "success" ? "bg-green-500/10 border-green-500/20 text-green-500" : txStatus === "error" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-primary/10 border-primary/20 text-primary"}`}>
                        <div className="flex items-center gap-2 justify-center">
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>{statusMessage}</span>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleInitializeVault}
                    disabled={isPending}
                    className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                    Initialize Global Vault
                </button>
            </div>
        );
    }

    // If User State is NOT initialized
    if (connected && isVaultInitialized === true && isUserInitialized === false) {
        return (
            <div className="glass rounded-[32px] p-8 border border-white/5 shadow-2xl space-y-6 w-full max-w-md text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Setup Staking Account</h3>
                <p className="text-white/60 text-sm">You need to create a personal stake account on the blockchain before you can deposit SOL.</p>

                {txStatus !== "idle" && (
                    <div className={`p-4 rounded-xl border text-sm ${txStatus === "success" ? "bg-green-500/10 border-green-500/20 text-green-500" : txStatus === "error" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-primary/10 border-primary/20 text-primary"}`}>
                        <div className="flex items-center gap-2 justify-center">
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>{statusMessage}</span>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleInitializeUser}
                    disabled={isPending}
                    className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                    Create Stake Account
                </button>
            </div>
        );
    }


    return (
        <div className="glass rounded-[32px] p-6 border border-white/5 shadow-2xl space-y-6 w-full max-w-md relative overflow-hidden">
            {/* Background Glow Effect */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full transition-opacity duration-1000 ${isPending ? 'opacity-100 animate-pulse' : 'opacity-50'}`} />

            <div className="flex p-1 bg-white/5 rounded-2xl relative z-10">
                <button
                    onClick={() => setStatus("stake")}
                    disabled={isPending}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${status === "stake" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white disabled:opacity-50"}`}
                >
                    Stake
                </button>
                <button
                    onClick={() => setStatus("unstake")}
                    disabled={isPending}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${status === "unstake" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white disabled:opacity-50"}`}
                >
                    Unstake
                </button>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 group focus-within:border-primary/50 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-white/40 group-focus-within:text-primary/70 transition-colors">Amount to {status}</span>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-white/30 truncate">
                                Wallet: {solBalance.toFixed(4)} SOL
                            </span>
                            <span className="text-[10px] text-primary/60 font-bold truncate">
                                Staked: {stakedBalance.toFixed(4)} SOL
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isPending}
                            placeholder="0.00"
                            className="bg-transparent text-3xl font-semibold outline-none w-full placeholder:text-white/10 disabled:opacity-50"
                        />
                        <button
                            onClick={() => setAmount(status === "stake" ? solBalance.toString() : stakedBalance.toString())}
                            disabled={isPending}
                            className="text-[10px] font-bold text-primary hover:text-primary/80 px-2 py-1 rounded bg-primary/10 transition disabled:opacity-50"
                        >
                            MAX
                        </button>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-2xl border border-white/10 shrink-0">
                            <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center relative">
                                <Image
                                    src={token.logo}
                                    alt={token.symbol}
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                />
                            </div>
                            <span className="font-bold">{token.symbol}</span>
                        </div>
                    </div>
                </div>

                {/* Rewards Section */}
                {stakedBalance > 0 && (
                    <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 flex items-center justify-between animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Gift className="w-5 h-5 text-primary animate-bounce" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-primary/60 tracking-wider">Accrued Rewards</p>
                                <p className="text-xl font-black text-white">{rewards.toFixed(8)} <span className="text-[10px] text-white/40 font-medium">USDC</span></p>
                            </div>
                        </div>
                        <button
                            onClick={handleClaim}
                            disabled={isPending || rewards <= 0}
                            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            Claim
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-400/10 flex items-center justify-center text-green-400">
                            <Zap size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-wider text-white/40 font-bold">APY</p>
                            <p className="text-lg font-black text-green-400">7.2%</p>
                        </div>
                    </div>
                    <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <ShieldCheck size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Rewards</p>
                            <p className="text-lg font-black text-primary">Daily</p>
                        </div>
                    </div>
                </div>

                {/* Status Indicator */}
                {txStatus !== "idle" && (
                    <div className={`p-4 rounded-2xl border transition-all animate-in slide-in-from-top-2 duration-300 ${txStatus === "success" ? "bg-green-500/10 border-green-500/20 text-green-500" :
                        txStatus === "error" ? "bg-red-500/10 border-red-500/20 text-red-500" :
                            "bg-primary/10 border-primary/20 text-primary"
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                    txStatus === "success" ? <CheckCircle2 className="w-4 h-4" /> :
                                        <AlertCircle className="w-4 h-4" />}
                                <span className="text-sm font-bold capitalize">
                                    {statusMessage || txStatus.charAt(0).toUpperCase() + txStatus.slice(1)}
                                </span>
                            </div>
                            {txHash && (
                                <a
                                    href={`https://solscan.io/tx/${txHash}?cluster=devnet`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[10px] font-bold underline hover:opacity-80 transition"
                                >
                                    View on Solscan <ExternalLink size={10} />
                                </a>
                            )}
                        </div>
                        {error && <p className="mt-2 text-[11px] leading-relaxed opacity-80 break-words">{error}</p>}
                    </div>
                )}

                <button
                    disabled={!connected || (!amount && status === "stake") || isPending || (isVaultInitialized === false) || (isUserInitialized === false)}
                    onClick={handleAction}
                    className={`w-full h-14 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 relative z-10 
                        ${txStatus === "success" ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary/90"}
                        disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.3)]
                    `}
                >
                    {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                    {connected ? (isPending ? statusMessage : `${status.charAt(0).toUpperCase() + status.slice(1)} Now`) : "Connect Wallet"}
                </button>
            </div>

            <div className="pt-2 flex items-start gap-2 text-[10px] text-white/30 leading-relaxed relative z-10">
                <Info className="w-3 h-3 shrink-0 mt-0.5" />
                <p>Tokens are locked for 0 days. Rewards are automatically compounded and can be claimed anytime.</p>
            </div>
        </div>
    );
}
