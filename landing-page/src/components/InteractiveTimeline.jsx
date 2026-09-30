import React, { useState } from 'react';
import { Calendar, Clock, Check, AlertCircle } from 'lucide-react';

const TIMELINE_DATA = {
  "2023": {
    year: "2023",
    label: "Mid 2023 (Initial State)",
    asOf: "2023-08-01",
    eventDesc: "Agent ingested: 'Primary backend programming language is Python 3.10 with FastAPI framework'",
    recalldb: {
      result: "Primary backend programming language is Python 3.10 with FastAPI framework",
      state: "ACTIVE",
      validWindow: "[2023-01-15 -> 2024-06-01)",
      score: 0.91,
      telemetry: { vector: 0.88, bm25: 0.94, temporal: 0.98, staleness: 0.0 },
      explanation: "Temporally valid in 2023 window. Strong lexical match on 'backend programming language'."
    },
    vectordb: {
      result: "Primary backend programming language is Python 3.10 with FastAPI framework",
      score: 0.88,
      critique: "Matches incidentally because no future conflicting assertions existed yet."
    }
  },
  "2024": {
    year: "2024",
    label: "Late 2024 (First Migration)",
    asOf: "2024-08-01",
    eventDesc: "Agent updated: 'Primary backend programming language migrated to Go using Gin framework'",
    recalldb: {
      result: "Primary backend programming language migrated to Go using Gin framework",
      state: "ACTIVE",
      validWindow: "[2024-06-01 -> 2026-02-01)",
      score: 0.93,
      telemetry: { vector: 0.89, bm25: 0.92, temporal: 0.96, staleness: 0.0 },
      explanation: "Atomic supersession invalidated 2023 Python record. Go is the only active state."
    },
    vectordb: {
      result: "Conflicted Top-2: (1) Python with FastAPI (0.88), (2) Go with Gin (0.87)",
      score: 0.88,
      critique: "Temporal Blindness: Vector DB returns both Python and Go with nearly identical cosine scores."
    }
  },
  "2025": {
    year: "2025",
    label: "Mid 2025 (Historical Query)",
    asOf: "2023-06-01",
    isHistoricalDemo: true,
    eventDesc: "Query: 'What language was I using in 2023?' (Historical Time-Travel Query)",
    recalldb: {
      result: "Primary backend programming language is Python 3.10 with FastAPI framework",
      state: "HISTORICAL_RESTORE",
      validWindow: "[2023-01-15 -> 2024-06-01)",
      score: 0.90,
      telemetry: { vector: 0.88, bm25: 0.94, temporal: 1.0, staleness: 0.0 },
      explanation: "as_of('2023-06-01') accurately reconstructed historical reality without catastrophic forgetting."
    },
    vectordb: {
      result: "Returns Latest Memory: Go with Gin framework",
      score: 0.87,
      critique: "Historical Amnesia: Pure vector DB cannot time-travel. It cannot tell what was true in 2023."
    }
  },
  "2026": {
    year: "2026",
    label: "2026 (Present Day)",
    asOf: "2026-06-01",
    eventDesc: "Agent updated: 'Primary backend programming language finalized on Rust with Axum runtime'",
    recalldb: {
      result: "Primary backend programming language finalized on Rust with Axum runtime",
      state: "ACTIVE",
      validWindow: "[2026-02-01 -> Present)",
      score: 0.95,
      telemetry: { vector: 0.91, bm25: 0.95, temporal: 0.99, staleness: 0.0 },
      explanation: "Bitemporal state resolves Rust as the sole active node. Python and Go are archived in the lineage DAG."
    },
    vectordb: {
      result: "Triple Collision: (1) Python (0.88), (2) Go (0.87), (3) Rust (0.86)",
      score: 0.88,
      critique: "Semantic Collapse: LLM reader receives 3 contradictory languages in prompt context and hallucinates."
    }
  }
};

export default function InteractiveTimeline() {
  const [selectedYear, setSelectedYear] = useState("2026");
  const data = TIMELINE_DATA[selectedYear];

  return (
    <section id="simulator" className="py-20 bg-zinc-950 border-b border-zinc-900">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono tracking-wider text-zinc-400 mb-2 uppercase">
            Interactive Simulator
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-zinc-100 mb-3">
            Bitemporal Memory vs. Vector Retrieval
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Select an evaluation timestamp to compare how RecallDB resolves state compared to traditional vector search.
          </p>
        </div>

        {/* Query Input Simulation Box */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
            <div>
              <div className="text-[11px] text-zinc-400 font-mono uppercase">Retrieval Query</div>
              <div className="text-sm font-medium text-zinc-100 mt-1">
                "{data.isHistoricalDemo ? 'What language was I using in 2023?' : 'What backend language does the user use?'}"
              </div>
            </div>
            <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 border border-zinc-800 rounded-sm font-mono text-xs">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-400">as_of:</span>
              <span className="text-zinc-200">{data.asOf}</span>
            </div>
          </div>

          {/* Time Picker Controls */}
          <div className="pt-5">
            <div className="text-[11px] text-zinc-400 font-mono mb-2 uppercase">Select Temporal Point:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.keys(TIMELINE_DATA).map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`p-3 rounded-sm border text-left transition-colors ${
                    selectedYear === yr
                      ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-mono text-xs font-medium text-zinc-200">{yr}</span>
                    <Clock className="w-3 h-3 text-zinc-400" />
                  </div>
                  <div className="text-[11px] truncate text-zinc-400">{TIMELINE_DATA[yr].label}</div>
                </button>
              ))}
            </div>
            <div className="mt-3 p-2.5 bg-zinc-950 border border-zinc-800/80 rounded-sm text-xs text-zinc-300 font-mono">
              Event: {data.eventDesc}
            </div>
          </div>
        </div>

        {/* Side by Side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RecallDB Output */}
          <div className="bg-zinc-900/60 border border-zinc-700 rounded-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-medium text-zinc-200 uppercase">RecallDB (Bitemporal Hybrid)</span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 border border-zinc-700 bg-zinc-800 text-zinc-300 rounded-sm">
                Score: {data.recalldb.score}
              </span>
            </div>

            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm mb-4">
              <div className="text-xs text-zinc-100 mb-2 leading-relaxed">
                {data.recalldb.result}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                <span className="text-zinc-300">{data.recalldb.state}</span>
                <span>•</span>
                <span>Valid: {data.recalldb.validWindow}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center font-mono text-[11px] mb-3">
              <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-sm">
                <div className="text-[9px] text-zinc-400">VECTOR</div>
                <div className="text-zinc-200">{data.recalldb.telemetry.vector}</div>
              </div>
              <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-sm">
                <div className="text-[9px] text-zinc-400">BM25</div>
                <div className="text-zinc-200">{data.recalldb.telemetry.bm25}</div>
              </div>
              <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-sm">
                <div className="text-[9px] text-zinc-400">TEMPORAL</div>
                <div className="text-zinc-200">{data.recalldb.telemetry.temporal}</div>
              </div>
              <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-sm">
                <div className="text-[9px] text-zinc-400">PENALTY</div>
                <div className="text-zinc-200">{data.recalldb.telemetry.staleness}</div>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-mono">
              Rationale: {data.recalldb.explanation}
            </p>
          </div>

          {/* Traditional Vector DB Output */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-medium text-zinc-400 uppercase">Vector DB (Dense Only)</span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 border border-zinc-800 bg-zinc-950 text-zinc-400 rounded-sm">
                Score: {data.vectordb.score}
              </span>
            </div>

            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm mb-4">
              <div className="text-xs text-zinc-300 leading-relaxed">
                {data.vectordb.result}
              </div>
            </div>

            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm text-xs text-zinc-400 font-mono leading-relaxed">
              Failure Analysis: {data.vectordb.critique}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
