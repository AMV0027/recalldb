import React from 'react';
import { motion } from 'framer-motion';

const problems = [
  {
    num: "1.",
    title: "Temporal Blindness & Contradiction",
    description: "When an agent learns 'I use Python' in 2024 and 'I use Rust' in 2026, pure vector similarity retrieves both simultaneously with overlapping confidence — inducing over 50% past-state hallucination (Zhou et al., Tsinghua 2026)."
  },
  {
    num: "2.",
    title: "Exact Alphanumeric Distortion",
    description: "Dense embeddings blur precise tokens — UUIDs, API endpoints, Git SHAs — into fuzzy latent clusters. Pure BM25 fails on paraphrase. Only dual-channel indexing bridges exact and semantic recall."
  },
  {
    num: "3.",
    title: "Destructive In-Place Overwriting",
    description: "Naive LLM memory frameworks overwrite records in-place, permanently deleting past state, destroying provenance, and making retrospective auditability impossible."
  },
  {
    num: "4.",
    title: "Context Poisoning in Small Models",
    description: "Small language models (<8B parameters) suffer catastrophic attention collapse when conflicting, superseded memories are injected into context. Decoupled evaluation is required."
  }
];

export default function ProblemSection() {
  return (
    <section id="failures" className="bg-white border-t border-[#e4e4e4]">
      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* Section Header — Lasimo two-column style */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
          <div className="md:col-span-5">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="text-[38px] sm:text-[48px] font-normal leading-tight tracking-tight text-[#111]"
            >
              Why RecallDB?
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
              Persistent agent memory is not an approximate nearest-neighbor search problem. It is a bitemporal state-machine problem. Conventional vector stores have four fundamental failure modes.
            </motion.p>
            <p className="text-[13px] text-[#888] mt-3 font-normal">
              Precise memory. Correct context. Always.
            </p>
          </div>
        </div>

        {/* 4 numbered columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t border-[#e4e4e4]">
          {problems.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="pt-8 pr-8 last:pr-0 space-y-3"
            >
              <div className="text-[32px] font-normal text-[#ccc] leading-none">{p.num}</div>
              <h4 className="text-[14px] font-medium text-[#111] leading-snug pt-1">{p.title}</h4>
              <p className="text-[13px] text-[#666] leading-relaxed">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
