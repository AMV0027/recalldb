import React, { useState, useMemo } from 'react';
import { Copy, Check, Terminal, FileCode2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';

const SNIPPETS = {
  chat: {
    id: "chat",
    label: "Connect & Chat",
    filename: "chat_agent.py",
    tag: "1-Line LLM RAG",
    description: "Zero-daemon embedded connection with instant LLM query routing",
    code: `# 1-Line Embedded Connect & Autonomous Chat
import recalldb

# Connect directly to local embedded SQLite + BM25 engine
db = recalldb.connect("agent_memory.db")

# Query with integrated local or remote LLM runtimes
response = db.chat(
    "What backend framework was I using in my 2022 project?",
    provider="ollama",
    model="minicpm-v4.6:latest"
)

print(response)
# -> "In mid-2022, you were using Python 3.10 with FastAPI."`
  },

  bitemporal: {
    id: "bitemporal",
    label: "Time-Travel Recall",
    filename: "time_travel.py",
    tag: "Bitemporal Engine",
    description: "Point-in-time deterministic memory retrieval without state corruption",
    code: `# Bitemporal Memory Ingestion & Point-in-Time Time Travel
from recalldb import RecallDB

db = RecallDB("agent_memory.db")

# Record memory with distinct event-time and assertion-time
db.remember(
    "User prefers Postgres for transactional databases",
    event_time="2023-01-15",
    valid_from="2023-01-15",
    source="conversation:104"
)

# Recall memory as of a historical snapshot in the past
past_memories = db.recall(
    "What database does the user prefer?",
    as_of="2023-06-01",
    k=3
)

print(f"Retrieved: {past_memories[0].content}")
# -> Retrieved: User prefers Postgres for transactional databases`
  },

  augment: {
    id: "augment",
    label: "Message Augmentation",
    filename: "augment_messages.py",
    tag: "Context Injector",
    description: "Inject temporal context into standard OpenAI/Anthropic messages payload",
    code: `# Zero-Friction Chat Message Augmentation
from recalldb import RecallDB

db = RecallDB("agent_memory.db")

# Standard chat history from any framework
messages = [
    {"role": "user", "content": "Help me refactor my database connection"}
]

# Inject verified bitemporal context directly into system prompt
augmented_messages = db.augment_messages(
    messages,
    k=3,
    as_of="2026-06-01"
)

# Dispatch to OpenAI, Claude, or local model:
# client.chat.completions.create(model="gpt-4o", messages=augmented_messages)`
  },

  tools: {
    id: "tools",
    label: "Agent Tool Schemas",
    filename: "agent_tools.py",
    tag: "Function Calling",
    description: "Auto-generate schema definitions for LangChain, CrewAI, or raw LLMs",
    code: `# Autonomous Agent Function Calling & Tool Binding
from recalldb import RecallDB

db = RecallDB("agent_memory.db")

# Generate native JSON schemas for function calling
tools = [
    db.as_tool(operation="remember"),
    db.as_tool(operation="recall")
]

# Pass directly to tool-calling agents:
# client.chat.completions.create(
#     model="gpt-4o",
#     messages=messages,
#     tools=tools,
#     tool_choice="auto"
# )`
  },

  audit: {
    id: "audit",
    label: "Lineage & Audit",
    filename: "audit_lineage.py",
    tag: "Causal Graph",
    description: "Non-destructive memory supersession with complete causal lineage",
    code: `# Non-Destructive Supersession & Causal Audit
from recalldb import RecallDB

db = RecallDB("agent_memory.db")

# Supersede outdated memory without deleting historical records
db.update(
    memory_id="mem_a1b2c3d4",
    content="User migrated from Postgres to TiDB",
    event_time="2026-02-01",
    supersedes=True
)

# Inspect temporal validity and supersession intervals
report = db.explain("mem_a1b2c3d4")
print(report)

# -> Status: SUPERSEDED
# -> Valid Interval: [2023-01-15 -> 2026-02-01)
# -> Superseded By: mem_f9e8d7c6
# -> Confidence Score: 0.984`
  }
};

export default function CodePlayground() {
  const [activeTab, setActiveTab] = useState("chat");
  const [copied, setCopied] = useState(false);

  const activeSnippet = SNIPPETS[activeTab] || SNIPPETS.chat;

  // Generate highlighted HTML lines with Prism
  const highlightedLines = useMemo(() => {
    const rawCode = activeSnippet.code;
    const highlighted = Prism.highlight(rawCode, Prism.languages.python, 'python');
    return highlighted.split('\n');
  }, [activeSnippet.code]);

  const copyCode = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: "chat", label: "Connect & Chat", tag: "1-Line" },
    { id: "bitemporal", label: "Time-Travel Recall", tag: "Bitemporal" },
    { id: "augment", label: "Message Augmentation", tag: "Context" },
    { id: "tools", label: "Agent Tool Schemas", tag: "Tools" },
    { id: "audit", label: "Lineage & Audit", tag: "Explain" },
  ];

  return (
    <section id="sdk" className="bg-[#fafafa] border-t border-[#e5e7eb] py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 mb-10 sm:mb-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#166534]"></span>
              <span className="text-[12px] font-medium tracking-wide text-[#166534] uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
                Developer Interface
              </span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="text-[34px] sm:text-[46px] leading-[1.05] tracking-tight text-[#111]"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
            >
              Python <span className="text-[#166534]">SDK.</span>
            </motion.h2>
          </div>
          <div className="md:col-span-7 flex flex-col justify-end">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-[15px] text-[#4b5563] leading-relaxed"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Embed RecallDB directly into your Python runtime with zero external server daemons. Supports local models via Ollama (<code className="px-1.5 py-0.5 rounded bg-[#e5e7eb] text-[#111] text-[13px] font-mono">minicpm-v4.6</code>) and cloud LLM APIs.
            </motion.p>
          </div>
        </div>

        {/* Code Format Block Container */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-xl overflow-hidden shadow-2xl border border-[#262f3e] bg-[#0c1017]"
        >
          {/* Top Bar: MacOS Controls + Filename + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1f293d] bg-[#090d14] px-4 py-3 gap-3">
            {/* Left: Window Dots & Filename Badge */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-sm"></span>
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-sm"></span>
                <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-sm"></span>
              </div>
              <div className="h-4 w-px bg-[#1f293d] hidden sm:block"></div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#94a3b8]">
                <FileCode2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span className="text-[#e2e8f0] font-medium">{activeSnippet.filename}</span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-sans tracking-wider rounded bg-[#166534]/40 text-[#4ade80] border border-[#166534]/60">
                  {activeSnippet.tag}
                </span>
              </div>
            </div>

            {/* Right: Copy Code & Quick Action */}
            <div className="flex items-center gap-2">
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-[#162032] hover:bg-[#1e2d45] text-[#e2e8f0] border border-[#2d3a52] transition-all cursor-pointer"
                title="Copy code snippet"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#4ade80]" />
                    <span className="text-[#4ade80]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#94a3b8]" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Subheader: Feature Tab Switcher */}
          <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 bg-[#0d121c] border-b border-[#1f293d] scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#166534] text-white shadow-sm'
                      : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#162032]'
                  }`}
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Code Body with Line Numbers and Prism Syntax Highlighting */}
          <div className="relative p-4 sm:p-6 overflow-x-auto bg-[#0a0e17] code-block selection:bg-[#2563eb]/40">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="flex font-mono text-[13px] sm:text-[13.5px] leading-[1.7]"
              >
                {/* Line Numbers Column */}
                <div className="select-none pr-4 sm:pr-6 text-right text-[#475569] border-r border-[#1e293b]/70 font-mono text-[12px] sm:text-[13px] leading-[1.7] flex-shrink-0">
                  {highlightedLines.map((_, index) => (
                    <div key={index} className="h-[23px] flex items-center justify-end">
                      {index + 1}
                    </div>
                  ))}
                </div>

                {/* Highlighted Python Code Column */}
                <div className="pl-4 sm:pl-6 flex-1 overflow-x-auto">
                  <pre className="!bg-transparent !p-0 !m-0 !overflow-visible">
                    <code>
                      {highlightedLines.map((lineHtml, index) => (
                        <div
                          key={index}
                          className="h-[23px] flex items-center whitespace-pre hover:bg-[#162032]/40 rounded px-1 -mx-1 transition-colors"
                          dangerouslySetInnerHTML={{ __html: lineHtml || '&nbsp;' }}
                        />
                      ))}
                    </code>
                  </pre>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Telemetry & Quick Info */}
          <div className="px-4 sm:px-6 py-3 border-t border-[#1f293d] bg-[#090d14] flex flex-wrap items-center justify-between gap-3 text-xs text-[#94a3b8]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></span>
              <span className="font-mono text-[#e2e8f0] font-medium">recalldb v0.1.0</span>
              <span className="text-[#64748b]">·</span>
              <span className="text-[#94a3b8]">{activeSnippet.description}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-[#64748b]">
              <span>Python 3.10+</span>
              <span>·</span>
              <span className="text-[#38bdf8]">Ollama / OpenAI / Claude / LangChain</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Install Pill Underneath */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-[#6b7280]">
          <span>Install directly via PyPI:</span>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f3f4f6] border border-[#e5e7eb] font-mono text-[#111]">
            <Terminal className="w-3.5 h-3.5 text-[#166534]" />
            <span>pip install recalldb</span>
          </div>
        </div>

      </div>
    </section>
  );
}
