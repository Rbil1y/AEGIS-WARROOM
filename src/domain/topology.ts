import { ModelContextTool } from '../webmcp/types';

export type NodeTier = 'TIER_0_EDGE' | 'TIER_1_INGRESS' | 'TIER_2_SERVICES' | 'TIER_3_STORAGE';
export type NodeStatus = 'HEALTHY' | 'DEGRADED' | 'ATTACKED' | 'QUARANTINED';

export interface TopologyNode {
  id: string;
  name: string;
  tier: NodeTier;
  tierLabel: string;
  region: 'us-east-1' | 'eu-central-1' | 'ap-south-1';
  status: NodeStatus;
  metrics: {
    cpuPercent: number;
    memoryPercent: number;
    rps: number;
    p99LatencyMs: number;
    errorRatePercent: number;
  };
  contextualTools: ModelContextTool[];
  x: number;
  y: number;
}

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  trafficRate: number; // RPS
  status: 'NORMAL' | 'SATURATED' | 'BLOCKED';
}

export const INITIAL_TOPOLOGY_NODES: TopologyNode[] = [
  // TIER 0: EDGE
  {
    id: 'edge-cloudflare-anycast',
    name: 'Cloudflare Anycast Worker Ingress',
    tier: 'TIER_0_EDGE',
    tierLabel: 'Tier 0: Global Edge',
    region: 'us-east-1',
    status: 'ATTACKED',
    metrics: {
      cpuPercent: 88,
      memoryPercent: 74,
      rps: 142000,
      p99LatencyMs: 410,
      errorRatePercent: 18.4
    },
    x: 180,
    y: 80,
    contextualTools: [
      {
        name: 'toggle_under_attack_mode',
        description: 'Enables Cloudflare I\'m Under Attack Mode (IUAM) requiring managed JS challenges for high-risk ASNs.',
        inputSchema: {
          type: 'object',
          properties: {
            sensitivity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'HIGH' }
          },
          required: ['sensitivity']
        },
        annotations: { readOnlyHint: false }
      },
      {
        name: 'purge_edge_cache_keys',
        description: 'Purges poisoned cache tags across 320+ global Anycast edge PoPs immediately.',
        inputSchema: {
          type: 'object',
          properties: {
            cacheTags: { type: 'string', description: 'Tags to invalidate (e.g. auth-tokens, session-meta)' }
          },
          required: ['cacheTags']
        },
        annotations: { readOnlyHint: false }
      }
    ]
  },

  // TIER 1: INGRESS GATEWAYS
  {
    id: 'gateway-envoy-us-east',
    name: 'Envoy API Gateway (US-East)',
    tier: 'TIER_1_INGRESS',
    tierLabel: 'Tier 1: Ingress Routing',
    region: 'us-east-1',
    status: 'ATTACKED',
    metrics: {
      cpuPercent: 96,
      memoryPercent: 89,
      rps: 94000,
      p99LatencyMs: 680,
      errorRatePercent: 32.1
    },
    x: 180,
    y: 200,
    contextualTools: [
      {
        name: 'rate_limit_ingress_endpoint',
        description: 'Enforces token-bucket rate limits per client IP or ASN on the Envoy gateway.',
        inputSchema: {
          type: 'object',
          properties: {
            burstTokens: { type: 'number', default: 50 },
            sustainedRps: { type: 'number', default: 20 }
          },
          required: ['sustainedRps']
        },
        annotations: { readOnlyHint: false }
      }
    ]
  },
  {
    id: 'gateway-envoy-eu-central',
    name: 'Envoy API Gateway (EU-Central Standby)',
    tier: 'TIER_1_INGRESS',
    tierLabel: 'Tier 1: Ingress Routing',
    region: 'eu-central-1',
    status: 'HEALTHY',
    metrics: {
      cpuPercent: 24,
      memoryPercent: 31,
      rps: 12000,
      p99LatencyMs: 42,
      errorRatePercent: 0.1
    },
    x: 520,
    y: 200,
    contextualTools: [
      {
        name: 'scale_eu_gateway_replicas',
        description: 'Pre-warms and scales Envoy instances in EU-Central ahead of incoming traffic failover.',
        inputSchema: {
          type: 'object',
          properties: {
            replicaCount: { type: 'integer', minimum: 4, maximum: 64, default: 16 }
          },
          required: ['replicaCount']
        },
        annotations: { readOnlyHint: false }
      }
    ]
  },

  // TIER 2: SERVICES
  {
    id: 'auth-pod-cluster',
    name: 'Auth Cluster (k8s Pods / JWT)',
    tier: 'TIER_2_SERVICES',
    tierLabel: 'Tier 2: Business Logic',
    region: 'us-east-1',
    status: 'ATTACKED',
    metrics: {
      cpuPercent: 99,
      memoryPercent: 94,
      rps: 68000,
      p99LatencyMs: 1240,
      errorRatePercent: 48.5
    },
    x: 120,
    y: 340,
    contextualTools: [
      {
        name: 'drain_pod_traffic',
        description: 'Immediately halts ingress to the auth-service pods and activates circuit breaker fallback.',
        inputSchema: {
          type: 'object',
          properties: {
            gracePeriodSeconds: { type: 'integer', default: 5 }
          }
        },
        annotations: { readOnlyHint: false }
      },
      {
        name: 'inspect_thread_dump',
        description: 'Extracts real-time JVM / Go heap dumps to identify deadlocks and cryptographic salt hashing bottlenecks.',
        inputSchema: {
          type: 'object',
          properties: {
            depth: { type: 'string', enum: ['SUMMARY', 'FULL_STACK'], default: 'SUMMARY' }
          }
        },
        annotations: { readOnlyHint: true }
      }
    ]
  },
  {
    id: 'payment-service-pod',
    name: 'PCI-DSS Payment Gateway Pod',
    tier: 'TIER_2_SERVICES',
    tierLabel: 'Tier 2: Business Logic',
    region: 'us-east-1',
    status: 'DEGRADED',
    metrics: {
      cpuPercent: 71,
      memoryPercent: 65,
      rps: 22000,
      p99LatencyMs: 310,
      errorRatePercent: 6.2
    },
    x: 320,
    y: 340,
    contextualTools: [
      {
        name: 'toggle_payment_circuit_breaker',
        description: 'Engages asynchronous queuing mode for payments to shield merchant settlement gateways from spikes.',
        inputSchema: {
          type: 'object',
          properties: {
            asyncQueueMode: { type: 'boolean', default: true }
          },
          required: ['asyncQueueMode']
        },
        annotations: { readOnlyHint: false }
      }
    ]
  },
  {
    id: 'inventory-service-pod',
    name: 'Inventory & Order Engine',
    tier: 'TIER_2_SERVICES',
    tierLabel: 'Tier 2: Business Logic',
    region: 'us-east-1',
    status: 'HEALTHY',
    metrics: {
      cpuPercent: 38,
      memoryPercent: 42,
      rps: 14000,
      p99LatencyMs: 55,
      errorRatePercent: 0.3
    },
    x: 520,
    y: 340,
    contextualTools: [
      {
        name: 'flush_local_lru_cache',
        description: 'Flushes stale in-memory inventory counters across worker nodes.',
        inputSchema: { type: 'object', properties: {} },
        annotations: { readOnlyHint: false }
      }
    ]
  },

  // TIER 3: PERSISTENCE & STORAGE
  {
    id: 'postgres-primary-01',
    name: 'PostgreSQL Primary Shard 01',
    tier: 'TIER_3_STORAGE',
    tierLabel: 'Tier 3: Storage & Persistence',
    region: 'us-east-1',
    status: 'DEGRADED',
    metrics: {
      cpuPercent: 82,
      memoryPercent: 88,
      rps: 31000,
      p99LatencyMs: 440,
      errorRatePercent: 4.8
    },
    x: 180,
    y: 480,
    contextualTools: [
      {
        name: 'trigger_failover_to_replica',
        description: 'Promotes EU-Central read-replica to master and demotes degraded US-East primary with zero WAL data loss.',
        inputSchema: {
          type: 'object',
          properties: {
            forcePromotion: { type: 'boolean', default: false }
          }
        },
        annotations: { readOnlyHint: false }
      },
      {
        name: 'kill_expensive_queries',
        description: 'Terminates client connections holding active locks exceeding 2000ms threshold.',
        inputSchema: {
          type: 'object',
          properties: {
            maxQueryDurationMs: { type: 'number', default: 2000 }
          }
        },
        annotations: { readOnlyHint: false }
      }
    ]
  },
  {
    id: 'redis-sentinel-cluster',
    name: 'Redis Sentinel Cluster (Token Ring)',
    tier: 'TIER_3_STORAGE',
    tierLabel: 'Tier 3: Storage & Persistence',
    region: 'us-east-1',
    status: 'DEGRADED',
    metrics: {
      cpuPercent: 78,
      memoryPercent: 91,
      rps: 82000,
      p99LatencyMs: 195,
      errorRatePercent: 2.1
    },
    x: 420,
    y: 480,
    contextualTools: [
      {
        name: 'flush_expired_tokens',
        description: 'Forces non-blocking key eviction of expired session tokens.',
        inputSchema: { type: 'object', properties: {} },
        annotations: { readOnlyHint: false }
      }
    ]
  }
];

export const INITIAL_TOPOLOGY_EDGES: TopologyEdge[] = [
  { id: 'e1', source: 'edge-cloudflare-anycast', target: 'gateway-envoy-us-east', trafficRate: 110000, status: 'SATURATED' },
  { id: 'e2', source: 'edge-cloudflare-anycast', target: 'gateway-envoy-eu-central', trafficRate: 32000, status: 'NORMAL' },
  { id: 'e3', source: 'gateway-envoy-us-east', target: 'auth-pod-cluster', trafficRate: 68000, status: 'SATURATED' },
  { id: 'e4', source: 'gateway-envoy-us-east', target: 'payment-service-pod', trafficRate: 22000, status: 'NORMAL' },
  { id: 'e5', source: 'gateway-envoy-eu-central', target: 'inventory-service-pod', trafficRate: 14000, status: 'NORMAL' },
  { id: 'e6', source: 'auth-pod-cluster', target: 'redis-sentinel-cluster', trafficRate: 55000, status: 'SATURATED' },
  { id: 'e7', source: 'payment-service-pod', target: 'postgres-primary-01', trafficRate: 21000, status: 'NORMAL' }
];
