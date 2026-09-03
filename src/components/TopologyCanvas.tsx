import React, { useEffect, useState } from 'react';
import { Server, Database, Cloud, ShieldAlert, Cpu, CheckCircle, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
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
    let base = 'transition-all duration-300 ';
    if (isSelected) {
      base += 'ring-2 ring-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.4)] scale-[1.03] z-20 ';
    }
    switch (status) {
      case 'ATTACKED':
        return base + 'border-red-500 bg-red-950/40 text-red-200 shadow-[0_0_20px_rgba(255,51,102,0.3)] animate-pulse';
      case 'DEGRADED':
        return base + 'border-amber-500/80 bg-amber-950/30 text-amber-200';
      case 'QUARANTINED':
        return base + 'border-cyan-500/70 bg-cyan-950/40 text-cyan-200 opacity-75';
      case 'HEALTHY':
      default:
        return base + 'border-slate-800 bg-slate-900/80 text-slate-200 hover:border-cyan-500/50 hover:bg-slate-900';
    }
  };

  const getStatusBadge = (status: NodeStatus) => {
    switch (status) {
      case 'ATTACKED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/50 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-red-400" /> ACTIVE ATTACK
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/50">
            HIGH LOAD
          </span>
        );
      case 'QUARANTINED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" /> QUARANTINED
          </span>
        );
      case 'HEALTHY':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> HEALTHY
          </span>
        );
    }
  };

  return (
    <div className="relative w-full h-[580px] bg-warroom-bg rounded-xl border border-warroom-border overflow-hidden select-none shadow-2xl flex flex-col">
      {/* Background Subtle Cyber Grid */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #00f0ff 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* Canvas Top Bar */}
      <div className="relative z-10 px-5 py-3 border-b border-warroom-border/80 bg-warroom-card/90 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Live Cloud Infrastructure Topology
          </span>
          <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
            — Click any node to inspect & mount contextual WebMCP tools
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-sans">
          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Healthy</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Degraded</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span>Attacked</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Quarantined</span>
          </div>
        </div>
      </div>

      {/* Topology Graph Area */}
      <div className="relative flex-1 p-6">
        {/* SVG Connectors & Traffic Streams */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="edgeGradNormal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="edgeGradSaturated" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff3366" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffaa00" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {state.edges.map((edge: TopologyEdge) => {
            const srcNode = state.nodes.find((n: TopologyNode) => n.id === edge.source);
            const tgtNode = state.nodes.find((n: TopologyNode) => n.id === edge.target);
            if (!srcNode || !tgtNode) return null;

            const isSaturated = edge.status === 'SATURATED';
            const strokeColor = isSaturated ? 'url(#edgeGradSaturated)' : 'url(#edgeGradNormal)';
            const strokeWidth = isSaturated ? 3.5 : 1.8;

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
                  strokeDasharray={isSaturated ? '5,4' : undefined}
                />

                {/* Animated Packet Stream Particle */}
                <circle r={isSaturated ? 4 : 3} fill={isSaturated ? '#ff3366' : '#00f0ff'}>
                  <animateMotion
                    path={`M ${srcNode.x + 130} ${srcNode.y + 45} L ${tgtNode.x + 130} ${tgtNode.y + 10}`}
                    dur={isSaturated ? '0.75s' : '2.0s'}
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
                className={`absolute w-64 p-3.5 rounded-xl border backdrop-blur-md cursor-pointer ${borderStyle}`}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`
                }}
              >
                {/* Node Header */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800/80 text-cyan-400 border border-slate-700/60">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-mono tracking-tight text-white leading-tight">
                        {node.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {node.region} • {node.tierLabel.split(':')[0]}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(node.status)}
                </div>

                {/* Micro Gauges & Metrics */}
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-[10px] text-slate-400">CPU Usage</span>
                    <span className={`font-bold ${node.metrics.cpuPercent > 80 ? 'text-red-400' : 'text-cyan-300'}`}>
                      {node.metrics.cpuPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${node.metrics.cpuPercent > 80 ? 'bg-red-500' : 'bg-cyan-400'}`}
                      style={{ width: `${node.metrics.cpuPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-1 text-[10px] text-slate-400">
                    <span>Traffic: <strong className="text-white">{(node.metrics.rps / 1000).toFixed(1)}k</strong> RPS</span>
                    <span className={node.metrics.p99LatencyMs > 300 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                      P99: {node.metrics.p99LatencyMs}ms
                    </span>
                  </div>
                </div>

                {/* Contextual Tools Badge */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[10px]">
                  <span className="text-cyan-300 font-semibold flex items-center gap-1 font-mono">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    {node.contextualTools.length} Contextual Tool{node.contextualTools.length > 1 ? 's' : ''}
                  </span>
                  {isSelected ? (
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      FOCUSED <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  ) : (
                    <span className="text-slate-500 hover:text-cyan-400 transition-colors">
                      Click to inspect
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Canvas Footer Status */}
      <div className="relative z-10 px-5 py-2.5 border-t border-warroom-border/80 bg-warroom-card/95 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span>Active Attack Target:</span>
          <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            {state.scenario.targetNodeId}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>Online Nodes: <strong className="text-white">{state.nodes.filter((n: TopologyNode) => n.status !== 'QUARANTINED').length}</strong> / {state.nodes.length}</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Multi-Region Failover Armed
          </span>
        </div>
      </div>
    </div>
  );
};
