import React from 'react';
import { Database, Layers, Zap } from 'lucide-react';

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="py-20 bg-zinc-950 border-b border-zinc-900">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Storage Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium text-zinc-100 tracking-tight">
            Embedded Systems Architecture
          </h2>
          <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
            Zero cloud overhead. Zero daemon processes. RecallDB compiles into a self-contained local SQLite file with native vector BLOBs and inverted indices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: SQLite WAL Engine */}
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm">
            <div className="w-8 h-8 rounded-sm bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center mb-4">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-base font-medium text-zinc-100 mb-2">SQLite WAL Storage</h3>
            <p className="text-zinc-400 text-xs leading-relaxed mb-4">
              Configured with write-ahead logging (WAL), normal sync, and 64MB cache. Enables concurrent multithreaded readers alongside atomic single-writer transactions with sub-millisecond execution.
            </p>
            <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-sm font-mono text-[11px] text-zinc-300">
              PRAGMA journal_mode = WAL;<br />
              PRAGMA synchronous = NORMAL;
            </div>
          </div>

          {/* Card 2: Bitemporal Intervals */}
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm">
            <div className="w-8 h-8 rounded-sm bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center mb-4">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-medium text-zinc-100 mb-2">Bitemporal Relational Model</h3>
            <p className="text-zinc-400 text-xs leading-relaxed mb-4">
              Tracks Event Time (<span className="font-mono text-zinc-300">t_e</span>) and Valid Interval (<span className="font-mono text-zinc-300">[t_s, t_e)</span>) alongside Transaction Time (<span className="font-mono text-zinc-300">t_r</span>). Enables immutable point-in-time state slicing without destructive mutations.
            </p>
            <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-sm font-mono text-[11px] text-zinc-300">
              as_of(t) = valid_from &le; t &lt; valid_until
            </div>
          </div>

          {/* Card 3: Dual-Channel Retrieval */}
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm">
            <div className="w-8 h-8 rounded-sm bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center mb-4">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-base font-medium text-zinc-100 mb-2">Dual-Channel Fusion</h3>
            <p className="text-zinc-400 text-xs leading-relaxed mb-4">
              SQLite FTS5 Porter tokenizer indexes alphanumeric tokens while SIMD float32 dot products compute vector cosine similarity. Blended via multi-factor rank normalization.
            </p>
            <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-sm font-mono text-[11px] text-zinc-300">
              Score = &alpha;Vector + &beta;BM25 + &gamma;Temporal
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
