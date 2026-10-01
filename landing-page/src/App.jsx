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
    <div className="min-h-screen bg-white text-[#111] flex flex-col selection:bg-[#111] selection:text-white">
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
