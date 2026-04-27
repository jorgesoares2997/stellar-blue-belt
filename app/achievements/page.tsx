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

export default function AchievementsPage() {
  const { connected, address } = useStellarWallet();
  const [loading, setLoading] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generatedBadge, setGeneratedBadge] = useState<{ id: string; url: string; prompt: string } | null>(null);

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

      const data = await response.json();
      if (data.success) {
        setGeneratedBadge({ id: missionId, url: data.imageUrl, prompt: data.achievementPrompt });
      }
    } catch (error) {
      console.error("Error generating badge:", error);
    } finally {
      setLoading(null);
    }
  };

  const mintAsNFT = async () => {
    if (!generatedBadge || !connected) return;
    
    setMinting(true);
    try {
      const userAddress = await getConnectedAddress();
      // Simulating metadata URI for the AI-generated art
      const metadataUri = `ipfs://ai-generated-badge/${generatedBadge.id}.json`;
      
      await invokeContract({
        contractId: NFT_CONTRACT_ID,
        method: "claim_certificate",
        args: [scVal.address(userAddress), scVal.string(metadataUri)],
      });

      setSuccess(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#10b981", "#8b5cf6"]
      });

      setTimeout(() => {
        setGeneratedBadge(null);
        setSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error("Minting failed:", error);
      alert(error instanceof Error ? error.message : "Minting failed");
    } finally {
      setMinting(false);
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
                      disabled={minting}
                      className="hoverable flex-1 rounded-xl bg-zinc-900 dark:bg-white px-6 py-3 text-sm font-bold text-white dark:text-black transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
                      onClick={mintAsNFT}
                    >
                      {minting ? "Minting on Stellar..." : "Mint as NFT"}
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
