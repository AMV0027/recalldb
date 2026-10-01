import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import BenchmarkVisualChart from './BenchmarkVisualChart';

export default function BenchmarkLeaderboard() {
  const benchmarks = [
    {
      system: "RecallDB Bitemporal Hybrid",
      config: "Dense (SIMD) + FTS5 BM25 + Bitemporal Interval Calculus",
      recall1: "1.0000",
      recall5: "1.0000",
      mrr: "1.0000",
      histAcc: "100.0%",
      currAcc: "100.0%",
      etemp: "0.0%",
      latency: "11.47 ms",
      highlight: true
    },
    {
      system: "Dense Vector Baseline (RAG)",
      config: "Standard Cosine Similarity Baseline (k=5)",
      recall1: "0.3080",
      recall5: "0.6920",
      mrr: "0.4580",
      histAcc: "25.0%",
      currAcc: "42.9%",
      etemp: "69.2%",
      latency: "14.20 ms",
      highlight: false
    },
    {
      system: "Hybrid Without Intervals",
      config: "Dense + BM25 Fusion (Unbounded, No Time Windows)",
      recall1: "0.2310",
      recall5: "0.6150",
      mrr: "0.3890",
      histAcc: "12.5%",
      currAcc: "33.3%",
      etemp: "76.9%",
      latency: "18.60 ms",
      highlight: false
    },
    {
      system: "FTS5 BM25 Lexical Baseline",
      config: "SQLite FTS5 Porter Tokenizer (Zero Vector Embeddings)",
      recall1: "0.0770",
      recall5: "0.3850",
      mrr: "0.1820",
      histAcc: "0.0%",
      currAcc: "14.3%",
      etemp: "85.7%",
      latency: "19.80 ms",
      highlight: false
    }
  ];

  return (
    <section id="benchmarks" className="py-14 bg-[#faf8f5] border-b border-[#e7e5e4]">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="border-b border-[#1c1917] pb-3 mb-8">
          <div className="text-[11px] font-serif uppercase tracking-widest text-[#78716c] mb-1">
            Section IV &bull; The Empirical Ledger
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#1c1917]">
            SynTemp-100 Benchmark Findings
          </h3>
          <p className="font-serif text-xs sm:text-sm text-[#57534e] mt-1 leading-relaxed">
            Controlled empirical ablations measuring retrieval fidelity and temporal invalidation failure under rapid memory churn.
          </p>
        </div>

        {/* Visual Benchmark Charts */}
        <BenchmarkVisualChart />

        {/* Financial Broadsheet Table */}
        <div className="overflow-x-auto pt-4">
          <table className="w-full text-left font-serif text-xs">
            <thead className="border-t-2 border-b border-[#1c1917] text-[#1c1917] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 pr-4">System Architecture</th>
                <th className="py-3 px-3 text-center">Recall@1</th>
                <th className="py-3 px-3 text-center">Recall@5</th>
                <th className="py-3 px-3 text-center">MRR</th>
                <th className="py-3 px-3 text-center">Hist Acc</th>
                <th className="py-3 px-3 text-center">Curr Acc</th>
                <th className="py-3 px-3 text-center">E_temp</th>
                <th className="py-3 pl-4 text-right">Latency (p50)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e5e4] text-[#44403c]">
              {benchmarks.map((row, idx) => (
                <tr
                  key={idx}
                  className={row.highlight ? 'bg-[#f5f2eb] font-medium text-[#1c1917]' : 'hover:bg-[#fbf9f6]'}
                >
                  <td className="py-3 pr-4">
                    <div className="font-serif text-xs text-[#1c1917]">{row.system}</div>
                    <div className="font-mono text-[10px] text-[#78716c]">{row.config}</div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-semibold text-[#1c1917]">{row.recall1}</td>
                  <td className="py-3 px-3 text-center font-mono">{row.recall5}</td>
                  <td className="py-3 px-3 text-center font-mono">{row.mrr}</td>
                  <td className="py-3 px-3 text-center font-mono">{row.histAcc}</td>
                  <td className="py-3 px-3 text-center font-mono">{row.currAcc}</td>
                  <td className={`py-3 px-3 text-center font-mono ${row.highlight ? 'font-semibold text-[#1c1917]' : 'text-[#991b1b]'}`}>
                    {row.etemp}
                  </td>
                  <td className="py-3 pl-4 text-right font-mono text-[#78716c]">{row.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Editorial Footnote */}
        <div className="mt-6 pt-3 border-t border-[#1c1917] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-serif text-[#57534e]">
          <div>
            <span className="font-medium text-[#1c1917]">Finding:</span> Bitemporal Hybrid retrieval yields a +224.7% relative gain in Recall@1 over pure dense search and drops Temporal Invalidation Failure (E_temp) from 69.2% to 0.0%.
          </div>
          <a
            href="#papers"
            className="inline-flex items-center gap-1 text-[#1c1917] hover:underline underline-offset-4 flex-shrink-0 font-medium"
          >
            <span>Consult Empirical Paper</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
