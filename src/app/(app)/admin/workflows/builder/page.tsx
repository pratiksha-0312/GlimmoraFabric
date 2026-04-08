"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Upload,
  Play,
  Circle,
  Square,
  Diamond,
  StopCircle,
  X,
  Check,
  AlertTriangle,
  Trash2,
  GripVertical,
  Loader2,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import type { UserRole } from "@/lib/roles";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NodeType = "start" | "task" | "decision" | "end";

interface WfNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  config: Record<string, string>;
}

interface WfEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

interface ValidationError {
  nodeId?: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Node Palette (Component)
// ---------------------------------------------------------------------------

const NODE_TYPES: { type: NodeType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: "start", label: "Start", icon: <Play className="h-4 w-4" />, color: "#22c55e" },
  { type: "task", label: "Task", icon: <Square className="h-4 w-4" />, color: "#3b82f6" },
  { type: "decision", label: "Decision", icon: <Diamond className="h-4 w-4" />, color: "#f59e0b" },
  { type: "end", label: "End", icon: <StopCircle className="h-4 w-4" />, color: "#ef4444" },
];

function NodePalette({ onAdd }: { onAdd: (type: NodeType) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--gf-text-muted)" }}>Node Palette</p>
      {NODE_TYPES.map((nt) => (
        <button
          key={nt.type}
          onClick={() => onAdd(nt.type)}
          draggable
          onDragStart={(e) => e.dataTransfer.setData("nodeType", nt.type)}
          className="flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:opacity-80 cursor-grab active:cursor-grabbing"
          style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
        >
          <GripVertical className="h-3 w-3" style={{ color: "var(--gf-text-muted)" }} />
          <div className="flex h-6 w-6 items-center justify-center rounded" style={{ backgroundColor: `${nt.color}20`, color: nt.color }}>
            {nt.icon}
          </div>
          {nt.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Node Property Editor (Component)
// ---------------------------------------------------------------------------

function NodePropertyEditor({
  node,
  onUpdate,
  onDelete,
  onClose,
}: {
  node: WfNode;
  onUpdate: (node: WfNode) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const nt = NODE_TYPES.find((n) => n.type === node.type);
  const fieldStyle = { backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded" style={{ backgroundColor: `${nt?.color}20`, color: nt?.color }}>
            {nt?.icon}
          </div>
          <p className="text-sm font-bold" style={{ color: "var(--gf-text-primary)" }}>{nt?.label} Properties</p>
        </div>
        <button onClick={onClose} className="p-1 hover:opacity-70" style={{ color: "var(--gf-text-muted)" }}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-secondary)" }}>Label *</label>
        <input type="text" value={node.label} onChange={(e) => onUpdate({ ...node, label: e.target.value })}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
      </div>

      {node.type === "task" && (
        <>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-secondary)" }}>Assignee</label>
            <input type="text" value={node.config.assignee ?? ""} onChange={(e) => onUpdate({ ...node, config: { ...node.config, assignee: e.target.value } })}
              placeholder="e.g. IT Team" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-secondary)" }}>Timeout (hours)</label>
            <input type="text" value={node.config.timeout ?? ""} onChange={(e) => onUpdate({ ...node, config: { ...node.config, timeout: e.target.value } })}
              placeholder="e.g. 24" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>
        </>
      )}

      {node.type === "decision" && (
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-secondary)" }}>Condition</label>
          <input type="text" value={node.config.condition ?? ""} onChange={(e) => onUpdate({ ...node, config: { ...node.config, condition: e.target.value } })}
            placeholder="e.g. amount > 1000" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
        </div>
      )}

      {node.type !== "start" && (
        <button onClick={() => onDelete(node.id)} className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />Remove Node
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Validation Feedback (Component)
// ---------------------------------------------------------------------------

function ValidationFeedback({ errors }: { errors: ValidationError[] }) {
  if (errors.length === 0) return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
      <Check className="h-4 w-4 text-green-500" />
      <span className="text-xs font-medium text-green-500">Workflow is valid</span>
    </div>
  );

  return (
    <div className="space-y-2">
      {errors.map((err, i) => (
        <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <span className="text-xs text-red-500">{err.message}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Canvas (Visual Builder)
// ---------------------------------------------------------------------------

function Canvas({
  nodes,
  edges,
  selectedId,
  onSelect,
  onDrop,
  onMove,
}: {
  nodes: WfNode[];
  edges: WfEdge[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDrop: (type: NodeType, x: number, y: number) => void;
  onMove: (id: string, x: number, y: number) => void;
}) {
  const [dragging, setDragging] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("nodeType") as NodeType;
    if (type) {
      const rect = e.currentTarget.getBoundingClientRect();
      onDrop(type, e.clientX - rect.left - 60, e.clientY - rect.top - 20);
    }
  };

  const nt = (type: NodeType) => NODE_TYPES.find((n) => n.type === type)!;

  return (
    <div
      className="relative w-full h-full min-h-[500px] rounded-xl border overflow-hidden"
      style={{ backgroundColor: "var(--gf-bg-base)", borderColor: "var(--gf-border)", backgroundImage: "radial-gradient(circle, var(--gf-border) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => onSelect(null)}
    >
      {/* Edges (SVG lines) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {edges.map((edge) => {
          const fromNode = nodes.find((n) => n.id === edge.from);
          const toNode = nodes.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;
          return (
            <line key={edge.id} x1={fromNode.x + 60} y1={fromNode.y + 20} x2={toNode.x + 60} y2={toNode.y + 20}
              stroke="var(--gf-accent)" strokeWidth="2" strokeDasharray="6 3" opacity="0.5" />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => {
        const nodeType = nt(node.type);
        const isSelected = selectedId === node.id;
        return (
          <div
            key={node.id}
            className={`absolute flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium cursor-move select-none transition-shadow ${isSelected ? "ring-2 ring-[var(--gf-accent)]" : ""}`}
            style={{
              left: node.x,
              top: node.y,
              backgroundColor: "var(--gf-bg-surface)",
              borderColor: isSelected ? "var(--gf-accent)" : "var(--gf-border)",
              color: "var(--gf-text-primary)",
              zIndex: isSelected ? 10 : 1,
            }}
            onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setDragging(node.id);
              const startX = e.clientX - node.x;
              const startY = e.clientY - node.y;
              const onMouseMove = (ev: MouseEvent) => { onMove(node.id, ev.clientX - startX, ev.clientY - startY); };
              const onMouseUp = () => { setDragging(null); document.removeEventListener("mousemove", onMouseMove); document.removeEventListener("mouseup", onMouseUp); };
              document.addEventListener("mousemove", onMouseMove);
              document.addEventListener("mouseup", onMouseUp);
            }}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded" style={{ backgroundColor: `${nodeType.color}20`, color: nodeType.color }}>
              {nodeType.icon}
            </div>
            <span className="whitespace-nowrap">{node.label}</span>
          </div>
        );
      })}

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Diamond className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: "var(--gf-text-muted)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--gf-text-muted)" }}>Drag nodes from the palette to build your workflow</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Builder Page
// ---------------------------------------------------------------------------

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const [name, setName] = useState("Untitled Workflow");
  const [nodes, setNodes] = useState<WfNode[]>([
    { id: "n1", type: "start", label: "Start", x: 50, y: 200, config: {} },
  ]);
  const [edges, setEdges] = useState<WfEdge[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  let nextId = nodes.length + 1;
  const addNode = useCallback((type: NodeType, x?: number, y?: number) => {
    const id = `n${Date.now()}`;
    const defaultLabels: Record<NodeType, string> = { start: "Start", task: "New Task", decision: "Decision", end: "End" };
    const newNode: WfNode = {
      id, type, label: defaultLabels[type],
      x: x ?? 200 + Math.random() * 200,
      y: y ?? 100 + Math.random() * 200,
      config: {},
    };
    setNodes((prev) => {
      const updated = [...prev, newNode];
      // Auto-connect to last node
      if (prev.length > 0) {
        const lastNode = prev[prev.length - 1];
        setEdges((e) => [...e, { id: `e${Date.now()}`, from: lastNode.id, to: id }]);
      }
      return updated;
    });
  }, []);

  const moveNode = (id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, x: Math.max(0, x), y: Math.max(0, y) } : n));
  };

  const updateNode = (updated: WfNode) => {
    setNodes((prev) => prev.map((n) => n.id === updated.id ? updated : n));
  };

  const deleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
    setSelectedId(null);
  };

  const validate = (): ValidationError[] => {
    const errs: ValidationError[] = [];
    const starts = nodes.filter((n) => n.type === "start");
    const ends = nodes.filter((n) => n.type === "end");
    if (starts.length === 0) errs.push({ message: "Workflow must have a Start node" });
    if (starts.length > 1) errs.push({ message: "Workflow can only have one Start node" });
    if (ends.length === 0) errs.push({ message: "Workflow must have an End node" });
    nodes.forEach((n) => {
      if (!n.label.trim()) errs.push({ nodeId: n.id, message: `Node "${n.type}" is missing a label` });
    });
    if (nodes.length < 3) errs.push({ message: "Workflow needs at least Start, one Task, and End" });
    return errs;
  };

  const handleValidate = () => {
    const errs = validate();
    setValidationErrors(errs);
    setShowValidation(true);
  };

  const handleSave = async (publish: boolean) => {
    const errs = validate();
    setValidationErrors(errs);
    setShowValidation(true);
    if (errs.length > 0) return;

    setSaving(true);
    await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, nodes, edges, status: publish ? "Published" : "Draft" }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); if (publish) router.push("/admin/workflows"); }, 1500);
  };

  return (
    <AuthGuard allowedRoles={["workflow_manager", "super_admin"] as UserRole[]}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/admin/workflows")} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="text-xl font-bold bg-transparent border-none outline-none focus:ring-0" style={{ color: "var(--gf-text-primary)" }} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleValidate} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium hover:opacity-80"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              <Check className="h-3.5 w-3.5" />Validate
            </button>
            <button onClick={() => handleSave(false)} disabled={saving} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium hover:opacity-80 disabled:opacity-50"
              style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Save Draft
            </button>
            <button onClick={() => handleSave(true)} disabled={saving} className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--gf-accent)" }}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}Publish
            </button>
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-xs font-medium text-green-500">Workflow saved successfully!</span>
          </div>
        )}

        {/* Builder Layout */}
        <div className="grid grid-cols-[220px_1fr_260px] gap-4" style={{ height: "calc(100vh - 200px)" }}>
          {/* Left: Node Palette */}
          <div className="rounded-xl border p-4 space-y-4 overflow-y-auto" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            <NodePalette onAdd={(type) => addNode(type)} />

            {showValidation && (
              <div className="pt-4 border-t" style={{ borderColor: "var(--gf-border)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--gf-text-muted)" }}>Validation</p>
                <ValidationFeedback errors={validationErrors} />
              </div>
            )}
          </div>

          {/* Center: Canvas */}
          <Canvas nodes={nodes} edges={edges} selectedId={selectedId} onSelect={setSelectedId} onDrop={(type, x, y) => addNode(type, x, y)} onMove={moveNode} />

          {/* Right: Property Editor */}
          <div className="rounded-xl border p-4 overflow-y-auto" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            {selectedNode ? (
              <NodePropertyEditor node={selectedNode} onUpdate={updateNode} onDelete={deleteNode} onClose={() => setSelectedId(null)} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-50">
                <Circle className="h-8 w-8 mb-3" style={{ color: "var(--gf-text-muted)" }} />
                <p className="text-xs font-medium text-center" style={{ color: "var(--gf-text-muted)" }}>Select a node to edit its properties</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
