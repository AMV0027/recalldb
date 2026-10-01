import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const YT_VIDEO_ID = 'HtG58C56xhU';

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
  { value: "10.7×", label: "Token Reduction Efficiency" },
];

export default function Hero() {
  const [hookIndex, setHookIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setHookIndex(i => (i + 1) % HOOKS.length), 3200);
    return () => clearInterval(t);
  }, []);

  const copyCommand = () => {
    navigator.clipboard.writeText('pip install recalldb');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="lead" className="bg-white pt-10 sm:pt-14 pb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── Subtle Category Kicker ── */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#166534]"></span>
          <span className="text-[11px] sm:text-[12px] font-medium tracking-wide text-[#166534] uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
            Autonomous Agent Memory Engine
          </span>
        </div>

        {/* ── Main Headline with Responsive Fluid Typography ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 sm:mb-5"
        >
          <h1
            className="text-[38px] xs:text-[46px] sm:text-[68px] md:text-[88px] leading-[1.0] tracking-tight font-normal bg-clip-text text-transparent bg-gradient-to-r from-[#111111] via-[#14532d] to-[#166534]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            SQL for AI memory.
          </h1>
        </motion.div>

        {/* ── Cycling Sub-hook + Install Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10"
        >
          {/* Cycling hook */}
          <div className="min-h-[26px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={hookIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="text-[14px] sm:text-[15px] text-[#4b5563] font-normal"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {HOOKS[hookIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Install command + Quick Link */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 flex-shrink-0">
            <div className="flex items-center gap-2.5 border-b border-[#111] pb-1">
              <span className="font-mono text-xs sm:text-sm text-[#111]">pip install recalldb</span>
              <button
                onClick={copyCommand}
                className="text-[#6b7280] hover:text-[#166534] transition-colors"
                title="Copy command"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#166534]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <a
              href="#simulator"
              className="flex items-center gap-1 text-[12px] sm:text-[13px] text-[#166534] font-medium border-b border-[#166534] pb-1 hover:text-[#14532d] hover:border-[#14532d] transition-colors"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Interactive Simulator ↗
            </a>
          </div>
        </motion.div>

        {/* ── Hero YouTube Video on Loop & Muted with Rounded Edges ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="w-full overflow-hidden rounded-xl border border-[#e5e7eb] shadow-sm"
          style={{ height: 'clamp(220px, 46vw, 540px)' }}
        >
          <div className="yt-wrapper w-full h-full bg-[#0a0a0a]">
            <iframe
              src={`https://www.youtube.com/embed/${YT_VIDEO_ID}?autoplay=1&mute=1&loop=1&controls=0&playlist=${YT_VIDEO_ID}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1`}
              title="RecallDB — Multi-Agent Memory Orchestration"
              allow="autoplay; encrypted-media"
              allowFullScreen={false}
              className="w-full h-full border-0"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '100%',
                height: '120%',
                transform: 'translate(-50%, -50%)',
                border: 'none',
                pointerEvents: 'none',
              }}
            />
          </div>
        </motion.div>

        {/* ── Stats Row Responsive Grid ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="grid grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#e5e7eb] border-t border-b border-[#e5e7eb] mt-0"
        >
          {STATS.map((s, i) => (
            <div key={i} className="py-5 sm:py-7 px-3 sm:px-6 first:pl-0">
              <div
                className="text-[24px] sm:text-[32px] leading-none tracking-tight text-[#111]"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
              >
                {s.value}
              </div>
              <div className="text-[11px] sm:text-[12px] text-[#6b7280] mt-1.5 sm:mt-2 leading-snug" style={{ fontFamily: 'var(--font-sans)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
