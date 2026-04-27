"use client";

import { useState } from "react";
import {
  GOVERNANCE_CONTRACT_ID,
  getConnectedAddress,
  invokeContract,
  scVal,
} from "@/lib/stellar";

const POLL_ID = Number(process.env.NEXT_PUBLIC_ACTIVE_POLL_ID ?? "1");

const options = [
  { id: 0, label: "Smart Contract Security Basics" },
  { id: 1, label: "Soroban Testing Deep Dive" },
  { id: 2, label: "Stellar Protocol Internals" },
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
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-blue-300">
          Governance Module
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          Which topic should we study next?
        </h1>
        <p className="mt-2 text-sm text-zinc-300">
          Active poll ID: {POLL_ID}. This vote sends a Soroban transaction to the
          governance contract.
        </p>
      </div>

      <div className="grid gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleVote(option.id)}
            disabled={loadingOption !== null}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-left hover:bg-zinc-800 disabled:opacity-60"
          >
            <span className="font-medium">{option.label}</span>
            <span className="mt-1 block text-xs text-zinc-400">
              {loadingOption === option.id ? "Sending vote..." : "Vote on-chain"}
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-200">
        {status}
      </div>
    </div>
  );
}
