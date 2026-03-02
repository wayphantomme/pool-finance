# Pool Finance

A modern Solana dApp for token swaps and portfolio management, built with Next.js and integrated with Jupiter Aggregator.

## 🚀 Features

- **Token Swap**: Seamless SOL ⇄ USDC swaps using Jupiter Quote API v6.
- **Real-Time Pricing**: Integrated with Pyth Network oracle for live SOL/USDC price feeds.
- **Portfolio Dashboard**: View your SOL and USDC balances with a premium, glassmorphism-inspired UI.
- **SOL Vault**: Interact with a dedicated Solana smart contract (Vault) to deposit and withdraw SOL.
- **Native Transfers**: Securely send SOL to any destination address.
- **Wallet Integration**: Supports Phantom and Solflare via the Solana Wallet Adapter.

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom Glassmorphism effects
- **Blockchain**: Solana Web3.js
- **DEX Aggregator**: Jupiter API
- **Oracle**: Pyth Network
- **Icons**: Lucide React & local SVG assets

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- A Solana wallet (Phantom or Solflare) configured to **Devnet**.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/wayphantomme/pool-finance.git
   cd pool-finance
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Network

This application is currently configured for **Solana Devnet**. Ensure your wallet is switched to Devnet to interact with the swap and vault features.

## 📄 License

MIT
