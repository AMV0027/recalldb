import React from 'react';
import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#e5e7eb] py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Brand */}
          <div>
            <a href="#lead" className="flex items-center gap-2 mb-2 select-none">
              <img
                src="/favicon_transparent.png"
                alt="RecallDB"
                style={{ width: 20, height: 20, objectFit: 'contain' }}
              />
              <span className="text-[14px]" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#111' }}>
                RecallDB
              </span>
            </a>
            <p className="text-[12px] text-[#6b7280]" style={{ fontFamily: 'var(--font-sans)' }}>
              Open-source bitemporal memory engine for autonomous AI agents.<br />
              Engineered by <span style={{ color: '#166534', fontFamily: 'var(--font-display)', fontWeight: 500 }}>Arunmozhi Varman</span>, BloomBig Studio — Coimbatore, India.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 text-[13px] text-[#4b5563]" style={{ fontFamily: 'var(--font-sans)' }}>
            <a
              href="#papers"
              className="hover:text-[#166534] transition-colors"
            >
              Research Papers
            </a>
            <a
              href="https://github.com/AMV0027/recalldb"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-[#166534] transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
            <span className="font-mono text-[12px] text-[#166534]">pip install recalldb-ai</span>
            <span className="text-[#9ca3af]">MIT License</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#f3f4f6] text-[11px] text-[#9ca3af] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ fontFamily: 'var(--font-sans)' }}>
          <span>RecallDB v0.1.0 — All benchmark data is fully reproducible.</span>
          <span>© 2026 Arunmozhi Varman</span>
        </div>
      </div>
    </footer>
  );
}
