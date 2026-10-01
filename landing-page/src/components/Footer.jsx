import React from 'react';
import { Github, Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-10 bg-[#faf8f5] text-[#57534e] font-serif text-xs border-t-2 border-[#1c1917]">
      <div className="max-w-5xl mx-auto px-6 space-y-4">
        {/* Top Colophon Line */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e7e5e4] pb-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-base font-normal text-[#1c1917]">The RecallDB Dispatch</span>
            <span className="text-[#78716c]">&bull;</span>
            <span className="italic">Vol. I, No. 1</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a
              href="https://github.com/AMV0027/recalldb"
              target="_blank"
              rel="noreferrer"
              className="text-[#1c1917] hover:underline underline-offset-4 flex items-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub (AMV0027/recalldb)</span>
            </a>
            <span>MIT License</span>
            <span className="font-mono text-[11px] text-[#1c1917]">pip install recalldb</span>
          </div>
        </div>

        {/* Imprint Text */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-[#78716c]">
          <p>
            An open-source cognitive memory system engineered by <strong className="text-[#1c1917]">Arunmozhi Varman</strong>. Coimbatore, Tamil Nadu, India.
          </p>
          <p>
            Printed digitally on newsprint. All benchmark data is fully reproducible.
          </p>
        </div>
      </div>
    </footer>
  );
}
