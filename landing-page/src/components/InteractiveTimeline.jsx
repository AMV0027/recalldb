import React, { useState } from 'react';
import { Calendar, Clock, Check, AlertCircle } from 'lucide-react';
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
      critique: "Historical Amnesia: Pure vector index has zero concept of time-slices. It cannot reconstruct past states."
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
      critique: "Semantic Collapse: Python ranks higher than Rust due to embedding lexical density, poisoning agent context."
    }
  }
};

export default function InteractiveTimeline() {
  const [selectedYear, setSelectedYear] = useState("2026");
  const data = TIMELINE_DATA[selectedYear];

  return (
    <section id="simulator" className="py-14 bg-[#faf8f5] border-b border-[#e7e5e4]">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="border-b border-[#1c1917] pb-3 mb-8">
          <div className="text-[11px] font-serif uppercase tracking-widest text-[#78716c] mb-1">
            Section II &bull; Chronology & Invalidation
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#1c1917]">
            The Bitemporal Memory Simulator
          </h3>
          <p className="font-serif text-xs sm:text-sm text-[#57534e] mt-1 leading-relaxed">
            Select an evaluation timestamp to witness how point-in-time intervals resolve state transitions versus unindexed vector drift.
          </p>
        </div>

        {/* Timeline Selector Bar */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e7e5e4] pb-2 text-xs font-serif text-[#78716c]">
            <span>Timeline Milestone:</span>
            <span>Target as_of: <strong className="text-[#1c1917] font-mono">{data.asOf}</strong></span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
            {Object.keys(TIMELINE_DATA).map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`py-2 px-3 text-left font-serif transition-colors border-b-2 ${
                  selectedYear === yr
                    ? 'border-[#1c1917] text-[#1c1917] bg-[#f5f2eb] font-medium'
                    : 'border-transparent text-[#78716c] hover:text-[#1c1917] hover:border-[#d6d3d1]'
                }`}
              >
                <div className="text-xs">{TIMELINE_DATA[yr].label}</div>
              </button>
            ))}
          </div>

          <div className="mt-3 p-3 bg-[#f5f2eb] border border-[#e7e5e4] text-xs font-serif text-[#44403c] italic">
            Event Log: {data.eventDesc}
          </div>
        </div>

        {/* Query Headline */}
        <div className="mb-6 pb-2 border-b border-[#e7e5e4]">
          <span className="text-[11px] font-serif uppercase tracking-wider text-[#78716c]">Retrieval Prompt: </span>
          <span className="font-serif italic text-sm text-[#1c1917]">
            "{data.isHistoricalDemo ? 'What backend language was I using in mid-2022?' : 'What backend language does the user use?'}"
          </span>
        </div>

        {/* Two-Column Side-by-Side Comparison (Editorial Style, No Heavy Boxes) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedYear}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 font-serif"
          >
            {/* Left Column: RecallDB */}
            <div className="space-y-3 pb-4">
              <div className="flex items-center justify-between border-b border-[#1c1917] pb-1.5">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#1c1917]">
                  RecallDB Bitemporal Engine
                </span>
                <span className="text-xs font-mono text-[#78716c]">
                  Score: {data.recalldb.score}
                </span>
              </div>

              <div className="text-sm font-medium text-[#1c1917] leading-relaxed">
                "{data.recalldb.result}"
              </div>

              <div className="text-xs text-[#78716c] flex items-center gap-2 font-mono">
                <span className="text-[#1c1917] font-semibold">[{data.recalldb.state}]</span>
                <span>&bull;</span>
                <span>Valid: {data.recalldb.validWindow}</span>
              </div>

              <p className="text-xs text-[#57534e] leading-relaxed italic border-t border-[#e7e5e4] pt-2">
                Editorial Finding: {data.recalldb.explanation}
              </p>
            </div>

            {/* Right Column: Standard Vector Store */}
            <div className="space-y-3 pb-4 md:border-l md:border-[#e7e5e4] md:pl-8">
              <div className="flex items-center justify-between border-b border-[#d6d3d1] pb-1.5">
                <span className="text-xs uppercase tracking-wider text-[#78716c]">
                  Conventional Vector Store (Dense Only)
                </span>
                <span className="text-xs font-mono text-[#78716c]">
                  Score: {data.vectordb.score}
                </span>
              </div>

              <div className="text-sm text-[#78716c] leading-relaxed">
                "{data.vectordb.result}"
              </div>

              <div className="text-xs text-[#991b1b] font-mono">
                Failure Mode: {data.vectordb.status}
              </div>

              <p className="text-xs text-[#78716c] leading-relaxed italic border-t border-[#e7e5e4] pt-2">
                Pathology: {data.vectordb.critique}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
