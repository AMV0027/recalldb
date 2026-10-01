import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  getBezierPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ─── Color palette per node type ──────────────────────────────────────────────
const COLORS = {
  input:      { header: '#6366f1', headerText: '#fff', dot: '#818cf8', bg: '#fafafa', ring: '#e0e7ff' },
  lexical:    { header: '#0ea5e9', headerText: '#fff', dot: '#38bdf8', bg: '#fafafa', ring: '#e0f2fe' },
  dense:      { header: '#8b5cf6', headerText: '#fff', dot: '#a78bfa', bg: '#fafafa', ring: '#ede9fe' },
  gate:       { header: '#0f172a', headerText: '#fff', dot: '#334155', bg: '#fafafa', ring: '#cbd5e1' },
  output:     { header: '#10b981', headerText: '#fff', dot: '#34d399', bg: '#fafafa', ring: '#d1fae5' },
};

// ─── Shared node shell ─────────────────────────────────────────────────────────
function NodeShell({ type, icon, tag, title, children, handles = 'both' }) {
  const c = COLORS[type] || COLORS.input;
  return (
    <div
      style={{
        background: '#fff',
        border: `1.5px solid ${c.ring}`,
        borderRadius: 12,
        minWidth: 210,
        maxWidth: 240,
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07), 0 1px 4px 0 rgba(0,0,0,0.04)',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Source handle (right) */}
      {(handles === 'both' || handles === 'source') && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: c.dot, border: '2px solid #fff', width: 10, height: 10, right: -6, boxShadow: `0 0 0 2px ${c.ring}` }}
        />
      )}
      {/* Target handle (left) */}
      {(handles === 'both' || handles === 'target') && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: c.dot, border: '2px solid #fff', width: 10, height: 10, left: -6, boxShadow: `0 0 0 2px ${c.ring}` }}
        />
      )}

      {/* Header strip */}
      <div style={{ background: c.header, padding: '9px 12px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', color: `${c.headerText}99`, textTransform: 'uppercase' }}>{tag}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: c.headerText, lineHeight: 1.3 }}>{title}</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px 12px' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Stat pill ─────────────────────────────────────────────────────────────────
function Pill({ label, value, color = '#6366f1' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 6, padding: '2px 7px', marginRight: 4, marginBottom: 4 }}>
      <span style={{ fontSize: 10, color: '#888' }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color, fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>
    </div>
  );
}

// ─── Code block ───────────────────────────────────────────────────────────────
function CodeLine({ children, color = '#374151' }) {
  return (
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 5, padding: '4px 8px', marginTop: 4, lineHeight: 1.5 }}>
      {children}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: 1, background: '#f0f0f0', margin: '8px 0' }} />;
}

// ─── Row label ────────────────────────────────────────────────────────────────
function RowLabel({ label, value, mono = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
      <span style={{ fontSize: 10, color: '#999', flexShrink: 0, marginRight: 8 }}>{label}</span>
      <span style={{ fontSize: 10, color: '#222', fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CUSTOM NODES
// ═══════════════════════════════════════════════════════════════════════════════

function InputNode({ data }) {
  return (
    <NodeShell type="input" icon="📥" tag="Input Packet" title="Query String" handles="source">
      <div style={{ fontSize: 11, color: '#6366f1', fontStyle: 'italic', marginBottom: 6 }}>"What language...?"</div>
      <RowLabel label="as_of" value='2024-06-01' mono />
      <RowLabel label="top_k" value="5" mono />
      <Divider />
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <Pill label="mode" value="hybrid" color="#6366f1" />
        <Pill label="provider" value="ollama" color="#6366f1" />
      </div>
    </NodeShell>
  );
}

function LexicalNode({ data }) {
  return (
    <NodeShell type="lexical" icon="🔤" tag="Channel A" title="Lexical Engine" handles="both">
      <RowLabel label="engine" value="SQLite FTS5 BM25" mono />
      <RowLabel label="tokenizer" value="Porter Stemmer" />
      <Divider />
      <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>Handles:</div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <Pill label="" value="UUIDs" color="#0ea5e9" />
        <Pill label="" value="Exact tokens" color="#0ea5e9" />
        <Pill label="" value="SHA refs" color="#0ea5e9" />
      </div>
      <CodeLine color="#0369a1">BM25(q, d) → ranked list</CodeLine>
    </NodeShell>
  );
}

function DenseNode({ data }) {
  return (
    <NodeShell type="dense" icon="🧠" tag="Channel B" title="Dense Vectors" handles="both">
      <RowLabel label="kernel" value="SIMD Float32 Cosine" mono />
      <RowLabel label="model" value="Nomic-embed-text" />
      <Divider />
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <Pill label="" value="Paraphrase" color="#8b5cf6" />
        <Pill label="" value="Semantic" color="#8b5cf6" />
        <Pill label="" value="384-dim" color="#8b5cf6" />
      </div>
      <CodeLine color="#7c3aed">cosine_sim(q⃗, d⃗) → score</CodeLine>
    </NodeShell>
  );
}

function GatekeeperNode({ data }) {
  return (
    <NodeShell type="gate" icon="⏱" tag="Bitemporal Gatekeeper" title="Interval Calculus" handles="both">
      <CodeLine color="#0f172a">valid_from ≤ t {'<'} valid_until</CodeLine>
      <div style={{ fontSize: 10, color: '#888', marginTop: 6, marginBottom: 2 }}>Supersession DAG</div>
      <div style={{ fontSize: 10, color: '#555', marginBottom: 6 }}>Prunes stale distractors before re-ranking</div>
      <Divider />
      <div style={{ fontSize: 10, color: '#888', marginBottom: 2 }}>Rank Fusion Formula</div>
      <CodeLine color="#0f172a">Score = αV + βB + γT</CodeLine>
      <Divider />
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 2 }}>
        <Pill label="E_temp" value="0.0%" color="#10b981" />
        <Pill label="latency" value="≤11.47ms" color="#10b981" />
        <Pill label="Recall@1" value="1.000" color="#10b981" />
      </div>
    </NodeShell>
  );
}

function OutputNode({ data }) {
  return (
    <NodeShell type="output" icon="🤖" tag="Dispatch" title="Agent LLM" handles="target">
      <RowLabel label="provider" value="Ollama / OpenAI / Claude" />
      <RowLabel label="mode" value="Zero daemon" />
      <Divider />
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <Pill label="" value="minicpm-v4.6" color="#10b981" />
        <Pill label="" value="gpt-4o" color="#10b981" />
        <Pill label="" value="claude-3.5" color="#10b981" />
      </div>
      <Divider />
      <div style={{ fontSize: 10, fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span>✓</span> Zero Hallucination Memory
      </div>
    </NodeShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CUSTOM ANIMATED EDGE with label
// ═══════════════════════════════════════════════════════════════════════════════

function AnimatedEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label, style = {} }) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '5 3', ...style }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 5,
              padding: '2px 6px',
              fontSize: 9,
              color: '#64748b',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

function SolidEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label, style = {} }) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke: '#6366f1', strokeWidth: 2, ...style }}
        markerEnd="url(#arrow-indigo)"
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#eef2ff',
              border: '1px solid #c7d2fe',
              borderRadius: 5,
              padding: '2px 6px',
              fontSize: 9,
              color: '#4338ca',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  NODE & EDGE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

const nodeTypes = {
  inputNode:      InputNode,
  lexicalNode:    LexicalNode,
  denseNode:      DenseNode,
  gatekeeperNode: GatekeeperNode,
  outputNode:     OutputNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
  solid:    SolidEdge,
};

const initialNodes = [
  { id: 'input',      type: 'inputNode',      position: { x: 0,   y: 160 }, data: {} },
  { id: 'lexical',    type: 'lexicalNode',    position: { x: 310, y: 20  }, data: {} },
  { id: 'dense',      type: 'denseNode',      position: { x: 310, y: 290 }, data: {} },
  { id: 'gatekeeper', type: 'gatekeeperNode', position: { x: 630, y: 130 }, data: {} },
  { id: 'output',     type: 'outputNode',     position: { x: 970, y: 175 }, data: {} },
];

const initialEdges = [
  { id: 'e1', source: 'input',      target: 'lexical',    type: 'animated', label: 'BM25 channel',    animated: false },
  { id: 'e2', source: 'input',      target: 'dense',      type: 'animated', label: 'vector channel',  animated: false },
  { id: 'e3', source: 'lexical',    target: 'gatekeeper', type: 'animated', label: 'ranked tokens',   animated: false },
  { id: 'e4', source: 'dense',      target: 'gatekeeper', type: 'animated', label: 'cosine scores',   animated: false },
  { id: 'e5', source: 'gatekeeper', target: 'output',     type: 'solid',    label: 'verified memory', animated: false },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN DIAGRAM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function ArchitectureDiagramSvg() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0 12px',
        borderBottom: '1px solid #e4e4e4',
        marginBottom: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#888', textTransform: 'uppercase' }}>
            Figure 2 · Dual-Channel Bitemporal Pipeline
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 10, color: '#10b981', fontFamily: 'JetBrains Mono, monospace', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 5, padding: '2px 8px' }}>
            ≤11.47ms
          </span>
          <span style={{ fontSize: 10, color: '#6366f1', fontFamily: 'JetBrains Mono, monospace', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 5, padding: '2px 8px' }}>
            Zero Daemon
          </span>
          <span style={{ fontSize: 10, color: '#0ea5e9', fontFamily: 'JetBrains Mono, monospace', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 5, padding: '2px 8px' }}>
            Recall@1: 1.000
          </span>
        </div>
      </div>

      {/* Flow canvas */}
      <div style={{ width: '100%', height: 480, background: '#fafafa', borderRadius: '0 0 12px 12px', overflow: 'hidden', border: '1px solid #e4e4e4', borderTop: 'none' }}>
        {/* SVG defs for arrowhead */}
        <svg style={{ width: 0, height: 0, position: 'absolute' }}>
          <defs>
            <marker id="arrow-indigo" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#6366f1" />
            </marker>
          </defs>
        </svg>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.25, minZoom: 0.6, maxZoom: 1.2 }}
          minZoom={0.4}
          maxZoom={2}
          panOnDrag
          zoomOnScroll={false}
          proOptions={{ hideAttribution: true }}
          style={{ background: 'transparent' }}
          defaultEdgeOptions={{ type: 'animated' }}
        >
          <Background
            variant="dots"
            gap={20}
            size={1}
            color="#e2e8f0"
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12, padding: '0 4px' }}>
        {[
          { dot: '#6366f1', label: 'Input Packet' },
          { dot: '#0ea5e9', label: 'Lexical Engine (FTS5 BM25)' },
          { dot: '#8b5cf6', label: 'Dense Vectors (SIMD Cosine)' },
          { dot: '#0f172a', label: 'Bitemporal Gatekeeper' },
          { dot: '#10b981', label: 'Agent Dispatch' },
        ].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.dot, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#666' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
