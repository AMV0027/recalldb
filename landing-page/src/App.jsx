import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemSection from './components/ProblemSection';
import ArchitectureSection from './components/ArchitectureSection';
import BenchmarkLeaderboard from './components/BenchmarkLeaderboard';
import CodePlayground from './components/CodePlayground';
import InteractiveTimeline from './components/InteractiveTimeline';
import ResearchPapersSection from './components/ResearchPapersSection';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-[#111] flex flex-col selection:bg-[#111] selection:text-white">
      <Navbar />
      <main className="flex-1">
        {/* 1. Hero */}
        <Hero />
        {/* 2. Why RecallDB */}
        <ProblemSection />
        {/* 3. Architecture */}
        <ArchitectureSection />
        {/* 4. Benchmarks */}
        <BenchmarkLeaderboard />
        {/* 5. Python SDK */}
        <CodePlayground />
        {/* 6. Memory Simulator */}
        <InteractiveTimeline />
        {/* 7. Research Papers */}
        <ResearchPapersSection />
      </main>
      <Footer />
    </div>
  );
}
