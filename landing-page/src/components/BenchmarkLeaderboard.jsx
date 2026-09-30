import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function BenchmarkLeaderboard() {
  const benchmarks = [
    {
      system: "RecallDB Full Hybrid",
      config: "Dense + BM25 + Bitemporal Intervals",
      recall1: "0.8333",
      recall5: "1.0000",
      mrr: "0.9167",
      histAcc: "100.0%",
      currAcc: "71.4%",
      latency: "23.51 ms",
      highlight: true
    },
    {
      system: "Dense Vector Only Baseline",
      config: "Traditional Vector DB (No temporal, no BM25)",
      recall1: "0.5000",
      recall5: "1.0000",
      mrr: "0.7361",
      histAcc: "40.0%",
      currAcc: "57.1%",
      latency: "18.72 ms",
      highlight: false
    },
    {
      system: "Hybrid Without Bitemporal",
      config: "Dense + BM25 (Zero temporal bounds)",
      recall1: "0.1667",
      recall5: "0.7500",
      mrr: "0.3806",
      histAcc: "20.0%",
      currAcc: "14.3%",
      latency: "26.28 ms",
      highlight: false
    },
    {
      system: "BM25 Lexical Only",
      config: "FTS5 BM25 (Zero semantic vectors)",
      recall1: "0.0000",
      recall5: "0.5833",
      mrr: "0.1500",
      histAcc: "0.0%",
      currAcc: "0.0%",
      latency: "27.95 ms",
      highlight: false
    }
  ];

  return (
    <section id="benchmarks" className="py-20 bg-zinc-950 border-b border-zinc-900">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Ablation Suite
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium text-zinc-100 tracking-tight mb-3">
            Empirical Benchmark Findings
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Controlled evaluation on the SynTemp-50 benchmark across four architectural configurations.
          </p>
        </div>

        {/* Minimal Table */}
        <div className="overflow-x-auto bg-zinc-900/60 border border-zinc-800 rounded-sm">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-950 text-zinc-400 uppercase border-b border-zinc-800 text-[11px]">
              <tr>
                <th className="py-3 px-5">System Architecture</th>
                <th className="py-3 px-3 text-center">Recall@1</th>
                <th className="py-3 px-3 text-center">Recall@5</th>
                <th className="py-3 px-3 text-center">MRR</th>
                <th className="py-3 px-3 text-center">Hist Acc</th>
                <th className="py-3 px-3 text-center">Curr Acc</th>
                <th className="py-3 px-5 text-right">Latency (p50)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {benchmarks.map((row, idx) => (
                <tr
                  key={idx}
                  className={row.highlight ? 'bg-zinc-800/50 text-zinc-100 font-medium' : 'hover:bg-zinc-900/40'}
                >
                  <td className="py-3 px-5 font-sans">
                    <div className="text-xs text-zinc-100 font-medium">{row.system}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{row.config}</div>
                  </td>
                  <td className="py-3 px-3 text-center text-zinc-100 font-bold">{row.recall1}</td>
                  <td className="py-3 px-3 text-center">{row.recall5}</td>
                  <td className="py-3 px-3 text-center">{row.mrr}</td>
                  <td className="py-3 px-3 text-center">{row.histAcc}</td>
                  <td className="py-3 px-3 text-center">{row.currAcc}</td>
                  <td className="py-3 px-5 text-right text-zinc-400">{row.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Insight Box */}
        <div className="mt-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-zinc-300 leading-relaxed">
            <span className="font-medium text-zinc-100">Finding:</span> Bitemporal Hybrid retrieval yields a <strong className="text-zinc-100">+66.7% relative gain</strong> in Recall@1 over pure dense search and completely eliminates the 60% historical query failure rate.
          </div>
          <a
            href="#research"
            className="text-xs font-medium text-zinc-200 hover:text-white flex items-center gap-1 flex-shrink-0"
          >
            Empirical Paper <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
