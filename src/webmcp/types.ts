/**
 * W3C WebMCP Community Group Draft Specification (2026) Types
 * Reference: https://webmachinelearning.github.io/webmcp/
 */

export interface ToolAnnotations {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
}

export interface ToolExecuteCallbackOptions {
  signal?: AbortSignal;
}

export type ToolExecuteFunction = (
  input: Record<string, any>,
  options: ToolExecuteCallbackOptions
) => Promise<string | Record<string, any> | void>;

export interface ModelContextTool {
  name: string;
  description: string;
  title?: string;
  inputSchema: Record<string, any>;
  execute?: ToolExecuteFunction;
  annotations?: ToolAnnotations;
}

export interface ModelContextRegisterToolOptions {
  signal?: AbortSignal;
  exposedTo?: string[];
}

export interface ModelContextGetToolOptions {
  fromOrigins?: string[];
}

export interface ModelContextExecuteToolOptions {
  signal?: AbortSignal;
}

export interface RegisteredTool {
  name: string;
  description: string;
  title?: string;
  inputSchema: Record<string, any>;
  annotations?: ToolAnnotations;
  origin?: string;
  window?: Window;
  execute?: ToolExecuteFunction;
}

export interface ModelContext extends EventTarget {
  registerTool(
    tool: ModelContextTool,
    options?: ModelContextRegisterToolOptions
  ): Promise<void>;

  getTools(
    options?: ModelContextGetToolOptions
  ): Promise<RegisteredTool[]>;

  executeTool(
    tool: RegisteredTool | string,
    inputObject?: Record<string, any> | string,
    options?: ModelContextExecuteToolOptions
  ): Promise<string>;

  ontoolchange?: ((event: Event) => void) | null;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
  interface Window {
    modelContext?: ModelContext;
  }
}

export interface ProtocolLogEntry {
  id: string;
  timestamp: string;
  type: 'REGISTER' | 'UNREGISTER' | 'EXECUTE' | 'ABORT' | 'DECLARATIVE' | 'EVENT';
  toolName: string;
  details: any;
  status: 'SUCCESS' | 'RUNNING' | 'ABORTED' | 'FAILED';
  durationMs?: number;
}
