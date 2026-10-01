import React from 'react';

export default function ProblemSection() {
  const problems = [
    {
      num: "I",
      title: "Temporal Blindness & Contradiction",
      description: "When an agent learns 'I use Python' in 2024 and 'I use Rust' in 2026, pure vector similarity retrieves both simultaneously with overlapping confidence. Zhou et al. (Tsinghua 2026) verified this induces over 50% past-state hallucination."
    },
    {
      num: "II",
      title: "Exact Alphanumeric Distortion",
      description: "Dense embeddings compress precise tokens—UUIDs, API endpoints, Git commit SHAs, and compiler traces—into blurred latent clusters. Pure BM25 fails on paraphrase. Only dual-channel indexing bridges exact and semantic recall."
    },
    {
      num: "III",
      title: "Destructive In-Place Overwriting",
      description: "Naive LLM memory frameworks use unstructured prompts to overwrite records in-place, permanently deleting past state, destroying provenance, and making retrospective auditability impossible."
    },
    {
      num: "IV",
      title: "Context Poisoning in Small Models",
      description: "Small language models (<8B parameters) suffer catastrophic attention collapse when conflicting, superseded memories are injected into context. Decoupled evaluation is required to isolate memory from reader hallucination."
    }
  ];

  return (
    <section id="failures" className="py-14 bg-[#faf8f5] border-b border-[#e7e5e4]">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="border-b border-[#1c1917] pb-3 mb-8">
          <div className="text-[11px] font-serif uppercase tracking-widest text-[#78716c] mb-1">
            Section III &bull; Investigative Critique
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#1c1917]">
            The Four Pathologies of Pure Vector Memory
          </h3>
          <p className="font-serif text-xs sm:text-sm text-[#57534e] mt-1 leading-relaxed">
            Persistent agent memory is not an approximate nearest-neighbor search problem. It is a bitemporal state-machine problem.
          </p>
        </div>

        {/* 4-Column Broadsheet Columns (No Containers, Clean Hairline Dividers) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-[#e7e5e4] font-serif">
          {problems.map((p, idx) => (
            <div key={idx} className="md:px-6 first:pl-0 last:pr-0 space-y-2">
              <div className="text-2xl font-serif font-light text-[#78716c] border-b border-[#e7e5e4] pb-1">
                {p.num}.
              </div>
              <h4 className="text-sm font-medium text-[#1c1917] leading-snug pt-1">
                {p.title}
              </h4>
              <p className="text-xs text-[#57534e] leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
