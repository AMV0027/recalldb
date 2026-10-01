import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TIMELINE_DATA = {
  "2022": {
    year: "2022",
    label: "2022: Python Era",
    asOf: "2022-08-01",
    eventDesc: "Ingested Fact: 'Primary backend programming language is Python 3.10 with FastAPI runtime'",
    cursorX: 12.5,
    recalldb: {
      result: "Primary backend programming language is Python 3.10 with FastAPI runtime",
      state: "ACTIVE",
      validWindow: "[2022-01-15 -> 2024-03-01)",
      score: 0.942,
      explanation: "Active in 2022 temporal interval. Gated by [2022-01-15, 2024-03-01). Dual-channel rank fusion confirmed."
    },
    vectordb: {
      result: "Primary backend programming language is Python 3.10 with FastAPI runtime",
      score: 0.891,
      status: "Incidental Pass",
      critique: "Coincidental pass. Succeeded only because future migrations had not yet occurred."
    }
  },
  "2024": {
    year: "2024",
    label: "2024: Go Migration",
    asOf: "2024-06-01",
    eventDesc: "Atomic Supersession: 'Primary backend programming language migrated to Go 1.22 with Gin framework'",
    cursorX: 37.5,
    recalldb: {
      result: "Primary backend programming language migrated to Go 1.22 with Gin framework",
      state: "ACTIVE",
      validWindow: "[2024-03-01 -> 2026-01-10)",
      score: 0.958,
      explanation: "Supersession DAG invalidated 2022 Python record. Go is the sole active memory at t=2024-06-01."
    },
    vectordb: {
      result: "Collision: (1) Python with FastAPI [0.891], (2) Go with Gin [0.884]",
      score: 0.891,
      status: "Contradiction Collapse",
      critique: "Temporal Blindness: Returns both Python and Go with overlapping similarity. Reader LLM receives contradiction."
    }
  },
  "2025": {
    year: "2025",
    label: "2025: Historical Query",
    asOf: "2022-06-01",
    isHistoricalDemo: true,
    eventDesc: "Historical Time-Travel Query: 'What language was I using in mid-2022?' with as_of='2022-06-01'",
    cursorX: 62.5,
    recalldb: {
      result: "Primary backend programming language is Python 3.10 with FastAPI runtime",
      state: "HISTORICAL RESTORE",
      validWindow: "[2022-01-15 -> 2024-03-01)",
      score: 0.935,
      explanation: "Deterministic point-in-time state reconstruction. as_of filter restored 2022 ground truth without database rollback."
    },
    vectordb: {
      result: "Returns Latest Record: Go 1.22 with Gin framework [0.884]",
      score: 0.884,
      status: "Historical Amnesia",
      critique: "Historical Amnesia: Pure vector index has zero concept of time-slices. Cannot reconstruct past states."
    }
  },
  "2026": {
    year: "2026",
    label: "2026: Rust Finalization",
    asOf: "2026-06-01",
    eventDesc: "Atomic Supersession: 'Primary backend programming language finalized on Rust 1.80 with Axum runtime'",
    cursorX: 87.5,
    recalldb: {
      result: "Primary backend programming language finalized on Rust 1.80 with Axum runtime",
      state: "ACTIVE",
      validWindow: "[2026-01-10 -> Present)",
      score: 0.981,
      explanation: "Bitemporal intervals resolve Rust as active. Python and Go archived in lineage DAG with zero data loss."
    },
    vectordb: {
      result: "Triple Collision: (1) Python [0.891], (2) Go [0.884], (3) Rust [0.879]",
      score: 0.891,
      status: "Semantic Collapse",
      critique: "Python ranks higher than Rust due to embedding lexical density, poisoning agent context."
    }
  }
};

export default function InteractiveTimeline() {
  const [selectedYear, setSelectedYear] = useState("2026");
  const data = TIMELINE_DATA[selectedYear];

  return (
    <section id="simulator" className="bg-white border-t border-[#e4e4e4]">
      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* Section Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
          <div className="md:col-span-5">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="text-[38px] sm:text-[48px] font-normal leading-tight tracking-tight text-[#111]"
            >
              Memory Simulator.
            </motion.h2>
          </div>
          <div className="md:col-span-7 flex flex-col justify-end">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-[15px] text-[#555] leading-relaxed"
            >
              Select an evaluation timestamp to witness how bitemporal point-in-time intervals resolve state transitions versus unindexed vector drift.
            </motion.p>
          </div>
        </div>

        {/* Timeline Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e4e4e4] pb-2 text-[12px] text-[#888]">
            <span>Timeline Milestone:</span>
            <span>as_of: <strong className="text-[#111] font-mono">{data.asOf}</strong></span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
            {Object.keys(TIMELINE_DATA).map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`py-2.5 px-3 text-left text-[13px] transition-colors border-b-2 ${
                  selectedYear === yr
                    ? 'border-[#111] text-[#111] font-medium'
                    : 'border-transparent text-[#888] hover:text-[#111] hover:border-[#ccc]'
                }`}
              >
                {TIMELINE_DATA[yr].label}
              </button>
            ))}
          </div>

          <div className="mt-3 p-4 bg-[#fafafa] border border-[#e4e4e4] text-[12px] text-[#666] italic">
            {data.eventDesc}
          </div>
        </div>

        {/* Query */}
        <div className="mb-6 pb-3 border-b border-[#e4e4e4]">
          <span className="text-[11px] uppercase tracking-wider text-[#aaa]">Retrieval Prompt: </span>
          <span className="text-[14px] text-[#111] italic">
            "{data.isHistoricalDemo ? 'What backend language was I using in mid-2022?' : 'What backend language does the user use?'}"
          </span>
        </div>

        {/* Side-by-side comparison */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedYear}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-10"
          >
            {/* Left: RecallDB */}
            <div className="space-y-3 pb-4">
              <div className="flex items-center justify-between border-b border-[#111] pb-1.5">
                <span className="text-[12px] uppercase tracking-wider font-medium text-[#111]">
                  RecallDB Bitemporal Engine
                </span>
                <span className="text-[12px] font-mono text-[#888]">
                  Score: {data.recalldb.score}
                </span>
              </div>
              <div className="text-[14px] text-[#111] leading-relaxed">
                "{data.recalldb.result}"
              </div>
              <div className="text-[12px] text-[#888] flex items-center gap-2 font-mono">
                <span className="text-[#111] font-medium">[{data.recalldb.state}]</span>
                <span>·</span>
                <span>Valid: {data.recalldb.validWindow}</span>
              </div>
              <p className="text-[13px] text-[#555] leading-relaxed italic border-t border-[#e4e4e4] pt-2">
                {data.recalldb.explanation}
              </p>
            </div>

            {/* Right: Vector Store */}
            <div className="space-y-3 pb-4 md:border-l md:border-[#e4e4e4] md:pl-10">
              <div className="flex items-center justify-between border-b border-[#e4e4e4] pb-1.5">
                <span className="text-[12px] uppercase tracking-wider text-[#aaa]">
                  Conventional Vector Store
                </span>
                <span className="text-[12px] font-mono text-[#aaa]">
                  Score: {data.vectordb.score}
                </span>
              </div>
              <div className="text-[14px] text-[#999] leading-relaxed">
                "{data.vectordb.result}"
              </div>
              <div className="text-[12px] text-[#c0392b] font-mono">
                Failure: {data.vectordb.status}
              </div>
              <p className="text-[13px] text-[#888] leading-relaxed italic border-t border-[#e4e4e4] pt-2">
                {data.vectordb.critique}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
