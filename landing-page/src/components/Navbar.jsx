import React from 'react';
import { Database, Github } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-zinc-950 border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-100 rounded-sm">
            <Database className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-base text-zinc-100 tracking-tight">RecallDB</span>
            <span className="text-[11px] font-mono text-zinc-400">v0.1.0</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-normal text-zinc-400">
          <a href="#simulator" className="hover:text-zinc-200 transition-colors">Simulator</a>
          <a href="#benchmarks" className="hover:text-zinc-200 transition-colors">Benchmarks</a>
          <a href="#architecture" className="hover:text-zinc-200 transition-colors">Architecture</a>
          <a href="#research" className="hover:text-zinc-200 transition-colors">Research</a>
          <a href="#quickstart" className="hover:text-zinc-200 transition-colors">API</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/AMV0027/recalldb"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-1 rounded-sm border border-zinc-800 bg-zinc-900 hover:bg-zinc-800/80 text-zinc-300 text-xs font-medium transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Repository</span>
          </a>
        </div>
      </div>
    </header>
  );
}
