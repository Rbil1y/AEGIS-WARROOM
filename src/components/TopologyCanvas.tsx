import React, { useEffect, useState } from 'react';
import { Server, Database, Cloud, ShieldAlert, Cpu, CheckCircle2, Zap, ArrowRight, ArrowDown, ShieldCheck, GitBranch } from 'lucide-react';
import { telemetryEngine, TelemetryState } from '../domain/telemetry';
import { TopologyNode, NodeStatus, NodeTier } from '../domain/topology';

export const TopologyCanvas: React.FC = () => {
  const [state, setState] = useState<TelemetryState>(telemetryEngine.getState());
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

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

  const getStatusBadge = (status: NodeStatus) => {
    switch (status) {
      case 'ATTACKED':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 font-sans shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Attacked
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-sans shrink-0">
            High Load
          </span>
        );
      case 'QUARANTINED':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-sans shrink-0 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Isolated
          </span>
        );
      case 'HEALTHY':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-sans shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Healthy
          </span>
        );
    }
  };

  const selectedNode = state.nodes.find((n) => n.id === state.selectedNodeId) || state.nodes[0];

  // Derive dependency chain for currently selected or hovered node
  const activeFocusId = hoveredNodeId || state.selectedNodeId;
  const isNodeInActiveChain = (nodeId: string) => {
    if (!activeFocusId) return true;
    if (activeFocusId === nodeId) return true;
    if (activeFocusId.includes('auth') || activeFocusId.includes('payment') || activeFocusId.includes('postgres') || activeFocusId.includes('redis')) {
      if (nodeId.includes('cloudflare') || nodeId.includes('us-east')) return true;
    }
    if (activeFocusId.includes('inventory')) {
      if (nodeId.includes('cloudflare') || nodeId.includes('eu-central')) return true;
    }
    return false;
  };

  // Dedicated node render function
  const renderCard = (node: TopologyNode, extraLabel?: string) => {
    const Icon = getNodeIcon(node.tier);
    const isSelected = state.selectedNodeId === node.id;
    const isHighlighted = isNodeInActiveChain(node.id);

    return (
      <div
        key={node.id}
        onClick={() => telemetryEngine.selectNode(node.id)}
        onMouseEnter={() => setHoveredNodeId(node.id)}
        onMouseLeave={() => setHoveredNodeId(null)}
        className={`transition-all duration-200 border rounded-xl p-3.5 cursor-pointer flex flex-col justify-between shadow-sm relative ${
          isSelected
            ? 'ring-2 ring-blue-500 bg-slate-800 shadow-elevated border-blue-400'
            : isHighlighted
            ? 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
            : 'bg-slate-950/80 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
        } ${node.status === 'ATTACKED' ? 'border-rose-500' : ''}`}
      >
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-slate-950 text-blue-400 border border-slate-700 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white tracking-tight leading-snug truncate">
                  {node.name}
                </h4>
              </div>
              <span className="text-[11px] text-slate-300 font-mono block truncate">
                {extraLabel || node.region} • <code className="text-blue-300 font-bold">{node.id}</code>
              </span>
            </div>
          </div>
          {getStatusBadge(node.status)}
        </div>

        {/* Real-time Metrics Box */}
        <div className="my-1.5 bg-slate-950/90 p-2.5 rounded-lg border border-slate-800 space-y-1.5 font-mono text-xs">
          <div className="flex justify-between items-center text-slate-200">
            <span className="text-slate-300 text-[11px] font-sans">CPU Saturation</span>
            <span className={`font-bold ${node.metrics.cpuPercent > 80 ? 'text-rose-400' : 'text-white'}`}>
              {node.metrics.cpuPercent}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-300 ${node.metrics.cpuPercent > 80 ? 'bg-rose-500' : 'bg-blue-500'}`}
              style={{ width: `${node.metrics.cpuPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center pt-0.5 text-[11px] text-slate-300">
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
            <span className="text-blue-400 font-bold text-xs flex items-center gap-1">
              Active Focus ✓
            </span>
          ) : (
            <span className="text-slate-400 hover:text-white transition-colors font-medium text-xs">
              Click to mount tools
            </span>
          )}
        </div>
      </div>
    );
  };

  const edgeNode = state.nodes.find((n) => n.id === 'edge-cloudflare-anycast')!;
  const usEastGateway = state.nodes.find((n) => n.id === 'gateway-envoy-us-east')!;
  const euCentralGateway = state.nodes.find((n) => n.id === 'gateway-envoy-eu-central')!;
  const authPod = state.nodes.find((n) => n.id === 'auth-pod-cluster')!;
  const paymentPod = state.nodes.find((n) => n.id === 'payment-service-pod')!;
  const inventoryPod = state.nodes.find((n) => n.id === 'inventory-service-pod')!;
  const pgPrimary = state.nodes.find((n) => n.id === 'postgres-primary-01')!;
  const redisRing = state.nodes.find((n) => n.id === 'redis-sentinel-cluster')!;

  return (
    <div className="bg-canvas-subtle rounded-xl border border-canvas-border overflow-hidden select-none shadow-card flex flex-col">
      {/* Canvas Top Bar */}
      <div className="px-5 py-3 border-b border-canvas-border bg-slate-900 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide font-sans">
            Interactive Cloud Architecture & Traffic Flow
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-sans text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-200">Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-semibold text-slate-200">High Load</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-semibold text-rose-300">Active Attack</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="font-semibold text-indigo-300">Quarantined</span>
          </div>
        </div>
      </div>

      {/* Crystal-Clear Active Dependency Path Banner */}
      <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-sans overflow-x-auto gap-4">
        <div className="flex items-center gap-2 text-slate-300 shrink-0">
          <GitBranch className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-white">Active Traffic Path:</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs overflow-x-auto text-slate-200">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-blue-300 font-bold">
            Cloudflare Anycast (142k RPS)
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className={`px-2 py-0.5 rounded border font-bold ${
            selectedNode.id.includes('eu-central') || selectedNode.id.includes('inventory')
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300 animate-pulse'
          }`}>
            {selectedNode.id.includes('eu-central') || selectedNode.id.includes('inventory')
              ? 'Envoy EU-Central (12k RPS)'
              : 'Envoy US-East (94k RPS - SATURATED)'}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/40 text-blue-300 font-bold">
            Target: {selectedNode.name}
          </span>
        </div>

        <div className="text-xs text-slate-300 font-sans shrink-0 hidden lg:block">
          Select node to inspect its specific WebMCP tools
        </div>
      </div>

      {/* Structured Architecture Map Canvas */}
      <div className="p-6 space-y-6 overflow-y-auto max-h-[640px]">
        {/* TIER 0: GLOBAL EDGE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-sans">
              <Cloud className="w-4 h-4 text-blue-400" />
              1. Global Anycast Edge Scrubbing (Cloudflare Workers)
            </span>
            <span className="text-xs font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Total Global Ingress: <strong className="text-white">{(state.globalRps / 1000).toFixed(1)}k RPS</strong>
            </span>
          </div>

          <div className="max-w-xl mx-auto">
            {renderCard(edgeNode, 'Global Ingress Point')}
          </div>
        </div>

        {/* Clear Multi-Region Split Connectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Left Branch Header */}
          <div className="bg-rose-950/30 border border-rose-500/30 rounded-lg p-2 flex items-center justify-between text-xs font-sans">
            <span className="font-bold text-rose-300 flex items-center gap-1.5">
              <ArrowDown className="w-4 h-4 text-rose-400 animate-bounce" />
              Primary Ingress Pipe: US-East-1 (Attacked Target)
            </span>
            <span className="text-xs font-mono text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40 font-bold">
              94,000 RPS Saturated
            </span>
          </div>

          {/* Right Branch Header */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-2 flex items-center justify-between text-xs font-sans">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
              <ArrowDown className="w-4 h-4 text-emerald-400" />
              Failover Standby Pipe: EU-Central-1 (Healthy Standby)
            </span>
            <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
              12,000 RPS Normal
            </span>
          </div>
        </div>

        {/* TIER 1 & 2 & 3: TWO CLEAR REGIONAL SWINLANES */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* US-EAST REGIONAL PIPELINE (7 Cols) */}
          <div className="md:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                Region: US-East-1 (Primary Workloads)
              </span>
              <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-bold">
                INCIDENT SEVERITY HIGH
              </span>
            </div>

            {/* Ingress Gateway */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase block font-mono">
                Tier 1: Ingress Routing Proxy
              </span>
              {renderCard(usEastGateway, 'TLS Termination & Auth Rate Limiting')}
            </div>

            {/* Route indicator */}
            <div className="flex justify-center py-1">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                <span>Internal Service Mesh (k8s Clustered Routes)</span>
              </div>
            </div>

            {/* Tier 2: Microservices Grid */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase block font-mono">
                Tier 2: Business Logic Services
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderCard(authPod, 'OAuth2 & JWT Verification')}
                {renderCard(paymentPod, 'PCI-DSS Payment Processor')}
              </div>
            </div>

            {/* Route indicator */}
            <div className="flex justify-center py-1">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                <span>Persistence Data Bus (TCP Socket Pool)</span>
              </div>
            </div>

            {/* Tier 3: Storage Grid */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase block font-mono">
                Tier 3: Database & Cache Shards
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderCard(redisRing, 'Distributed Token Cache Ring')}
                {renderCard(pgPrimary, 'PostgreSQL Primary Shard 01')}
              </div>
            </div>
          </div>

          {/* EU-CENTRAL REGIONAL PIPELINE (5 Cols) */}
          <div className="md:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Region: EU-Central-1 (Standby)
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                100% CAPACITY AVAILABLE
              </span>
            </div>

            {/* Ingress Gateway */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase block font-mono">
                Tier 1: Standby Gateway
              </span>
              {renderCard(euCentralGateway, 'Frankfurt Anycast Node (Pre-warmed)')}
            </div>

            {/* Route indicator */}
            <div className="flex justify-center py-1">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>Standby Workload Absorber</span>
              </div>
            </div>

            {/* Tier 2: Inventory Pod */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase block font-mono">
                Tier 2: Backup Microservices
              </span>
              {renderCard(inventoryPod, 'Inventory & Order Engine')}
            </div>

            {/* Failover Rebalancing Card */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-sans space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Automated Failover Target
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                When the operator or WebMCP agent executes <code className="text-blue-300 font-mono font-bold">rebalance_traffic_load</code>, Cloudflare sheds 80% ingress from US-East into this cluster without service interruption.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Footer Status */}
      <div className="px-5 py-3 border-t border-canvas-border bg-slate-900 flex items-center justify-between text-xs text-slate-300 font-sans flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span>Active Incident Target:</span>
          <span className="text-rose-300 font-mono font-bold bg-rose-500/20 px-2.5 py-0.5 rounded border border-rose-500/40">
            {state.scenario.targetNodeId}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-200 font-mono text-xs">
          <span>Online Nodes: <strong className="text-white">{state.nodes.filter((n) => n.status !== 'QUARANTINED').length}</strong> / {state.nodes.length}</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Multi-Region Failover Armed
          </span>
        </div>
      </div>
    </div>
  );
};
