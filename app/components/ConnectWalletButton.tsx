"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

function truncate(address: string) {
    if (!address) return "";
    return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function WalletConnectButton() {
    const { publicKey, wallet, disconnect, connected, connecting } = useWallet();
    const { setVisible } = useWalletModal();
    const [open, setOpen] = useState(false);

    const address = publicKey ? publicKey.toString() : null;

    const handleToggle = () => {
        if (!connected && !connecting) {
            setVisible(true);
        } else {
            setOpen((v) => !v);
        }
    };

    const handleDisconnect = async () => {
        await disconnect();
        setOpen(false);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={handleToggle}
                className="inline-flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-95"
            >
                {connecting ? (
                    "Connecting..."
                ) : address ? (
                    <span className="font-mono">{truncate(address)}</span>
                ) : (
                    <span>Connect Wallet</span>
                )}
                <span className="text-xs text-white/40">{open ? "▲" : "▼"}</span>
            </button>

            {open && connected && (
                <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-white/10 bg-[#141416] p-3 shadow-2xl backdrop-blur-xl">
                    <div className="space-y-3">
                        <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Connected Wallet</p>
                            <div className="flex items-center gap-2 mt-1">
                                {wallet?.adapter.icon && (
                                    <img src={wallet.adapter.icon} alt="" className="w-4 h-4" />
                                )}
                                <p className="font-mono text-xs text-white truncate" title={address ?? ""}>
                                    {address}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleDisconnect}
                            className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                            Disconnect
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
