import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2, AlertCircle, ArrowRightLeft, ArrowDown, Settings, ChevronDown, ChevronUp, ExternalLink, Copy } from "lucide-react";
import { Connection } from "@solana/web3.js";

const TOKENS = [
    {
        symbol: "SOL",
        label: "Sol",
        mint: "11111111111111111111111111111111",
        image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
    },
    {
        symbol: "USDC",
        label: "dUSDC",
        mint: "USDCoctVLVnvTXBEuP9s8hntucdJokbo17RwHuNXemT",
        image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
    },
    {
        symbol: "RAY",
        label: "dRAY",
        mint: "DRay3aNHKdjZ4P4DoRnyxdKh6jBrf4HpjfDkQF7MFPpR",
        image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png"
    }
];

export function RaydiumSwapCard() {
    const { publicKey, connected } = useWallet();

    const [fromToken, setFromToken] = useState(TOKENS[0]);
    const [toToken, setToToken] = useState(TOKENS[1]);
    const [payAmount, setPayAmount] = useState("");
    const [receiveAmount, setReceiveAmount] = useState("");

    // Explicit connection as requested
    const raydiumConnection = new Connection("https://raydium2-raydium2-d4b9.devnet.rpcpool.com/", "confirmed");

    const [isFetchingInfo, setIsFetchingInfo] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [poolInfo, setPoolInfo] = useState<any | null>(null);

    // Settings State
    const [showSettings, setShowSettings] = useState(false);
    const [swapSlippage, setSwapSlippage] = useState("0.5");
    const [liquiditySlippage, setLiquiditySlippage] = useState("2.5");

    useEffect(() => {
        if (payAmount && !isNaN(Number(payAmount))) {
            // Mock calculation 1:1 ratio
            setReceiveAmount(payAmount);
        } else {
            setReceiveAmount("");
        }
    }, [payAmount, fromToken, toToken]);

    const fetchPoolData = async () => {
        if (!fromToken || !toToken || fromToken.mint === toToken.mint) return;
        setIsFetchingInfo(true);
        setError(null);
        try {
            // SDK fetching placeholder
            await new Promise(res => setTimeout(res, 1000));
            setPoolInfo({
                baseReserve: 1000,
                quoteReserve: 1000,
                price: 1
            });
        } catch (err: any) {
            setError("Failed to fetch pool data.");
        } finally {
            setIsFetchingInfo(false);
        }
    };

    const handleSwap = async () => {
        setIsSwapping(true);
        try {
            // SDK swap placeholder
            await new Promise(res => setTimeout(res, 2000));
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsSwapping(false);
        }
    };

    const handleSwitchTokens = () => {
        const temp = fromToken;
        setFromToken(toToken);
        setToToken(temp);
        setPayAmount(receiveAmount);
        setReceiveAmount(payAmount);
    };

    return (
        <div className="w-full">
            <div className="glass flex flex-col items-center justify-center p-8 rounded-[32px] border border-white/5 shadow-2xl space-y-4">
                <div className="p-4 bg-primary/10 text-primary rounded-full mb-2">
                    <ArrowRightLeft className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Raydium AMM (Direct)</h3>
                <p className="text-sm text-white/50 text-center max-w-sm">
                    Swap tokens directly using Devnet liquidity pools.
                </p>

                <div className="w-full mt-6 space-y-2 relative">
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 transition-colors focus-within:border-primary/50">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-wide">Pay</label>
                        <div className="flex items-center gap-4 mt-2">
                            <input
                                type="number"
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                                onBlur={fetchPoolData}
                                placeholder="0.00"
                                className="w-full bg-transparent text-3xl font-bold outline-none"
                            />
                            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-2 py-1 cursor-pointer hover:bg-white/20 transition">
                                <img src={fromToken.image} alt={fromToken.symbol} className="w-6 h-6 rounded-full" />
                                <select
                                    value={fromToken.symbol}
                                    onChange={(e) => setFromToken(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[0])}
                                    className="bg-transparent text-sm font-bold outline-none cursor-pointer text-white appearance-none pr-2"
                                >
                                    {TOKENS.map(t => <option key={t.symbol} value={t.symbol} className="bg-[#1a1a1b]">{t.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 z-10">
                        <button onClick={handleSwitchTokens} className="bg-[#1a1a1b] p-2 rounded-xl border border-white/10 hover:border-primary/50 transition-colors">
                            <ArrowDown className="w-4 h-4 text-white/60" />
                        </button>
                    </div>

                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 transition-colors">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-wide">Received</label>
                        <div className="flex items-center gap-4 mt-2">
                            <input
                                type="number"
                                value={receiveAmount}
                                readOnly
                                placeholder="0.00"
                                className="w-full bg-transparent text-3xl font-bold outline-none text-white/50"
                            />
                            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-2 py-1 cursor-pointer hover:bg-white/20 transition">
                                <img src={toToken.image} alt={toToken.symbol} className="w-6 h-6 rounded-full" />
                                <select
                                    value={toToken.symbol}
                                    onChange={(e) => setToToken(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[1])}
                                    className="bg-transparent text-sm font-bold outline-none cursor-pointer text-white appearance-none pr-2"
                                >
                                    {TOKENS.map(t => <option key={t.symbol} value={t.symbol} className="bg-[#1a1a1b]">{t.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {isFetchingInfo && (
                    <div className="flex items-center gap-2 text-primary text-sm p-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Fetching Pool Liquidity...
                    </div>
                )}

                {poolInfo && !isFetchingInfo && (
                    <div className="w-full bg-white/5 p-4 rounded-xl border border-white/10 space-y-2 text-sm mt-4">
                        <div className="flex justify-between">
                            <span className="text-white/40">Pool Price</span>
                            <span className="font-bold">1 {fromToken.symbol} = {poolInfo.price} {toToken.symbol}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Reserves</span>
                            <span className="text-green-400">{poolInfo.baseReserve} / {poolInfo.quoteReserve}</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="w-full p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center gap-2 mt-4">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <button
                    disabled={!connected || isSwapping || !payAmount}
                    onClick={handleSwap}
                    className="w-full mt-4 h-14 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2"
                >
                    {!connected ? "Connect Wallet" : isSwapping ? <><Loader2 className="w-5 h-5 animate-spin" /> Swapping...</> : "Enter"}
                </button>

                {/* Settings & Token Info Toggle */}
                <div className="w-full mt-4">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="flex items-center gap-2 text-white/50 text-sm hover:text-white transition-colors pb-2"
                    >
                        <Settings className="w-4 h-4" />
                        Settings
                        {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showSettings && (
                        <div className="mt-2 p-4 rounded-xl bg-white/5 border border-white/10 space-y-4 text-sm animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-4">
                                <h4 className="font-bold text-white/80">Settings</h4>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/60">Swap slippage tolerance</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white/40 text-xs">Custom</span>
                                            <div className="flex items-center bg-black/30 rounded-lg px-2 py-1 border border-white/10 w-20">
                                                <input
                                                    type="number"
                                                    value={swapSlippage}
                                                    onChange={(e) => setSwapSlippage(e.target.value)}
                                                    className="bg-transparent w-full text-right outline-none text-white font-mono text-sm leading-none"
                                                />
                                                <span className="text-white/40 ml-1 text-xs">%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-white/60">Liquidity slippage tolerance</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white/40 text-xs">Custom</span>
                                            <div className="flex items-center bg-black/30 rounded-lg px-2 py-1 border border-white/10 w-20">
                                                <input
                                                    type="number"
                                                    value={liquiditySlippage}
                                                    onChange={(e) => setLiquiditySlippage(e.target.value)}
                                                    className="bg-transparent w-full text-right outline-none text-white font-mono text-sm leading-none"
                                                />
                                                <span className="text-white/40 ml-1 text-xs">%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-white/10 w-full" />

                            <div className="space-y-4">
                                <h4 className="font-bold text-white/80">Token Balance/Address</h4>

                                <div className="space-y-3">
                                    {TOKENS.map((token) => (
                                        <div key={token.symbol} className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5">
                                            <div className="flex items-center gap-2">
                                                <img src={token.image} alt={token.label} className="w-5 h-5 rounded-full" />
                                                <span className="text-white/80 font-medium text-xs">{token.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(token.mint)}
                                                    className="text-white/40 hover:text-white transition-colors"
                                                    title="Copy Address"
                                                >
                                                    <span className="font-mono text-xs hidden sm:inline">{token.mint.slice(0, 6)}...{token.mint.slice(-4)}</span>
                                                    <Copy className="w-3 h-3 sm:hidden" />
                                                </button>
                                                <a
                                                    href={`https://solscan.io/token/${token.mint}?cluster=devnet`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-primary hover:text-primary/70 transition-colors bg-primary/10 p-1 rounded-md"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                <h4 className="text-[10px] font-bold text-white/40 uppercase mb-2">Direct AMM Execution</h4>
                <p className="text-[10px] text-white/30 leading-relaxed max-w-xs mx-auto">
                    This mode bypasses Jupiter routing and interacts securely with the specified Raydium liquidity pool on-chain.
                </p>
            </div>
        </div>
    );
}
