import React, { useEffect, useState } from 'react';
import { Zap, Activity, Play, Check, CornerDownRight } from 'lucide-react';
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

  // Mount contextual tools for selected node via useWebMCP (§ 4.2.3)
  const firstTool = selectedNode?.contextualTools[0] || null;
  const secondTool = selectedNode?.contextualTools[1] || null;
  useWebMCP(firstTool, [selectedNode?.id]);
  useWebMCP(secondTool, [selectedNode?.id]);

  const handleExecuteTool = async (toolName: string) => {
    setExecutingTool(toolName);
    setLastResult(null);
    try {
      const res = await webMCPManager.executeTool(toolName, {});
      setLastResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2));

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
      <div className="p-6 bg-canvas-subtle border border-canvas-border rounded-xl text-center font-sans text-xs text-slate-400">
        Select a node on the topology to view diagnostics and contextual WebMCP tools.
      </div>
    );
  }

  return (
    <div className="bg-canvas-subtle border border-canvas-border rounded-xl p-5 flex flex-col gap-4 select-none shadow-card">
      {/* Node Header */}
      <div className="flex items-start justify-between pb-3 border-b border-canvas-border">
        <div>
          <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-semibold block">
            {selectedNode.tierLabel}
          </span>
          <h3 className="text-sm font-semibold text-white tracking-tight mt-0.5 font-sans">
            {selectedNode.name}
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Cluster: <code className="text-slate-300">{selectedNode.id}</code>
          </span>
        </div>

        <span
          className={`px-2.5 py-1 rounded-md text-xs font-medium font-sans ${
            selectedNode.status === 'ATTACKED'
              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              : selectedNode.status === 'DEGRADED'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : selectedNode.status === 'QUARANTINED'
              ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          {selectedNode.status}
        </span>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
        <div className="bg-canvas-surface p-2.5 rounded-lg border border-canvas-border">
          <span className="text-[10px] text-slate-400 uppercase block mb-0.5">CPU Load</span>
          <span className={`text-sm font-semibold ${selectedNode.metrics.cpuPercent > 80 ? 'text-rose-400' : 'text-white'}`}>
            {selectedNode.metrics.cpuPercent}%
          </span>
        </div>

        <div className="bg-canvas-surface p-2.5 rounded-lg border border-canvas-border">
          <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Memory</span>
          <span className="text-sm font-semibold text-slate-200">
            {selectedNode.metrics.memoryPercent}%
          </span>
        </div>

        <div className="bg-canvas-surface p-2.5 rounded-lg border border-canvas-border">
          <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Traffic</span>
          <span className="text-sm font-semibold text-slate-200">
            {(selectedNode.metrics.rps / 1000).toFixed(1)}k <span className="text-[10px] font-normal text-slate-400">RPS</span>
          </span>
        </div>

        <div className="bg-canvas-surface p-2.5 rounded-lg border border-canvas-border">
          <span className="text-[10px] text-slate-400 uppercase block mb-0.5">P99 Latency</span>
          <span className={`text-sm font-semibold ${selectedNode.metrics.p99LatencyMs > 300 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {selectedNode.metrics.p99LatencyMs}ms
          </span>
        </div>
      </div>

      {/* Mounted Contextual WebMCP Tools */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-sans">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            Mounted Contextual Tools:
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            ontoolchange active
          </span>
        </div>

        <div className="space-y-2">
          {selectedNode.contextualTools.map((tool) => (
            <div
              key={tool.name}
              className="bg-canvas-surface border border-canvas-border rounded-lg p-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div>
                  <h4 className="text-xs font-mono font-medium text-white flex items-center gap-1">
                    <CornerDownRight className="w-3 h-3 text-blue-400" />
                    {tool.name}()
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    {tool.description}
                  </p>
                </div>

                <button
                  onClick={() => handleExecuteTool(tool.name)}
                  disabled={executingTool === tool.name}
                  className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
                >
                  {executingTool === tool.name ? (
                    <>
                      <Activity className="w-3 h-3 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-white" />
                      Run Tool
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-slate-500">
                <span className="px-1.5 py-0.5 rounded bg-canvas-bg text-slate-400">
                  {tool.annotations?.readOnlyHint ? 'READ-ONLY' : 'MUTATING'}
                </span>
                <span>Params: {Object.keys(tool.inputSchema.properties || {}).join(', ') || 'none'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Output Result Box */}
      {lastResult && (
        <div className="bg-canvas-bg p-3 rounded-lg border border-canvas-border font-mono text-xs">
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase mb-1">
            <Check className="w-3 h-3" /> Execution Result:
          </div>
          <pre className="text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap max-h-32 font-mono">
            {lastResult}
          </pre>
        </div>
      )}
    </div>
  );
};
