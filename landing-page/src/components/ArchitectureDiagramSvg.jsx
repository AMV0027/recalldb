import React from 'react';

export default function ArchitectureDiagramSvg() {
  return (
    <div className="py-4 mb-8 overflow-x-auto">
      <div className="flex items-center justify-between border-b border-[#e7e5e4] pb-2 mb-4 font-serif text-xs text-[#78716c]">
        <span>FIGURE 2 &bull; SCHEMATIC OF DUAL-CHANNEL BITEMPORAL PIPELINE</span>
        <span className="font-mono text-[11px]">Latency: &le;11.47ms &bull; Zero Daemon Overhead</span>
      </div>

      <div className="min-w-[700px] py-2">
        <svg viewBox="0 0 800 240" className="w-full h-auto font-serif select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="ink-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#1c1917" />
            </marker>
          </defs>

          {/* Background Canvas */}
          <rect width="800" height="240" fill="#f5f2eb" stroke="#e7e5e4" strokeWidth="1" />

          {/* 1. INPUT QUERY NODE */}
          <g transform="translate(30, 75)">
            <rect width="140" height="90" fill="#faf8f5" stroke="#1c1917" strokeWidth="1.5" />
            <text x="12" y="24" fill="#78716c" fontSize="9" letterSpacing="1">INPUT PACKET</text>
            <text x="12" y="44" fill="#1c1917" fontSize="12" fontWeight="600">Query String</text>
            <text x="12" y="60" fill="#57534e" fontSize="10" fontStyle="italic">"What language...?"</text>
            <rect x="12" y="68" width="116" height="14" fill="#f5f2eb" stroke="#d6d3d1" />
            <text x="16" y="79" fill="#1c1917" fontSize="9" fontFamily="monospace">as_of="2024-06-01"</text>
          </g>

          {/* Connectors from Input to Dual Channels */}
          <path d="M 170 105 L 220 55 L 250 55" fill="none" stroke="#1c1917" strokeWidth="1.2" markerEnd="url(#ink-arrow)" />
          <path d="M 170 135 L 220 185 L 250 185" fill="none" stroke="#1c1917" strokeWidth="1.2" markerEnd="url(#ink-arrow)" />

          {/* CHANNEL 1: LEXICAL FTS5 */}
          <g transform="translate(250, 20)">
            <rect width="180" height="70" fill="#faf8f5" stroke="#78716c" strokeWidth="1" />
            <rect x="0" y="0" width="180" height="18" fill="#e7e5e4" />
            <text x="10" y="13" fill="#1c1917" fontSize="9" fontWeight="600" letterSpacing="0.5">CHANNEL A: LEXICAL ENGINE</text>
            <text x="10" y="34" fill="#1c1917" fontSize="11" fontWeight="500">SQLite FTS5 BM25</text>
            <text x="10" y="48" fill="#57534e" fontSize="9">Exact tokens, UUIDs, compiler traces</text>
          </g>

          {/* CHANNEL 2: DENSE SIMD VECTORS */}
          <g transform="translate(250, 150)">
            <rect width="180" height="70" fill="#faf8f5" stroke="#78716c" strokeWidth="1" />
            <rect x="0" y="0" width="180" height="18" fill="#e7e5e4" />
            <text x="10" y="13" fill="#1c1917" fontSize="9" fontWeight="600" letterSpacing="0.5">CHANNEL B: DENSE VECTORS</text>
            <text x="10" y="34" fill="#1c1917" fontSize="11" fontWeight="500">SIMD Float32 Cosine</text>
            <text x="10" y="48" fill="#57534e" fontSize="9">Semantic paraphrase capture</text>
          </g>

          {/* Connectors from Channels to Center Gate */}
          <path d="M 430 55 L 465 55 L 485 105" fill="none" stroke="#78716c" strokeWidth="1.2" markerEnd="url(#ink-arrow)" />
          <path d="M 430 185 L 465 185 L 485 135" fill="none" stroke="#78716c" strokeWidth="1.2" markerEnd="url(#ink-arrow)" />

          {/* CENTER: BITEMPORAL GATEKEEPER */}
          <g transform="translate(485, 65)">
            <rect width="150" height="110" fill="#faf8f5" stroke="#1c1917" strokeWidth="1.5" />
            <rect x="0" y="0" width="150" height="20" fill="#1c1917" />
            <text x="10" y="14" fill="#faf8f5" fontSize="9" fontWeight="600" letterSpacing="0.5">BITEMPORAL GATEKEEPER</text>
            <text x="10" y="38" fill="#1c1917" fontSize="11" fontWeight="500">Interval Calculus</text>
            <text x="10" y="52" fill="#57534e" fontSize="9" fontFamily="monospace">valid_from &le; t &lt; until</text>
            <line x1="10" y1="60" x2="140" y2="60" stroke="#e7e5e4" strokeWidth="1" />
            <text x="10" y="74" fill="#1c1917" fontSize="10">Supersession DAG</text>
            <text x="10" y="86" fill="#78716c" fontSize="8" fontStyle="italic">Prunes Stale Distractors</text>
            <text x="10" y="100" fill="#1c1917" fontSize="8" fontFamily="monospace">Score = &alpha;V + &beta;B + &gamma;T</text>
          </g>

          {/* Connector to Output */}
          <path d="M 635 120 L 675 120" fill="none" stroke="#1c1917" strokeWidth="1.5" markerEnd="url(#ink-arrow)" />

          {/* OUTPUT: AGENT LLM */}
          <g transform="translate(680, 75)">
            <rect width="90" height="90" fill="#faf8f5" stroke="#1c1917" strokeWidth="1.5" />
            <text x="8" y="22" fill="#78716c" fontSize="8" letterSpacing="0.5">DISPATCH</text>
            <text x="8" y="40" fill="#1c1917" fontSize="11" fontWeight="600">Agent LLM</text>
            <text x="8" y="56" fill="#57534e" fontSize="8">Ollama</text>
            <text x="8" y="68" fill="#57534e" fontSize="8">OpenAI / Claude</text>
            <text x="8" y="82" fill="#1c1917" fontSize="8" fontStyle="italic">Zero Hallucination</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
