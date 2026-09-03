export interface AttackScenario {
  id: string;
  name: string;
  codeName: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED';
  vector: string;
  targetNodeId: string;
  description: string;
  recommendedActions: string[];
  initialMetrics: {
    globalRps: number;
    p99LatencyMs: number;
    errorRatePercent: number;
    threatSeverity: number; // 0 - 100
  };
}

export const ATTACK_SCENARIOS: AttackScenario[] = [
  {
    id: 'titan-l7-flood',
    name: 'Operation Titan: L7 Rapid Reset & Auth Ingress Flood',
    codeName: 'TITAN-L7',
    threatLevel: 'CRITICAL',
    vector: 'HTTP/2 RST_STREAM Rapid Reset + GraphQL Batching Amplification',
    targetNodeId: 'auth-pod-cluster',
    description: 'Malicious distributed botnet spanning 14,000 IPs is flooding the Auth Ingress with randomized JWT validation payloads, causing 99% CPU saturation and 48.5% 5xx errors.',
    recommendedActions: [
      'Inspect incoming packet heuristics via trace_network_packets',
      'Synthesize and deploy Cloudflare Edge WAF challenge rule',
      'Execute Monte Carlo failover simulation with simulate_failover_latency',
      'Rebalance 80% ingress traffic to healthy EU-Central gateway',
      'Execute Declarative Break-Glass Quarantine on auth-ingress-us-east-1'
    ],
    initialMetrics: {
      globalRps: 184000,
      p99LatencyMs: 890,
      errorRatePercent: 28.4,
      threatSeverity: 94
    }
  },
  {
    id: 'hydra-sql-exhaustion',
    name: 'Operation Hydra: Database Connection Pool Starvation',
    codeName: 'HYDRA-SQL',
    threatLevel: 'HIGH',
    vector: 'Distributed Slowloris Connection Holding + Blind SQLi Injection',
    targetNodeId: 'postgres-primary-01',
    description: 'Threat actor is maintaining 4,000 half-open TCP connections holding exclusive row locks on Postgres Primary Shard 01, driving query latency to 1,400ms.',
    recommendedActions: [
      'Select Postgres Primary node to mount database contextual tools',
      'Execute kill_expensive_queries via WebMCP',
      'Run trigger_failover_to_replica to promote standby replica',
      'Deploy rate limit policy on Envoy API Gateway'
    ],
    initialMetrics: {
      globalRps: 92000,
      p99LatencyMs: 1420,
      errorRatePercent: 19.8,
      threatSeverity: 82
    }
  },
  {
    id: 'phantom-cache-poison',
    name: 'Operation Phantom: Edge Cache Poisoning & Key Exhaustion',
    codeName: 'PHANTOM-CACHE',
    threatLevel: 'ELEVATED',
    vector: 'HTTP Header Smuggling (X-Forwarded-Host) + Cache Invalidation Flood',
    targetNodeId: 'edge-cloudflare-anycast',
    description: 'Adversaries are exploiting unkeyed headers to poison Anycast edge CDN caches with spoofed redirect payloads, causing intermittent user hijackings.',
    recommendedActions: [
      'Select Edge Cloudflare node to expose purge_edge_cache_keys tool',
      'Enable Cloudflare I\'m Under Attack Mode (IUAM)',
      'Deploy WAF rule filtering mutated X-Forwarded headers'
    ],
    initialMetrics: {
      globalRps: 128000,
      p99LatencyMs: 340,
      errorRatePercent: 12.6,
      threatSeverity: 68
    }
  }
];
