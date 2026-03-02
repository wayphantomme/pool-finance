import Link from "next/link";
import { WalletConnectButton } from "./ConnectWalletButton";

export function Navbar({ hideWalletButton }: { hideWalletButton?: boolean }) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/5 bg-background/60 px-6 py-4 backdrop-blur-2xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
                <Link href="/" className="flex items-center gap-3 transition hover:opacity-80">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-sky-500 shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
                        Pool<span className="text-primary font-black"> Finance</span>
                    </span>
                </Link>
                <div className="flex items-center gap-6">
                    {hideWalletButton ? (
                        <Link
                            href="/dashboard"
                            className="rounded-full bg-primary hover:bg-primary/90 px-5 py-2 text-sm font-medium text-primary-foreground shadow-[0_0_20px_rgba(139,92,246,0.5)] transition hover:shadow-[0_0_25px_rgba(139,92,246,0.7)] hover:-translate-y-0.5 cursor-pointer"
                        >
                            Launch App
                        </Link>
                    ) : (
                        <>
                            <Link href="/swap" className="text-sm font-semibold tracking-wide text-muted hover:text-white transition-colors">
                                Swap
                            </Link>
                            <Link href="/dashboard" className="text-sm font-semibold tracking-wide text-muted hover:text-white transition-colors">
                                Dashboard
                            </Link>
                            <WalletConnectButton />
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
