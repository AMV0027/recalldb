import React from 'react';
import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#e4e4e4] py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[11px] tracking-widest uppercase text-[#aaa]">[ DB ]</span>
              <span className="text-[14px]" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: '#111' }}>
                RecallDB
              </span>
            </div>
            <p className="text-[12px] text-[#888]" style={{ fontFamily: 'var(--font-sans)' }}>
              Open-source bitemporal memory for AI agents.<br />
              Built by <span style={{ color: '#111', fontFamily: 'var(--font-display)', fontWeight: 500 }}>Arunmozhi Varman</span>, BloomBig Studio — Coimbatore, India.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-8 text-[13px] text-[#555]" style={{ fontFamily: 'var(--font-sans)' }}>
            <a
              href="https://github.com/AMV0027/recalldb"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-[#111] transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
            <span className="font-mono text-[12px] text-[#888]">pip install recalldb</span>
            <span className="text-[#ccc]">MIT License</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#f0f0f0] text-[11px] text-[#bbb] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ fontFamily: 'var(--font-sans)' }}>
          <span>RecallDB v0.1.0 — All benchmark data is fully reproducible.</span>
          <span>© 2026 Arunmozhi Varman</span>
        </div>
      </div>
    </footer>
  );
}
