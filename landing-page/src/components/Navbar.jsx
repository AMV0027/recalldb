import React, { useState } from 'react';
import { Github, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Why RecallDB", href: "#failures" },
    { label: "Architecture", href: "#architecture" },
    { label: "Benchmarks", href: "#benchmarks" },
    { label: "SDK", href: "#sdk" },
    { label: "Simulator", href: "#simulator" },
    { label: "Papers", href: "#papers" },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#e5e7eb] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        {/* Logo: ant icon + RecallDB name */}
        <a href="#lead" className="flex items-center gap-2 text-[#111] select-none">
          <img
            src="/favicon_transparent.png"
            alt="RecallDB"
            className="w-5 h-5 object-contain"
          />
          <span
            className="text-[15px] tracking-tight"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
          >
            RecallDB
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav
          className="hidden md:flex items-center gap-7 text-[13px] text-[#4b5563]"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-[#166534] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA + Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/AMV0027/recalldb"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[12px] sm:text-[13px] px-3 sm:px-4 py-1.5 border border-[#111] text-[#111] hover:bg-[#111] hover:text-white transition-colors duration-200 rounded"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub ↗</span>
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[#4b5563] hover:text-[#111] rounded hover:bg-[#f3f4f6]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#e5e7eb] bg-white px-4 py-3 space-y-2 shadow-sm">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[14px] text-[#374151] hover:text-[#166534] font-medium border-b border-[#f3f4f6] last:border-0"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
