"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { LiquidBackground } from "@/components/ui/liquid-background";

export default function Home() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

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
          className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-blue-400"
        >
          Welcome to StudyGroup DAO
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-4xl text-5xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-7xl leading-tight"
        >
          Decentralized coordination for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">study communities</span> on Stellar
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
          <button className="hoverable glass px-8 py-4 rounded-full text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95">
            Explore Proposals
          </button>
          <button className="hoverable bg-blue-600 px-8 py-4 rounded-full text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
            Connect Wallet
          </button>
        </motion.div>
      </motion.section>

      {/* Features Grid */}
      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Governance (Polls)",
            description: "Propose study topics and vote transparently with wallet-signed actions.",
            delay: 0.5
          },
          {
            title: "Treasury",
            description: "Track contributions and manage shared expenses for courses and tools.",
            delay: 0.6
          },
          {
            title: "My Certificates (NFTs)",
            description: "Mint completion certificates as verifiable on-chain achievements.",
            delay: 0.7
          }
        ].map((feature, i) => (
          <motion.article 
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: feature.delay }}
            className="hoverable glass-card group rounded-2xl p-8 hover:glass-card-hover"
          >
            <div className="mb-6 h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
              <div className="h-2 w-2 rounded-full bg-blue-400" />
            </div>
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">{feature.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
              {feature.description}
            </p>
          </motion.article>
        ))}
      </section>

      {/* Decorative Parallax Element */}
      <motion.div 
        style={{ y: useTransform(scrollY, [500, 1500], [0, -100]) }}
        className="absolute right-0 top-[600px] -z-10 h-[600px] w-[600px] rounded-full bg-blue-900/5 blur-[150px]"
      />
    </div>
  );
}
