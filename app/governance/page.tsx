"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GOVERNANCE_CONTRACT_ID,
  getConnectedAddress,
  invokeContract,
  scVal,
} from "@/lib/stellar";

const POLL_ID = Number(process.env.NEXT_PUBLIC_ACTIVE_POLL_ID ?? "1");

const options = [
  { id: 0, label: "Smart Contract Security Basics", icon: "🛡️" },
  { id: 1, label: "Soroban Testing Deep Dive", icon: "🧪" },
  { id: 2, label: "Stellar Protocol Internals", icon: "⚙️" },
];

export default function GovernancePage() {
  const [status, setStatus] = useState<string>("Ready to vote.");
  const [loadingOption, setLoadingOption] = useState<number | null>(null);

  const handleVote = async (optionId: number) => {
    setLoadingOption(optionId);
    setStatus("Submitting vote transaction...");
    try {
      const address = await getConnectedAddress();
      await invokeContract({
        contractId: GOVERNANCE_CONTRACT_ID,
        method: "vote",
        args: [scVal.address(address), scVal.u32(POLL_ID), scVal.u32(optionId)],
      });
      setStatus("Vote submitted successfully on Stellar Testnet.");
    } catch (error) {
      setStatus(
        error instanceof Error ? `Vote failed: ${error.message}` : "Vote failed.",
      );
    } finally {
      setLoadingOption(null);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs uppercase tracking-widest text-blue-400 font-medium"
        >
          Governance Module
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl"
        >
          Which topic should we study next?
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-zinc-600 dark:text-zinc-400 max-w-2xl"
        >
          Active poll ID: <span className="text-blue-300 font-mono">{POLL_ID}</span>. 
          Your vote is recorded on-chain via the Soroban governance contract.
        </motion.p>
      </header>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {options.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index + 0.3 }}
            type="button"
            onClick={() => handleVote(option.id)}
            disabled={loadingOption !== null}
            className="hoverable glass-card group relative overflow-hidden rounded-2xl p-6 text-left hover:glass-card-hover disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl group-hover:bg-blue-500/20 transition-colors">
                {option.icon}
              </div>
              <div>
                <span className="block font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                  {option.label}
                </span>
                <span className="mt-1 block text-xs text-zinc-500">
                  {loadingOption === option.id ? (
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                      Sending vote...
                    </span>
                  ) : (
                    "Cast your vote on-chain"
                  )}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.02] px-6 py-4 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {status}
        </div>
      </motion.div>
    </div>
  );
}
