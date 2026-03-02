"use client";

import type { SolanaClientConfig } from "@solana/client";
import { SolanaProvider } from "@solana/react-hooks";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";

import "@solana/wallet-adapter-react-ui/styles.css";

const defaultConfig: SolanaClientConfig = {
    cluster: "devnet",
    rpc: "https://api.devnet.solana.com",
    websocket: "wss://api.devnet.solana.com",
};

export default function Providers({ children }: { children: React.ReactNode }) {
    // Use a stable Devnet endpoint
    const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={[]} autoConnect>
                <WalletModalProvider>
                    {/* SolanaProvider (Solana Kit) must be inside WalletModalProvider to share context */}
                    <SolanaProvider config={defaultConfig}>{children}</SolanaProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
