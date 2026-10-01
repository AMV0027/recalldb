import React, { useState } from 'react';

const METRICS_DATA = [
  {
    name: "RecallDB Bitemporal Hybrid",
    recall1: 1.000,
    mrr: 1.000,
    histAcc: 1.000,
    etemp: 0.000,
    latency: 11.47,
    isPrimary: true
  },
  {
    name: "Dense Vector Baseline (RAG)",
    recall1: 0.308,
    mrr: 0.458,
    histAcc: 0.250,
    etemp: 0.692,
    latency: 14.20,
    isPrimary: false
  },
  {
    name: "Hybrid Without Intervals",
    recall1: 0.231,
    mrr: 0.389,
    histAcc: 0.125,
    etemp: 0.769,
    latency: 18.60,
    isPrimary: false
  },
  {
    name: "BM25 Lexical Baseline",
    recall1: 0.077,
    mrr: 0.182,
    histAcc: 0.000,
    etemp: 0.857,
    latency: 19.80,
    isPrimary: false
  }
];

export default function BenchmarkVisualChart() {
  const [viewMode, setViewMode] = useState('accuracy');

  return (
    <div className="mb-8" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#e5e7eb] pb-3 mb-5">
        <span className="text-[11px] uppercase tracking-wider text-[#6b7280] font-mono font-medium">
          Figure 2 · Empirical Comparative Metrics
        </span>

        <div className="flex flex-wrap items-center gap-1 text-[12px]">
          <button
            onClick={() => setViewMode('accuracy')}
            className={`px-3 py-1.5 rounded transition-colors ${
              viewMode === 'accuracy'
                ? 'bg-[#166534] text-white font-medium'
                : 'text-[#4b5563] hover:text-[#111] hover:bg-[#f3f4f6]'
            }`}
          >
            Recall & Accuracy
          </button>
          <button
            onClick={() => setViewMode('failure')}
            className={`px-3 py-1.5 rounded transition-colors ${
              viewMode === 'failure'
                ? 'bg-[#166534] text-white font-medium'
                : 'text-[#4b5563] hover:text-[#111] hover:bg-[#f3f4f6]'
            }`}
          >
            Invalidation Errors (E_temp)
          </button>
          <button
            onClick={() => setViewMode('latency')}
            className={`px-3 py-1.5 rounded transition-colors ${
              viewMode === 'latency'
                ? 'bg-[#166534] text-white font-medium'
                : 'text-[#4b5563] hover:text-[#111] hover:bg-[#f3f4f6]'
            }`}
          >
            Latency (ms)
          </button>
        </div>
      </div>

      {/* Visual Bars with Responsive Stacking */}
      <div className="space-y-4">
        {viewMode === 'accuracy' &&
          METRICS_DATA.map((item, idx) => {
            const recallPercent = Math.round(item.recall1 * 100);
            return (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[13px]">
                <span className={`w-full sm:w-56 truncate ${item.isPrimary ? 'font-semibold text-[#166534]' : 'text-[#4b5563]'}`}>
                  {item.name}
                </span>
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1 bg-[#f3f4f6] h-4 rounded overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded ${
                        item.isPrimary ? 'bg-[#166534]' : 'bg-[#9ca3af]'
                      }`}
                      style={{ width: `${Math.max(recallPercent, 2)}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono text-xs font-semibold text-[#111]">
                    {recallPercent}%
                  </span>
                </div>
              </div>
            );
          })}

        {viewMode === 'failure' &&
          METRICS_DATA.map((item, idx) => {
            const failurePercent = Math.round(item.etemp * 100);
            return (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[13px]">
                <span className={`w-full sm:w-56 truncate ${item.isPrimary ? 'font-semibold text-[#166534]' : 'text-[#4b5563]'}`}>
                  {item.name}
                </span>
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1 bg-[#f3f4f6] h-4 rounded overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded ${
                        item.isPrimary ? 'bg-[#166534]' : 'bg-[#dc2626]'
                      }`}
                      style={{ width: `${Math.max(failurePercent, item.isPrimary ? 0 : 3)}%` }}
                    />
                  </div>
                  <span className={`w-12 text-right font-mono text-xs font-semibold ${item.isPrimary ? 'text-[#166534]' : 'text-[#dc2626]'}`}>
                    {item.isPrimary ? '0.0%' : `${failurePercent}%`}
                  </span>
                </div>
              </div>
            );
          })}

        {viewMode === 'latency' &&
          METRICS_DATA.map((item, idx) => {
            const maxLatency = 25;
            const widthPercent = Math.round((item.latency / maxLatency) * 100);
            return (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[13px]">
                <span className={`w-full sm:w-56 truncate ${item.isPrimary ? 'font-semibold text-[#166534]' : 'text-[#4b5563]'}`}>
                  {item.name}
                </span>
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1 bg-[#f3f4f6] h-4 rounded overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded ${
                        item.isPrimary ? 'bg-[#166534]' : 'bg-[#9ca3af]'
                      }`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                  <span className="w-16 text-right font-mono text-xs font-semibold text-[#111]">
                    {item.latency} ms
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
