import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, ChevronRight, CheckCircle2, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const TIMELINE_DATA = [
  {
    id: "2022",
    year: "2022",
    title: "Epoch 1: Python Ingestion",
    date: "2022-08-01",
    asOf: "2022-08-01",
    eventDesc: "Ingested Fact: 'Primary backend programming language is Python 3.10 with FastAPI runtime'",
    query: "What backend language does the user use?",
    recalldb: {
      result: "Primary backend programming language is Python 3.10 with FastAPI runtime",
      state: "VALID_ACTIVE",
      validWindow: "[2022-01-15 -> 2024-03-01)",
      score: "0.942",
      accuracy: 100,
      status: "Verified True",
      reason: "Record is temporally valid at t=2022-08-01 within interval [2022-01-15, 2024-03-01)."
    },
    vectordb: {
      result: "Primary backend programming language is Python 3.10 with FastAPI runtime",
      score: "0.891",
      accuracy: 100,
      status: "Incidental Pass",
      reason: "Coincidental pass because future superseding facts have not yet been stored."
    }
  },
  {
    id: "2024",
    year: "2024",
    title: "Epoch 2: Go Migration & Invalidation",
    date: "2024-06-01",
    asOf: "2024-06-01",
    eventDesc: "Atomic Supersession: 'Primary backend programming language migrated to Go 1.22 with Gin framework'",
    query: "What backend language does the user use?",
    recalldb: {
      result: "Primary backend programming language migrated to Go 1.22 with Gin framework",
      state: "SUPERSEDED_ACTIVE",
      validWindow: "[2024-03-01 -> 2026-01-10)",
      score: "0.958",
      accuracy: 100,
      status: "Verified True",
      reason: "Supersession DAG invalidated 2022 Python record. Go is the only active state at t=2024-06-01."
    },
    vectordb: {
      result: "Collision: [1] Python 3.10 (0.891) vs [2] Go 1.22 (0.884)",
      score: "0.891",
      accuracy: 0,
      status: "Contradiction Collapse",
      reason: "Temporal Blindness: Returns Python and Go with overlapping confidence. Reader LLM hallucinates."
    }
  },
  {
    id: "2025",
    year: "2025",
    title: "Epoch 3: Historical Time-Travel Query",
    date: "2025-03-01",
    asOf: "2022-06-01",
    isTimeTravel: true,
    eventDesc: "Time-Travel Query: 'What language was I using in mid-2022?' with predicate as_of='2022-06-01'",
    query: "What language was I using in mid-2022?",
    recalldb: {
      result: "Primary backend programming language is Python 3.10 with FastAPI runtime",
      state: "HISTORICAL_RESTORE",
      validWindow: "[2022-01-15 -> 2024-03-01)",
      score: "0.935",
      accuracy: 100,
      status: "Point-in-Time Match",
      reason: "as_of='2022-06-01' predicate reconstructed historical ground truth without database rollback."
    },
    vectordb: {
      result: "Returns Most Recent: Go 1.22 with Gin framework [0.884]",
      score: "0.884",
      accuracy: 0,
      status: "Historical Amnesia",
      reason: "Unindexed vectors cannot time-travel. It returns whatever has highest cosine similarity."
    }
  },
  {
    id: "2026",
    year: "2026",
    title: "Epoch 4: Rust Finalization & Triple State",
    date: "2026-06-01",
    asOf: "2026-06-01",
    eventDesc: "Atomic Supersession: 'Primary backend programming language finalized on Rust 1.80 with Axum runtime'",
    query: "What backend language does the user use?",
    recalldb: {
      result: "Primary backend programming language finalized on Rust 1.80 with Axum runtime",
      state: "ACTIVE_FINAL",
      validWindow: "[2026-01-10 -> Present)",
      score: "0.981",
      accuracy: 100,
      status: "Deterministic Truth",
      reason: "Rust is actively valid. Python and Go remain immutable in lineage history with zero corruption."
    },
    vectordb: {
      result: "Triple Collision: [1] Python [0.891], [2] Go [0.884], [3] Rust [0.879]",
      score: "0.891",
      accuracy: 0,
      status: "Context Poisoning",
      reason: "Python still ranks #1 because of keyword frequency, poisoning agent context with stale facts."
    }
  }
];

export default function InteractiveTimeline() {
  const [currentIndex, setCurrentIndex] = useState(3);
  const current = TIMELINE_DATA[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TIMELINE_DATA.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TIMELINE_DATA.length) % TIMELINE_DATA.length);
  };

  return (
    <section id="simulator" className="bg-white border-t border-[#e5e7eb]">
      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#166534]"></span>
              <span className="text-[12px] font-medium tracking-wide text-[#166534] uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
                Interactive State Machine
              </span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="text-[38px] sm:text-[46px] leading-[1.05] tracking-tight text-[#111]"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
            >
              Memory <span className="text-[#166534]">Simulator.</span>
            </motion.h2>
          </div>
          <div className="md:col-span-7 flex flex-col justify-end">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-[15px] text-[#4b5563] leading-relaxed"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Step through historical epochs to verify point-in-time state reconstruction versus conventional vector degradation in real-time.
            </motion.p>
          </div>
        </div>

        {/* Gamified Time Machine Deck */}
        <div className="border border-[#e5e7eb] rounded-xl overflow-hidden shadow-sm bg-white mb-10">

          {/* Top Control Bar / Scrubber */}
          <div className="p-4 sm:p-6 bg-[#fafafa] border-b border-[#e5e7eb]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-[11px] font-medium text-[#166534] uppercase tracking-wider font-mono">
                  ACTIVE EPOCH {currentIndex + 1} OF {TIMELINE_DATA.length}
                </span>
                <h3 className="text-[18px] text-[#111] font-medium mt-0.5" style={{ fontFamily: 'var(--font-display)' }}>
                  {current.title}
                </h3>
              </div>

              {/* Step Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 text-xs text-[#4b5563] hover:text-[#111] bg-white border border-[#e5e7eb] rounded hover:bg-[#f3f4f6] transition-colors"
                >
                  ← Prev Epoch
                </button>
                <button
                  onClick={handleNext}
                  className="px-3 py-1.5 text-xs text-white bg-[#166534] hover:bg-[#14532d] rounded font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span>Next Epoch</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stepper Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {TIMELINE_DATA.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    currentIndex === idx
                      ? 'bg-white border-[#166534] shadow-sm ring-1 ring-[#166534]/20'
                      : 'bg-white/60 border-[#e5e7eb] hover:bg-white text-[#6b7280]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#9ca3af]">{item.year}</span>
                    {currentIndex === idx && (
                      <span className="w-2 h-2 rounded-full bg-[#166534]"></span>
                    )}
                  </div>
                  <div className={`text-[13px] mt-1 font-medium truncate ${currentIndex === idx ? 'text-[#166534]' : 'text-[#374151]'}`}>
                    {item.year}: {item.title.split(':')[1]?.trim() || item.year}
                  </div>
                </button>
              ))}
            </div>

            {/* Ingestion Event Banner */}
            <div className="mt-4 p-3 bg-white border border-[#e5e7eb] rounded-md text-[12px] text-[#4b5563] flex items-start gap-2.5">
              <span className="font-mono text-[10px] uppercase font-semibold text-[#166534] bg-[#f0fdf4] px-1.5 py-0.5 rounded border border-[#bbf7d0] mt-0.5">
                EVENT
              </span>
              <span className="italic">{current.eventDesc}</span>
            </div>
          </div>

          {/* Active Prompt Header */}
          <div className="px-6 py-3.5 bg-white border-b border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#9ca3af] uppercase font-mono text-[10px]">Retrieval Prompt:</span>
              <span className="font-medium text-[#111827]">"{current.query}"</span>
            </div>
            <div className="font-mono text-[11px] text-[#166534] bg-[#f0fdf4] px-2.5 py-1 rounded border border-[#bbf7d0] self-start sm:self-auto">
              as_of = "{current.asOf}"
            </div>
          </div>

          {/* Side-by-Side Arena */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Left: RecallDB (100% Accuracy) */}
            <div className="border border-[#bbf7d0] bg-[#f0fdf4]/20 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#bbf7d0]/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#166534]" />
                  <span className="text-[13px] font-semibold text-[#166534]" style={{ fontFamily: 'var(--font-display)' }}>
                    RecallDB Engine
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-[#166534] bg-[#dcfce7] px-2 py-0.5 rounded font-medium">100% Match</span>
                  <span className="text-[#6b7280]">Score: {current.recalldb.score}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-mono text-[#6b7280] mb-1">Retrieved Memory Fact:</div>
                <div className="text-[14px] font-medium text-[#111827] leading-relaxed bg-white p-3 rounded-lg border border-[#e5e7eb]">
                  "{current.recalldb.result}"
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-white p-2 rounded border border-[#e5e7eb]">
                  <div className="text-[#9ca3af] text-[9px] uppercase">State DAG</div>
                  <div className="text-[#166534] font-medium mt-0.5">{current.recalldb.state}</div>
                </div>
                <div className="bg-white p-2 rounded border border-[#e5e7eb]">
                  <div className="text-[#9ca3af] text-[9px] uppercase">Valid Time Window</div>
                  <div className="text-[#111827] mt-0.5 truncate">{current.recalldb.validWindow}</div>
                </div>
              </div>

              <p className="text-[12px] text-[#4b5563] leading-relaxed italic pt-1">
                <strong className="text-[#166534] not-italic">Verification: </strong>
                {current.recalldb.reason}
              </p>
            </div>

            {/* Right: Unindexed Vector Store (Fails on state churn) */}
            <div className="border border-[#fecaca] bg-[#fef2f2]/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#fecaca]/60">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-[#dc2626]" />
                  <span className="text-[13px] font-semibold text-[#991b1b]" style={{ fontFamily: 'var(--font-display)' }}>
                    Standard Vector Store (Dense RAG)
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className={`px-2 py-0.5 rounded font-medium ${current.vectordb.accuracy === 100 ? 'bg-[#fef9c3] text-[#854d0e]' : 'bg-[#fee2e2] text-[#991b1b]'}`}>
                    {current.vectordb.accuracy === 100 ? 'Incidental' : '0% Match'}
                  </span>
                  <span className="text-[#6b7280]">Score: {current.vectordb.score}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-mono text-[#6b7280] mb-1">Retrieved Memory Fact:</div>
                <div className="text-[14px] text-[#4b5563] leading-relaxed bg-white p-3 rounded-lg border border-[#e5e7eb]">
                  "{current.vectordb.result}"
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-white p-2 rounded border border-[#e5e7eb]">
                  <div className="text-[#9ca3af] text-[9px] uppercase">Failure Mode</div>
                  <div className="text-[#dc2626] font-medium mt-0.5 truncate">{current.vectordb.status}</div>
                </div>
                <div className="bg-white p-2 rounded border border-[#e5e7eb]">
                  <div className="text-[#9ca3af] text-[9px] uppercase">Temporal Handling</div>
                  <div className="text-[#6b7280] mt-0.5">Unbounded Drift</div>
                </div>
              </div>

              <p className="text-[12px] text-[#4b5563] leading-relaxed italic pt-1">
                <strong className="text-[#dc2626] not-italic">Pathology: </strong>
                {current.vectordb.reason}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
