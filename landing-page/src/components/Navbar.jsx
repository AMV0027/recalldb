import React from 'react';
import { Github } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-white border-b border-[#e4e4e4] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href="#lead" className="flex items-center gap-2 text-[#111]">
          <span className="font-mono text-[11px] tracking-widest uppercase text-[#666] select-none">[ DB ]</span>
          <span className="text-[14px] tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            RecallDB
          </span>
        </a>

        {/* Nav Links */}
        <nav className="hidden sm:flex items-center gap-8 text-[13px] text-[#555]" style={{ fontFamily: 'var(--font-sans)' }}>
          <a href="#simulator" className="hover:text-[#111] transition-colors">Simulator</a>
          <a href="#failures" className="hover:text-[#111] transition-colors">Why RecallDB</a>
          <a href="#benchmarks" className="hover:text-[#111] transition-colors">Benchmarks</a>
          <a href="#architecture" className="hover:text-[#111] transition-colors">Architecture</a>
          <a href="#sdk" className="hover:text-[#111] transition-colors">SDK</a>
        </nav>

        {/* CTA */}
        <a
          href="https://github.com/AMV0027/recalldb"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-[13px] px-4 py-1.5 border border-[#111] text-[#111] hover:bg-[#111] hover:text-white transition-colors duration-200"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <Github className="w-3.5 h-3.5" />
          <span>GitHub ↗</span>
        </a>
      </div>
    </header>
  );
}
