"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useStellarWallet } from "@/hooks/useStellarWallet";
import {
  NFT_CONTRACT_ID,
  getConnectedAddress,
  invokeContract,
  scVal,
} from "@/lib/stellar";
import confetti from "canvas-confetti";

const MISSIONS = [
  { id: "m1", title: "Smart Contract Pioneer", description: "Completed the first Rust module with honors." },
  { id: "m2", title: "Stellar Governor", description: "Participated in 5 consecutive DAO polls." },
  { id: "m3", title: "Treasury Hero", description: "Contributed over 100 XLM to the group funds." },
];

type CreatedBadge = {
  id: string;
  missionTitle: string;
  imageKey: string;
  imageUrl: string;
  prompt: string;
  createdAt: string;
  minted: boolean;
  minting?: boolean;
  metadataUri?: string;
};

type BadgeRow = {
  id: string;
  mission_title: string;
  image_url: string;
  prompt: string;
  created_at: string;
  minted: boolean;
  metadata_uri: string;
};

type ToastMessage = {
  id: string;
  type: "success" | "error";
  title: string;
  description: string;
};

function mapBadgeRow(row: BadgeRow): CreatedBadge {
  const imageKey = row.image_url.startsWith("/")
    ? row.image_url.split("/").pop() || "badge_1.png"
    : row.image_url;
  return {
    id: row.id,
    missionTitle: row.mission_title,
    imageKey,
    imageUrl: `/assets/badges/${imageKey}`,
    prompt: row.prompt,
    createdAt: row.created_at,
    minted: row.minted,
    metadataUri: row.metadata_uri,
  };
}

export default function AchievementsPage() {
  const { connected, address } = useStellarWallet();
  const configuredAdmin = process.env.NEXT_PUBLIC_NFT_ADMIN_ADDRESS ?? "";
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [generatedBadge, setGeneratedBadge] = useState<{ id: string; url: string; prompt: string } | null>(null);
  const [createdBadges, setCreatedBadges] = useState<CreatedBadge[]>([]);
  const [approveTarget, setApproveTarget] = useState("");
  const [approving, setApproving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastCounterRef = useRef(0);

  const showToast = (
    type: ToastMessage["type"],
    title: string,
    description: string,
  ) => {
    toastCounterRef.current += 1;
    const id = `toast-${toastCounterRef.current}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4200);
  };

  useEffect(() => {
    const loadBadges = async () => {
      if (!address) {
        setCreatedBadges([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/badges?walletAddress=${encodeURIComponent(address)}`,
        );
        if (!response.ok) {
          throw new Error("Failed to load badges from database.");
        }
        const data = await response.json();
        const badges = (data.badges ?? []) as BadgeRow[];
        setCreatedBadges(badges.map(mapBadgeRow));
      } catch (error) {
        console.error("Error loading badges:", error);
        setStatus(
          error instanceof Error ? error.message : "Error loading badges.",
        );
      }
    };

    void loadBadges();
  }, [address]);

  const generateBadge = async (missionId: string, missionTitle: string) => {
    if (!connected || !address) return;
    setLoading(missionId);
    setGeneratedBadge(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/generate-badge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievementTitle: missionTitle, userAddress: address }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? "Could not generate badge.");
      }

      const data = await response.json();
      if (data.success) {
        const badgeId = data.badgeId ?? missionId;
        const metadataUri = `ipfs://ai-generated-badge/${badgeId}.json`;
        const imageKey = data.imageKey ?? "badge_1.png";

        const saveResponse = await fetch("/api/badges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: address,
            missionTitle,
            imageUrl: imageKey,
            prompt: data.achievementPrompt,
            metadataUri,
            minted: false,
          }),
        });

        if (!saveResponse.ok) {
          const saveError = await saveResponse.json().catch(() => ({}));
          throw new Error(saveError.error ?? "Failed to save badge.");
        }

        const saved = await saveResponse.json();
        const savedBadge = mapBadgeRow(saved.badge as BadgeRow);
        setGeneratedBadge({
          id: savedBadge.id,
          url: savedBadge.imageUrl,
          prompt: savedBadge.prompt,
        });
        setCreatedBadges((prev) => [savedBadge, ...prev]);
        setStatus("Badge generated successfully.");
        showToast(
          "success",
          "Badge created",
          "AI badge generated and saved to the database.",
        );
      }
    } catch (error) {
      console.error("Error generating badge:", error);
      const message =
        error instanceof Error ? error.message : "Error generating badge.";
      setStatus(message);
      showToast("error", "Badge generation failed", message);
    } finally {
      setLoading(null);
    }
  };

  const mintBadge = async (badgeId: string) => {
    if (!connected) return;

    const targetBadge = createdBadges.find((badge) => badge.id === badgeId);
    if (!targetBadge || targetBadge.minted) return;

    setCreatedBadges((prev) =>
      prev.map((badge) =>
        badge.id === badgeId ? { ...badge, minting: true } : badge
      )
    );

    try {
      const userAddress = await getConnectedAddress();
      const metadataUri =
        targetBadge.metadataUri ?? `ipfs://ai-generated-badge/${badgeId}.json`;
      
      await invokeContract({
        contractId: NFT_CONTRACT_ID,
        method: "claim_certificate",
        args: [scVal.address(userAddress), scVal.string(metadataUri)],
      });

      setSuccess(true);
      setStatus("Badge minted on Stellar successfully.");
      showToast(
        "success",
        "NFT minted",
        "Certificate minted on Stellar and persisted in your badge history.",
      );

      const patchResponse = await fetch(`/api/badges/${badgeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minted: true }),
      });
      if (!patchResponse.ok) {
        const patchError = await patchResponse.json().catch(() => ({}));
        throw new Error(patchError.error ?? "Failed to persist mint status.");
      }

      const patched = await patchResponse.json();
      const patchedBadge = mapBadgeRow(patched.badge as BadgeRow);
      setCreatedBadges((prev) =>
        prev.map((badge) =>
          badge.id === badgeId
            ? { ...patchedBadge, minting: false }
            : badge
        )
      );
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#10b981", "#8b5cf6"]
      });

    } catch (error) {
      console.error("Minting failed:", error);
      const rawMessage =
        error instanceof Error ? error.message : "Minting failed";
      const normalized = rawMessage.toLowerCase();
      if (
        normalized.includes("claim_certificate") ||
        normalized.includes("hosterror")
      ) {
        const message =
          "Mint failed on-chain. Wallet is likely not eligible yet, or it already has a certificate.";
        setStatus(message);
        showToast(
          "error",
          "Mint rejected",
          `${message} Use "Approve Wallet" with the admin account, then try again.`,
        );
      } else {
        setStatus(rawMessage);
        showToast("error", "Mint failed", rawMessage);
      }
      setCreatedBadges((prev) =>
        prev.map((badge) =>
          badge.id === badgeId ? { ...badge, minting: false } : badge
        )
      );
    } finally {
      setTimeout(() => {
        setSuccess(false);
      }, 1500);
    }
  };

  const approveWallet = async () => {
    if (!connected || !address) return;

    const member = approveTarget.trim();
    if (!/^G[A-Z2-7]{55}$/.test(member)) {
      const message = "Enter a valid Stellar public key (starts with G...).";
      setStatus(message);
      showToast("error", "Invalid wallet", message);
      return;
    }

    setApproving(true);
    setStatus("Submitting eligibility approval on-chain...");
    try {
      // We re-resolve the address from the wallet-kit to avoid stale UI state.
      const adminFromKit = await getConnectedAddress();
      console.log("[Approve Wallet] connected UI address:", address);
      console.log("[Approve Wallet] connected kit address:", adminFromKit);
      console.log("[Approve Wallet] configured admin:", configuredAdmin);
      console.log("[Approve Wallet] approving member:", member);

      if (
        configuredAdmin &&
        adminFromKit !== configuredAdmin &&
        member.length > 0
      ) {
        const message =
          "Connected wallet does not match NEXT_PUBLIC_NFT_ADMIN_ADDRESS. Approvals will fail unless you connect the NFT contract admin.";
        setStatus(message);
        showToast("error", "Not admin", message);
        return;
      }

      await invokeContract({
        contractId: NFT_CONTRACT_ID,
        method: "set_eligible",
        args: [
          scVal.address(adminFromKit),
          scVal.address(member),
          scVal.bool(true),
        ],
      });
      const message = `Wallet ${member.slice(0, 6)}...${member.slice(-4)} is now eligible.`;
      setStatus(message);
      showToast("success", "Wallet approved", message);
    } catch (error) {
      console.error("[Approve Wallet] failed:", error);
      const rawMessage =
        error instanceof Error ? error.message : "Approval failed.";
      const normalized = rawMessage.toLowerCase();
      if (normalized.includes("hosterror") || normalized.includes("set_eligible")) {
        const message =
          "Approval failed on-chain. Make sure the connected wallet is the NFT contract admin account.";
        setStatus(message);
        showToast("error", "Approval failed", message);
      } else {
        setStatus(rawMessage);
        showToast("error", "Approval failed", rawMessage);
      }
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="space-y-12">
      <header>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs uppercase tracking-widest text-emerald-400 font-medium"
        >
          AI Achievements
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl"
        >
          Generate Unique AI Badges
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-zinc-600 dark:text-zinc-400 max-w-2xl"
        >
          Our Google Gemini AI analyzes your milestones to create one-of-a-kind 
          digital art for your achievements.
        </motion.p>
      </header>

      <div className="grid gap-6">
        {MISSIONS.map((mission, index) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index + 0.3 }}
            className="hoverable glass-card flex flex-col items-start justify-between gap-6 rounded-2xl p-8 md:flex-row md:items-center"
          >
            <div className="flex-1">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{mission.title}</h3>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm">{mission.description}</p>
            </div>
            
            <button
              onClick={() => generateBadge(mission.id, mission.title)}
              disabled={loading !== null || !connected}
              className="hoverable relative group overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading === mission.id ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Gemini AI Processing...
                  </>
                ) : (
                  "Generate Unique AI Badge"
                )}
              </span>
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-emerald-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </motion.div>
        ))}
      </div>

      <section className="rounded-2xl border border-black/5 bg-black/[0.01] p-6 dark:border-white/10 dark:bg-white/[0.02]">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          Admin: Approve Wallet To Mint
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Connect with the NFT admin wallet, then approve any member wallet.
        </p>
        {configuredAdmin && (
          <p className="mt-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
            Configured admin: {configuredAdmin}
          </p>
        )}
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            value={approveTarget}
            onChange={(event) => setApproveTarget(event.target.value)}
            placeholder="G... member wallet address"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-zinc-900 outline-none ring-blue-500/40 placeholder:text-zinc-400 focus:ring-2 dark:border-white/20 dark:bg-zinc-900 dark:text-white"
          />
          <button
            type="button"
            onClick={approveWallet}
            disabled={!connected || approving}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {approving ? "Approving..." : "Approve Wallet"}
          </button>
        </div>

        {toasts.length > 0 && (
          <div className="mt-3 space-y-2">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${
                  toast.type === "success"
                    ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                    : "border-rose-400/40 bg-rose-500/15 text-rose-100"
                }`}
              >
                <p className="font-semibold">{toast.title}</p>
                <p className="mt-1 text-xs opacity-90">{toast.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Created Badges
        </h2>
        {createdBadges.length === 0 ? (
          <div className="rounded-2xl border border-black/5 bg-black/[0.01] px-6 py-6 text-sm text-zinc-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-zinc-400">
            No badges generated yet. Create one from a mission above.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {createdBadges.map((badge) => (
              <div
                key={badge.id}
                className="glass-card rounded-2xl p-4"
              >
                <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    src={badge.imageUrl}
                    alt={badge.missionTitle}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {badge.missionTitle}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {badge.prompt}
                </p>
                <button
                  type="button"
                  disabled={!connected || badge.minted || badge.minting}
                  onClick={() => mintBadge(badge.id)}
                  className="mt-3 w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  {badge.minted
                    ? "Minted"
                    : badge.minting
                      ? "Minting..."
                      : "Mint as NFT"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {status && (
        <div className="rounded-xl border border-black/5 bg-black/[0.01] px-6 py-4 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-zinc-300">
          {status}
        </div>
      )}

      <AnimatePresence>
        {generatedBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
            onClick={() => setGeneratedBadge(null)}
          >
            <motion.div 
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg overflow-hidden rounded-3xl glass p-1 shadow-2xl"
              whileHover={{ rotateY: 5, rotateX: 5 }}
              style={{ perspective: 1000 }}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-[22px] bg-zinc-100 dark:bg-zinc-900">
                <Image
                  src={generatedBadge.url}
                  alt="Generated Badge"
                  fill
                    sizes="(max-width: 768px) 100vw, 512px"
                  className={`object-cover transition-all duration-1000 ${success ? "scale-110 brightness-125" : ""}`}
                />
                {/* Refraction Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/40 pointer-events-none" />
                <div className={`absolute -inset-[50%] bg-gradient-to-tr from-blue-500/20 via-transparent to-purple-500/20 pointer-events-none transition-opacity duration-500 ${success ? "opacity-100 animate-pulse" : "opacity-0"}`} />
              </div>
              
              <div className="p-8">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {success ? "Achievement Minted! ✨" : "Your AI-Generated Badge"}
                </h2>
                <p className="mt-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">AI Prompt Analysis</p>
                <p className="mt-2 text-sm italic text-zinc-600 dark:text-zinc-400 line-clamp-3">
                  &quot;{generatedBadge.prompt}&quot;
                </p>
                
                <div className="mt-8 flex gap-4">
                  {!success && (
                    <button 
                      disabled={
                        !generatedBadge ||
                        !createdBadges.some((badge) => badge.id === generatedBadge.id) ||
                        createdBadges.find((badge) => badge.id === generatedBadge.id)?.minted ||
                        createdBadges.find((badge) => badge.id === generatedBadge.id)?.minting
                      }
                      className="hoverable flex-1 rounded-xl bg-zinc-900 dark:bg-white px-6 py-3 text-sm font-bold text-white dark:text-black transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
                      onClick={() => generatedBadge && mintBadge(generatedBadge.id)}
                    >
                      {createdBadges.find((badge) => badge.id === generatedBadge.id)?.minting
                        ? "Minting on Stellar..."
                        : "Mint as NFT"}
                    </button>
                  )}
                  <button 
                    className="hoverable rounded-xl bg-zinc-200 dark:bg-zinc-800 px-6 py-3 text-sm font-bold text-zinc-900 dark:text-white transition-all hover:bg-zinc-300 dark:hover:bg-zinc-700"
                    onClick={() => setGeneratedBadge(null)}
                  >
                    {success ? "Close" : "Close"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
