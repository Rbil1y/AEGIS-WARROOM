import React, { useEffect, useState } from 'react';
import { Server, Database, Cloud, ShieldAlert, Cpu, CheckCircle2, Zap, ArrowDown, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { telemetryEngine, TelemetryState } from '../domain/telemetry';
import { TopologyNode, NodeStatus, NodeTier } from '../domain/topology';

export const TopologyCanvas: React.FC = () => {
  const [state, setState] = useState<TelemetryState>(telemetryEngine.getState());

  useEffect(() => {
    return telemetryEngine.subscribe(setState);
  }, []);

  const getNodeIcon = (tier: NodeTier) => {
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

  const getStatusStyle = (status: NodeStatus, isSelected: boolean) => {
    let base = 'transition-all duration-200 border rounded-xl p-3.5 cursor-pointer ';
    if (isSelected) {
      base += 'ring-2 ring-blue-500 bg-slate-800 shadow-elevated ';
    } else {
      base += 'bg-slate-900 hover:border-slate-600 hover:bg-slate-800/90 ';
    }

    switch (status) {
      case 'ATTACKED':
        return base + 'border-rose-500 text-white';
      case 'DEGRADED':
        return base + 'border-amber-500 text-white';
      case 'QUARANTINED':
        return base + 'border-indigo-500 text-white';
      case 'HEALTHY':
      default:
        return base + 'border-slate-700 text-white';
    }
  };

  const getStatusBadge = (status: NodeStatus) => {
    switch (status) {
      case 'ATTACKED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 font-sans shrink-0">
            <ShieldAlert className="w-3 h-3 text-rose-400" /> Incident
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-sans shrink-0">
            High Load
          </span>
        );
      case 'QUARANTINED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-sans shrink-0 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-indigo-400" /> Isolated
          </span>
        );
      case 'HEALTHY':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-sans shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Healthy
          </span>
        );
    }
  };

  // Group nodes by tier for structured, spacious rendering
  const tier0Nodes = state.nodes.filter((n) => n.tier === 'TIER_0_EDGE');
  const tier1Nodes = state.nodes.filter((n) => n.tier === 'TIER_1_INGRESS');
  const tier2Nodes = state.nodes.filter((n) => n.tier === 'TIER_2_SERVICES');
  const tier3Nodes = state.nodes.filter((n) => n.tier === 'TIER_3_STORAGE');

  const renderNodeCard = (node: TopologyNode) => {
    const Icon = getNodeIcon(node.tier);
    const isSelected = state.selectedNodeId === node.id;
    const cardClass = getStatusStyle(node.status, isSelected);

    return (
      <div
        key={node.id}
        onClick={() => telemetryEngine.selectNode(node.id)}
        className={`${cardClass} flex flex-col justify-between`}
      >
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-slate-950 text-blue-400 border border-slate-700 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white tracking-tight leading-snug truncate">
                {node.name}
              </h4>
              <span className="text-[11px] text-slate-300 font-mono block truncate">
                {node.region} • <code className="text-blue-300">{node.id}</code>
              </span>
            </div>
          </div>
          {getStatusBadge(node.status)}
        </div>

        {/* Metrics Grid */}
        <div className="space-y-1.5 text-xs font-sans my-1 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <div className="flex justify-between items-center text-slate-200">
            <span className="text-slate-300 text-[11px]">CPU Usage</span>
            <span className={`font-mono font-bold ${node.metrics.cpuPercent > 80 ? 'text-rose-400' : 'text-white'}`}>
              {node.metrics.cpuPercent}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-300 ${node.metrics.cpuPercent > 80 ? 'bg-rose-500' : 'bg-blue-500'}`}
              style={{ width: `${node.metrics.cpuPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center pt-0.5 text-[11px] text-slate-300 font-mono">
            <span>RPS: <strong className="text-white">{(node.metrics.rps / 1000).toFixed(1)}k</strong></span>
            <span className={node.metrics.p99LatencyMs > 300 ? 'text-amber-300 font-bold' : 'text-slate-200'}>
              P99: {node.metrics.p99LatencyMs}ms
            </span>
          </div>
        </div>

        {/* Footer WebMCP Info */}
        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs mt-1">
          <span className="text-slate-300 flex items-center gap-1.5 font-medium">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            {node.contextualTools.length} WebMCP tool{node.contextualTools.length > 1 ? 's' : ''}
          </span>
          {isSelected ? (
            <span className="text-blue-400 font-bold flex items-center gap-1">
              Selected <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          ) : (
            <span className="text-slate-300 hover:text-white transition-colors font-medium">
              Inspect
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-canvas-subtle rounded-xl border border-canvas-border overflow-hidden select-none shadow-card flex flex-col">
      {/* Canvas Top Bar */}
      <div className="px-5 py-3 border-b border-canvas-border bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-xs font-bold text-white tracking-wide font-sans">
            System Architecture & Live Traffic Map
          </span>
          <span className="text-xs text-slate-300 font-sans hidden md:inline">
            — Structured Multi-Tier Topology (Click any node to focus)
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-sans text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-200">Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-medium text-slate-200">Degraded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="font-medium text-slate-200">Attacked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="font-medium text-slate-200">Quarantined</span>
          </div>
        </div>
      </div>

      {/* Structured Tier-Based Canvas Area */}
      <div className="p-6 space-y-5 overflow-y-auto max-h-[620px]">
        {/* TIER 0: GLOBAL EDGE SCRUBBING */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-sans border-b border-slate-800 pb-1">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Cloud className="w-3.5 h-3.5 text-blue-400" />
              Tier 0: Global Anycast Edge (Cloudflare CDN / Scrubbing)
            </span>
            <span className="text-[11px] font-mono text-slate-400">Total Ingress: {(state.globalRps / 1000).toFixed(1)}k RPS</span>
          </div>
          <div className="grid grid-cols-1 max-w-md mx-auto">
            {tier0Nodes.map(renderNodeCard)}
          </div>
        </div>

        {/* Connector Stream 0 -> 1 */}
        <div className="flex justify-center items-center gap-4 text-xs font-mono text-slate-400 py-0.5">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            <ArrowDown className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
            <span>Encrypted mTLS Ingress Route</span>
          </div>
        </div>

        {/* TIER 1: INGRESS ROUTING GATEWAYS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-sans border-b border-slate-800 pb-1">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              Tier 1: Ingress Gateways (Envoy Proxies & TLS Termination)
            </span>
            <span className="text-[11px] font-mono text-slate-400">Multi-Region Failover Pair</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tier1Nodes.map(renderNodeCard)}
          </div>
        </div>

        {/* Connector Stream 1 -> 2 */}
        <div className="flex justify-center items-center gap-4 text-xs font-mono text-slate-400 py-0.5">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            <ArrowDown className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
            <span>gRPC Cluster Workload Distribution</span>
          </div>
        </div>

        {/* TIER 2: BUSINESS LOGIC PODS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-sans border-b border-slate-800 pb-1">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              Tier 2: Kubernetes Microservices (Auth, Payments, Inventory)
            </span>
            <span className="text-[11px] font-mono text-slate-400">Application Layer</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tier2Nodes.map(renderNodeCard)}
          </div>
        </div>

        {/* Connector Stream 2 -> 3 */}
        <div className="flex justify-center items-center gap-4 text-xs font-mono text-slate-400 py-0.5">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            <ArrowDown className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
            <span>Low-Latency Database & Cache Bus</span>
          </div>
        </div>

        {/* TIER 3: STORAGE & PERSISTENCE */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-sans border-b border-slate-800 pb-1">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              Tier 3: Storage & Persistence (PostgreSQL Shards, Redis Ring)
            </span>
            <span className="text-[11px] font-mono text-slate-400">Zero-Loss WAL Replication</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tier3Nodes.map(renderNodeCard)}
          </div>
        </div>
      </div>

      {/* Canvas Footer Status */}
      <div className="px-5 py-2.5 border-t border-canvas-border bg-slate-900 flex items-center justify-between text-xs text-slate-300 font-sans">
        <div className="flex items-center gap-2">
          <span>Target Service:</span>
          <span className="text-rose-300 font-mono font-bold bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40">
            {state.scenario.targetNodeId}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-200 font-mono text-xs">
          <span>Active Nodes: <strong className="text-white">{state.nodes.filter((n) => n.status !== 'QUARANTINED').length}</strong> / {state.nodes.length}</span>
          <span className="text-emerald-400 font-semibold">N+1 Cluster Redundancy Active</span>
        </div>
      </div>
    </div>
  );
};
