import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

const SNIPPETS = {
  remember: `# 1. Ingest fact with bitemporal metadata & provenance
from recalldb import RecallDB

memory = RecallDB("agent_memory.db")

memory.remember(
    "User develops backend microservices in Python",
    event_time="2024-05-10",
    valid_from="2024-05-10",
    source="conversation:104",
    importance=0.8
)`,
  recall: `# 2. Point-in-time historical or present-state recall
# Query past state
past = memory.recall(
    "What backend language does the user use?",
    as_of="2024-12-01",
    k=3
)
print(past[0].record.content)  # -> Python

# Query present state
current = memory.recall(
    "What backend language does the user use?",
    k=3
)
print(current[0].record.content)  # -> Rust`,
  update: `# 3. Atomic supersession update (preserves historical audit trail)
memory.update(
    memory_id="mem_a1b2c3d4",
    content="User transitioned backend microservices to Rust",
    event_time="2026-01-15",
    supersedes=True
)`,
  explain: `# 4. Audit provenance, confidence, and supersession DAG
report = memory.explain("mem_a1b2c3d4")
print(report)

# Output includes:
# - Valid Window: [2024-05-10 -> 2026-01-15)
# - State: SUPERSEDED
# - Superseded By: mem_f9e8d7c6
# - Evolution Lineage Chain`
};

export default function CodePlayground() {
  const [activeTab, setActiveTab] = useState("remember");
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(SNIPPETS[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="quickstart" className="py-20 bg-zinc-950 border-b border-zinc-900">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Python SDK
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium text-zinc-100 tracking-tight">
            Developer API
          </h2>
          <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
            Minimal, single-import persistent memory engine for any agent framework.
          </p>
        </div>

        {/* Code Box */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 bg-zinc-950">
            <div className="flex items-center gap-1">
              {['remember', 'recall', 'update', 'explain'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 font-mono text-xs rounded-sm transition-colors ${
                    activeTab === tab
                      ? 'bg-zinc-800 text-zinc-100 font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab}()
                </button>
              ))}
            </div>

            <button
              onClick={copyCode}
              className="text-zinc-400 hover:text-zinc-200 text-xs flex items-center gap-1 font-mono transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-zinc-200" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Snippet Display */}
          <div className="p-5 font-mono text-xs leading-relaxed overflow-x-auto text-zinc-300 bg-zinc-950/80">
            <pre>{SNIPPETS[activeTab]}</pre>
          </div>
        </div>
      </div>
    </section>
  );
}
