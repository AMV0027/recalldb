import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const SNIPPETS = {
  chat: `# 1. Seamless 1-Line AI Superpower: Connect & Chat
import recalldb

# Initialize single-file embedded memory
db = recalldb.connect("agent_memory.db")

# Chat with automatic memory recall & background fact extraction
# Works with Ollama (minicpm-v4.6:latest, llama3), OpenAI, or Anthropic
response = db.chat(
    "What backend framework was I using in my 2022 project?",
    provider="ollama",
    model="minicpm-v4.6:latest"
)
print(response)
# -> "In mid-2022, you were using Python 3.10 with FastAPI (as verified by your past project records)."`,

  bitemporal: `# 2. Bitemporal Memory Ingestion & Point-in-Time Time Travel
from recalldb import RecallDB

db = RecallDB("agent_memory.db")

# Ingest fact with valid interval and provenance
db.remember(
    "User prefers Postgres for transactional databases",
    event_time="2023-01-15",
    valid_from="2023-01-15",
    source="conversation:104"
)

# Time travel query: slice past historical state without database rollback
past_memories = db.recall(
    "What database does the user prefer?",
    as_of="2023-06-01",
    k=3
)
print(past_memories[0].content)  # -> Postgres`,

  augment: `# 3. Zero-Friction Message Augmentation (OpenAI / LangChain)
from recalldb import RecallDB

db = RecallDB("agent_memory.db")

messages = [
    {"role": "user", "content": "Help me refactor my database connection"}
]

# Automatically retrieves relevant bitemporal context and injects as system instruction
augmented_messages = db.augment_messages(
    messages,
    k=3,
    as_of="2026-06-01"
)

# Send directly to any standard LLM client
# client.chat.completions.create(model="gpt-4o", messages=augmented_messages)`,

  tools: `# 4. Autonomous Agent Function Calling Tool
from recalldb import RecallDB

db = RecallDB("agent_memory.db")

# Export standardized tool schemas for OpenAI, Anthropic, or LangChain
tools = [
    db.as_tool(operation="remember"),
    db.as_tool(operation="recall")
]

# Provide to agent runtime:
# client.chat.completions.create(..., tools=tools)`,

  audit: `# 5. Non-Destructive Supersession & Provenance Audit
from recalldb import RecallDB

db = RecallDB("agent_memory.db")

# Transition memory without deleting historical state
db.update(
    memory_id="mem_a1b2c3d4",
    content="User migrated database layer from Postgres to TiDB",
    event_time="2026-02-01",
    supersedes=True
)

# Inspect provenance and supersession DAG
report = db.explain("mem_a1b2c3d4")
print(report)
# -> Status: SUPERSEDED
# -> Valid Interval: [2023-01-15 -> 2026-02-01)
# -> Superseded By: mem_f9e8d7c6 (TiDB)`
};

export default function CodePlayground() {
  const [activeTab, setActiveTab] = useState("chat");
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(SNIPPETS[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: "chat", label: "1-Line Connect & Chat" },
    { id: "bitemporal", label: "Time-Travel Recall" },
    { id: "augment", label: "Message Augmentation" },
    { id: "tools", label: "Agent Tool Schema" },
    { id: "audit", label: "Lineage & Audit" }
  ];

  return (
    <section id="sdk" className="py-14 bg-[#faf8f5] border-b border-[#e7e5e4]">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="border-b border-[#1c1917] pb-3 mb-8">
          <div className="text-[11px] font-serif uppercase tracking-widest text-[#78716c] mb-1">
            Section VI &bull; Developer Specification
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#1c1917]">
            Python SDK & 1-Line Superpowers
          </h3>
          <p className="font-serif text-xs sm:text-sm text-[#57534e] mt-1 leading-relaxed">
            Connect RecallDB to Ollama (minicpm-v4.6:latest), OpenAI, Anthropic, or LangChain with zero daemon setup and minimal code.
          </p>
        </div>

        {/* Tidy Broadsheet Code Box */}
        <div className="border border-[#e7e5e4] bg-[#f5f2eb]">
          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#e7e5e4] px-4 py-2 bg-[#f0eae1]">
            <div className="flex flex-wrap items-center gap-1 font-serif">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 text-xs transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#1c1917] text-[#faf8f5] font-medium'
                      : 'text-[#57534e] hover:text-[#1c1917]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={copyCode}
              className="text-[#57534e] hover:text-[#1c1917] text-xs flex items-center gap-1 font-serif transition-colors py-1 px-2"
              title="Copy snippet"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#1c1917]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Snippet Display */}
          <div className="p-5 font-mono text-xs leading-relaxed overflow-x-auto text-[#1c1917] bg-[#fbf9f6]">
            <pre className="text-[12px]">{SNIPPETS[activeTab]}</pre>
          </div>

          {/* Footnote */}
          <div className="px-4 py-2 border-t border-[#e7e5e4] bg-[#f0eae1] flex flex-wrap items-center justify-between text-[11px] font-serif text-[#78716c]">
            <span>PACKAGE: recalldb v0.1.0 &bull; Single-file embedded storage</span>
            <span className="text-[#1c1917]">Supports: Ollama minicpm-v4.6:latest &bull; OpenAI &bull; Claude &bull; LangChain</span>
          </div>
        </div>
      </div>
    </section>
  );
}
