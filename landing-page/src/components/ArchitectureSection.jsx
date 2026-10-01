import React from 'react';
import { motion } from 'framer-motion';
import ArchitectureDiagramSvg from './ArchitectureDiagramSvg';

const pillars = [
  {
    num: "1.",
    title: "SQLite WAL Engine",
    body: "Write-ahead logging with a 64MB memory cache delivers concurrent multithreaded readers alongside atomic single-writer ACID transactions under 15ms.",
    code: `PRAGMA journal_mode = WAL;\nPRAGMA synchronous = NORMAL;\nPRAGMA cache_size = -64000;`
  },
  {
    num: "2.",
    title: "Bitemporal Relational Model",
    body: "Explicitly bifurcates Valid Time intervals [t_s, t_e) from Transaction Time t_r. Immutable point-in-time state slicing without destructive in-place mutations.",
    code: `as_of(t) = valid_from ≤ t < valid_until\nLineage DAG: ACTIVE → SUPERSEDED`
  },
  {
    num: "3.",
    title: "Dual-Channel Rank Fusion",
    body: "FTS5 BM25 Porter tokenizer indexes alphanumeric exact tokens while SIMD float32 cosine kernels score semantic vectors. Blended via temporal interval gating.",
    code: `Score = αVector + βBM25 + γTemporal\nGated by: isValidAt(query_time)`
  }
];

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="bg-white border-t border-[#e4e4e4]">
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
              Embedded Storage Architecture.
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
              Zero cloud overhead. Zero daemon processes. RecallDB compiles into a self-contained local SQLite file with native vector BLOBs and inverted indices. A single file is all you need.
            </motion.p>
          </div>
        </div>

        {/* SVG Diagram */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <ArchitectureDiagramSvg />
        </motion.div>

        {/* 3 Pillar Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-[#e4e4e4]">
          {pillars.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              className="pt-8 pr-8 last:pr-0 space-y-3"
            >
              <div className="text-[28px] font-normal text-[#ccc] leading-none">{p.num}</div>
              <h4 className="text-[14px] font-medium text-[#111] leading-snug">{p.title}</h4>
              <p className="text-[13px] text-[#666] leading-relaxed">{p.body}</p>
              <div className="font-mono text-[11px] text-[#444] bg-[#f8f8f8] p-3 leading-relaxed whitespace-pre">
                {p.code}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
