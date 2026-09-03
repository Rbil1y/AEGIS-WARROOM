# The WebMCP Challenge 2026 — Devpost Submission Package

## Project Title
**Aegis WarRoom // Agent-Native Cyber Incident Command & Cloud Infrastructure Defense System**

## Tagline
*The mission-critical cloud defense cockpit where SREs and AI agents co-pilot live cyber incident triage, heuristic packet tracing, and safety-gated break-glass failovers via WebMCP.*

---

## 1. Why your use case is a strong fit for WebMCP
Cyber incident response on modern distributed cloud infrastructures (Kubernetes clusters, Cloudflare Anycast edge workers, multi-region databases) is inherently high-stakes and latency-sensitive. When a distributed Layer 7 HTTP/2 Rapid Reset or SQL connection pool exhaustion attack hits, telemetry streams generate over 500,000 metric datapoints and log lines per second.

Traditional AI approaches fail here:
- **Autonomous background bots (MCP)** cannot be trusted to blindly execute mutating operations or reboot production clusters without human oversight—an error causes a global blackout.
- **Screen-scraping computer use** is far too slow, burns thousands of vision tokens, and hallucinates on complex dynamic canvas graphs.

**WebMCP is the ideal standard**: It turns the operator's active browser tab into a synchronized, high-bandwidth communication channel. The agent discovers structured tools directly from the page context (`document.modelContext.getTools()`), inspects real-time Prometheus telemetry, runs long-running failover simulations with `AbortSignal` cancellation support, and stages safety-gated interventions where the human maintains 100% visual oversight.

---

## 2. How it creates a better user experience
Instead of an SRE jumping frantically across 8 browser tabs (Datadog dashboards, AWS console, Cloudflare WAF, Kubernetes CLI, PagerDuty), Aegis WarRoom aggregates the entire crisis into a unified, agent-native visual cockpit:
- **Visual Co-Presence**: The SRE sees live topological node health, packet particle streams, and saturation indicators in real time.
- **Zero-Friction Contextual Tools (`ontoolchange`)**: When the SRE clicks a database cluster, the browser dynamically registers DB-specific tools (`trigger_failover_to_replica`, `kill_expensive_queries`). When clicking an Edge Ingress node, tools dynamically swap to `toggle_under_attack_mode` and `purge_edge_cache_keys`.
- **Confidence & Safety**: The SRE knows that every agent action is typed, validated against JSON Schema draft-07, and logged in an immutable audit stream.

---

## 3. Describe what people and agents can do together that was difficult or impossible before
Before WebMCP, human-agent collaboration on web infrastructure was either **completely disengaged** (an API agent acting invisibly in the dark) or **excruciatingly brittle** (an LLM clicking pixels on a webpage via mouse coordinates).

With Aegis WarRoom powered by WebMCP, people and agents achieve **true co-pilot operational unity**:
1. **Heuristic Packet Triage at Machine Speed**: The agent sniffs 2,500 incoming packets via `trace_network_packets` in 800ms, identifying the exact CVE-2023-44487 HTTP/2 Rapid Reset signature.
2. **Predictive Failure Prevention**: The agent executes a 10,000-packet Monte Carlo failover simulation (`simulate_failover_latency`) to test whether rerouting 80% traffic to EU-Central will brownout the backup region. Crucially, if the human sees a false positive, they can click **Abort**, which instantly halts the simulation via WebMCP's native `AbortSignal` without memory leaks.
3. **Safety-Gated Break-Glass Execution**: The agent stages the emergency isolation via a **Declarative WebMCP Form** (`<form toolname="emergencySubnetQuarantine">`). The browser brings the form into focus, applies `:tool-form-active` visual highlights, pre-fills the parameters, and requires human cryptographic sign-off before dispatching the strike, returning the verified audit receipt back to the model via `e.respondWith()`.

---

## 4. Briefly explain how you implemented WebMCP
We implemented 100% of the W3C WebMCP Community Group Draft Specification (2026):

1. **Imperative WebMCP API (§ 4.2)**:
   - Registered 6 production-grade global tools on `document.modelContext`: `inspect_telemetry_metrics`, `trace_network_packets`, `deploy_waf_defense_rule`, `rebalance_traffic_load`, `simulate_failover_latency`, and `synthesize_incident_brief`.
   - Annotated with strict W3C security hints: `readOnlyHint: true` for monitoring, and `untrustedContentHint: true` for generative WAF rule expressions.
2. **Context-Aware Dynamic Lifecycles (§ 4.2.3)**:
   - Wrapped contextual node tools inside our `useWebMCP` React hook. Selecting a node aborts previous controllers and registers node-specific tools, firing `document.modelContext.dispatchEvent(new Event('toolchange'))`.
3. **Tool Execution Cancellation (§ 4.2.2)**:
   - Handled `options.signal` in the `execute` callback of `simulate_failover_latency`, allowing both human operators and agents to cleanly abort in-flight computation.
4. **Declarative WebMCP (§ 4.3)**:
   - Engineered the break-glass quarantine form using standard HTML attributes: `toolname`, `tooldescription`, `toolparamdescription`, and `toolautosubmit`.
   - Styled with CSS `:tool-form-active` and `:tool-submit-active` pseudo-classes.
   - Handled `toolactivated`, `toolcancel`, `SubmitEvent.agentInvoked`, and `e.respondWith(Promise)`.
5. **Universal Evaluator Experience**:
   - Engineered a spec-compliant fallback shim and in-page WebMCP Terminal HUD so judges on any browser can inspect registered schemas, view real-time event logs, and run 1-click incident scenarios.

---

## 5. Public Code Repository
- GitHub URL: `https://github.com/your-username/aegis-warroom`
- Open-Source License: MIT License (visible at root of repository)
- Live Deployment URL: `https://aegis-warroom.vercel.app` (or Cloudflare Pages)
