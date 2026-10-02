import React, { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';

const SNIPPETS = {
  chat: {
    id: "chat",
    label: "Connect & Chat",
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

print(past_memories[0].content)
# -> "User prefers Postgres for transactional databases"`
  },

  augment: {
    id: "augment",
    label: "Message Augmentation",
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
# -> Superseded By: mem_f9e8d7c6`
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
    { id: "chat", label: "Connect & Chat" },
    { id: "bitemporal", label: "Time-Travel Recall" },
    { id: "augment", label: "Message Augmentation" },
    { id: "tools", label: "Agent Tool Schemas" },
    { id: "audit", label: "Lineage & Audit" },
  ];

  return (
    <section id="sdk" className="bg-white border-t border-[#e5e7eb] py-20">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
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
              className="text-[38px] sm:text-[46px] leading-[1.05] tracking-tight text-[#111]"
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
              Connect RecallDB to Ollama, OpenAI, Anthropic, or LangChain with zero daemon setup. One line of code to enable persistent, bitemporal agent memory.
            </motion.p>
          </div>
        </div>

        {/* Code Block Container */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border border-[#e5e7eb] rounded-lg overflow-hidden bg-white shadow-sm"
        >
          {/* Minimal Tab Bar & Copy Action */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#e5e7eb] px-4 py-2.5 bg-[#fafafa]">
            <div className="flex flex-wrap items-center gap-1.5">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 text-[12px] rounded transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-[#166534] text-white font-medium'
                        : 'text-[#6b7280] hover:text-[#111] hover:bg-[#f3f4f6]'
                    }`}
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={copyCode}
              className="text-[#6b7280] hover:text-[#166534] text-[12px] flex items-center gap-1.5 transition-colors py-1 px-2.5 rounded hover:bg-[#f3f4f6] cursor-pointer"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#166534]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Code Body with Line Numbers & Syntax Highlighted Lines */}
          <div className="p-6 overflow-x-auto bg-[#ffffff] code-block">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex font-mono text-[12.5px] leading-relaxed"
              >
                {/* Line Numbers Column */}
                <div className="select-none pr-5 text-right text-[#9ca3af] border-r border-[#e5e7eb] font-mono text-[12px] flex-shrink-0">
                  {highlightedLines.map((_, index) => (
                    <div key={index} className="h-[22px] flex items-center justify-end">
                      {index + 1}
                    </div>
                  ))}
                </div>

                {/* Highlighted Code Column */}
                <div className="pl-5 flex-1 overflow-x-auto">
                  <pre className="!bg-transparent !p-0 !m-0 !overflow-visible">
                    <code>
                      {highlightedLines.map((lineHtml, index) => (
                        <div
                          key={index}
                          className="h-[22px] flex items-center whitespace-pre text-[#24292f]"
                          dangerouslySetInnerHTML={{ __html: lineHtml || '&nbsp;' }}
                        />
                      ))}
                    </code>
                  </pre>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Minimal Footer */}
          <div className="px-4 py-2.5 border-t border-[#e5e7eb] bg-[#fafafa] flex flex-wrap items-center justify-between text-[11px] text-[#6b7280]" style={{ fontFamily: 'var(--font-sans)' }}>
            <span className="font-mono text-[#166534] font-medium">recalldb v0.1.0 — embedded, zero-daemon</span>
            <span>Supports: Ollama · OpenAI · Claude · LangChain</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
