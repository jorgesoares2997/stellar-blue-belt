"use client";

import { useMemo, useState } from "react";
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
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-blue-300">
          Treasury Module
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Group treasury overview</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Track testnet funding for study tools and donate directly from your
          connected wallet.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-sm text-zinc-300">Current treasury balance (UI):</p>
        <p className="mt-1 text-3xl font-semibold">{raised.toFixed(2)} XLM</p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-zinc-300">Crowdfunding progress</span>
          <span className="font-medium">
            {raised}/{FUNDING_TARGET} XLM
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-800">
          <div
            className="h-2 rounded-full bg-blue-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4 md:flex-row md:items-end">
        <label className="flex-1 text-sm">
          <span className="mb-1 block text-zinc-300">Donate XLM (Testnet)</span>
          <input
            type="number"
            min="1"
            step="1"
            value={donation}
            onChange={(e) => setDonation(e.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-blue-500"
          />
        </label>
        <button
          type="button"
          onClick={donate}
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Donate XLM (Testnet)"}
        </button>
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-200">
        {status}
      </div>
    </div>
  );
}
