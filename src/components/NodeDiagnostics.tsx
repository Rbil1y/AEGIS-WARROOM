import React, { useEffect, useState } from 'react';
import { Zap, Activity, Play, Check } from 'lucide-react';
import { telemetryEngine, TelemetryState } from '../domain/telemetry';
import { webMCPManager } from '../webmcp/manager';
import { useWebMCP } from '../webmcp/useWebMCP';

export const NodeDiagnostics: React.FC = () => {
  const [state, setState] = useState<TelemetryState>(telemetryEngine.getState());
  const [executingTool, setExecutingTool] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  useEffect(() => {
    return telemetryEngine.subscribe(setState);
  }, []);

  const selectedNode = state.nodes.find((n) => n.id === state.selectedNodeId);

  // Mount the contextual tools for the selected node via useWebMCP (§ 4.2.3)
  // When selectedNode changes, the hook's AbortController aborts previous tools and mounts the new node tools!
  const firstTool = selectedNode?.contextualTools[0] || null;
  const secondTool = selectedNode?.contextualTools[1] || null;
  useWebMCP(firstTool, [selectedNode?.id]);
  useWebMCP(secondTool, [selectedNode?.id]);

  const handleExecuteTool = async (toolName: string) => {
    setExecutingTool(toolName);
    setLastResult(null);
    try {
      // Execute via WebMCP Manager
      const res = await webMCPManager.executeTool(toolName, {});
      setLastResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2));

      // If specific tools trigger domain state updates
      if (toolName === 'toggle_under_attack_mode') {
        telemetryEngine.setUnderAttackMode(true);
      } else if (toolName === 'trigger_failover_to_replica') {
        telemetryEngine.failoverDatabase();
      }
    } catch (err: any) {
      setLastResult(`Error: ${err.message || String(err)}`);
    } finally {
      setExecutingTool(null);
    }
  };

  if (!selectedNode) {
    return (
      <div className="p-4 bg-warroom-card border border-warroom-border rounded-xl text-center font-mono text-xs text-slate-400">
        Select a node on the topology to view diagnostics and contextual WebMCP tools.
      </div>
    );
  }

  return (
    <div className="bg-warroom-card border border-warroom-border rounded-xl p-4 flex flex-col gap-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-warroom-border/80">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
            {selectedNode.tierLabel}
          </span>
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            {selectedNode.name}
          </h3>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          ID: {selectedNode.id}
        </span>
      </div>

      {/* Real-Time Metrics Grid */}
      <div className="grid grid-cols-4 gap-2 font-mono text-center">
        <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase block">CPU Usage</span>
          <span className={`text-xs font-bold ${selectedNode.metrics.cpuPercent > 80 ? 'text-red-400' : 'text-cyan-400'}`}>
            {selectedNode.metrics.cpuPercent}%
          </span>
        </div>
        <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase block">Memory</span>
          <span className="text-xs font-bold text-slate-200">
            {selectedNode.metrics.memoryPercent}%
          </span>
        </div>
        <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase block">RPS</span>
          <span className="text-xs font-bold text-slate-200">
            {(selectedNode.metrics.rps / 1000).toFixed(1)}k
          </span>
        </div>
        <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase block">P99 Latency</span>
          <span className={`text-xs font-bold ${selectedNode.metrics.p99LatencyMs > 300 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {selectedNode.metrics.p99LatencyMs}ms
          </span>
        </div>
      </div>

      {/* Contextual WebMCP Tools */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Mounted Contextual WebMCP Tools:
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
            Registered on document.modelContext
          </span>
        </div>

        <div className="space-y-2">
          {selectedNode.contextualTools.map((tool) => (
            <div
              key={tool.name}
              className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 hover:border-cyan-500/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <h4 className="text-xs font-bold font-mono text-cyan-300">
                    {tool.name}()
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {tool.description}
                  </p>
                </div>
                <button
                  onClick={() => handleExecuteTool(tool.name)}
                  disabled={executingTool === tool.name}
                  className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)] disabled:opacity-50"
                >
                  {executingTool === tool.name ? (
                    <>
                      <Activity className="w-3 h-3 animate-spin text-cyan-400" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-cyan-400 text-cyan-400" />
                      Execute Tool
                    </>
                  )}
                </button>
              </div>

              {/* Annotation & Schema Tags */}
              <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-900 text-[9px] font-mono text-slate-500">
                <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                  {tool.annotations?.readOnlyHint ? 'READ-ONLY' : 'MUTATING'}
                </span>
                <span>Params: {Object.keys(tool.inputSchema.properties || {}).join(', ') || 'none'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Output Stream */}
      {lastResult && (
        <div className="bg-slate-950 p-3 rounded-lg border border-warroom-border font-mono text-xs">
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase mb-1">
            <Check className="w-3 h-3" /> Tool Output Result:
          </div>
          <pre className="text-slate-300 whitespace-pre-wrap text-[11px] overflow-x-auto max-h-36">
            {lastResult}
          </pre>
        </div>
      )}
    </div>
  );
};
