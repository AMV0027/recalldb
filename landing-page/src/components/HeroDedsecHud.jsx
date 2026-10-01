import React from 'react';
import { Terminal, Shield, Cpu, Activity, Disc } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroDedsecHud() {
  const streamVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.15, duration: 0.4, ease: "easeOut" }
    })
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full bg-[#14060a] border border-[#380d16] rounded-none p-5 mb-14 text-left font-mono"
    >
      {/* HUD Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#380d16] pb-3 mb-4 text-[10px]">
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2 h-2 bg-[#c5a059]"
          />
          <span className="text-[#c5a059] font-medium tracking-widest uppercase">
            [RADAR TELEMETRY • NODE: 11.0168°N, 76.9558°E]
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#ab9573]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#c5a059]"></span>
            <span>STATUS: ARMED</span>
          </span>
          <span>•</span>
          <span className="text-[#f7eedb]">WAL_MODE: OK</span>
          <span>•</span>
          <span>LATENCY: 11.47ms</span>
        </div>
      </div>

      {/* Main HUD Body: Crosshair Radar + Live Memory Stream */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: SVG Tactical Radar Crosshair */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-[#17070b] border border-[#380d16]">
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 140 140" className="w-full h-full select-none">
              {/* Concentric Radar Rings */}
              <circle cx="70" cy="70" r="60" fill="none" stroke="#380d16" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="70" cy="70" r="40" fill="none" stroke="#380d16" strokeWidth="1" />
              <circle cx="70" cy="70" r="20" fill="none" stroke="#691425" strokeWidth="1" />

              {/* Crosshair Axes */}
              <line x1="10" y1="70" x2="130" y2="70" stroke="#380d16" strokeWidth="1" />
              <line x1="70" y1="10" x2="70" y2="130" stroke="#380d16" strokeWidth="1" />

              {/* Rotating Radar Sweep Line */}
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                style={{ originX: "70px", originY: "70px" }}
              >
                <line x1="70" y1="70" x2="70" y2="10" stroke="#c5a059" strokeWidth="1.5" strokeOpacity="0.8" />
                <polygon points="70,70 70,10 90,15" fill="#c5a059" fillOpacity="0.1" />
              </motion.g>

              {/* Memory Vector Nodes in Space */}
              {/* Node 1: Obsolete Python */}
              <circle cx="45" cy="45" r="3" fill="#691425" />
              <text x="32" y="38" fill="#ab9573" fontSize="7">0x7F (Py)</text>

              {/* Node 2: Obsolete Go */}
              <circle cx="95" cy="50" r="3" fill="#691425" />
              <text x="100" y="48" fill="#ab9573" fontSize="7">0x8B (Go)</text>

              {/* Node 3: Active Rust (Glowing Gold with Motion Pulse) */}
              <circle cx="78" cy="88" r="4" fill="#c5a059" />
              <motion.circle
                cx="78"
                cy="88"
                r="4"
                fill="none"
                stroke="#c5a059"
                strokeWidth="1.5"
                animate={{ r: [4, 12, 16], opacity: [0.9, 0.4, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              />
              <text x="88" y="92" fill="#c5a059" fontSize="8" fontWeight="bold">0xCA [ACTIVE]</text>

              {/* Center Reticle Point */}
              <circle cx="70" cy="70" r="2" fill="#f7eedb" />
            </svg>
          </div>
          <div className="text-[9px] text-[#ab9573] mt-2 tracking-wider text-center">
            BITEMPORAL LATENT PROJECTION
          </div>
        </div>

        {/* Right: Real-time Memory Stream */}
        <div className="md:col-span-8 space-y-2.5">
          <div className="text-[10px] text-[#ab9573] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Non-Destructive Lineage State DAG:</span>
            <span className="text-[#c5a059]">[DAG_SLICES: 3]</span>
          </div>

          {/* Memory Item 1 */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={streamVariants}
            className="p-2.5 bg-[#17070b] border border-[#380d16] flex items-center justify-between text-xs hover:border-[#691425] transition-colors"
          >
            <div className="truncate mr-3">
              <span className="text-[#ab9573] text-[10px] mr-2">0x7F10</span>
              <span className="text-[#e2d2b5]/70">Python 3.10 with FastAPI</span>
              <span className="text-[#ab9573] text-[10px] ml-2 hidden sm:inline">[2022-01-15 &rarr; 2024-03-01)</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 border border-[#380d16] bg-[#0d0508] text-[#ab9573]">
              SUPERSEDED
            </span>
          </motion.div>

          {/* Memory Item 2 */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={streamVariants}
            className="p-2.5 bg-[#17070b] border border-[#380d16] flex items-center justify-between text-xs hover:border-[#691425] transition-colors"
          >
            <div className="truncate mr-3">
              <span className="text-[#ab9573] text-[10px] mr-2">0x8B22</span>
              <span className="text-[#e2d2b5]/70">Go 1.22 with Gin framework</span>
              <span className="text-[#ab9573] text-[10px] ml-2 hidden sm:inline">[2024-03-01 &rarr; 2026-01-10)</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 border border-[#380d16] bg-[#0d0508] text-[#ab9573]">
              SUPERSEDED
            </span>
          </motion.div>

          {/* Memory Item 3 (Active) */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={streamVariants}
            className="p-2.5 bg-[#1a080d] border border-[#c5a059] flex items-center justify-between text-xs"
          >
            <div className="truncate mr-3">
              <span className="text-[#c5a059] text-[10px] mr-2">0xCA91</span>
              <span className="text-[#f7eedb] font-medium">Rust 1.80 with Axum runtime</span>
              <span className="text-[#c5a059] text-[10px] ml-2 hidden sm:inline">[2026-01-10 &rarr; Present)</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 border border-[#c5a059] bg-[#240a11] text-[#c5a059] font-bold">
              ACTIVE_GROUND_TRUTH
            </span>
          </motion.div>
        </div>
      </div>

      {/* Terminal Stream Footer */}
      <div className="mt-4 pt-3 border-t border-[#380d16] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#ab9573]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-[#c5a059]" />
          <span>&gt; recalldb.recall("backend language", as_of="2026-06-01") &rarr; 0xCA91 (Rust 1.80)</span>
        </div>
        <div className="flex items-center gap-3 text-[#e2d2b5]/70">
          <span>ZERO_DAEMON_OVERHEAD</span>
          <span>•</span>
          <span>SQLITE_EMBEDDED</span>
        </div>
      </div>
    </motion.div>
  );
}
