import React from 'react';
import { Database, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 bg-zinc-950 border-t border-zinc-900 text-xs font-mono text-zinc-400">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-zinc-300" />
          <span className="text-zinc-200 font-medium">RecallDB</span>
          <span>— Open-Source Agent Memory Infrastructure</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/AMV0027/recalldb"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub (AMV0027/recalldb)</span>
          </a>
          <span>MIT License</span>
          <span className="text-zinc-400">Arunmozhi Varman</span>
        </div>
      </div>
    </footer>
  );
}
