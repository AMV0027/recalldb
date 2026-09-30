import React from 'react';
import { CalendarX, SearchX, RefreshCcw, HelpCircle } from 'lucide-react';

export default function ProblemSection() {
  const problems = [
    {
      icon: CalendarX,
      title: "Temporal Collapse",
      description: "When an agent learns 'I use Python' in 2024 and 'I use Rust' in 2026, pure vector retrieval fetches both with identical similarity. The agent hallucinates contradictory answers."
    },
    {
      icon: SearchX,
      title: "Lexical & Symbol Blindness",
      description: "Dense embeddings distort exact alphanumeric tokens, API keys, error traces, and ports. Pure BM25 fails on semantic paraphrase. Only dual-channel indexing bridges this gap."
    },
    {
      icon: RefreshCcw,
      title: "Destructive In-Place Mutation",
      description: "Naive agent architectures use LLM prompts to overwrite facts in-place, permanently deleting past state and destroying historical auditability."
    },
    {
      icon: HelpCircle,
      title: "Conflated Evaluation",
      description: "Measuring agent memory purely by final LLM answer accuracy obscures whether memory retrieval omitted evidence or the LLM reader hallucinated."
    }
  ];

  return (
    <section className="py-20 bg-zinc-950 border-b border-zinc-900">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
            The Failure Modes
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium text-zinc-100 tracking-tight">
            Why Vector Stores Fail at Agent Memory
          </h2>
          <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
            Persistent memory is not merely a vector similarity problem. It is a bitemporal state-management problem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problems.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm">
                <div className="w-8 h-8 rounded-sm bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-base font-medium text-zinc-100 mb-2">{p.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">{p.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
