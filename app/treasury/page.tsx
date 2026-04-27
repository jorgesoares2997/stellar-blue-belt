"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TREASURY_CONTRACT_ID,
  getConnectedAddress,
  invokeContract,
  scVal,
} from "@/lib/stellar";

const FUNDING_TARGET = 200;

export default function TreasuryPage() {
  const [donation, setDonation] = useState("10");
  const [raised, setRaised] = useState(40);
  const [status, setStatus] = useState("Ready for the next donation.");
  const [loading, setLoading] = useState(false);

  const progress = useMemo(
    () => Math.min(100, Math.round((raised / FUNDING_TARGET) * 100)),
    [raised],
  );

  const donate = async () => {
    const parsed = Number(donation);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setStatus("Please enter a valid positive XLM amount.");
      return;
    }

    setLoading(true);
    setStatus("Submitting donation transaction...");

    try {
      const address = await getConnectedAddress();
      await invokeContract({
        contractId: TREASURY_CONTRACT_ID,
        method: "contribute",
        args: [
          scVal.address(address),
          scVal.i128(BigInt(Math.floor(parsed * 10_000_000))),
        ],
      });
      setRaised((prev) => prev + parsed);
      setStatus("Donation submitted successfully on Stellar Testnet.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `Donation failed: ${error.message}`
          : "Donation failed.",
      );
    } finally {
      setLoading(false);
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
          Treasury Module
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl"
        >
          Group treasury overview
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-zinc-600 dark:text-zinc-400 max-w-2xl"
        >
          Manage shared funds for tools, courses and study material. 
          Every contribution is verifiable on the Stellar ledger.
        </motion.p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card flex flex-col justify-center rounded-2xl p-8"
        >
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Current Balance</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-bold text-zinc-900 dark:text-white">{raised.toFixed(0)}</span>
            <span className="text-xl font-semibold text-blue-400">XLM</span>
          </div>
          <p className="mt-4 text-xs text-zinc-500 uppercase tracking-widest">
            Stellar Testnet Assets
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card flex flex-col justify-center rounded-2xl p-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Target Progress</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-white">
              {progress}%
            </span>
          </div>
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-purple-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            />
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            {raised} of {FUNDING_TARGET} XLM reached
          </p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-8"
      >
        <h3 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-white">Contribute to the DAO</h3>
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Amount (XLM)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={donation}
              onChange={(e) => setDonation(e.target.value)}
              className="hoverable w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/5 px-4 py-3 text-zinc-900 dark:text-white outline-none focus:border-blue-500/50 focus:bg-black/[0.05] dark:focus:bg-white/[0.08] transition-all"
            />
          </div>
          <button
            type="button"
            onClick={donate}
            disabled={loading}
            className="hoverable flex h-[50px] items-center justify-center rounded-xl bg-blue-600 px-8 text-sm font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                Processing...
              </span>
            ) : (
              "Contribute Now"
            )}
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.02] px-6 py-4 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          {status}
        </div>
      </motion.div>
    </div>
  );
}
