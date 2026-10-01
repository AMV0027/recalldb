import React from 'react';
import { Github, BookOpen } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-[#faf8f5] text-[#1c1917] border-b border-[#e7e5e4]">
      {/* Top Newspaper Dateline Bar */}
      <div className="max-w-5xl mx-auto px-6 pt-3 pb-2 text-[11px] font-serif text-[#78716c] flex flex-wrap items-center justify-between border-b border-[#e7e5e4]">
        <div>VOL. I, NO. 1 &bull; COIMBATORE, INDIA</div>
        <div className="italic hidden sm:block">A Special Technical Gazette on Agent Memory Infrastructure</div>
        <div className="font-mono text-[10px] text-[#44403c]">OCTOBER 2026 &bull; RECALLDB v0.1.0</div>
      </div>

      {/* Main Newspaper Masthead */}
      <div className="max-w-5xl mx-auto px-6 py-6 text-center">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight font-normal text-[#1c1917] select-none">
          The RecallDB Dispatch
        </h1>
        <p className="font-serif italic text-xs sm:text-sm text-[#57534e] mt-1">
          A Journal of Bitemporal Memory, State Invalidation & Long-Horizon Agent Systems
        </p>
      </div>

      {/* Double Broadsheet Rule Navigation */}
      <div className="border-t-2 border-b border-[#1c1917] bg-[#faf8f5]">
        <div className="max-w-5xl mx-auto px-6 py-2 flex items-center justify-between text-xs font-serif">
          <nav className="flex flex-wrap items-center gap-6 text-[#44403c]">
            <a href="#lead" className="hover:text-[#1c1917] hover:underline underline-offset-4 transition-colors">
              Lead Article
            </a>
            <a href="#simulator" className="hover:text-[#1c1917] hover:underline underline-offset-4 transition-colors">
              Chronology Simulator
            </a>
            <a href="#failures" className="hover:text-[#1c1917] hover:underline underline-offset-4 transition-colors">
              The Four Failures
            </a>
            <a href="#benchmarks" className="hover:text-[#1c1917] hover:underline underline-offset-4 transition-colors">
              Empirical Ledger
            </a>
            <a href="#architecture" className="hover:text-[#1c1917] hover:underline underline-offset-4 transition-colors">
              Architecture
            </a>
            <a href="#sdk" className="hover:text-[#1c1917] hover:underline underline-offset-4 transition-colors">
              Python SDK
            </a>
            <a href="#papers" className="hover:text-[#1c1917] hover:underline underline-offset-4 transition-colors">
              Manuscripts
            </a>
          </nav>

          <a
            href="https://github.com/AMV0027/recalldb"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-[#1c1917] font-sans hover:underline underline-offset-4"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Source Code</span>
          </a>
        </div>
      </div>
    </header>
  );
}
