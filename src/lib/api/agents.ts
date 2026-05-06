// AI Agents — /api/v1/ai/agents/*. Registry, execution, tools, memory, history.

import { apiClient } from "./client";

export type AgentStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface Agent {
  id: string;
  name: string;
  description: string;
  config: Record<string, unknown>;
  status: AgentStatus | string;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AgentListItem {
  id: string;
  name: string;
  description: string;
  status: AgentStatus | string;
  created_at: string;
  updated_at: string | null;
}

export interface PaginatedAgents {
  items: AgentListItem[];
  pagination: { page: number; page_size: number; total: number };
}

export interface AgentSummary {
  id: string;
  name: string;
  status: AgentStatus | string;
  created_at: string;
}

export interface CreateAgentInput {
  name: string;
  description?: string;
  config?: Record<string, unknown>;
  status?: AgentStatus;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  config?: Record<string, unknown>;
  status?: AgentStatus;
}

// ---- Execution --------------------------------------------------------------

export type AgentRunStatus = "RUNNING" | "SUCCESS" | "FAILED" | string;

export interface AgentRun {
  id: string;
  agent_id: string;
  input_payload: Record<string, unknown>;
  output_result: Record<string, unknown> | string | null;
  status: AgentRunStatus;
  error_message: string | null;
  execution_time_ms: number | null;
  retry_count: number;
  executed_by: string | null;
  created_at: string;
}

export interface AgentExecutionStatus {
  id: string;
  agent_id: string;
  status: AgentRunStatus;
  error_message: string | null;
  execution_time_ms: number | null;
  created_at: string;
}

export interface AgentExecutionHistoryItem {
  id: string;
  status: AgentRunStatus;
  execution_time_ms: number | null;
  error_message: string | null;
  executed_by: string | null;
  created_at: string;
}

export interface PaginatedAgentExecutions {
  items: AgentExecutionHistoryItem[];
  pagination: { page: number; limit: number; total: number };
}

// ---- Tools ------------------------------------------------------------------

export interface AgentTool {
  id: string;
  agent_id: string;
  name: string;
  description: string;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string | null;
}

// ---- Memory -----------------------------------------------------------------

export interface AgentMemoryEntry {
  id: string;
  agent_id: string;
  memory_key: string;
  memory_value: unknown;
  created_at: string;
  updated_at: string | null;
}

// ---- Module -----------------------------------------------------------------

export const agentsApi = {
  list(params: { search?: string; status?: AgentStatus; page?: number; page_size?: number } = {}): Promise<PaginatedAgents> {
    return apiClient.get<PaginatedAgents>("/api/v1/ai/agents/", { query: params as Record<string, unknown> });
  },

  create(input: CreateAgentInput): Promise<AgentSummary> {
    return apiClient.post<AgentSummary>("/api/v1/ai/agents/", input);
  },

  update(agentId: string, input: UpdateAgentInput): Promise<Agent> {
    return apiClient.put<Agent>(`/api/v1/ai/agents/${agentId}`, input);
  },

  // Synchronous execution — backend persists the AgentRun record and returns
  // status/result. Long-running agents typically use 202+poll, but this route
  // returns 201 with the final or in-progress execution.
  run(agentId: string, inputPayload: Record<string, unknown> = {}): Promise<AgentRun> {
    return apiClient.post<AgentRun>(`/api/v1/ai/agents/${agentId}/run`, { input_payload: inputPayload });
  },

  getExecution(executionId: string): Promise<AgentExecutionStatus> {
    return apiClient.get<AgentExecutionStatus>(`/api/v1/ai/agents/executions/${executionId}`);
  },

  history(
    agentId: string,
    params: {
      status?: "SUCCESS" | "FAILED" | "RUNNING";
      from_date?: string;
      to_date?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<PaginatedAgentExecutions> {
    return apiClient.get<PaginatedAgentExecutions>(`/api/v1/ai/agents/${agentId}/history`, {
      query: params as Record<string, unknown>,
    });
  },

  // ---- Tools ---------------------------------------------------------------

  registerTool(
    agentId: string,
    input: { name: string; description?: string; config?: Record<string, unknown> },
  ): Promise<AgentTool> {
    return apiClient.post<AgentTool>(`/api/v1/ai/agents/${agentId}/tools`, input);
  },

  // ---- Memory --------------------------------------------------------------

  listMemory(
    agentId: string,
    params: { memory_key?: string; limit?: number; offset?: number } = {},
  ): Promise<{ items: AgentMemoryEntry[]; count: number }> {
    return apiClient.get(`/api/v1/ai/agents/${agentId}/memory`, { query: params as Record<string, unknown> });
  },

  // Pass `memoryKey` to scope deletion to a single key, or omit to wipe all.
  clearMemory(agentId: string, memoryKey?: string): Promise<{ deleted_count: number }> {
    return apiClient.delete(`/api/v1/ai/agents/${agentId}/memory`, {
      query: memoryKey ? { memory_key: memoryKey } : undefined,
    });
  },
};
