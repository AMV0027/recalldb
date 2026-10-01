import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import BenchmarkVisualChart from './BenchmarkVisualChart';

const benchmarks = [
  {
    system: "RecallDB Bitemporal Hybrid",
    config: "Dense (SIMD) + FTS5 BM25 + Bitemporal Interval Calculus",
    recall1: "1.0000", recall5: "1.0000", mrr: "1.0000",
    histAcc: "100.0%", currAcc: "100.0%", etemp: "0.0%",
    latency: "11.47 ms", highlight: true
  },
  {
    system: "Dense Vector Baseline (RAG)",
    config: "Standard Cosine Similarity (k=5)",
    recall1: "0.3080", recall5: "0.6920", mrr: "0.4580",
    histAcc: "25.0%", currAcc: "42.9%", etemp: "69.2%",
    latency: "14.20 ms", highlight: false
  },
  {
    system: "Hybrid Without Intervals",
    config: "Dense + BM25 Fusion (No Time Windows)",
    recall1: "0.2310", recall5: "0.6150", mrr: "0.3890",
    histAcc: "12.5%", currAcc: "33.3%", etemp: "76.9%",
    latency: "18.60 ms", highlight: false
  },
  {
    system: "FTS5 BM25 Lexical Baseline",
    config: "SQLite FTS5 Porter Tokenizer (Zero Vectors)",
    recall1: "0.0770", recall5: "0.3850", mrr: "0.1820",
    histAcc: "0.0%", currAcc: "14.3%", etemp: "85.7%",
    latency: "19.80 ms", highlight: false
  }
];

export default function BenchmarkLeaderboard() {
  return (
    <section id="benchmarks" className="bg-white border-t border-[#e4e4e4]">
      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
          <div className="md:col-span-5">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="text-[38px] sm:text-[48px] font-normal leading-tight tracking-tight text-[#111]"
            >
              SynTemp-100 Benchmark Results.
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
              Controlled empirical ablations measuring retrieval fidelity and temporal invalidation failure under rapid memory churn. RecallDB achieves perfect Recall@1 with zero temporal errors.
            </motion.p>
          </div>
        </div>

        {/* Visual Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <BenchmarkVisualChart />
        </motion.div>

        {/* Data Table */}
        <div className="overflow-x-auto border-t border-[#e4e4e4]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#e4e4e4] text-[11px] uppercase tracking-wider text-[#888]">
                <th className="py-4 pr-6 font-normal">System</th>
                <th className="py-4 px-3 text-center font-normal">Recall@1</th>
                <th className="py-4 px-3 text-center font-normal">Recall@5</th>
                <th className="py-4 px-3 text-center font-normal">MRR</th>
                <th className="py-4 px-3 text-center font-normal">Hist Acc</th>
                <th className="py-4 px-3 text-center font-normal">Curr Acc</th>
                <th className="py-4 px-3 text-center font-normal">E_temp</th>
                <th className="py-4 pl-4 text-right font-normal">Latency</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-[#f0f0f0] ${row.highlight ? 'bg-[#fafafa]' : 'hover:bg-[#fafafa]'} transition-colors`}
                >
                  <td className="py-4 pr-6">
                    <div className={`text-[13px] ${row.highlight ? 'text-[#111] font-medium' : 'text-[#333]'}`}>{row.system}</div>
                    <div className="font-mono text-[11px] text-[#aaa] mt-0.5">{row.config}</div>
                  </td>
                  <td className={`py-4 px-3 text-center font-mono text-[13px] ${row.highlight ? 'text-[#111] font-medium' : 'text-[#555]'}`}>{row.recall1}</td>
                  <td className="py-4 px-3 text-center font-mono text-[#555]">{row.recall5}</td>
                  <td className="py-4 px-3 text-center font-mono text-[#555]">{row.mrr}</td>
                  <td className="py-4 px-3 text-center font-mono text-[#555]">{row.histAcc}</td>
                  <td className="py-4 px-3 text-center font-mono text-[#555]">{row.currAcc}</td>
                  <td className={`py-4 px-3 text-center font-mono ${row.highlight ? 'text-[#111] font-medium' : 'text-[#c0392b]'}`}>{row.etemp}</td>
                  <td className="py-4 pl-4 text-right font-mono text-[#888]">{row.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Finding footnote */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[13px] text-[#666]">
          <p>
            <span className="text-[#111] font-medium">Finding:</span> Bitemporal Hybrid yields +224.7% relative gain in Recall@1 over pure dense search and drops E_temp from 69.2% to 0.0%.
          </p>
          <a href="#papers" className="flex items-center gap-1 text-[#111] border-b border-[#111] pb-0.5 flex-shrink-0 hover:text-[#555] hover:border-[#555] transition-colors">
            Read the Paper <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
