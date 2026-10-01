import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ANT_IMAGE = '/ant_hero.jpg';

const HOOKS = [
  "Long-term memory for AI agents.",
  "Connected memory for multi-agent systems.",
  "Distributed memory for AI agents.",
  "Persistent memory for intelligent agents.",
  "Local-first AI memory.",
  "Shared memory for agent systems.",
];

const STATS = [
  { value: "1.0000", label: "Recall@1 Accuracy" },
  { value: "0.0%", label: "Temporal Invalidation Errors" },
  { value: "11.47 ms", label: "p50 Retrieval Latency" },
  { value: "10.7×", label: "Token Reduction" },
];

export default function Hero() {
  const [hookIndex, setHookIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setHookIndex(i => (i + 1) % HOOKS.length), 3200);
    return () => clearInterval(t);
  }, []);

  const copyCommand = () => {
    navigator.clipboard.writeText("pip install recalldb");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="lead" className="bg-white pt-16 pb-0">
      <div className="max-w-6xl mx-auto px-6">

        {/* — Headline Block */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6"
        >
          <h1 className="text-[56px] sm:text-[72px] md:text-[88px] font-normal leading-[1.0] tracking-tight text-[#111] max-w-4xl">
            SQL for AI memory.
          </h1>
        </motion.div>

        {/* — Cycling Sub-hook + Install Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10"
        >
          {/* Cycling hook */}
          <div className="min-h-[28px]">
            <AnimatePresence mode="wait">
              <motion.p
                key={hookIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="text-[15px] text-[#666] font-normal"
              >
                {HOOKS[hookIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Right: install cmd + see more */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="flex items-center gap-3 border-b border-[#111] pb-1">
              <span className="font-mono text-sm text-[#111]">pip install recalldb</span>
              <button
                onClick={copyCommand}
                className="text-[#999] hover:text-[#111] transition-colors"
                title="Copy"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#111]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <a
              href="#simulator"
              className="flex items-center gap-1 text-[13px] text-[#111] border-b border-[#111] pb-1 hover:text-[#555] hover:border-[#555] transition-colors"
            >
              See More ↗
            </a>
          </div>
        </motion.div>

        {/* — Full-width Ant Photography Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 1.01 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
          className="w-full overflow-hidden"
          style={{ height: 'clamp(320px, 52vw, 580px)' }}
        >
          <img
            src={ANT_IMAGE}
            alt="Leafcutter ants carrying leaves in organized colony trail — symbolizing multi-agent distributed memory"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
        </motion.div>

        {/* — Stats Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#e4e4e4] border-t border-b border-[#e4e4e4] my-0"
        >
          {STATS.map((s, i) => (
            <div key={i} className="py-7 px-6 first:pl-0">
              <div className="text-[32px] font-normal text-[#111] leading-none tracking-tight">{s.value}</div>
              <div className="text-[12px] text-[#888] mt-2 leading-snug">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
