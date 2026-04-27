"use client";

import Link from "next/link";
import { useStellarWallet } from "@/hooks/useStellarWallet";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Governance (Polls)", href: "/governance" },
  { label: "Treasury", href: "/treasury" },
  { label: "My Certificates (NFTs)", href: "/certificates" },
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-lg font-semibold">StudyGroup DAO</p>
            <p className="text-xs text-zinc-400">Stellar Testnet MVP</p>
          </div>
          <div className="flex items-center gap-3">
            {connected && shortAddress ? (
              <>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                  {shortAddress}
                </span>
                <button
                  type="button"
                  onClick={disconnect}
                  className="rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={connect}
                disabled={loading}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-6 py-6 md:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Navigation
          </p>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {network && (
            <p className="mt-4 text-xs text-zinc-400">Freighter network: {network}</p>
          )}
          {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
        </aside>
        <main className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          {children}
        </main>
      </div>
      <div className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 rounded-lg border border-blue-500/40 bg-zinc-900/95 px-4 py-3 text-sm shadow-xl">
        <p className="text-zinc-100">
          Help us improve! Please fill out our Feedback Form:{" "}
          <a
            href="[LINK_PLACEHOLDER]"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-300 underline underline-offset-2"
          >
            [LINK_PLACEHOLDER]
          </a>
        </p>
      </div>
    </div>
  );
}
