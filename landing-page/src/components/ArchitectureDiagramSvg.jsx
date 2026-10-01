import React from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ─── Professional Minimal Palette ──────────────────────────────────────────────
const STYLES = {
  input: {
    accent: '#166534',
    bg: '#ffffff',
    border: '#d1d5db',
    tag: 'INPUT STREAM',
    badgeBg: '#f0fdf4',
    badgeText: '#166534',
  },
  lexical: {
    accent: '#0f766e',
    bg: '#ffffff',
    border: '#d1d5db',
    tag: 'CHANNEL A · LEXICAL',
    badgeBg: '#f0fdfa',
    badgeText: '#0f766e',
  },
  dense: {
    accent: '#334155',
    bg: '#ffffff',
    border: '#d1d5db',
    tag: 'CHANNEL B · EMBEDDINGS',
    badgeBg: '#f8fafc',
    badgeText: '#334155',
  },
  gate: {
    accent: '#111827',
    bg: '#ffffff',
    border: '#111827',
    tag: 'STATE MACHINE',
    badgeBg: '#111827',
    badgeText: '#ffffff',
  },
  output: {
    accent: '#166534',
    bg: '#ffffff',
    border: '#166534',
    tag: 'DISPATCH GATEWAY',
    badgeBg: '#166534',
    badgeText: '#ffffff',
  }
};

// ─── Unified Professional Node Shell ───────────────────────────────────────────
function NodeShell({ type, tag, title, subtitle, children, handles = 'both', isDark = false }) {
  const cfg = STYLES[type] || STYLES.input;

  return (
    <div
      style={{
        background: '#ffffff',
        border: `1px solid ${cfg.border}`,
        borderRadius: 8,
        minWidth: 230,
        maxWidth: 250,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Handles */}
      {(handles === 'both' || handles === 'target') && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: '#ffffff',
            border: `2px solid ${cfg.accent}`,
            width: 8,
            height: 8,
            left: -5,
          }}
        />
      )}
      {(handles === 'both' || handles === 'source') && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: '#ffffff',
            border: `2px solid ${cfg.accent}`,
            width: 8,
            height: 8,
            right: -5,
          }}
        />
      )}

      {/* Header bar */}
      <div
        style={{
          borderBottom: '1px solid #f3f4f6',
          padding: '8px 12px 7px',
          background: isDark ? '#111827' : '#fafafa',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: isDark ? '#9ca3af' : '#6b7280',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {tag}
        </span>
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: cfg.accent,
          }}
        />
      </div>

      {/* Title block */}
      <div style={{ padding: '10px 12px 10px' }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#111827',
            fontFamily: 'var(--font-display)',
            lineHeight: 1.3,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
            {subtitle}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ─── Custom Professional Nodes ────────────────────────────────────────────────

function InputNode() {
  return (
    <NodeShell
      type="input"
      tag="Input Query"
      title="Retrieval Request"
      subtitle="Context query + temporal predicate"
      handles="source"
    >
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#166534', background: '#f0fdf4', padding: '4px 6px', borderRadius: 4 }}>
          as_of = "2024-06-01"
        </div>
        <div style={{ fontSize: 10, color: '#6b7280', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
          <span>Search scope</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#111827' }}>top_k=5</span>
        </div>
      </div>
    </NodeShell>
  );
}

function LexicalNode() {
  return (
    <NodeShell
      type="lexical"
      tag="Channel A"
      title="SQLite FTS5 BM25"
      subtitle="Inverted index lexical scoring"
      handles="both"
    >
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
        <div style={{ fontSize: 10, color: '#4b5563', lineHeight: 1.5 }}>
          Exact UUIDs, function signatures, compiler logs & error traces
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#0f766e', background: '#f0fdfa', padding: '4px 6px', borderRadius: 4, marginTop: 6 }}>
          BM25(query, tokens) → Score_lex
        </div>
      </div>
    </NodeShell>
  );
}

function DenseNode() {
  return (
    <NodeShell
      type="dense"
      tag="Channel B"
      title="SIMD Float32 Cosine"
      subtitle="Vector embedding similarity"
      handles="both"
    >
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
        <div style={{ fontSize: 10, color: '#4b5563', lineHeight: 1.5 }}>
          Latent semantic similarity & intent preservation
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#334155', background: '#f8fafc', padding: '4px 6px', borderRadius: 4, marginTop: 6 }}>
          cos_sim(v_q, v_d) → Score_dense
        </div>
      </div>
    </NodeShell>
  );
}

function GatekeeperNode() {
  return (
    <NodeShell
      type="gate"
      tag="Bitemporal Core"
      title="Interval Calculus & DAG"
      subtitle="State validity verification"
      handles="both"
    >
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#111827', background: '#f3f4f6', padding: '4px 6px', borderRadius: 4 }}>
          valid_from ≤ t &lt; valid_until
        </div>
        <div style={{ fontSize: 10, color: '#4b5563', marginTop: 6, lineHeight: 1.4 }}>
          Supersession DAG purges superseded records before rank blending
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#166534', marginTop: 6, fontWeight: 500 }}>
          Score = α·Dense + β·BM25 + γ·Temp
        </div>
      </div>
    </NodeShell>
  );
}

function OutputNode() {
  return (
    <NodeShell
      type="output"
      tag="Dispatch"
      title="Autonomous Agent LLM"
      subtitle="Deterministic context injection"
      handles="target"
    >
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
        <div style={{ fontSize: 10, color: '#166534', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#166534' }} />
          Verified Temporal State
        </div>
        <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>
          Ollama · OpenAI · Anthropic · Claude
        </div>
      </div>
    </NodeShell>
  );
}

// ─── Professional Custom Edges ────────────────────────────────────────────────

function ChannelEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label }) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke: '#9ca3af', strokeWidth: 1.25, strokeDasharray: '4 4' }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 9,
              color: '#4b5563',
              fontFamily: 'var(--font-mono)',
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

function VerifiedEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label }) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke: '#166534', strokeWidth: 1.75 }}
        markerEnd="url(#arrow-forest)"
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 9,
              color: '#166534',
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
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

// ─── Component Config ──────────────────────────────────────────────────────────

const nodeTypes = {
  inputNode: InputNode,
  lexicalNode: LexicalNode,
  denseNode: DenseNode,
  gatekeeperNode: GatekeeperNode,
  outputNode: OutputNode,
};

const edgeTypes = {
  channel: ChannelEdge,
  verified: VerifiedEdge,
};

const initialNodes = [
  { id: 'input',      type: 'inputNode',      position: { x: 0,   y: 155 }, data: {} },
  { id: 'lexical',    type: 'lexicalNode',    position: { x: 310, y: 30  }, data: {} },
  { id: 'dense',      type: 'denseNode',      position: { x: 310, y: 280 }, data: {} },
  { id: 'gatekeeper', type: 'gatekeeperNode', position: { x: 630, y: 135 }, data: {} },
  { id: 'output',     type: 'outputNode',     position: { x: 960, y: 165 }, data: {} },
];

const initialEdges = [
  { id: 'e1', source: 'input',      target: 'lexical',    type: 'channel',  label: 'lexical channel' },
  { id: 'e2', source: 'input',      target: 'dense',      type: 'channel',  label: 'vector channel' },
  { id: 'e3', source: 'lexical',    target: 'gatekeeper', type: 'channel',  label: 'exact candidates' },
  { id: 'e4', source: 'dense',      target: 'gatekeeper', type: 'channel',  label: 'semantic candidates' },
  { id: 'e5', source: 'gatekeeper', target: 'output',     type: 'verified', label: 'gated ground-truth' },
];

export default function ArchitectureDiagramSvg() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Schematic Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 0',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#166534' }} />
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Figure 1 · Dual-Channel Bitemporal Pipeline Architecture
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
          <span>Latency: <strong style={{ color: '#166534' }}>≤11.47ms</strong></span>
          <span>Daemon: <strong style={{ color: '#111827' }}>Zero</strong></span>
          <span>Errors: <strong style={{ color: '#166534' }}>0.0%</strong></span>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div
        style={{
          width: '100%',
          height: 460,
          background: '#fafafa',
          border: '1px solid #e5e7eb',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <svg style={{ width: 0, height: 0, position: 'absolute' }}>
          <defs>
            <marker id="arrow-forest" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#166534" />
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
          fitViewOptions={{ padding: 0.2, minZoom: 0.65, maxZoom: 1.1 }}
          minZoom={0.4}
          maxZoom={1.5}
          panOnDrag
          zoomOnScroll={false}
          proOptions={{ hideAttribution: true }}
          style={{ background: 'transparent' }}
        >
          <Background variant="dots" gap={18} size={1} color="#e5e7eb" />
        </ReactFlow>
      </div>
    </div>
  );
}
