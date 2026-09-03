import { TopologyNode, TopologyEdge, INITIAL_TOPOLOGY_NODES, INITIAL_TOPOLOGY_EDGES } from './topology';
import { AttackScenario, ATTACK_SCENARIOS } from './attacks';

export interface TelemetryState {
  scenario: AttackScenario;
  threatLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'STABLE';
  globalRps: number;
  p99LatencyMs: number;
  errorRatePercent: number;
  mitigationPercent: number;
  activeWafRules: { id: string; name: string; expression: string; action: string; timestamp: string }[];
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  selectedNodeId: string | null;
  incidentTimerSeconds: number;
  isUnderAttackMode: boolean;
  quarantinedSubnets: string[];
}

type TelemetrySubscriber = (state: TelemetryState) => void;

class TelemetryEngine {
  private state: TelemetryState = {
    scenario: ATTACK_SCENARIOS[0],
    threatLevel: 'CRITICAL',
    globalRps: ATTACK_SCENARIOS[0].initialMetrics.globalRps,
    p99LatencyMs: ATTACK_SCENARIOS[0].initialMetrics.p99LatencyMs,
    errorRatePercent: ATTACK_SCENARIOS[0].initialMetrics.errorRatePercent,
    mitigationPercent: 0,
    activeWafRules: [],
    nodes: JSON.parse(JSON.stringify(INITIAL_TOPOLOGY_NODES)),
    edges: JSON.parse(JSON.stringify(INITIAL_TOPOLOGY_EDGES)),
    selectedNodeId: 'auth-pod-cluster',
    incidentTimerSeconds: 142,
    isUnderAttackMode: false,
    quarantinedSubnets: []
  };

  private subscribers: Set<TelemetrySubscriber> = new Set();
  private intervalId: any = null;

  constructor() {
    this.startHeartbeat();
  }

  public subscribe(cb: TelemetrySubscriber): () => void {
    this.subscribers.add(cb);
    cb(this.state);
    return () => this.subscribers.delete(cb);
  }

  private notify() {
    this.subscribers.forEach((cb) => cb({ ...this.state }));
  }

  private startHeartbeat() {
    if (typeof window === 'undefined') return;

    this.intervalId = setInterval(() => {
      this.state.incidentTimerSeconds += 1;

      // Add realistic stochastic jitter to metrics
      const jitter = (Math.random() - 0.5) * 4;
      if (this.state.threatLevel !== 'STABLE') {
        this.state.p99LatencyMs = Math.max(35, Math.round(this.state.p99LatencyMs + jitter * 3));
        this.state.globalRps = Math.max(10000, Math.round(this.state.globalRps + (Math.random() - 0.5) * 800));
      }

      this.notify();
    }, 1000);
  }

  public stopHeartbeat() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public getState(): TelemetryState {
    return { ...this.state };
  }

  public selectScenario(id: string) {
    const scenario = ATTACK_SCENARIOS.find((s) => s.id === id) || ATTACK_SCENARIOS[0];
    this.state.scenario = scenario;
    this.state.threatLevel = scenario.threatLevel;
    this.state.globalRps = scenario.initialMetrics.globalRps;
    this.state.p99LatencyMs = scenario.initialMetrics.p99LatencyMs;
    this.state.errorRatePercent = scenario.initialMetrics.errorRatePercent;
    this.state.mitigationPercent = 0;
    this.state.selectedNodeId = scenario.targetNodeId;
    this.state.nodes = JSON.parse(JSON.stringify(INITIAL_TOPOLOGY_NODES));
    this.state.edges = JSON.parse(JSON.stringify(INITIAL_TOPOLOGY_EDGES));
    this.state.activeWafRules = [];
    this.state.quarantinedSubnets = [];
    this.state.incidentTimerSeconds = 0;

    // Set target node to ATTACKED
    const target = this.state.nodes.find((n) => n.id === scenario.targetNodeId);
    if (target) {
      target.status = 'ATTACKED';
    }

    this.notify();
  }

  public selectNode(nodeId: string | null) {
    this.state.selectedNodeId = nodeId;
    this.notify();
  }

  public applyWafRule(ruleName: string, expression: string, action: string) {
    this.state.activeWafRules.push({
      id: `waf-${Date.now()}`,
      name: ruleName,
      expression,
      action,
      timestamp: new Date().toLocaleTimeString()
    });

    // Reduce malicious ingress
    this.state.globalRps = Math.round(this.state.globalRps * 0.45);
    this.state.errorRatePercent = Math.max(1.5, Number((this.state.errorRatePercent * 0.25).toFixed(1)));
    this.state.p99LatencyMs = Math.max(65, Math.round(this.state.p99LatencyMs * 0.55));
    this.state.mitigationPercent = Math.min(100, this.state.mitigationPercent + 45);

    // Update attacked nodes to DEGRADED
    this.state.nodes.forEach((n) => {
      if (n.status === 'ATTACKED') n.status = 'DEGRADED';
    });

    if (this.state.mitigationPercent >= 80) {
      this.state.threatLevel = 'STABLE';
    } else {
      this.state.threatLevel = 'ELEVATED';
    }

    this.notify();
  }

  public rebalanceTraffic(sourceRegion: string, targetRegion: string, percentage: number) {
    console.log(`[Telemetry] Rebalancing ${percentage}% traffic from ${sourceRegion} to ${targetRegion}`);
    this.state.edges.forEach((edge) => {
      if (edge.source.includes('cloudflare')) {
        if (edge.target.includes('eu-central')) {
          edge.trafficRate += 65000;
          edge.status = 'NORMAL';
        } else if (edge.target.includes('us-east')) {
          edge.trafficRate = Math.max(10000, edge.trafficRate - 65000);
          edge.status = 'NORMAL';
        }
      }
    });

    const euGateway = this.state.nodes.find((n) => n.id === 'gateway-envoy-eu-central');
    if (euGateway) {
      euGateway.metrics.rps += 65000;
      euGateway.metrics.cpuPercent = 58;
    }

    this.state.mitigationPercent = Math.min(100, this.state.mitigationPercent + 30);
    this.state.p99LatencyMs = Math.max(45, Math.round(this.state.p99LatencyMs * 0.6));
    this.state.errorRatePercent = Math.max(0.4, Number((this.state.errorRatePercent * 0.3).toFixed(1)));

    if (this.state.mitigationPercent >= 80) {
      this.state.threatLevel = 'STABLE';
    }

    this.notify();
  }

  public quarantineNode(subnetId: string, region: string) {
    console.log(`[Telemetry] Quarantining subnet ${subnetId} -> Failover: ${region}`);
    this.state.quarantinedSubnets.push(subnetId);

    this.state.nodes.forEach((n) => {
      if (n.id.includes(subnetId) || subnetId.includes(n.id) || n.id === this.state.selectedNodeId) {
        n.status = 'QUARANTINED';
        n.metrics.errorRatePercent = 0;
        n.metrics.rps = 0;
      }
    });

    this.state.mitigationPercent = 100;
    this.state.threatLevel = 'STABLE';
    this.state.errorRatePercent = 0.05;
    this.state.p99LatencyMs = 48;

    this.notify();
  }

  public setUnderAttackMode(enabled: boolean) {
    this.state.isUnderAttackMode = enabled;
    if (enabled) {
      this.state.globalRps = Math.round(this.state.globalRps * 0.5);
      this.state.errorRatePercent = Math.max(0.8, Number((this.state.errorRatePercent * 0.3).toFixed(1)));
    }
    this.notify();
  }

  public failoverDatabase() {
    const pg = this.state.nodes.find((n) => n.id === 'postgres-primary-01');
    if (pg) {
      pg.status = 'HEALTHY';
      pg.name = 'PostgreSQL Read Replica (Promoted to Master)';
      pg.region = 'eu-central-1';
      pg.metrics.p99LatencyMs = 38;
      pg.metrics.errorRatePercent = 0.1;
      pg.metrics.cpuPercent = 34;
    }
    this.state.mitigationPercent = Math.min(100, this.state.mitigationPercent + 50);
    if (this.state.mitigationPercent >= 80) this.state.threatLevel = 'STABLE';
    this.notify();
  }
}

export const telemetryEngine = new TelemetryEngine();
