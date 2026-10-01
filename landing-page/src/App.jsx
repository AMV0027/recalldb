import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import InteractiveTimeline from './components/InteractiveTimeline';
import ProblemSection from './components/ProblemSection';
import BenchmarkLeaderboard from './components/BenchmarkLeaderboard';
import ArchitectureSection from './components/ArchitectureSection';
import CodePlayground from './components/CodePlayground';
import ResearchPapersSection from './components/ResearchPapersSection';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1917] flex flex-col selection:bg-[#e7e5e4] selection:text-[#1c1917]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <InteractiveTimeline />
        <ProblemSection />
        <BenchmarkLeaderboard />
        <ArchitectureSection />
        <CodePlayground />
        <ResearchPapersSection />
      </main>
      <Footer />
    </div>
  );
}
