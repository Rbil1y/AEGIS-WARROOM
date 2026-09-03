import React, { useEffect, useState } from 'react';
import { Server, Database, Cloud, ShieldAlert, Cpu, CheckCircle2, Zap, ArrowUpRight } from 'lucide-react';
import { telemetryEngine, TelemetryState } from '../domain/telemetry';
import { TopologyNode, TopologyEdge, NodeStatus } from '../domain/topology';

export const TopologyCanvas: React.FC = () => {
  const [state, setState] = useState<TelemetryState>(telemetryEngine.getState());

  useEffect(() => {
    return telemetryEngine.subscribe(setState);
  }, []);

  const getNodeIcon = (tier: string) => {
    switch (tier) {
      case 'TIER_0_EDGE':
        return Cloud;
      case 'TIER_1_INGRESS':
        return Zap;
      case 'TIER_2_SERVICES':
        return Cpu;
      case 'TIER_3_STORAGE':
        return Database;
      default:
        return Server;
    }
  };

  const getStatusBorder = (status: NodeStatus, isSelected: boolean) => {
    let base = 'transition-all duration-200 ';
    if (isSelected) {
      base += 'ring-2 ring-blue-500 bg-canvas-elevated shadow-elevated ';
    } else {
      base += 'bg-canvas-surface hover:border-slate-700 hover:bg-canvas-elevated ';
    }

    switch (status) {
      case 'ATTACKED':
        return base + 'border-rose-500/80 text-rose-200';
      case 'DEGRADED':
        return base + 'border-amber-500/80 text-amber-200';
      case 'QUARANTINED':
        return base + 'border-indigo-500/70 text-indigo-200 opacity-80';
      case 'HEALTHY':
      default:
        return base + 'border-canvas-border text-slate-200';
    }
  };

  const getStatusBadge = (status: NodeStatus) => {
    switch (status) {
      case 'ATTACKED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 font-sans">
            <ShieldAlert className="w-3 h-3" /> Incident
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 font-sans">
            High Load
          </span>
        );
      case 'QUARANTINED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-sans">
            Isolated
          </span>
        );
      case 'HEALTHY':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-sans">
            <CheckCircle2 className="w-3 h-3" /> Healthy
          </span>
        );
    }
  };

  return (
    <div className="relative w-full h-[580px] bg-canvas-subtle rounded-xl border border-canvas-border overflow-hidden select-none shadow-card flex flex-col">
      {/* Canvas Top Bar */}
      <div className="relative z-10 px-5 py-3 border-b border-canvas-border bg-canvas-surface/80 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold text-white tracking-wide font-sans">
            System Architecture & Live Traffic Map
          </span>
          <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
            — Select node to inspect live WebMCP tools
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3.5 text-xs font-sans text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Degraded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Attacked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Quarantined</span>
          </div>
        </div>
      </div>

      {/* Topology Graph Area */}
      <div className="relative flex-1 p-6">
        {/* SVG Connectors & Traffic Streams */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {state.edges.map((edge: TopologyEdge) => {
            const srcNode = state.nodes.find((n: TopologyNode) => n.id === edge.source);
            const tgtNode = state.nodes.find((n: TopologyNode) => n.id === edge.target);
            if (!srcNode || !tgtNode) return null;

            const isSaturated = edge.status === 'SATURATED';
            const strokeColor = isSaturated ? '#ef4444' : '#334155';
            const strokeWidth = isSaturated ? 2.5 : 1.5;

            return (
              <g key={edge.id}>
                {/* Traffic Path Line */}
                <line
                  x1={srcNode.x + 130}
                  y1={srcNode.y + 45}
                  x2={tgtNode.x + 130}
                  y2={tgtNode.y + 10}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isSaturated ? '4,4' : undefined}
                />

                {/* Subtle Flow Particle */}
                <circle r={isSaturated ? 3.5 : 2.5} fill={isSaturated ? '#ef4444' : '#60a5fa'}>
                  <animateMotion
                    path={`M ${srcNode.x + 130} ${srcNode.y + 45} L ${tgtNode.x + 130} ${tgtNode.y + 10}`}
                    dur={isSaturated ? '1.0s' : '2.4s'}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        <div className="relative z-10 w-full h-full">
          {state.nodes.map((node: TopologyNode) => {
            const Icon = getNodeIcon(node.tier);
            const isSelected = state.selectedNodeId === node.id;
            const borderStyle = getStatusBorder(node.status, isSelected);

            return (
              <div
                key={node.id}
                onClick={() => telemetryEngine.selectNode(node.id)}
                className={`absolute w-64 p-3.5 rounded-xl border cursor-pointer ${borderStyle}`}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`
                }}
              >
                {/* Node Header */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-canvas-bg text-blue-400 border border-canvas-border">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white tracking-tight leading-snug">
                        {node.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {node.region}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(node.status)}
                </div>

                {/* Metrics Bar */}
                <div className="space-y-1.5 text-[11px] font-sans">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-[10px] text-slate-400">CPU Usage</span>
                    <span className={`font-mono font-medium ${node.metrics.cpuPercent > 80 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {node.metrics.cpuPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${node.metrics.cpuPercent > 80 ? 'bg-rose-500' : 'bg-blue-500'}`}
                      style={{ width: `${node.metrics.cpuPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-1 text-[10px] text-slate-400 font-mono">
                    <span>Traffic: <strong className="text-slate-200">{(node.metrics.rps / 1000).toFixed(1)}k</strong> RPS</span>
                    <span className={node.metrics.p99LatencyMs > 300 ? 'text-amber-400 font-medium' : 'text-slate-300'}>
                      P99: {node.metrics.p99LatencyMs}ms
                    </span>
                  </div>
                </div>

                {/* Footer WebMCP Info */}
                <div className="mt-2.5 pt-2 border-t border-canvas-border/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1 text-[10px] font-medium">
                    <Zap className="w-3 h-3 text-blue-400" />
                    {node.contextualTools.length} WebMCP tool{node.contextualTools.length > 1 ? 's' : ''}
                  </span>
                  {isSelected ? (
                    <span className="text-blue-400 text-[10px] font-semibold flex items-center gap-0.5">
                      Selected <ArrowUpRight className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[10px] hover:text-slate-300 transition-colors">
                      Inspect
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Canvas Footer Status */}
      <div className="relative z-10 px-5 py-2.5 border-t border-canvas-border bg-canvas-surface/80 flex items-center justify-between text-xs text-slate-400 font-sans">
        <div className="flex items-center gap-2">
          <span>Target Service:</span>
          <span className="text-rose-400 font-mono font-medium bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            {state.scenario.targetNodeId}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-300 font-mono text-[11px]">
          <span>Online Nodes: <strong>{state.nodes.filter((n: TopologyNode) => n.status !== 'QUARANTINED').length}</strong> / {state.nodes.length}</span>
          <span className="text-emerald-400">N+1 Cluster Redundancy Active</span>
        </div>
      </div>
    </div>
  );
};
