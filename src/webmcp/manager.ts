import {
  ModelContext,
  ModelContextTool,
  RegisteredTool,
  ModelContextRegisterToolOptions,
  ModelContextGetToolOptions,
  ModelContextExecuteToolOptions,
  ProtocolLogEntry
} from './types';

type ProtocolSubscriber = (entry: ProtocolLogEntry) => void;
type ToolsChangedSubscriber = (tools: RegisteredTool[]) => void;

class WebMCPManagerImpl extends EventTarget implements ModelContext {
  private toolMap = new Map<string, { tool: ModelContextTool; registeredAt: number; options?: ModelContextRegisterToolOptions }>();
  private logSubscribers: Set<ProtocolSubscriber> = new Set();
  private toolsChangedSubscribers: Set<ToolsChangedSubscriber> = new Set();
  public ontoolchange: ((event: Event) => void) | null = null;
  public isNative: boolean = false;

  constructor() {
    super();
    this.initNativeOrShim();
  }

  private initNativeOrShim() {
    if (typeof window !== 'undefined') {
      if (document.modelContext && typeof document.modelContext.registerTool === 'function') {
        console.log('[WebMCP] Native document.modelContext detected.');
        this.isNative = true;
      } else {
        console.log('[WebMCP] Initializing W3C compliant ModelContext shim.');
        document.modelContext = this as unknown as ModelContext;
        window.modelContext = this as unknown as ModelContext;
        this.isNative = false;
      }
    }
  }

  public subscribeProtocol(callback: ProtocolSubscriber): () => void {
    this.logSubscribers.add(callback);
    return () => this.logSubscribers.delete(callback);
  }

  public subscribeTools(callback: ToolsChangedSubscriber): () => void {
    this.toolsChangedSubscribers.add(callback);
    this.getTools().then(callback);
    return () => this.toolsChangedSubscribers.delete(callback);
  }

  private emitLog(entry: Omit<ProtocolLogEntry, 'id' | 'timestamp'>) {
    const fullEntry: ProtocolLogEntry = {
      ...entry,
      id: `mcp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString()
    };
    this.logSubscribers.forEach((cb) => cb(fullEntry));
  }

  private notifyToolChange() {
    const event = new Event('toolchange');
    this.dispatchEvent(event);
    if (this.ontoolchange) {
      this.ontoolchange(event);
    }
    this.getTools().then((tools) => {
      this.toolsChangedSubscribers.forEach((cb) => cb(tools));
    });
  }

  public async registerTool(
    tool: ModelContextTool,
    options: ModelContextRegisterToolOptions = {}
  ): Promise<void> {
    // 1. Validation per W3C WebMCP § 4.2
    if (!tool.name || tool.name.length === 0 || tool.name.length > 128) {
      throw new DOMException('Tool name must be between 1 and 128 characters.', 'InvalidStateError');
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(tool.name)) {
      throw new DOMException('Tool name contains invalid characters.', 'InvalidStateError');
    }
    if (!tool.description || tool.description.trim().length === 0) {
      throw new DOMException('Tool description cannot be empty.', 'InvalidStateError');
    }
    try {
      JSON.stringify(tool.inputSchema);
    } catch {
      throw new TypeError('inputSchema must be valid JSON-serializable object.');
    }

    if (this.toolMap.has(tool.name)) {
      // Overwriting existing tool or throw if duplicates registered simultaneously
      console.warn(`[WebMCP] Updating existing tool registration: ${tool.name}`);
    }

    // 2. AbortSignal handling for unregistration (§ 4.2.3)
    if (options.signal) {
      if (options.signal.aborted) {
        throw options.signal.reason || new DOMException('Registration aborted', 'AbortError');
      }
      options.signal.addEventListener('abort', () => {
        this.unregisterTool(tool.name, 'SIGNAL_ABORT');
      }, { once: true });
    }

    // 3. Register tool
    this.toolMap.set(tool.name, {
      tool,
      registeredAt: Date.now(),
      options
    });

    this.emitLog({
      type: 'REGISTER',
      toolName: tool.name,
      details: {
        description: tool.description,
        schema: tool.inputSchema,
        annotations: tool.annotations
      },
      status: 'SUCCESS'
    });

    // Also register to native document.modelContext if running alongside native
    if (this.isNative && document.modelContext && document.modelContext !== (this as unknown as ModelContext)) {
      try {
        await document.modelContext.registerTool(tool, options);
      } catch (err) {
        console.warn('[WebMCP] Native registration warning:', err);
      }
    }

    this.notifyToolChange();
  }

  public unregisterTool(name: string, reason: string = 'MANUAL'): void {
    if (this.toolMap.has(name)) {
      this.toolMap.delete(name);
      this.emitLog({
        type: 'UNREGISTER',
        toolName: name,
        details: { reason },
        status: 'SUCCESS'
      });
      this.notifyToolChange();
    }
  }

  public async getTools(_options: ModelContextGetToolOptions = {}): Promise<RegisteredTool[]> {
    const list: RegisteredTool[] = [];
    for (const [name, entry] of this.toolMap.entries()) {
      list.push({
        name,
        description: entry.tool.description,
        title: entry.tool.title || name,
        inputSchema: entry.tool.inputSchema,
        annotations: entry.tool.annotations || { readOnlyHint: false, untrustedContentHint: false },
        origin: typeof window !== 'undefined' ? window.location.origin : 'https://localhost',
        execute: entry.tool.execute
      });
    }
    // Alphabetical order per spec § 4.2
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  public async executeTool(
    toolOrName: RegisteredTool | string,
    inputObject: Record<string, any> | string = {},
    options: ModelContextExecuteToolOptions = {}
  ): Promise<string> {
    const toolName = typeof toolOrName === 'string' ? toolOrName : toolOrName.name;
    const entry = this.toolMap.get(toolName);

    if (!entry || !entry.tool.execute) {
      throw new DOMException(`Tool "${toolName}" is not registered or has no execute callback.`, 'NotFoundError');
    }

    let parsedInput: Record<string, any> = {};
    if (typeof inputObject === 'string') {
      try {
        parsedInput = inputObject.trim().length > 0 ? JSON.parse(inputObject) : {};
      } catch (e) {
        throw new TypeError(`Invalid JSON input string: ${(e as Error).message}`);
      }
    } else {
      parsedInput = inputObject || {};
    }

    const startTime = performance.now();
    this.emitLog({
      type: 'EXECUTE',
      toolName,
      details: { input: parsedInput },
      status: 'RUNNING'
    });

    try {
      if (options.signal?.aborted) {
        throw new DOMException('Tool execution was cancelled before start', 'AbortError');
      }

      const result = await entry.tool.execute(parsedInput, { signal: options.signal });
      const durationMs = Math.round(performance.now() - startTime);

      const serializedResult = typeof result === 'string' ? result : JSON.stringify(result, null, 2);

      this.emitLog({
        type: 'EXECUTE',
        toolName,
        details: { result: serializedResult },
        status: 'SUCCESS',
        durationMs
      });

      return serializedResult;
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      const isAbort = err?.name === 'AbortError' || options.signal?.aborted;

      this.emitLog({
        type: isAbort ? 'ABORT' : 'EXECUTE',
        toolName,
        details: { error: err?.message || String(err) },
        status: isAbort ? 'ABORTED' : 'FAILED',
        durationMs
      });

      throw err;
    }
  }
}

export const webMCPManager = new WebMCPManagerImpl();
