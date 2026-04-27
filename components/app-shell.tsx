"use client";

import Link from "next/link";
import Image from "next/image";
import { useStellarWallet } from "@/hooks/useStellarWallet";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Governance (Polls)", href: "/governance" },
  { label: "Treasury", href: "/treasury" },
  { label: "AI Achievements", href: "/achievements" },
];

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const {
    connected,
    connect,
    disconnect,
    shortAddress,
    network,
    loading,
    error,
  } = useStellarWallet();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <header className="sticky top-0 z-20 border-b border-white dark:border-white/5 bg-white/70 dark:bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="hoverable flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 shadow-lg">
              <Image
                src="/favicon.png"
                alt="Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">StudyGroup DAO</p>
              <p className="text-xs text-zinc-500">Stellar Testnet</p>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <div className="h-8 w-[1px] bg-white dark:bg-zinc-800" />
            {connected && shortAddress ? (
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                  {shortAddress}
                </span>
                <button
                  type="button"
                  onClick={disconnect}
                  className="hoverable rounded-xl border border-white dark:border-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={connect}
                disabled={loading}
                className="hoverable rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 py-8 md:grid-cols-[260px_1fr]">
        <aside className="h-fit space-y-6">
          <div className="rounded-2xl border border-white glass-card p-6">
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.16em] text-zinc-700 dark:text-zinc-200">
              Navigation
            </p>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hoverable block rounded-xl px-4 py-3 text-sm font-semibold tracking-[0.01em] text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-blue-700 dark:hover:text-blue-300 transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="rounded-2xl border border-white glass-card p-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
              Network Status
            </p>
            {network ? (
              <p className="text-xs text-zinc-400">Connected to <span className="text-emerald-500 font-mono">{network}</span></p>
            ) : (
              <p className="text-xs text-zinc-400 italic">Wallet not connected</p>
            )}
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          </div>
        </aside>

        <main className="rounded-3xl border border-white glass-card p-10 min-h-[600px]">
          {children}
        </main>
      </div>

      <footer className="fixed bottom-6 left-1/2 z-30 w-[calc(100%-3rem)] max-w-3xl -translate-x-1/2">
        <div className="rounded-2xl glass p-4 shadow-2xl">
          <p className="text-center text-sm text-zinc-400">
            Help us improve! Please fill out our{" "}
            <a
              href="https://forms.gle/x5ZLrqT6AEmYZsjh7"
              target="_blank"
              rel="noopener noreferrer"
              className="hoverable font-bold text-blue-400 underline underline-offset-4"
            >
              Feedback Form
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
