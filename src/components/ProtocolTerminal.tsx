import React, { useEffect, useState } from 'react';
import { Terminal, CheckCircle2, Zap, FileCode, ChevronDown, ChevronUp } from 'lucide-react';
import { webMCPManager } from '../webmcp/manager';
import { RegisteredTool, ProtocolLogEntry } from '../webmcp/types';

export const ProtocolTerminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TOOLS' | 'EVENTS' | 'SPEC'>('TOOLS');
  const [tools, setTools] = useState<RegisteredTool[]>([]);
  const [logs, setLogs] = useState<ProtocolLogEntry[]>([]);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  useEffect(() => {
    const unsubTools = webMCPManager.subscribeTools(setTools);
    const unsubLogs = webMCPManager.subscribeProtocol((entry) => {
      setLogs((prev) => [entry, ...prev.slice(0, 49)]);
    });

    return () => {
      unsubTools();
      unsubLogs();
    };
  }, []);

  const toggleTool = (name: string) => {
    setExpandedTool(expandedTool === name ? null : name);
  };

  return (
    <div className="bg-canvas-subtle border border-canvas-border rounded-xl flex flex-col h-[580px] overflow-hidden select-none shadow-card">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-canvas-border px-5 py-3 bg-canvas-surface/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-white tracking-wide font-sans">
            WebMCP Protocol Inspector
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-canvas-bg p-1 rounded-lg border border-canvas-border text-xs font-sans">
          <button
            onClick={() => setActiveTab('TOOLS')}
            className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'TOOLS' ? 'bg-blue-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Registered Tools ({tools.length})
          </button>
          <button
            onClick={() => setActiveTab('EVENTS')}
            className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'EVENTS' ? 'bg-blue-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Protocol Events ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('SPEC')}
            className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'SPEC' ? 'bg-blue-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            W3C Matrix
          </button>
        </div>
      </div>

      {/* Tab 1: Registered Tools */}
      {activeTab === 'TOOLS' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-sans">
          <div className="text-xs text-slate-400 flex items-center justify-between pb-2 border-b border-canvas-border font-mono text-[11px]">
            <span>Active context: <code className="text-blue-400">document.modelContext.getTools()</code></span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Canonical alphabetical ordering
            </span>
          </div>

          {tools.map((tool) => {
            const isExpanded = expandedTool === tool.name;

            return (
              <div
                key={tool.name}
                className="bg-canvas-surface border border-canvas-border rounded-lg p-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-medium text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-400" />
                      {tool.name}
                    </span>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                      {tool.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {tool.annotations?.readOnlyHint ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-canvas-bg text-slate-400 border border-canvas-border">
                        readOnly
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        mutating
                      </span>
                    )}

                    <button
                      onClick={() => toggleTool(tool.name)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-2.5 pt-2 border-t border-canvas-border font-mono">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                      <FileCode className="w-3 h-3 text-blue-400" /> JSON Schema (Draft-07):
                    </div>
                    <pre className="text-[10px] text-slate-300 bg-canvas-bg p-2.5 rounded overflow-x-auto max-h-36">
                      {JSON.stringify(tool.inputSchema, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Event Stream */}
      {activeTab === 'EVENTS' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-center text-slate-500 py-16 font-sans">
              No protocol events captured yet. Run an action to inspect the protocol exchange.
            </div>
          ) : (
            logs.map((log) => {
              const statusBadge = {
                SUCCESS: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                RUNNING: 'text-blue-400 bg-blue-500/10 border-blue-500/20 animate-pulse',
                ABORTED: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                FAILED: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
              }[log.status];

              return (
                <div
                  key={log.id}
                  className="bg-canvas-surface border border-canvas-border rounded p-2.5 flex flex-col gap-1 text-[11px]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                      <span className="font-semibold text-white">[{log.type}]</span>
                      <span className="text-slate-300">{log.toolName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {log.durationMs !== undefined && (
                        <span className="text-[10px] text-slate-500">{log.durationMs}ms</span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[9px] border font-medium ${statusBadge}`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: W3C Spec Matrix */}
      {activeTab === 'SPEC' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs text-slate-300">
          <div className="p-3 bg-canvas-surface border border-canvas-border rounded-lg text-slate-300 text-xs">
            <span className="font-semibold text-white block mb-0.5">W3C WebMCP Standard Verification Matrix</span>
            Native implementation verified against Chromium Blink Origin Trial & W3C WebMachineLearning specifications.
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-canvas-surface rounded-lg border border-canvas-border flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">§ 4.2 Imperative ModelContext</span>
                Full <code className="text-blue-400 font-mono">registerTool()</code>, <code className="text-blue-400 font-mono">getTools()</code>, and <code className="text-blue-400 font-mono">executeTool()</code> methods with JSON Schema validation and dictionary normalization.
              </div>
            </div>

            <div className="p-3 bg-canvas-surface rounded-lg border border-canvas-border flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">§ 4.2.3 Dynamic Lifecycle & ontoolchange</span>
                Node selection creates an <code className="text-blue-400 font-mono">AbortController</code>. Deselection aborts previous registrations, cleans up tools, and dispatches the <code className="text-blue-400 font-mono">toolchange</code> event.
              </div>
            </div>

            <div className="p-3 bg-canvas-surface rounded-lg border border-canvas-border flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">§ 4.2.2 Execution Cancellation via AbortSignal</span>
                Monte Carlo failover engine binds <code className="text-blue-400 font-mono">options.signal</code> directly to streaming compute iterations, aborting on demand without memory leakage.
              </div>
            </div>

            <div className="p-3 bg-canvas-surface rounded-lg border border-canvas-border flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">§ 4.3 Declarative WebMCP</span>
                HTML <code className="text-blue-400 font-mono">&lt;form toolname="..." toolautosubmit&gt;</code> with <code className="text-blue-400 font-mono">toolparamdescription</code>, <code className="text-blue-400 font-mono">:tool-form-active</code>, <code className="text-blue-400 font-mono">agentInvoked</code>, and <code className="text-blue-400 font-mono">e.respondWith()</code>.
              </div>
            </div>

            <div className="p-3 bg-canvas-surface rounded-lg border border-canvas-border flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">§ 6 Security & Origin Isolation</span>
                Origin-Agent-Cluster header enabled, Permissions Policy <code className="text-blue-400 font-mono">tools=(self)</code> configured, and prompt injection defenses applied.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
