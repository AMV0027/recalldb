import React from 'react';
import ArchitectureDiagramSvg from './ArchitectureDiagramSvg';

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="py-14 bg-[#faf8f5] border-b border-[#e7e5e4]">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="border-b border-[#1c1917] pb-3 mb-8">
          <div className="text-[11px] font-serif uppercase tracking-widest text-[#78716c] mb-1">
            Section V &bull; Systems Architecture
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#1c1917]">
            Embedded Storage Subsystem
          </h3>
          <p className="font-serif text-xs sm:text-sm text-[#57534e] mt-1 leading-relaxed">
            Zero cloud overhead. Zero daemon processes. RecallDB compiles into a self-contained local SQLite file with native vector BLOBs and inverted indices.
          </p>
        </div>

        {/* Schematic Engraving */}
        <ArchitectureDiagramSvg />

        {/* 3 Editorial Columns (No Heavy Containers) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 font-serif">
          {/* Pillar 1 */}
          <div className="border-t-2 border-[#1c1917] pt-3 space-y-2">
            <h4 className="text-sm font-semibold text-[#1c1917]">
              1. SQLite WAL Engine
            </h4>
            <p className="text-xs text-[#57534e] leading-relaxed">
              Configured with write-ahead logging (WAL), normal sync, and a 64MB memory cache. Delivers concurrent multithreaded readers alongside atomic single-writer ACID transactions under 15ms.
            </p>
            <div className="p-2.5 bg-[#f5f2eb] border border-[#e7e5e4] font-mono text-[10px] text-[#1c1917] mt-3">
              PRAGMA journal_mode = WAL;<br />
              PRAGMA synchronous = NORMAL;<br />
              PRAGMA cache_size = -64000;
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="border-t-2 border-[#1c1917] pt-3 space-y-2">
            <h4 className="text-sm font-semibold text-[#1c1917]">
              2. Bitemporal Relational Model
            </h4>
            <p className="text-xs text-[#57534e] leading-relaxed">
              Explicitly bifurcates Valid Time intervals <span className="font-mono text-[#1c1917]">[t_s, t_e)</span> from Transaction Time <span className="font-mono text-[#1c1917]">t_r</span>. Immutable point-in-time state slicing without destructive in-place mutations.
            </p>
            <div className="p-2.5 bg-[#f5f2eb] border border-[#e7e5e4] font-mono text-[10px] text-[#1c1917] mt-3">
              as_of(t) = valid_from &le; t &lt; valid_until<br />
              Lineage DAG: ACTIVE &rarr; SUPERSEDED
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="border-t-2 border-[#1c1917] pt-3 space-y-2">
            <h4 className="text-sm font-semibold text-[#1c1917]">
              3. Dual-Channel Rank Fusion
            </h4>
            <p className="text-xs text-[#57534e] leading-relaxed">
              FTS5 BM25 Porter tokenizer indexes alphanumeric exact tokens while SIMD float32 cosine kernels score semantic vectors. Blended via temporal interval gating.
            </p>
            <div className="p-2.5 bg-[#f5f2eb] border border-[#e7e5e4] font-mono text-[10px] text-[#1c1917] mt-3">
              Score = &alpha;Vector + &beta;BM25 + &gamma;Temporal<br />
              Gated by: isValidAt(query_time)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
