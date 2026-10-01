import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const papers = [
  {
    label: "Empirical Systems Paper",
    title: "RecallDB: A Local-First, Bitemporal Hybrid Engine for Long-Horizon Agent Memory and Decoupled Evaluation",
    venue: "NeurIPS / VLDB / OSDI AI Systems Track (2026)",
    author: "Arunmozhi Varman",
    abstract: "Formalizes the bitemporal state-machine algebra, embedded SQLite WAL engine architecture, and empirical evaluation on the SynTemp-100 benchmark. Demonstrates +224.7% relative gain in Recall@1 and drops temporal invalidation failure from 69.2% to 0.0% with sub-15ms local retrieval.",
    metrics: "1.0000 Recall@1 · 0.0% E_temp · 11.47ms p50",
    link: "https://github.com/AMV0027/recalldb/blob/main/research/empirical_paper/recalldb_empirical.md"
  },
  {
    label: "Systematic Survey & Taxonomy",
    title: "Persistent, Temporal, and Hierarchical Memory in Autonomous Agents: A Comprehensive Survey and Taxonomy",
    venue: "IEEE Trans. on AI & Autonomous Systems Track (2026)",
    author: "Arunmozhi Varman",
    abstract: "A rigorous survey of 12 landmark agent memory systems (MemGPT, LongMemEval, Mem0, HippoRAG, Zep, A-MEM). Uncovers the Four Grand Failures of Vector Memory and establishes a 5-layer taxonomic framework for bitemporal relational state machines.",
    metrics: "12 Systems Evaluated · 4 Failure Modes · Bitemporal DAG",
    link: "https://github.com/AMV0027/recalldb/blob/main/research/review_paper/survey_agent_memory.md"
  }
];

export default function ResearchPapersSection() {
  return (
    <section id="papers" className="bg-white border-t border-[#e5e7eb]">
      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#166534]"></span>
              <span className="text-[12px] font-medium tracking-wide text-[#166534] uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
                Academic Literature
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
              Research <span className="text-[#166534]">Papers.</span>
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
              RecallDB was engineered as a reproducible scientific instrument. Benchmark datasets, ablation scripts, and manuscript drafts are fully documented and open-source.
            </motion.p>
          </div>
        </div>

        {/* Paper Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-[#e5e7eb]">
          {papers.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              className="pt-10 pr-10 last:pr-0 space-y-4"
            >
              <div className="text-[11px] uppercase tracking-widest text-[#166534] font-medium font-mono">
                {p.label}
              </div>
              <h4
                className="text-[16px] text-[#111] leading-snug"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                {p.title}
              </h4>
              <div className="text-[12px] text-[#6b7280]" style={{ fontFamily: 'var(--font-sans)' }}>
                {p.author} · {p.venue}
              </div>
              <p className="text-[13px] text-[#4b5563] leading-relaxed" style={{ fontFamily: 'var(--font-sans)' }}>
                {p.abstract}
              </p>
              <div className="font-mono text-[11px] text-[#166534] pt-1">{p.metrics}</div>
              <a
                href={p.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[13px] text-[#166534] font-medium border-b border-[#166534] pb-0.5 hover:text-[#14532d] hover:border-[#14532d] transition-colors"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Read Paper <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </motion.div>
          ))}
        </div>

        {/* Citation anchors */}
        <div className="mt-14 pt-6 border-t border-[#e5e7eb]">
          <div className="text-[11px] uppercase tracking-widest text-[#6b7280] mb-5 font-mono">
            Comparative Literature (2026)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[13px] text-[#4b5563] leading-relaxed" style={{ fontFamily: 'var(--font-sans)' }}>
            <p>
              <span className="text-[#111827] font-medium">Zhou et al. (Tsinghua 2026):</span> Dense vector RAG induces more than 50% past-state hallucination in autonomous agents under memory evolution.
            </p>
            <p>
              <span className="text-[#111827] font-medium">Oracle Agent Memory (Alake et al. 2026):</span> Structured decoupled memory systems achieve 10.7x token overhead reduction versus prompt stuffing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
