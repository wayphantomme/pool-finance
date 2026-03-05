# Pool Finance

A modern Solana dApp for token swaps and portfolio management, built with Next.js and integrated with Jupiter Aggregator.

## Features

- 🔄 **Multi-Protocol Swap**: Seamless trading via **Jupiter Aggregator** (V6) and direct **Raydium AMM** pools.
- 📊 **Dynamic Dashboard**: Track balances for **SOL**, **dUSDC**, and **dRAY** with real-time value tracking.
- 📈 **Pyth Oracle Integration**: Live, high-fidelity price feeds for accurate asset valuation.
- 🏦 **Vault & Staking**: Secure on-chain SOL management and staking features.
- 💸 **Instant Transfers**: Native SOL transfer capabilities with instant confirmation.
- 🔐 **Wallet Support**: Fully integrated with **Phantom** and **Solflare** via Solana Wallet Adapter.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Premium Glassmorphism UI
- **Blockchain**: Solana Web3.js
- **Liquidity**: Jupiter API & Raydium SDK
- **Data Oracle**: Pyth Network
- **Components**: Lucide React Icons

## Getting Started

### Prerequisites

- Node.js 18+
- Solana wallet configured to **Devnet**.

### Quick Start

1. **Clone & Setup**:
   ```bash
   git clone https://github.com/wayphantomme/pool-finance.git
   cd pool-finance
   npm install
   ```

2. **Run Dev Server**:
   ```bash
   npm run dev
   ```

3. **Interact**:
   Head to `http://localhost:3000` and connect your Devnet wallet.

## Network

Configured for **Solana Devnet**. Ensure your wallet is switched to Devnet to interact with swaps, vaults, and dashboard features.
