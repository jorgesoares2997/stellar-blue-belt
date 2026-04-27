"use client";

import { useState } from "react";
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
  imageUrl: string;
  prompt: string;
  createdAt: string;
  minted: boolean;
  minting?: boolean;
  metadataUri?: string;
};

const isoNow = () => new Date().toISOString();

export default function AchievementsPage() {
  const { connected, address } = useStellarWallet();
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [generatedBadge, setGeneratedBadge] = useState<{ id: string; url: string; prompt: string } | null>(null);
  const [createdBadges, setCreatedBadges] = useState<CreatedBadge[]>([]);

  const generateBadge = async (missionId: string, missionTitle: string) => {
    if (!connected) return;
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
        const created: CreatedBadge = {
          id: badgeId,
          missionTitle,
          imageUrl: data.imageUrl,
          prompt: data.achievementPrompt,
          createdAt: isoNow(),
          minted: false,
          metadataUri: `ipfs://ai-generated-badge/${badgeId}.json`,
        };
        setGeneratedBadge({ id: created.id, url: created.imageUrl, prompt: created.prompt });
        setCreatedBadges((prev) => [created, ...prev]);
        setStatus("Badge generated successfully.");
      }
    } catch (error) {
      console.error("Error generating badge:", error);
      setStatus(error instanceof Error ? error.message : "Error generating badge.");
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
      setCreatedBadges((prev) =>
        prev.map((badge) =>
          badge.id === badgeId ? { ...badge, minted: true, minting: false } : badge
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
      setStatus(error instanceof Error ? error.message : "Minting failed");
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
