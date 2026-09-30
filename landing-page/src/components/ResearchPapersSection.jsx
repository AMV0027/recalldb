import React from 'react';
import { FileText, ArrowUpRight, BookOpen } from 'lucide-react';

export default function ResearchPapersSection() {
  const papers = [
    {
      type: "COMPREHENSIVE SURVEY & TAXONOMY",
      title: "Persistent, Temporal, and Hierarchical Memory in Autonomous Agents: A Comprehensive Survey and Taxonomy",
      venue: "Preprint / IEEE Trans. on AI & Autonomous Systems Track",
      author: "Arunmozhi Varman",
      abstract: "A systematic review and taxonomy of 12 landmark agent memory systems (MemGPT/Letta, LongMemEval, Mem0, HippoRAG, Zep, A-MEM). Identifies the Four Grand Failures of Vector Memory and formalizes bitemporal relational state solutions.",
      link: "https://github.com/AMV0027/recalldb/blob/main/research/review_paper/survey_agent_memory.md"
    },
    {
      type: "EMPIRICAL RESEARCH PAPER",
      title: "RecallDB: A Local-First, Bitemporal Hybrid Engine for Long-Horizon Agent Memory and Decoupled Evaluation",
      venue: "NeurIPS / VLDB / OSDI AI Systems Track",
      author: "Arunmozhi Varman",
      abstract: "Presents the mathematical formulation, system architecture, and controlled empirical ablations on SynTemp-50. Proves a +66.7% Recall@1 improvement and 100% historical accuracy with sub-25ms local retrieval.",
      link: "https://github.com/AMV0027/recalldb/blob/main/research/empirical_paper/recalldb_empirical.md"
    }
  ];

  return (
    <section id="research" className="py-20 bg-zinc-950 border-b border-zinc-900">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Publications
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium text-zinc-100 tracking-tight">
            Scientific Research Papers
          </h2>
          <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
            RecallDB was built as a research-grade scientific instrument. All benchmark receipts and methodologies are fully reproducible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {papers.map((p, idx) => (
            <div key={idx} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase text-zinc-400 mb-2">
                  {p.type}
                </div>
                <h3 className="text-base font-medium text-zinc-100 mb-2 leading-snug">
                  {p.title}
                </h3>
                <div className="text-xs text-zinc-400 font-mono mb-4">
                  {p.author} • {p.venue}
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed mb-6">
                  {p.abstract}
                </p>
              </div>

              <a
                href={p.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-200 hover:text-white transition-colors"
              >
                <span>Read Full Paper Manuscript</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
