"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type OnConnect,
  Handle,
  Position,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
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
import { ApiError, workflowsApi } from "@/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WfNodeType = "start" | "task" | "decision" | "end";

interface NodeData {
  label: string;
  nodeType: WfNodeType;
  config: Record<string, string>;
}

interface ValidationError {
  nodeId?: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Node Palette (Component)
// ---------------------------------------------------------------------------

const NODE_DEFS: { type: WfNodeType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: "start", label: "Start", icon: <Play className="h-4 w-4" />, color: "#22c55e" },
  { type: "task", label: "Task", icon: <Square className="h-4 w-4" />, color: "#3b82f6" },
  { type: "decision", label: "Decision", icon: <Diamond className="h-4 w-4" />, color: "#f59e0b" },
  { type: "end", label: "End", icon: <StopCircle className="h-4 w-4" />, color: "#ef4444" },
];

function NodePalette() {
  const onDragStart = (event: React.DragEvent, nodeType: WfNodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--gf-text-muted)" }}>Node Palette</p>
      {NODE_DEFS.map((nt) => (
        <div
          key={nt.type}
          draggable
          onDragStart={(e) => onDragStart(e, nt.type)}
          className="flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:opacity-80 cursor-grab active:cursor-grabbing"
          style={{ borderColor: "var(--gf-border)", color: "var(--gf-text-primary)" }}
        >
          <GripVertical className="h-3 w-3" style={{ color: "var(--gf-text-muted)" }} />
          <div className="flex h-6 w-6 items-center justify-center rounded" style={{ backgroundColor: `${nt.color}20`, color: nt.color }}>
            {nt.icon}
          </div>
          {nt.label}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom React Flow Nodes
// ---------------------------------------------------------------------------

function StartNode({ data, selected }: { data: NodeData; selected: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${selected ? "ring-2 ring-[var(--gf-accent)]" : ""}`}
      style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: selected ? "var(--gf-accent)" : "var(--gf-border)", color: "var(--gf-text-primary)" }}>
      <div className="flex h-6 w-6 items-center justify-center rounded" style={{ backgroundColor: "#22c55e20", color: "#22c55e" }}>
        <Play className="h-4 w-4" />
      </div>
      <span className="whitespace-nowrap">{data.label}</span>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-green-500" />
    </div>
  );
}

function TaskNode({ data, selected }: { data: NodeData; selected: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${selected ? "ring-2 ring-[var(--gf-accent)]" : ""}`}
      style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: selected ? "var(--gf-accent)" : "var(--gf-border)", color: "var(--gf-text-primary)" }}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-blue-500" />
      <div className="flex h-6 w-6 items-center justify-center rounded" style={{ backgroundColor: "#3b82f620", color: "#3b82f6" }}>
        <Square className="h-4 w-4" />
      </div>
      <span className="whitespace-nowrap">{data.label}</span>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-blue-500" />
    </div>
  );
}

function DecisionNode({ data, selected }: { data: NodeData; selected: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${selected ? "ring-2 ring-[var(--gf-accent)]" : ""}`}
      style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: selected ? "var(--gf-accent)" : "var(--gf-border)", color: "var(--gf-text-primary)" }}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-amber-500" />
      <div className="flex h-6 w-6 items-center justify-center rounded" style={{ backgroundColor: "#f59e0b20", color: "#f59e0b" }}>
        <Diamond className="h-4 w-4" />
      </div>
      <span className="whitespace-nowrap">{data.label}</span>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-amber-500" />
      <Handle type="source" position={Position.Bottom} id="no" className="!w-2 !h-2 !bg-red-500" />
    </div>
  );
}

function EndNode({ data, selected }: { data: NodeData; selected: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${selected ? "ring-2 ring-[var(--gf-accent)]" : ""}`}
      style={{ backgroundColor: "var(--gf-bg-surface)", borderColor: selected ? "var(--gf-accent)" : "var(--gf-border)", color: "var(--gf-text-primary)" }}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-red-500" />
      <div className="flex h-6 w-6 items-center justify-center rounded" style={{ backgroundColor: "#ef444420", color: "#ef4444" }}>
        <StopCircle className="h-4 w-4" />
      </div>
      <span className="whitespace-nowrap">{data.label}</span>
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
  node: Node<NodeData>;
  onUpdate: (id: string, data: Partial<NodeData>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const nt = NODE_DEFS.find((n) => n.type === node.data.nodeType);
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
        <input type="text" value={node.data.label} onChange={(e) => onUpdate(node.id, { label: e.target.value })}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
      </div>

      {node.data.nodeType === "task" && (
        <>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-secondary)" }}>Assignee</label>
            <input type="text" value={node.data.config.assignee ?? ""} onChange={(e) => onUpdate(node.id, { config: { ...node.data.config, assignee: e.target.value } })}
              placeholder="e.g. IT Team" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-secondary)" }}>Timeout (hours)</label>
            <input type="text" value={node.data.config.timeout ?? ""} onChange={(e) => onUpdate(node.id, { config: { ...node.data.config, timeout: e.target.value } })}
              placeholder="e.g. 24" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
          </div>
        </>
      )}

      {node.data.nodeType === "decision" && (
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--gf-text-secondary)" }}>Condition</label>
          <input type="text" value={node.data.config.condition ?? ""} onChange={(e) => onUpdate(node.id, { config: { ...node.data.config, condition: e.target.value } })}
            placeholder="e.g. amount > 1000" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--gf-accent)]/40" style={fieldStyle} />
        </div>
      )}

      {node.data.nodeType !== "start" && (
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
// Main Builder Page
// ---------------------------------------------------------------------------

const initialNodes: Node<NodeData>[] = [
  {
    id: "n1",
    type: "startNode",
    position: { x: 50, y: 200 },
    data: { label: "Start", nodeType: "start", config: {} },
  },
];

const initialEdges: Edge[] = [];

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [name, setName] = useState("Untitled Workflow");
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      startNode: StartNode,
      taskNode: TaskNode,
      decisionNode: DecisionNode,
      endNode: EndNode,
    }),
    []
  );

  const typeToNodeType: Record<WfNodeType, string> = {
    start: "startNode",
    task: "taskNode",
    decision: "decisionNode",
    end: "endNode",
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          { ...connection, markerEnd: { type: MarkerType.ArrowClosed }, animated: true, style: { stroke: "var(--gf-accent)" } },
          eds
        )
      );
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow") as WfNodeType;
      if (!type) return;

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const defaultLabels: Record<WfNodeType, string> = { start: "Start", task: "New Task", decision: "Decision", end: "End" };
      const newNode: Node<NodeData> = {
        id: `n${Date.now()}`,
        type: typeToNodeType[type],
        position,
        data: { label: defaultLabels[type], nodeType: type, config: {} },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const updateNodeData = (id: string, dataUpdate: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...dataUpdate } } : n
      )
    );
  };

  const deleteNode = (id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedNodeId(null);
  };

  const validate = (): ValidationError[] => {
    const errs: ValidationError[] = [];
    const starts = nodes.filter((n) => n.data.nodeType === "start");
    const ends = nodes.filter((n) => n.data.nodeType === "end");
    if (starts.length === 0) errs.push({ message: "Workflow must have a Start node" });
    if (starts.length > 1) errs.push({ message: "Workflow can only have one Start node" });
    if (ends.length === 0) errs.push({ message: "Workflow must have an End node" });
    nodes.forEach((n) => {
      if (!n.data.label.trim()) errs.push({ nodeId: n.id, message: `Node "${n.data.nodeType}" is missing a label` });
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
    try {
      // Topologically sort nodes by edge ordering so the steps go to the
      // backend in execution order. Falls back to declaration order if the
      // graph has cycles or disconnected nodes.
      const adj = new Map<string, string[]>();
      const incoming = new Map<string, number>();
      nodes.forEach((n) => {
        adj.set(n.id, []);
        incoming.set(n.id, 0);
      });
      edges.forEach((e) => {
        adj.get(e.source)?.push(e.target);
        incoming.set(e.target, (incoming.get(e.target) ?? 0) + 1);
      });
      const queue: string[] = [];
      incoming.forEach((c, id) => {
        if (c === 0) queue.push(id);
      });
      const ordered: string[] = [];
      while (queue.length) {
        const id = queue.shift()!;
        ordered.push(id);
        for (const next of adj.get(id) ?? []) {
          incoming.set(next, (incoming.get(next) ?? 0) - 1);
          if (incoming.get(next) === 0) queue.push(next);
        }
      }
      const orderedIds = ordered.length === nodes.length ? ordered : nodes.map((n) => n.id);
      const steps = orderedIds.map((id, idx) => {
        const n = nodes.find((x) => x.id === id);
        return { step_name: (n?.data.label as string) ?? `Step ${idx + 1}`, order: idx + 1 };
      });

      const payload = {
        name,
        description: publish ? "Published workflow" : "Draft workflow",
        steps,
      };

      if (editId) {
        await workflowsApi.update(editId, payload);
      } else {
        await workflowsApi.create(payload);
      }

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        if (publish) router.push("/workflow");
      }, 1500);
    } catch (err) {
      // Surface as a console error; the existing UI doesn't have a toast slot.
      console.error("Failed to save workflow:", err instanceof ApiError ? err.message : err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["workflow_manager", "super_admin"] as UserRole[]}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/workflow")} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: "var(--gf-text-secondary)" }}>
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
            <NodePalette />

            {showValidation && (
              <div className="pt-4 border-t" style={{ borderColor: "var(--gf-border)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--gf-text-muted)" }}>Validation</p>
                <ValidationFeedback errors={validationErrors} />
              </div>
            )}
          </div>

          {/* Center: React Flow Canvas */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--gf-border)" }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              deleteKeyCode="Delete"
              style={{ backgroundColor: "var(--gf-bg-base)" }}
            >
              <Background gap={20} size={1} color="var(--gf-border)" />
              <Controls />
              <MiniMap
                nodeStrokeWidth={3}
                style={{ backgroundColor: "var(--gf-bg-surface)" }}
              />
            </ReactFlow>
          </div>

          {/* Right: Property Editor */}
          <div className="rounded-xl border p-4 overflow-y-auto" style={{ borderColor: "var(--gf-border)", backgroundColor: "var(--gf-bg-surface)" }}>
            {selectedNode ? (
              <NodePropertyEditor node={selectedNode} onUpdate={updateNodeData} onDelete={deleteNode} onClose={() => setSelectedNodeId(null)} />
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
