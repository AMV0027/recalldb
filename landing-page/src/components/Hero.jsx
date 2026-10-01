import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// YouTube video ID from https://youtu.be/HtG58C56xhU
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
    navigator.clipboard.writeText('pip install recalldb');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="lead" className="bg-white pt-16 pb-0">
      <div className="max-w-6xl mx-auto px-6">

        {/* ── Headline Block ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <h1
            className="text-[56px] sm:text-[72px] md:text-[90px] leading-[1.0] tracking-tight text-[#111]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
          >
            SQL for AI memory.
          </h1>
        </motion.div>

        {/* ── Cycling Sub-hook + Install Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10"
        >
          {/* Cycling hook */}
          <div className="min-h-[28px]">
            <AnimatePresence mode="wait">
              <motion.p
                key={hookIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-[15px] text-[#666]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {HOOKS[hookIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Install command + See More */}
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

        {/* ── YouTube Video Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="w-full overflow-hidden rounded-lg"
          style={{ height: 'clamp(280px, 50vw, 560px)' }}
        >
          {/*
            YouTube embed parameters:
            autoplay=1     – starts automatically
            mute=1         – required for autoplay in browsers
            loop=1         – loops forever
            controls=0     – hides player controls
            playlist=ID    – required for loop to work with a single video
            rel=0          – no recommended videos at end
            showinfo=0     – no title overlay
            modestbranding=1 – minimal YouTube branding
            iv_load_policy=3 – no annotations
            disablekb=1    – disable keyboard shortcuts
            fs=0           – disable fullscreen button
          */}
          <div className="yt-wrapper w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${YT_VIDEO_ID}?autoplay=1&mute=1&loop=1&controls=0&playlist=${YT_VIDEO_ID}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1`}
              title="RecallDB — Multi-Agent Memory"
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

        {/* ── Stats Bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#e4e4e4] border-t border-b border-[#e4e4e4]"
        >
          {STATS.map((s, i) => (
            <div key={i} className="py-7 px-6 first:pl-0">
              <div
                className="text-[32px] leading-none tracking-tight text-[#111]"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
              >
                {s.value}
              </div>
              <div className="text-[12px] text-[#888] mt-2 leading-snug" style={{ fontFamily: 'var(--font-sans)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
