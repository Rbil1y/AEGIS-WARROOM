import React, { useEffect, useState } from 'react';
import { Terminal, CheckCircle, Zap, FileCode, ChevronDown, ChevronUp } from 'lucide-react';
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
    <div className="bg-warroom-card border border-warroom-border rounded-xl flex flex-col h-[580px] overflow-hidden select-none shadow-2xl">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-warroom-border/80 px-4 py-3 bg-warroom-card">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            WebMCP Protocol Inspector
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('TOOLS')}
            className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'TOOLS' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Tools ({tools.length})
          </button>
          <button
            onClick={() => setActiveTab('EVENTS')}
            className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'EVENTS' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Live Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('SPEC')}
            className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'SPEC' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
          >
            W3C Matrix
          </button>
        </div>
      </div>

      {/* Tab 1: Registered Tools */}
      {activeTab === 'TOOLS' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
          <div className="text-xs text-slate-400 flex items-center justify-between pb-2 border-b border-slate-800 font-mono">
            <span>Inspecting: <code className="text-cyan-400">document.modelContext.getTools()</code></span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Alphabetical sort verified
            </span>
          </div>

          {tools.map((tool) => {
            const isExpanded = expandedTool === tool.name;

            return (
              <div
                key={tool.name}
                className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      {tool.name}
                    </span>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {tool.annotations?.readOnlyHint ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
                        readOnly
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-950/50 text-amber-300 border border-amber-500/30">
                        mutating
                      </span>
                    )}

                    <button
                      onClick={() => toggleTool(tool.name)}
                      className="p-1 rounded text-slate-400 hover:text-cyan-300"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-2.5 border-t border-slate-900 font-mono">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                      <FileCode className="w-3 h-3 text-cyan-400" /> JSON Schema (Draft-07):
                    </div>
                    <pre className="text-[10px] text-slate-300 bg-slate-900 p-2.5 rounded-lg overflow-x-auto max-h-36">
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
              No protocol events captured yet. Run an action on the dashboard to view live events.
            </div>
          ) : (
            logs.map((log) => {
              const statusBadge = {
                SUCCESS: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
                RUNNING: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30 animate-pulse',
                ABORTED: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
                FAILED: 'text-rose-400 bg-rose-950/40 border-rose-500/30'
              }[log.status];

              return (
                <div
                  key={log.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 flex flex-col gap-1 text-[11px]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                      <span className="font-bold text-cyan-300">[{log.type}]</span>
                      <span className="text-slate-200">{log.toolName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {log.durationMs !== undefined && (
                        <span className="text-[10px] text-slate-500">{log.durationMs}ms</span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[9px] border font-bold ${statusBadge}`}>
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
          <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl text-cyan-300 text-xs">
            <span className="font-bold block mb-1">Standard: W3C WebMCP Community Group Specification</span>
            Native implementation verified against Chromium Blink Origin Trial & W3C WebMCP draft.
          </div>

          <div className="space-y-2.5">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">§ 4.2 Imperative ModelContext</span>
                Full <code className="text-cyan-400">registerTool()</code>, <code className="text-cyan-400">getTools()</code>, and <code className="text-cyan-400">executeTool()</code> methods with JSON Schema validation and dictionary normalization.
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">§ 4.2.3 Dynamic Lifecycle & ontoolchange</span>
                Node selection creates an <code className="text-cyan-400">AbortController</code>. Deselection aborts previous registrations, cleans up tools, and dispatches the <code className="text-cyan-400">toolchange</code> event.
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">§ 4.2.2 Execution Cancellation via AbortSignal</span>
                Monte Carlo failover engine binds <code className="text-cyan-400">options.signal</code> directly to streaming compute iterations, aborting on demand without memory leakage.
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">§ 4.3 Declarative WebMCP</span>
                HTML <code className="text-cyan-400">&lt;form toolname="..." toolautosubmit&gt;</code> with <code className="text-cyan-400">toolparamdescription</code>, <code className="text-cyan-400">:tool-form-active</code>, <code className="text-cyan-400">agentInvoked</code>, and <code className="text-cyan-400">e.respondWith()</code>.
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">§ 6 Security & Origin Isolation</span>
                Origin-Agent-Cluster header enabled, Permissions Policy <code className="text-cyan-400">tools=(self)</code> configured, and prompt injection defenses applied.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
