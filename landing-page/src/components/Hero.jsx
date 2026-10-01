import React, { useState } from 'react';
import { Copy, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText("pip install recalldb");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="lead" className="py-12 bg-[#faf8f5] border-b border-[#e7e5e4]">
      <div className="max-w-5xl mx-auto px-6">
        {/* Kicker / Category Dateline */}
        <div className="text-center mb-3">
          <span className="font-serif italic text-xs tracking-widest text-[#78716c] uppercase">
            Special Report &bull; Agent Systems Architecture
          </span>
        </div>

        {/* Lead Headline */}
        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-center text-[#1c1917] font-normal tracking-tight leading-[1.15] max-w-4xl mx-auto mb-4">
          Persistent, Bitemporal Memory for Autonomous AI Agents
        </h2>

        {/* Lead Deck / Subtitle */}
        <p className="font-serif italic text-base sm:text-xl text-center text-[#57534e] max-w-3xl mx-auto mb-6 leading-relaxed">
          How bifurcating valid time intervals from transaction time eliminates the 69% contradiction failure rate of traditional vector stores.
        </p>

        {/* Byline */}
        <div className="text-center text-xs font-serif text-[#78716c] pb-8 border-b border-[#e7e5e4] mb-8">
          By <span className="text-[#1c1917] font-medium">Arunmozhi Varman</span> &bull; BloomBig Studio, Coimbatore &bull; Published October 2026
        </div>

        {/* Two-Column Broadsheet Article Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-10 text-sm leading-relaxed text-[#44403c] font-serif">
          {/* Main Column */}
          <div className="md:col-span-8 space-y-4">
            <p className="drop-cap">
              Modern autonomous agents routinely hallucinate contradictory facts because conventional vector databases suffer from temporal blindness. When an agent learns in 2024 that a user writes backend code in Python, and in 2026 that the stack migrated to Rust, pure vector similarity retrieves both statements with identical mathematical confidence.
            </p>
            <p>
              RecallDB solves this fundamental failure mode through an embedded, single-file relational state engine. By pairing SQLite Write-Ahead Logging (WAL) with native SIMD vector embeddings, inverted FTS5 lexical indexing, and bitemporal interval calculus, the engine achieves deterministic point-in-time state reconstruction with sub-15ms local latency.
            </p>
          </div>

          {/* Side Editorial Column / Quick Action */}
          <div className="md:col-span-4 p-5 bg-[#f5f2eb] border border-[#e7e5e4] space-y-4">
            <div className="text-xs font-serif uppercase tracking-wider font-semibold text-[#1c1917] border-b border-[#d6d3d1] pb-1.5">
              Installation & Dispatch
            </div>

            <p className="text-xs text-[#57534e]">
              A zero-daemon Python package that connects directly to Ollama, OpenAI, and Anthropic in a single line of code:
            </p>

            {/* Clean Tidy Command Bar */}
            <div className="flex items-center justify-between p-2.5 bg-[#faf8f5] border border-[#d6d3d1] text-xs font-mono">
              <span className="text-[#1c1917]">$ pip install recalldb</span>
              <button
                onClick={copyCommand}
                className="text-[#78716c] hover:text-[#1c1917] transition-colors p-1"
                title="Copy install command"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-stone-900" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="pt-1">
              <a
                href="#simulator"
                className="inline-flex items-center gap-1.5 text-xs font-serif font-medium text-[#1c1917] hover:underline underline-offset-4"
              >
                <span>Read the Interactive Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Tidy Broadsheet Statistics Ledger (No heavy boxes) */}
        <div className="border-t-2 border-b border-[#1c1917] py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#e7e5e4] text-center">
            <div className="py-2 px-4">
              <div className="font-serif text-3xl text-[#1c1917] font-normal">1.0000</div>
              <div className="font-serif text-xs text-[#78716c] mt-0.5">Recall@1 Accuracy</div>
            </div>
            <div className="py-2 px-4">
              <div className="font-serif text-3xl text-[#1c1917] font-normal">0.0%</div>
              <div className="font-serif text-xs text-[#78716c] mt-0.5">Temporal Invalidation Errors</div>
            </div>
            <div className="py-2 px-4">
              <div className="font-serif text-3xl text-[#1c1917] font-normal">11.47 ms</div>
              <div className="font-serif text-xs text-[#78716c] mt-0.5">p50 Retrieval Latency</div>
            </div>
            <div className="py-2 px-4">
              <div className="font-serif text-3xl text-[#1c1917] font-normal">10.7x</div>
              <div className="font-serif text-xs text-[#78716c] mt-0.5">Token Reduction Efficiency</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
