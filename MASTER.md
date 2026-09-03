# AEGIS WARROOM: ENGINEERING MASTER SPECIFICATION
**Agent-Native Cyber Incident Command & Cloud Infrastructure Defense System**
*Standard: W3C WebMCP Community Group Draft Specification (2026) & Chromium Blink Agent Protocol*

---

## 1. System Overview & Mission Criticality

### 1.1 The Operational Problem
Modern cloud infrastructure consists of distributed, ephemeral topologies spanning multi-cloud regions, Kubernetes clusters, and global edge CDNs (Cloudflare Workers, Netlify Edge, AWS CloudFront). During high-severity cyber incidents (Layer 7 HTTP/2 Rapid Reset attacks, credential stuffing, SQL injection, buffer saturation):
1. **Telemetry Overload**: Prometheus, Datadog, and OpenTelemetry streams output upwards of 500,000 metric datapoints and log lines per second. Human Site Reliability Engineers (SREs) suffer severe cognitive fatigue and take an average of 14–42 minutes to establish root cause.
2. **The "Rogue Bot" Dilemma**: Autonomous mitigation bots cannot be granted unfettered write access to production clusters; automated script failures have historically induced cascading global outages (e.g., automated route withdrawals causing complete DNS blackouts).
3. **The WebMCP Solution**: **Aegis WarRoom** establishes a synchronized, observable bridge between a Site Reliability Engineer and an AI Agent. Built entirely on the emerging **W3C WebMCP standard**, the system turns the live browser tab into an interactive operational cockpit where the human directs high-level policy on a topological canvas, while the agent inspects packet traces, runs predictive Monte Carlo failover simulations, and stages cryptographic break-glass interventions with strict human-in-the-loop validation.

---

## 2. Infrastructure & Domain Architecture

```
                                  [GLOBAL INTERNET TRAFFIC]
                                             │
                                             ▼
                        ┌────────────────────────────────────────┐
                        │   TIER 0: ANYCAST EDGE SCRUBBING       │
                        │   (Cloudflare Workers / Global WAF)   │
                        └────────────────────┬───────────────────┘
                                             │
                                             ▼
                        ┌────────────────────────────────────────┐
                        │   TIER 1: INGRESS ROUTING GATEWAYS     │
                        │   (Envoy Proxy / TLS Termination)      │
                        └───────┬────────────────────────┬───────┘
                                │                        │
               ┌────────────────┴──────────┐  ┌──────────┴──────────────┐
               ▼                           ▼  ▼                         ▼
 ┌───────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────┐
 │   TIER 2: AUTH CLUSTER    │ │  TIER 2: PAYMENT GATEWAY  │ │ TIER 2: INVENTORY SERVICE │
 │   (k8s Pods / JWT Verify) │ │  (PCI-DSS Isolated Pods)  │ │ (Async gRPC Microservice) │
 └─────────────┬─────────────┘ └─────────────┬─────────────┘ └─────────────┬─────────────┘
               │                             │                             │
               ▼                             ▼                             ▼
 ┌───────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────┐
 │   TIER 3: REDIS SENTINEL  │ │ TIER 3: POSTGRES PRIMARY  │ │ TIER 3: REPLICA CLUSTER   │
 │   (Distributed Token Bus) │ │ (Write Master Shard 01)   │ │ (Read Only Multi-Region)  │
 └───────────────────────────┘ └───────────────────────────┘ └───────────────────────────┘
```

### 2.1 Component Specifications
- **Edge Anycast Nodes (Tier 0)**: Ingests up to 2.4 Tbps global traffic. Exposes rate-limiting, IP reputation scoring, and "Under Attack Mode" challenges.
- **Ingress Gateways (Tier 1)**: Manages regional routing between `us-east-1` (Active/Primary), `eu-central-1` (Standby/Secondary), and `ap-south-1` (Disaster Recovery).
- **Application Microservices (Tier 2)**: Containerized services executing business logic, authentications, and payment authorizations.
- **Stateful Persistence Layer (Tier 3)**: High-availability Postgres clusters with sub-millisecond WAL replication and Redis cache rings.

---

## 3. WebMCP W3C Standard Implementation Matrix

Aegis WarRoom implements 100% of the W3C WebMCP Specification across all operational tiers:

| WebMCP Feature | Spec Section | Aegis WarRoom Implementation |
| :--- | :--- | :--- |
| **Imperative API** | § 4.2 | `document.modelContext.registerTool({...})` with typed JSON Schemas |
| **Dynamic Tool Lifecycle** | § 4.2.3 | `AbortController` unregistration + automatic `ontoolchange` dispatching |
| **Execution Cancellation** | § 4.2.2 | `execute: async (input, { signal })` binding `AbortSignal` to Monte Carlo engine |
| **Tool Annotations** | § 4.2.1 | Strict `readOnlyHint` and `untrustedContentHint` separation |
| **Declarative WebMCP** | § 4.3 | `<form toolname="..." toolautosubmit>` with parameter schema synthesis |
| **Pseudo-Classes** | § 4.3 | `:tool-form-active` (neon cyan focus) & `:tool-submit-active` (neon alert) |
| **Agent Event Handling** | § 4.3 | `toolactivated`, `toolcancel`, `SubmitEvent.agentInvoked`, `e.respondWith()` |
| **Security & Isolation** | § 4.5, 6 | `Origin-Agent-Cluster: ?1`, `tools=(self)` Permissions Policy, Length Mitigations |

---

## 4. Imperative WebMCP Tool Definitions

### 4.1 Global Command Tools (Available at Root Level)

#### 1. `inspect_telemetry_metrics`
* **Purpose**: Fetches real-time cluster telemetry, error rates, and saturation vectors.
* **Annotations**: `{ readOnlyHint: true, untrustedContentHint: false }`
* **Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "targetTier": {
      "type": "string",
      "enum": ["all", "tier0_edge", "tier1_ingress", "tier2_services", "tier3_storage"],
      "description": "Specific infrastructure tier to query"
    },
    "metricWindowSeconds": {
      "type": "integer",
      "minimum": 5,
      "maximum": 300,
      "default": 30,
      "description": "Time window for rolling average telemetry"
    }
  },
  "required": ["targetTier"]
}
```

#### 2. `trace_network_packets`
* **Purpose**: Heuristic packet analyzer searching for attack signatures, anomalous ASNs, and payload spikes.
* **Annotations**: `{ readOnlyHint: true, untrustedContentHint: false }`
* **Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "protocol": {
      "type": "string",
      "enum": ["HTTP2", "HTTP3", "TCP_SYN", "UDP_FRAG", "GRPC"],
      "description": "Network protocol to sniff and filter"
    },
    "sampleSize": {
      "type": "integer",
      "minimum": 100,
      "maximum": 10000,
      "description": "Number of raw packet headers to evaluate"
    }
  },
  "required": ["protocol"]
}
```

#### 3. `deploy_waf_defense_rule`
* **Purpose**: Synthesizes and applies a real-time Cloudflare/Envoy WAF firewall rule.
* **Annotations**: `{ readOnlyHint: false, untrustedContentHint: true }`
* **Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "ruleName": { "type": "string", "maxLength": 64 },
    "targetVector": { "type": "string", "enum": ["IP_RATE_LIMIT", "ASN_CHALLENGE", "URI_REGEX", "HEADER_ANOMALY"] },
    "expression": { "type": "string", "description": "Firewall expression syntax (e.g., http.request.uri.path contains '/auth' and ip.geoip.asnum eq 13335)" },
    "action": { "type": "string", "enum": ["BLOCK", "MANAGED_CHALLENGE", "JS_CHALLENGE", "LOG_ONLY"] }
  },
  "required": ["ruleName", "targetVector", "expression", "action"]
}
```

#### 4. `rebalance_traffic_load`
* **Purpose**: Shifts global traffic weights across geographic regions.
* **Annotations**: `{ readOnlyHint: false, untrustedContentHint: false }`
* **Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "sourceRegion": { "type": "string", "enum": ["us-east-1", "eu-central-1", "ap-south-1"] },
    "targetRegion": { "type": "string", "enum": ["us-east-1", "eu-central-1", "ap-south-1"] },
    "shiftPercentage": { "type": "number", "minimum": 10, "maximum": 100 }
  },
  "required": ["sourceRegion", "targetRegion", "shiftPercentage"]
}
```

#### 5. `simulate_failover_latency` (Long-Running with `AbortSignal`)
* **Purpose**: Executes a 10,000-packet Monte Carlo streaming simulation of network failover dynamics.
* **Annotations**: `{ readOnlyHint: true, untrustedContentHint: false }`
* **Cancellation Support**: Passes `signal` to the simulation loop. Aborts immediately upon `signal.aborted`.

---

### 4.2 Dynamic Node-Specific Tools (Context-Aware Lifecycles)

When the SRE selects a node on the live topology canvas, WebMCP triggers an **atomic tool transition**:
1. Previous node controller calls `abortController.abort()`.
2. Active tool map cleans up obsolete tools.
3. New node tools register via `registerTool(tool, { signal })`.
4. Browser fires `ontoolchange` on `document.modelContext`.

```
               [SRE Clicks Node: "postgres-primary-01"]
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │ 1. abortController.abort() on previous tools          │
      │ 2. Unregister generic tools cleanly                    │
      │ 3. Register Database-specific tools:                   │
      │    - trigger_failover_to_replica                       │
      │    - kill_expensive_queries                            │
      │    - flush_wal_buffer_cache                            │
      │ 4. Fire "toolchange" event on document.modelContext    │
      └────────────────────────────────────────────────────────┘
```

#### Contextual Tools:
* **Edge Ingress Node**: `toggle_under_attack_mode`, `purge_edge_cache_keys`, `set_ddos_sensitivity`.
* **Auth Cluster Node**: `drain_pod_traffic`, `hotpatch_jwt_revocation`, `dump_thread_profiling`.
* **Database Shard Node**: `trigger_failover_to_replica`, `kill_zombie_connections`, `throttle_write_batch`.

---

## 5. Declarative WebMCP Break-Glass Architecture

The break-glass quarantine procedure is executed using the **Declarative WebMCP API** (§ 4.3):

```html
<form 
  id="quarantine-form"
  toolname="emergencySubnetQuarantine"
  tooldescription="Immediately quarantines a compromised cloud subnet, severs ingress connections, and activates cold-standby infrastructure."
  toolautosubmit
  action="/api/v1/quarantine"
  method="POST"
>
  <div class="form-field">
    <label for="subnetId">Target Subnet ID</label>
    <input 
      type="text" 
      id="subnetId" 
      name="subnetId" 
      required
      toolparamdescription="Exact cluster or subnet identifier to isolate (e.g. auth-ingress-us-east-1)"
    />
  </div>

  <div class="form-field">
    <label for="drainPercent">Traffic Drain Percentage</label>
    <input 
      type="number" 
      id="drainPercent" 
      name="drainPercent" 
      min="10" 
      max="100" 
      required
      toolparamdescription="Percentage of ingress traffic to immediately drop or redirect (10-100)"
    />
  </div>

  <div class="form-field">
    <label for="failoverRegion">Failover Region Destination</label>
    <select 
      id="failoverRegion" 
      name="failoverRegion" 
      required
      toolparamdescription="Destination cloud region designated to absorb redirected workloads"
    >
      <option value="eu-central-1">EU-Central (Frankfurt)</option>
      <option value="ap-south-1">APAC-South (Singapore)</option>
    </select>
  </div>

  <div class="form-field">
    <label for="authSignature">2FA SRE Cryptographic Token</label>
    <input 
      type="password" 
      id="authSignature" 
      name="authSignature" 
      required
      toolparamdescription="High-privilege emergency operator token for break-glass audit trail"
    />
  </div>

  <button type="submit" id="quarantine-submit-btn">
    AUTHORIZE BREAK-GLASS QUARANTINE
  </button>
</form>
```

### 5.1 Declarative Event Lifecycle & CSS Activation
1. **Model Invocation**: Agent detects attack escalation and calls `emergencySubnetQuarantine`.
2. **Browser Activation**: The browser applies `:tool-form-active` (neon cyan pulsed border) and `:tool-submit-active` (neon red glow on button).
3. **Event `toolactivated`**: Window receives `{ toolName: "emergencySubnetQuarantine" }`.
4. **Form Submission & `respondWith`**:
   ```javascript
   form.addEventListener('submit', (e) => {
     e.preventDefault();
     if (e.agentInvoked) {
       const auditPromise = executeCryptographicQuarantine(new FormData(form));
       e.respondWith(auditPromise);
     }
   });
   ```

---

## 6. Real-Time Telemetry & Incident Mathematical Model

### 6.1 Attack Vector Models
1. **L7 Rapid Reset & Distributed HTTP Flood**:
   $$\text{Ingress RPS}(t) = \text{Baseline} + \sum_{k=1}^{M} A_k \cdot \left(1 + \sin(\omega_k t)\right) \cdot \mathbb{I}(t \ge t_{\text{attack}})$$
   *P99 latency increases logarithmically as connection pools exhaust.*
2. **Connection Starvation (Slowloris/SYN Flood)**:
   $$\text{Available Pool}(t) = \text{Capacity} \cdot e^{-\lambda t}$$
3. **5xx Error Rate Generation**:
   $$\text{ErrRate}(t) = \min\left(100\%, \frac{\text{Ingress RPS}(t) - \text{Throttled RPS}}{\text{Ingress RPS}(t)} \times 100\right)$$

---

## 7. Zero-Friction Universal Evaluator (Judge Experience)

To ensure that 100% of judges—regardless of browser or flags—have an unforgettable, bug-free experience:
1. **Native Chrome 149+ Flag Detection**: If `document.modelContext` exists natively, tools register directly to the browser standard.
2. **Universal Spec-Compliant WebMCP Engine**: If not detected, an in-page micro-engine implements the full WebIDL `ModelContext` interface, maintaining the exact same asynchronous behavior, event queues, and schema checking.
3. **Embedded Protocol Inspector & Terminal**: A HUD panel displaying:
   - Live Registered Tools table (`document.modelContext.getTools()`)
   - Interactive Event Stream (`toolchange`, `toolactivated`, `executeTool`, `abort`)
   - 1-Click Attack Scenarios for instant evaluation
   - Live LLM Freeform Chat (deterministic high-IQ agent simulation + optional live OpenAI/Gemini API key runner).

---

## 8. Devpost Deliverables Checklist
- [x] Functional Live Deployment URL (Vercel / Cloudflare Pages ready)
- [x] Public Open-Source Repository with visible MIT License
- [x] Working implementation of `document.modelContext.registerTool`
- [x] Declarative WebMCP `<form toolname="...">` integration
- [x] <3-minute YouTube Video Demo Script with audio & timestamps
- [x] Full text writeup explaining Why WebMCP, User Experience, Co-presence, and Implementation.
