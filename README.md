# 🛡️ AEGIS WARROOM
### **Agent-Native Cyber Incident Command & Cloud Infrastructure Defense System**
*Built for **The WebMCP Challenge (2026)** — Powered by the emerging W3C WebMCP Standard*

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](https://opensource.org/licenses/MIT)
[![W3C Standard](https://img.shields.io/badge/W3C_Spec-WebMCP_2026-00f0ff.svg)](https://webmachinelearning.github.io/webmcp/)
[![Chrome AI](https://img.shields.io/badge/Chrome_Blink-Origin_Trial_149+-emerald.svg)](https://developer.chrome.com/docs/ai/webmcp)
[![ChatGPT Operator Ready](https://img.shields.io/badge/ChatGPT_Browser-Site_Tools_Ready-blue.svg)](https://learn.chatgpt.com/docs/webmcp)

---

## ⚡ Executive Summary

During high-severity cyber-attacks (e.g. HTTP/2 Rapid Reset floods, credential stuffing, SQL injection, buffer saturation), modern cloud infrastructures generate over 500,000 telemetry datapoints per second.
- **Human engineers** are cognitively overwhelmed and take an average of 14–42 minutes to isolate attacks.
- **Autonomous bots** cannot be granted blind write access to production without risking global route collapses.
- **Traditional APIs (MCP)** are blind to what the engineer is looking at in the live browser tab.

**Aegis WarRoom** solves this by turning the browser tab into an **agent-native operational war room**. Built 100% on the **W3C WebMCP standard**, an SRE and an AI agent co-pilot live cloud defense on an interactive topological canvas with real-time visual feedback, safety-gated break-glass authorization, and dynamic tool morphing.

---

## 🌟 Why Aegis WarRoom Stands Out

| Feature | Standard Hackathon Submissions | Aegis WarRoom |
| :--- | :--- | :--- |
| **Domain** | Toy demos (pizza ordering, basic flight search) | **Mission-Critical Cloud Defense & Multi-Region Failover** |
| **WebMCP Standard** | 1–2 static tools, single form | **Full W3C Spec: Imperative, Declarative, Dynamic Lifecycle & AbortSignal** |
| **Tool Lifecycle** | Static tools that never change | **Context-Aware Dynamic Tools (`ontoolchange` + `AbortController`)** |
| **Cancellation** | No cancellation handling | **Long-Running Monte Carlo Simulation with WebMCP `AbortSignal`** |
| **Declarative WebMCP** | Ignored | **`<form toolname="...">`, `:tool-form-active`, `agentInvoked`, `e.respondWith()`** |
| **Evaluator Experience** | Broken if browser lacks flag | **Zero-Friction Dual-Mode: Native Chrome 149+ + Embedded Protocol Inspector** |

---

## 📐 Architecture & Multi-Tier Topology

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

---

## 🛠️ W3C WebMCP Technical Implementation

### 1. Global Imperative Tools (`document.modelContext.registerTool`)
- `inspect_telemetry_metrics`: Real-time Prometheus metrics lookback (`readOnlyHint: true`).
- `trace_network_packets`: Deep heuristic packet analyzer sniffing for HTTP/2 RST_STREAM floods (`readOnlyHint: true`).
- `deploy_waf_defense_rule`: Synthesizes and deploys Cloudflare Edge WAF firewall expressions (`readOnlyHint: false`, `untrustedContentHint: true`).
- `rebalance_traffic_load`: Dynamically redistributes Anycast traffic across US-East, EU-Central, and APAC-South (`readOnlyHint: false`).
- `simulate_failover_latency`: **Monte Carlo streaming simulation with `AbortSignal` cancellation support** (§ 4.2.2).

### 2. Context-Aware Dynamic Tools (`ontoolchange` + `AbortController`)
When the operator clicks on any node in the topology canvas:
1. Previous node controller calls `controller.abort()`.
2. Generic tools unregister cleanly per § 4.2.3.
3. Node-specific tools register (e.g. `toggle_under_attack_mode` on Edge nodes, `drain_pod_traffic` on Auth pods, `trigger_failover_to_replica` on Postgres shards).
4. `document.modelContext` fires the `toolchange` event, automatically updating the protocol inspector.

### 3. Declarative WebMCP (§ 4.3)
```html
<form 
  toolname="emergencySubnetQuarantine"
  tooldescription="Immediately quarantines compromised cloud subnet and activates standby infrastructure"
  toolautosubmit
  action="/api/v1/quarantine"
>
  <input name="subnetId" toolparamdescription="Compromised cluster ID" required />
  <input name="drainPercent" toolparamdescription="Traffic percentage to drop" required />
  <select name="failoverRegion" toolparamdescription="Destination standby region" required>...</select>
  <input name="authSignature" toolparamdescription="2FA SRE cryptographic authorization token" required />
  <button type="submit">AUTHORIZE BREAK-GLASS QUARANTINE</button>
</form>
```
- **CSS Activation**: Browser applies `:tool-form-active` (neon cyan outline) and `:tool-submit-active` (neon red outline).
- **Event Lifecycle**: Window fires `toolactivated` and `toolcancel`.
- **Submission**: Custom `SubmitEvent.agentInvoked === true` with `e.respondWith(Promise)` returning the cryptographic audit receipt back to the model.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation & Local Run
```bash
# 1. Clone repository
git clone https://github.com/your-username/aegis-warroom.git
cd aegis-warroom

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Testing with WebMCP in Google Chrome
1. Open Google Chrome.
2. Navigate to `chrome://flags/#enable-webmcp-testing`.
3. Set the flag to **Enabled** and relaunch Chrome.
4. Open `http://localhost:5173`. Open Chrome DevTools (`F12`) and inspect `document.modelContext.getTools()`.

### Testing in Any Standard Browser / ChatGPT In-App Browser
Aegis WarRoom features an embedded **Universal WebMCP Protocol Terminal & In-Page Agent**. Even if you test without experimental flags, you can run 1-click tactical scenarios, inspect live registered tools, observe `ontoolchange` events, and test tool cancellation with full fidelity.

---

## 📜 License
This project is open-source and licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
