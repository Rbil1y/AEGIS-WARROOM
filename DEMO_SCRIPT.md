# 🎬 AEGIS WARROOM — 3-Minute Demo Video Script
**Target Duration**: 2 minutes 45 seconds (Under the <3-minute hackathon limit)
**Audio**: Voiceover narrative with sound effects enabled

---

### [0:00 - 0:30] Introduction: The Problem & The Mission
**Visual**:
- Full screen capture of Aegis WarRoom running at `http://localhost:5173`.
- The header blinks with `THREAT LEVEL: CRITICAL`, `Ingress: 184.2k RPS`, `P99: 890ms`, `5xx Error: 28.4%`.
- The topological canvas displays red blinking nodes and rapid saturated particle streams heading toward the Auth Pod Cluster.

**Voiceover Narrative**:
> "Welcome to Aegis WarRoom — an agent-native cloud incident command cockpit built on the new W3C WebMCP standard.
> 
> Right now, our multi-cloud infrastructure is under a coordinated Layer 7 HTTP/2 Rapid Reset attack. Over 180,000 requests per second are slamming our authentication gateways.
> 
> In traditional operations, an SRE would be frantically jumping across 8 disconnected dashboards, or relying on autonomous bots that risk crashing production with automated script mistakes.
> 
> With WebMCP, the human engineer and the AI agent co-pilot the defense inside the same live browser tab."

---

### [0:30 - 1:15] Part 1: Imperative WebMCP & Dynamic Tool Lifecycles (`ontoolchange`)
**Visual**:
- Switch view to the **WebMCP Protocol Terminal**.
- Point cursor to `document.modelContext.getTools()`. Show the 6 global registered tools with JSON schemas and annotations (`readOnlyHint: true`, `untrustedContentHint: true`).
- Switch back to the Topology canvas and click on the **PostgreSQL Primary Shard 01** node.
- Show that the node inspector instantly highlights the database, and the Protocol Terminal logs an `UNREGISTER` followed by `REGISTER` of database-specific tools: `trigger_failover_to_replica` and `kill_expensive_queries`. Show the `ontoolchange` event firing.

**Voiceover Narrative**:
> "Let's look under the hood at WebMCP. On the right, our Protocol Terminal inspects `document.modelContext.getTools()`. All tools are typed with JSON Schema draft-07 and annotated with W3C security hints.
> 
> Notice what happens when I click on our PostgreSQL primary node on the canvas:
> WebMCP dynamically unregisters irrelevant tools using an `AbortController` and registers database-specific tools: `trigger_failover_to_replica` and `kill_expensive_queries`.
> The browser automatically dispatches the `ontoolchange` event. The agent's capabilities morph in real-time based on the human's visual focus."

---

### [1:15 - 1:55] Part 2: Packet Tracing & Execution Cancellation (`AbortSignal`)
**Visual**:
- In the **Agent Command Chat**, click the 1-click preset **"1. Trace Packets"**.
- Watch the agent call `trace_network_packets` on WebMCP. Show the heuristic packet sniffer identifying the CVE-2023-44487 reset flood.
- Next, click the preset **"2. Deploy Edge WAF"**. Watch the Cloudflare WAF rule deploy. The traffic drops by 45%, and the mitigation meter climbs.
- Now, scroll down to the **Monte Carlo Failover Simulator**. Click **"Run 10,000-Packet Simulation"**.
- While the computation runs, immediately click **"Abort via AbortSignal"**.
- Show the alert: *"Simulation cleanly aborted by operator via WebMCP AbortSignal"*, and the Protocol Terminal logging `[ABORT] simulate_failover_latency`.

**Voiceover Narrative**:
> "Now let's engage the co-pilot. I ask the agent to trace network packets. Through the `trace_network_packets` tool, it sniffs 2,500 frames in 800ms, identifying an HTTP/2 reset flood.
> 
> The agent synthesizes and deploys an edge WAF rule via `deploy_waf_defense_rule`. Ingress error rates plummet immediately.
> 
> But what about long-running tasks? Section 4.2.2 of the WebMCP standard mandates `AbortSignal` support.
> Here we run a 10,000-packet Monte Carlo failover simulation. If I detect an issue and hit Abort, the signal cleanly halts execution across the browser event loop without memory leaks or stalled promises."

---

### [1:55 - 2:35] Part 3: Declarative WebMCP Break-Glass Protocol
**Visual**:
- In the chat, click **"5. Break-Glass Quarantine"**.
- The page smoothly scrolls to the **Declarative WebMCP Break-Glass Form**.
- Notice the CSS pseudo-class `:tool-form-active` pulse with a neon cyan dashed outline around the form!
- Notice the button glow with `:tool-submit-active`!
- The fields `subnetId`, `drainPercent`, and `failoverRegion` auto-populate.
- The form submits with `agentInvoked: true`.
- The audit receipt box appears showing the cryptographic confirmation hash returned via `e.respondWith()`.
- On the topology map, the attacked Auth pod turns into a cool cyan **QUARANTINED** state, 5xx errors drop to 0.05%, and the threat level turns **STABLE**.

**Voiceover Narrative**:
> "Finally, the breakthrough: Declarative WebMCP.
> For high-stakes actions like isolating a cluster, we use a standard HTML form annotated with `toolname`, `tooldescription`, and `toolparamdescription`.
> 
> When the agent triggers this declarative tool, the browser brings the form into focus and applies native `:tool-form-active` CSS highlights.
> The agent pre-fills the parameters. The submit event is captured with `agentInvoked = true`, and using `e.respondWith()`, we return an immutable cryptographic audit signature directly back to the model.
> 
> The compromised subnet is quarantined, traffic is fully absorbed by EU-Central, and our infrastructure is 100% stabilized."

---

### [2:35 - 2:45] Conclusion & Open Source
**Visual**:
- Return to the full cockpit view showing the green **THREAT LEVEL: STABLE** status, 100% mitigation, and the open-source MIT badge in the footer.

**Voiceover Narrative**:
> "Aegis WarRoom proves that WebMCP is not just for ordering pizza — it is the foundation of the agent-native web for mission-critical human-agent collaboration.
> 
> Open-source under the MIT License. Thank you!"
