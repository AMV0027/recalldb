import React, { useState } from 'react';
import { Copy, Check, ArrowRight } from 'lucide-react';

export default function Hero() {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText("pip install recalldb");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="pt-20 pb-20 bg-zinc-950 border-b border-zinc-900">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Subtle Category Tag */}
        <div className="inline-block text-xs font-mono tracking-wider text-zinc-400 mb-6 uppercase">
          Open-Source Agent Memory Infrastructure & Benchmark
        </div>

        {/* Refined Modest Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-zinc-100 max-w-3xl mx-auto leading-tight mb-6">
          Persistent, Bitemporal Memory for Autonomous AI Agents
        </h1>

        {/* Quiet Subheading */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          RecallDB is an embedded single-file memory engine combining bitemporal intervals, FTS5 lexical BM25, and dense vector similarity with sub-25ms local retrieval.
        </p>

        {/* Clean Installation & Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-16">
          <div className="flex items-center justify-between w-full sm:w-auto px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm font-mono text-xs">
            <span className="text-zinc-500 mr-2 select-none">$</span>
            <span className="text-zinc-200 mr-4 font-normal">pip install recalldb</span>
            <button
              onClick={copyCommand}
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Copy command"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-zinc-300" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <a
            href="#simulator"
            className="w-full sm:w-auto px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs rounded-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Time-Travel Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Flat Minimalist Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-800 border border-zinc-800 rounded-sm overflow-hidden">
          <div className="bg-zinc-950 p-5 text-center">
            <div className="text-xl sm:text-2xl font-mono font-medium text-zinc-100">0.8333</div>
            <div className="text-[11px] text-zinc-400 mt-1">Recall@1 (+66.7% vs Dense)</div>
          </div>
          <div className="bg-zinc-950 p-5 text-center">
            <div className="text-xl sm:text-2xl font-mono font-medium text-zinc-100">100.0%</div>
            <div className="text-[11px] text-zinc-400 mt-1">Historical Query Precision</div>
          </div>
          <div className="bg-zinc-950 p-5 text-center">
            <div className="text-xl sm:text-2xl font-mono font-medium text-zinc-100">23.5 ms</div>
            <div className="text-[11px] text-zinc-400 mt-1">p50 Retrieval Latency</div>
          </div>
          <div className="bg-zinc-950 p-5 text-center">
            <div className="text-xl sm:text-2xl font-mono font-medium text-zinc-100">Zero</div>
            <div className="text-[11px] text-zinc-400 mt-1">Daemon Servers Needed</div>
          </div>
        </div>
      </div>
    </section>
  );
}
