import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function ResearchPapersSection() {
  const papers = [
    {
      badge: "Empirical Systems Paper",
      title: "RecallDB: A Local-First, Bitemporal Hybrid Engine for Long-Horizon Agent Memory and Decoupled Evaluation",
      venue: "NeurIPS / VLDB / OSDI AI Systems Track (2026)",
      author: "Arunmozhi Varman",
      abstract: "Formalizes the bitemporal state-machine algebra, embedded SQLite WAL engine architecture, and empirical evaluation on the SynTemp-100 benchmark. Demonstrates +224.7% relative gain in Recall@1 and drops temporal invalidation failure (E_temp) from 69.2% to 0.0% with sub-15ms local retrieval.",
      metrics: "1.0000 Recall@1 &bull; 0.0% E_temp &bull; 11.47ms p50",
      link: "https://github.com/AMV0027/recalldb/blob/main/research/empirical_paper/recalldb_empirical.md"
    },
    {
      badge: "Systematic Survey & Taxonomy",
      title: "Persistent, Temporal, and Hierarchical Memory in Autonomous Agents: A Comprehensive Survey and Taxonomy",
      venue: "IEEE Trans. on AI & Autonomous Systems Track (2026)",
      author: "Arunmozhi Varman",
      abstract: "A rigorous survey of 12 landmark agent memory systems (MemGPT/Letta, LongMemEval, Mem0, HippoRAG, Zep, A-MEM). Uncovers the Four Grand Failures of Vector Memory and establishes a 5-layer taxonomic framework for bitemporal relational state machines.",
      metrics: "12 Systems Evaluated &bull; 4 Failure Modes &bull; Bitemporal DAG",
      link: "https://github.com/AMV0027/recalldb/blob/main/research/review_paper/survey_agent_memory.md"
    }
  ];

  return (
    <section id="papers" className="py-14 bg-[#faf8f5] border-b border-[#e7e5e4]">
      <div className="max-w-5xl mx-auto px-6 font-serif">
        {/* Section Header */}
        <div className="border-b border-[#1c1917] pb-3 mb-8">
          <div className="text-[11px] uppercase tracking-widest text-[#78716c] mb-1">
            Section VII &bull; Academic Literature
          </div>
          <h3 className="text-2xl sm:text-3xl font-normal text-[#1c1917]">
            Scientific Research Manuscripts
          </h3>
          <p className="text-xs sm:text-sm text-[#57534e] mt-1 leading-relaxed">
            RecallDB was engineered as a reproducible scientific instrument. Benchmark datasets, ablation scripts, and manuscript drafts are fully documented.
          </p>
        </div>

        {/* Papers in Two Broadsheet Columns (No Heavy Containers) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pb-10">
          {papers.map((p, idx) => (
            <div key={idx} className="space-y-3 flex flex-col justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-[#78716c] border-b border-[#e7e5e4] pb-1 mb-2">
                  {p.badge}
                </div>

                <h4 className="text-base font-semibold text-[#1c1917] leading-snug">
                  {p.title}
                </h4>

                <div className="text-xs text-[#78716c] mt-1 italic">
                  {p.author} &bull; {p.venue}
                </div>

                <p className="text-xs text-[#57534e] leading-relaxed mt-3">
                  {p.abstract}
                </p>
              </div>

              <div className="pt-3 border-t border-[#e7e5e4]">
                <div className="text-[11px] font-mono text-[#78716c] mb-2">
                  Verified: {p.metrics}
                </div>

                <a
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1c1917] hover:underline underline-offset-4 uppercase tracking-wider"
                >
                  <span>Read Full Paper Manuscript</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Academic Citations Reference Bar */}
        <div className="pt-4 border-t-2 border-[#1c1917] text-xs text-[#57534e]">
          <div className="uppercase text-[11px] tracking-wider text-[#78716c] mb-2 font-semibold">
            Comparative Literature Anchors (2026):
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong className="text-[#1c1917]">Zhou et al. (Tsinghua / OpenDataBox 2026):</strong> Proved that dense vector RAG induces &gt;50% past-state hallucination in autonomous agents under memory evolution.
            </p>
            <p>
              <strong className="text-[#1c1917]">Oracle Agent Memory (Alake et al. 2026):</strong> Demonstrated that structured decoupled memory systems achieve 10.7x token overhead reduction vs. prompt stuffing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
