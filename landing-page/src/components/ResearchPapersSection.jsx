import React from 'react';
import { ArrowUpRight, FileText, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const papers = [
  {
    label: "Empirical Systems Paper",
    title: "RecallDB: A Local-First, Bitemporal Hybrid Engine for Long-Horizon Agent Memory and Decoupled Evaluation",
    venue: "NeurIPS / VLDB / OSDI AI Systems Track (2026)",
    author: "Arunmozhi Varman K",
    abstract: "Formalizes the bitemporal state-machine algebra, embedded SQLite WAL engine architecture, and empirical evaluation on the SynTemp-100 benchmark. Demonstrates +224.7% relative gain in Recall@1 and drops temporal invalidation failure from 69.2% to 0.0% with sub-15ms local retrieval.",
    metrics: "1.0000 Recall@1 · 0.0% E_temp · 11.47ms p50",
    doi: "10.5281/zenodo.23107756",
    doiUrl: "https://doi.org/10.5281/zenodo.23107756",
    pdfUrl: "/papers/recalldb_empirical.pdf",
    mdUrl: "https://github.com/AMV0027/recalldb/blob/main/research/empirical_paper/recalldb_empirical.md",
    pages: "12 Pages · Research PDF"
  },
  {
    label: "Systematic Survey & Taxonomy",
    title: "Persistent, Temporal, and Hierarchical Memory in Autonomous Agents: A Comprehensive Survey and Taxonomy",
    venue: "AI & Autonomous Systems Research Track (2026)",
    author: "Arunmozhi Varman K",
    abstract: "A rigorous survey of 12 landmark agent memory systems (MemGPT, LongMemEval, Mem0, HippoRAG, Zep, A-MEM). Uncovers the Four Grand Failures of Vector Memory and establishes a 5-layer taxonomic framework for bitemporal relational state machines.",
    metrics: "12 Systems Evaluated · 4 Failure Modes · Bitemporal DAG",
    pdfUrl: "/papers/survey_agent_memory.pdf",
    mdUrl: "https://github.com/AMV0027/recalldb/blob/main/research/review_paper/survey_agent_memory.md",
    pages: "20 Pages · Research PDF"
  }
];

export default function ResearchPapersSection() {
  return (
    <section id="papers" className="bg-white border-t border-[#e5e7eb]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#166534]"></span>
              <span className="text-[12px] font-medium tracking-wide text-[#166534] uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
                Academic Literature & Preprints
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
              RecallDB was engineered as a reproducible scientific instrument. Full manuscripts are published as publication-grade research PDFs with open-source benchmark scripts and ablation data.
            </motion.p>
          </div>
        </div>

        {/* Paper Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 border-t border-[#e5e7eb] pt-10">
          {papers.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              className="flex flex-col justify-between space-y-4 border border-[#e5e7eb] p-6 rounded-xl hover:border-[#166534]/50 transition-colors shadow-sm bg-white"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] uppercase tracking-widest text-[#166534] font-medium font-mono">
                    {p.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {p.doi && (
                      <a
                        href={p.doiUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-mono text-[#166534] bg-[#f0fdf4] px-2 py-0.5 rounded border border-[#bbf7d0] hover:bg-[#dcfce7] transition-colors"
                      >
                        DOI: {p.doi}
                      </a>
                    )}
                    <span className="text-[11px] font-mono text-[#6b7280] bg-[#f9fafb] px-2 py-0.5 rounded border border-[#f3f4f6]">
                      {p.pages}
                    </span>
                  </div>
                </div>

                <h3
                  className="text-[17px] text-[#111] leading-snug font-medium"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {p.title}
                </h3>

                <div className="text-[12px] text-[#6b7280]" style={{ fontFamily: 'var(--font-sans)' }}>
                  {p.author} · <span className="italic">{p.venue}</span>
                </div>

                <p className="text-[13px] text-[#4b5563] leading-relaxed" style={{ fontFamily: 'var(--font-sans)' }}>
                  {p.abstract}
                </p>

                <div className="font-mono text-[11px] text-[#166534] pt-1 font-medium">
                  {p.metrics}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#f3f4f6] flex flex-wrap items-center justify-between gap-3">
                <a
                  href={p.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] text-white bg-[#166534] hover:bg-[#14532d] px-4 py-2 rounded font-medium transition-colors shadow-sm"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Read Research PDF ↗</span>
                </a>

                <div className="flex items-center gap-4 text-[12px]">
                  <a
                    href={p.pdfUrl}
                    download
                    className="inline-flex items-center gap-1 text-[#4b5563] hover:text-[#166534] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                  <a
                    href={p.mdUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#6b7280] hover:text-[#111] transition-colors"
                  >
                    Markdown
                  </a>
                </div>
              </div>
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
