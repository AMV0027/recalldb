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
    <div className="mb-8 font-serif">
      {/* Tidy Newspaper Chart Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7e5e4] pb-2 mb-4">
        <span className="text-xs uppercase tracking-wider text-[#78716c]">
          Figure 1 &bull; Visual Comparative Metrics
        </span>

        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setViewMode('accuracy')}
            className={`px-2.5 py-1 transition-colors ${
              viewMode === 'accuracy'
                ? 'bg-[#1c1917] text-[#faf8f5] font-medium'
                : 'text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            Recall & Accuracy
          </button>
          <button
            onClick={() => setViewMode('failure')}
            className={`px-2.5 py-1 transition-colors ${
              viewMode === 'failure'
                ? 'bg-[#1c1917] text-[#faf8f5] font-medium'
                : 'text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            Invalidation Errors (E_temp)
          </button>
          <button
            onClick={() => setViewMode('latency')}
            className={`px-2.5 py-1 transition-colors ${
              viewMode === 'latency'
                ? 'bg-[#1c1917] text-[#faf8f5] font-medium'
                : 'text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            Latency (ms)
          </button>
        </div>
      </div>

      {/* Visual Bars on Clean Newsprint Background */}
      <div className="space-y-3">
        {viewMode === 'accuracy' &&
          METRICS_DATA.map((item, idx) => {
            const recallPercent = Math.round(item.recall1 * 100);
            return (
              <div key={idx} className="flex items-center gap-4 text-xs">
                <span className={`w-48 truncate ${item.isPrimary ? 'font-semibold text-[#1c1917]' : 'text-[#57534e]'}`}>
                  {item.name}
                </span>
                <div className="flex-1 bg-[#f0eae1] h-3.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      item.isPrimary ? 'bg-[#1c1917]' : 'bg-[#a8a29e]'
                    }`}
                    style={{ width: `${Math.max(recallPercent, 2)}%` }}
                  />
                </div>
                <span className="w-16 text-right font-mono text-xs text-[#1c1917]">
                  {recallPercent}%
                </span>
              </div>
            );
          })}

        {viewMode === 'failure' &&
          METRICS_DATA.map((item, idx) => {
            const failurePercent = Math.round(item.etemp * 100);
            return (
              <div key={idx} className="flex items-center gap-4 text-xs">
                <span className={`w-48 truncate ${item.isPrimary ? 'font-semibold text-[#1c1917]' : 'text-[#57534e]'}`}>
                  {item.name}
                </span>
                <div className="flex-1 bg-[#f0eae1] h-3.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      item.isPrimary ? 'bg-[#1c1917]' : 'bg-[#991b1b]'
                    }`}
                    style={{ width: `${Math.max(failurePercent, item.isPrimary ? 0 : 3)}%` }}
                  />
                </div>
                <span className="w-16 text-right font-mono text-xs text-[#1c1917]">
                  {item.isPrimary ? '0.0%' : `${failurePercent}%`}
                </span>
              </div>
            );
          })}

        {viewMode === 'latency' &&
          METRICS_DATA.map((item, idx) => {
            const maxLatency = 25;
            const widthPercent = Math.round((item.latency / maxLatency) * 100);
            return (
              <div key={idx} className="flex items-center gap-4 text-xs">
                <span className={`w-48 truncate ${item.isPrimary ? 'font-semibold text-[#1c1917]' : 'text-[#57534e]'}`}>
                  {item.name}
                </span>
                <div className="flex-1 bg-[#f0eae1] h-3.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      item.isPrimary ? 'bg-[#1c1917]' : 'bg-[#a8a29e]'
                    }`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <span className="w-16 text-right font-mono text-xs text-[#1c1917]">
                  {item.latency} ms
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
