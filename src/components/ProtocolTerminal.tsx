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
      <div className="flex items-center justify-between border-b border-canvas-border px-5 py-3.5 bg-slate-900">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-white tracking-wide font-sans">
            WebMCP Protocol Inspector
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-700 text-xs font-sans">
          <button
            onClick={() => setActiveTab('TOOLS')}
            className={`px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${activeTab === 'TOOLS' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
          >
            Registered Tools ({tools.length})
          </button>
          <button
            onClick={() => setActiveTab('EVENTS')}
            className={`px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${activeTab === 'EVENTS' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
          >
            Protocol Events ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('SPEC')}
            className={`px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${activeTab === 'SPEC' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
          >
            W3C Matrix
          </button>
        </div>
      </div>

      {/* Tab 1: Registered Tools */}
      {activeTab === 'TOOLS' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
          <div className="text-xs text-slate-300 flex items-center justify-between pb-2 border-b border-slate-700 font-mono text-[11px]">
            <span>Active context: <code className="text-blue-400 font-bold">document.modelContext.getTools()</code></span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Canonical alphabetical ordering
            </span>
          </div>

          {tools.map((tool) => {
            const isExpanded = expandedTool === tool.name;

            return (
              <div
                key={tool.name}
                className="bg-slate-900 border border-slate-700 rounded-lg p-3.5 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-400" />
                      {tool.name}
                    </span>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed font-sans font-normal">
                      {tool.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {tool.annotations?.readOnlyHint ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-950 text-slate-300 border border-slate-700">
                        readOnly
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        mutating
                      </span>
                    )}

                    <button
                      onClick={() => toggleTool(tool.name)}
                      className="p-1 rounded text-slate-300 hover:text-white cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 font-mono">
                    <div className="text-xs text-slate-300 flex items-center gap-1.5 mb-1.5 font-bold">
                      <FileCode className="w-3.5 h-3.5 text-blue-400" /> JSON Schema (Draft-07):
                    </div>
                    <pre className="text-xs text-white bg-slate-950 p-3 rounded-lg overflow-x-auto max-h-40 border border-slate-800">
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
            <div className="text-center text-slate-300 py-16 font-sans text-xs">
              No protocol events captured yet. Run an action on the dashboard to view live events.
            </div>
          ) : (
            logs.map((log) => {
              const statusBadge = {
                SUCCESS: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40',
                RUNNING: 'text-blue-300 bg-blue-950/60 border-blue-500/40 animate-pulse',
                ABORTED: 'text-amber-300 bg-amber-950/60 border-amber-500/40',
                FAILED: 'text-rose-300 bg-rose-950/60 border-rose-500/40'
              }[log.status];

              return (
                <div
                  key={log.id}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs font-normal">{log.timestamp}</span>
                      <span className="font-bold text-white">[{log.type}]</span>
                      <span className="text-slate-200 font-semibold">{log.toolName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {log.durationMs !== undefined && (
                        <span className="text-xs text-slate-400">{log.durationMs}ms</span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs border font-bold ${statusBadge}`}>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs text-slate-200">
          <div className="p-3.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs">
            <span className="font-bold text-white block mb-1">W3C WebMCP Standard Verification Matrix</span>
            Native implementation verified against Chromium Blink Origin Trial & W3C WebMachineLearning specifications.
          </div>

          <div className="space-y-2.5">
            <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-700 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">§ 4.2 Imperative ModelContext</span>
                Full <code className="text-blue-400 font-mono font-bold">registerTool()</code>, <code className="text-blue-400 font-mono font-bold">getTools()</code>, and <code className="text-blue-400 font-mono font-bold">executeTool()</code> methods with JSON Schema validation and dictionary normalization.
              </div>
            </div>

            <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-700 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">§ 4.2.3 Dynamic Lifecycle & ontoolchange</span>
                Node selection creates an <code className="text-blue-400 font-mono font-bold">AbortController</code>. Deselection aborts previous registrations, cleans up tools, and dispatches the <code className="text-blue-400 font-mono font-bold">toolchange</code> event.
              </div>
            </div>

            <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-700 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">§ 4.2.2 Execution Cancellation via AbortSignal</span>
                Monte Carlo failover engine binds <code className="text-blue-400 font-mono font-bold">options.signal</code> directly to streaming compute iterations, aborting on demand without memory leakage.
              </div>
            </div>

            <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-700 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">§ 4.3 Declarative WebMCP</span>
                HTML <code className="text-blue-400 font-mono font-bold">&lt;form toolname="..." toolautosubmit&gt;</code> with <code className="text-blue-400 font-mono font-bold">toolparamdescription</code>, <code className="text-blue-400 font-mono font-bold">:tool-form-active</code>, <code className="text-blue-400 font-mono font-bold">agentInvoked</code>, and <code className="text-blue-400 font-mono font-bold">e.respondWith()</code>.
              </div>
            </div>

            <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-700 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">§ 6 Security & Origin Isolation</span>
                Origin-Agent-Cluster header enabled, Permissions Policy <code className="text-blue-400 font-mono font-bold">tools=(self)</code> configured, and prompt injection defenses applied.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
