import React, { useEffect, useState } from 'react';
import { Server, Database, Cloud, ShieldAlert, Cpu, CheckCircle, Zap } from 'lucide-react';
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
    let base = '';
    if (isSelected) {
      base += ' ring-2 ring-warroom-cyber shadow-[0_0_20px_rgba(0,240,255,0.5)] scale-[1.02] ';
    }
    switch (status) {
      case 'ATTACKED':
        return base + ' border-red-500 bg-red-950/40 text-red-300 shadow-[0_0_15px_rgba(255,51,102,0.3)] animate-pulse';
      case 'DEGRADED':
        return base + ' border-amber-500 bg-amber-950/30 text-amber-300';
      case 'QUARANTINED':
        return base + ' border-cyan-500 bg-cyan-950/40 text-cyan-300 opacity-60';
      case 'HEALTHY':
      default:
        return base + ' border-slate-700/80 bg-slate-900/80 text-slate-200 hover:border-cyan-500/60';
    }
  };

  const getStatusBadge = (status: NodeStatus) => {
    switch (status) {
      case 'ATTACKED':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1">
            <ShieldAlert className="w-2.5 h-2.5" /> ATTACK
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            LOAD
          </span>
        );
      case 'QUARANTINED':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            ISOLATED
          </span>
        );
      case 'HEALTHY':
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle className="w-2.5 h-2.5" /> OK
          </span>
        );
    }
  };

  return (
    <div className="relative w-full h-[580px] bg-warroom-bg rounded-xl border border-warroom-border overflow-hidden select-none shadow-2xl flex flex-col">
      {/* Background Cyber Grid */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #00f0ff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Canvas Top Bar */}
      <div className="relative z-10 px-4 py-2.5 border-b border-warroom-border/80 bg-warroom-card/80 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Infrastructure Topology Map
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            (Click any node to dynamically mount WebMCP tools)
          </span>
        </div>

        {/* Region Indicators */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            US-East-1 <span className="text-red-400 font-bold">• Active</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            EU-Central-1 <span className="text-emerald-400 font-bold">• Standby</span>
          </span>
        </div>
      </div>

      {/* Topology Graph Area */}
      <div className="relative flex-1 p-6">
        {/* SVG Connectors & Traffic Streams */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="edgeGradNormal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="edgeGradSaturated" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff3366" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffaa00" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {state.edges.map((edge: TopologyEdge) => {
            const srcNode = state.nodes.find((n: TopologyNode) => n.id === edge.source);
            const tgtNode = state.nodes.find((n: TopologyNode) => n.id === edge.target);
            if (!srcNode || !tgtNode) return null;

            const isSaturated = edge.status === 'SATURATED';
            const strokeColor = isSaturated ? 'url(#edgeGradSaturated)' : 'url(#edgeGradNormal)';
            const strokeWidth = isSaturated ? 3 : 1.5;

            return (
              <g key={edge.id}>
                {/* Connection Line */}
                <line
                  x1={srcNode.x + 120}
                  y1={srcNode.y + 40}
                  x2={tgtNode.x + 120}
                  y2={tgtNode.y + 10}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isSaturated ? '4,4' : undefined}
                />

                {/* Animated Packet Flow Dot */}
                <circle r={isSaturated ? 3.5 : 2.5} fill={isSaturated ? '#ff3366' : '#00f0ff'}>
                  <animateMotion
                    path={`M ${srcNode.x + 120} ${srcNode.y + 40} L ${tgtNode.x + 120} ${tgtNode.y + 10}`}
                    dur={isSaturated ? '0.8s' : '2.2s'}
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
                className={`absolute w-60 p-3 rounded-lg border backdrop-blur transition-all duration-300 cursor-pointer ${borderStyle}`}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`
                }}
              >
                {/* Node Header */}
                <div className="flex items-start justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-slate-800 text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-mono tracking-tight text-white leading-tight">
                        {node.name}
                      </h4>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">
                        {node.region}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(node.status)}
                </div>

                {/* Micro Gauges */}
                <div className="space-y-1 font-mono text-[10px]">
                  <div className="flex justify-between text-slate-300">
                    <span>CPU Load</span>
                    <span className={node.metrics.cpuPercent > 80 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                      {node.metrics.cpuPercent}%
                    </span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${node.metrics.cpuPercent > 80 ? 'bg-red-500' : 'bg-cyan-400'}`}
                      style={{ width: `${node.metrics.cpuPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-slate-400 pt-1">
                    <span>RPS: {(node.metrics.rps / 1000).toFixed(1)}k</span>
                    <span className={node.metrics.p99LatencyMs > 300 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                      P99: {node.metrics.p99LatencyMs}ms
                    </span>
                  </div>
                </div>

                {/* Contextual Tools Badge */}
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono">
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" />
                    {node.contextualTools.length} WebMCP Tool{node.contextualTools.length > 1 ? 's' : ''}
                  </span>
                  {isSelected && (
                    <span className="text-emerald-400 font-bold uppercase tracking-wider">
                      MOUNTED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Canvas Footer Status */}
      <div className="relative z-10 px-4 py-2 border-t border-warroom-border/80 bg-warroom-card/90 flex items-center justify-between text-xs font-mono text-slate-400">
        <div>
          Vector Target: <span className="text-cyan-300 font-semibold">{state.scenario.targetNodeId}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Active Nodes: {state.nodes.filter((n: TopologyNode) => n.status !== 'QUARANTINED').length} / {state.nodes.length}</span>
          <span className="text-emerald-400">Redundancy: N+1 Verified</span>
        </div>
      </div>
    </div>
  );
};
