"use client";

import { useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { LiquidBackground } from "@/components/ui/liquid-background";

export default function Home() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [selectedFeature, setSelectedFeature] = useState<{
    title: string;
    description: string;
    steps: string[];
  } | null>(null);

  const features = [
    {
      title: "Governance (Polls)",
      description: "Propose study topics and vote transparently with wallet-signed actions.",
      delay: 0.5,
      steps: [
        "Connect your Freighter wallet to the Stellar Testnet.",
        "Navigate to the Governance module from the sidebar.",
        "Select an active proposal for the next study topic.",
        "Sign the transaction to cast your on-chain vote."
      ]
    },
    {
      title: "Treasury",
      description: "Track contributions and manage shared expenses for courses and tools.",
      delay: 0.6,
      steps: [
        "Connect your Freighter wallet to the Stellar Testnet.",
        "Open the Treasury module to view the current DAO balance.",
        "Enter the amount of XLM you wish to contribute.",
        "Sign the transaction to send funds to the smart contract pool."
      ]
    },
    {
      title: "AI Achievements",
      description: "Generate AI badges and mint them as verifiable on-chain NFTs.",
      delay: 0.7,
      steps: [
        "Complete a required study module or DAO milestone.",
        "Navigate to the AI Achievements section.",
        "Click to generate a unique Gemini AI badge.",
        "Mint your new AI badge as a verifiable NFT on Stellar."
      ]
    }
  ];

  return (
    <div className="relative min-h-[150vh] space-y-24 pb-24">
      <LiquidBackground />

      {/* Hero Section */}
      <motion.section 
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative flex flex-col items-center justify-center pt-12 pb-20 text-center"
      >
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-blue-500 dark:text-blue-400"
        >
          Welcome to StudyGroup DAO
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-4xl text-5xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-7xl leading-tight"
        >
          Decentralized coordination for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">study communities</span> on Stellar
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed"
        >
          StudyGroup DAO is an elite platform for governance, shared treasury, 
          and AI-powered achievements on the Stellar Testnet.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex gap-4"
        >
          <button className="hoverable glass px-8 py-4 rounded-full text-sm font-semibold text-zinc-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95">
            Explore Proposals
          </button>
          <button className="hoverable bg-blue-600 px-8 py-4 rounded-full text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
            Connect Wallet
          </button>
        </motion.div>
      </motion.section>

      {/* Features Grid */}
      <section id="about" className="grid gap-6 md:grid-cols-3 scroll-mt-32">
        {features.map((feature, i) => (
          <motion.article 
            key={i}
            onClick={() => setSelectedFeature(feature)}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: feature.delay }}
            className="hoverable glass-card group rounded-2xl p-8 hover:glass-card-hover cursor-pointer"
          >
            <div className="mb-6 h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
              <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400" />
            </div>
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">{feature.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
              {feature.description}
            </p>
            <p className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 opacity-0 transition-opacity group-hover:opacity-100">
              Click to learn more &rarr;
            </p>
          </motion.article>
        ))}
      </section>

      {/* Feature Details Modal */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-black/60 p-6 backdrop-blur-md"
            onClick={() => setSelectedFeature(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl glass p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                {selectedFeature.title}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                {selectedFeature.description}
              </p>
              
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  How it works
                </h3>
                <ul className="space-y-4">
                  {selectedFeature.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-4 items-start">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-xs font-bold text-blue-600 dark:text-blue-400">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pt-0.5">
                        {step}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={() => setSelectedFeature(null)}
                className="hoverable mt-10 w-full rounded-xl bg-zinc-900 dark:bg-white px-6 py-4 text-sm font-bold text-white dark:text-black shadow-lg transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Parallax Element */}
      <motion.div 
        style={{ y: useTransform(scrollY, [500, 1500], [0, -100]) }}
        className="absolute right-0 top-[600px] -z-10 h-[600px] w-[600px] rounded-full bg-blue-600/5 dark:bg-blue-900/10 blur-[150px]"
      />
    </div>
  );
}
