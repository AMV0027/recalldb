import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const SNIPPETS = {
  chat: `# 1-Line Connect & Chat
import recalldb

db = recalldb.connect("agent_memory.db")

response = db.chat(
    "What backend framework was I using in my 2022 project?",
    provider="ollama",
    model="minicpm-v4.6:latest"
)
print(response)
# -> "In mid-2022, you were using Python 3.10 with FastAPI."`,

  bitemporal: `# Bitemporal Memory Ingestion & Time Travel
from recalldb import RecallDB

db = RecallDB("agent_memory.db")

db.remember(
    "User prefers Postgres for transactional databases",
    event_time="2023-01-15",
    valid_from="2023-01-15",
    source="conversation:104"
)

past_memories = db.recall(
    "What database does the user prefer?",
    as_of="2023-06-01",
    k=3
)
print(past_memories[0].content)  # -> Postgres`,

  augment: `# Zero-Friction Message Augmentation
from recalldb import RecallDB

db = RecallDB("agent_memory.db")

messages = [
    {"role": "user", "content": "Help me refactor my database connection"}
]

augmented_messages = db.augment_messages(
    messages, k=3, as_of="2026-06-01"
)

# Send directly to any LLM client
# client.chat.completions.create(model="gpt-4o", messages=augmented_messages)`,

  tools: `# Autonomous Agent Function Calling
from recalldb import RecallDB

db = RecallDB("agent_memory.db")

tools = [
    db.as_tool(operation="remember"),
    db.as_tool(operation="recall")
]

# Provide to agent runtime:
# client.chat.completions.create(..., tools=tools)`,

  audit: `# Non-Destructive Supersession & Audit
from recalldb import RecallDB

db = RecallDB("agent_memory.db")

db.update(
    memory_id="mem_a1b2c3d4",
    content="User migrated from Postgres to TiDB",
    event_time="2026-02-01",
    supersedes=True
)

report = db.explain("mem_a1b2c3d4")
print(report)
# -> Status: SUPERSEDED
# -> Valid Interval: [2023-01-15 -> 2026-02-01)
# -> Superseded By: mem_f9e8d7c6`
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
    { id: "chat", label: "Connect & Chat" },
    { id: "bitemporal", label: "Time-Travel Recall" },
    { id: "augment", label: "Message Augmentation" },
    { id: "tools", label: "Agent Tools" },
    { id: "audit", label: "Lineage & Audit" },
  ];

  return (
    <section id="sdk" className="bg-white border-t border-[#e4e4e4]">
      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          <div className="md:col-span-5">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="text-[38px] sm:text-[48px] font-normal leading-tight tracking-tight text-[#111]"
            >
              Python SDK.
            </motion.h2>
          </div>
          <div className="md:col-span-7 flex flex-col justify-end">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-[15px] text-[#555] leading-relaxed"
            >
              Connect RecallDB to Ollama, OpenAI, Anthropic, or LangChain with zero daemon setup. One line of code to enable persistent, bitemporal agent memory.
            </motion.p>
          </div>
        </div>

        {/* Code Block */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border border-[#e4e4e4]"
        >
          {/* Tab Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#e4e4e4] px-4 py-2 bg-[#fafafa]">
            <div className="flex flex-wrap items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-[12px] transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#111] text-white'
                      : 'text-[#666] hover:text-[#111]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={copyCode}
              className="text-[#888] hover:text-[#111] text-[12px] flex items-center gap-1.5 transition-colors py-1 px-2"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#111]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Code */}
          <div className="p-6 font-mono text-[12px] leading-relaxed overflow-x-auto text-[#111] bg-[#fefefe]">
            <pre>{SNIPPETS[activeTab]}</pre>
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-[#e4e4e4] bg-[#fafafa] flex flex-wrap items-center justify-between text-[11px] text-[#888]">
            <span className="font-mono">recalldb v0.1.0 — embedded, zero-daemon</span>
            <span>Supports: Ollama · OpenAI · Claude · LangChain</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
