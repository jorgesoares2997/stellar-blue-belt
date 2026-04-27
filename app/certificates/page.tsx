"use client";

import { useState } from "react";
import {
  NFT_CONTRACT_ID,
  getConnectedAddress,
  invokeContract,
  scVal,
} from "@/lib/stellar";

const DEFAULT_METADATA_URI =
  "ipfs://studygroup-dao/certificates/module-completion.json";

export default function CertificatesPage() {
  const [metadataUri, setMetadataUri] = useState(DEFAULT_METADATA_URI);
  const [status, setStatus] = useState("Ready to claim your certificate.");
  const [loading, setLoading] = useState(false);

  const claimCertificate = async () => {
    if (!metadataUri.trim()) {
      setStatus("Please provide a metadata URI.");
      return;
    }

    setLoading(true);
    setStatus("Submitting claim transaction...");
    try {
      const address = await getConnectedAddress();
      await invokeContract({
        contractId: NFT_CONTRACT_ID,
        method: "claim_certificate",
        args: [scVal.address(address), scVal.string(metadataUri)],
      });
      setStatus("Certificate claimed successfully on Stellar Testnet.");
    } catch (error) {
      setStatus(
        error instanceof Error ? `Claim failed: ${error.message}` : "Claim failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-blue-300">
          Achievements Module
        </p>
        <h1 className="mt-2 text-2xl font-semibold">My Certificates (NFTs)</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Mint your completion certificate as an on-chain NFT-style achievement.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <label className="text-sm">
          <span className="mb-1 block text-zinc-300">Certificate metadata URI</span>
          <input
            value={metadataUri}
            onChange={(e) => setMetadataUri(e.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-blue-500"
          />
        </label>
        <button
          type="button"
          onClick={claimCertificate}
          disabled={loading}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {loading ? "Claiming..." : "Claim Certificate"}
        </button>
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-200">
        {status}
      </div>
    </div>
  );
}
