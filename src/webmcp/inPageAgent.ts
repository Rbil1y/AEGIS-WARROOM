import { webMCPManager } from './manager';

export interface AgentMessage {
  id: string;
  sender: 'OPERATOR' | 'AGENT' | 'SYSTEM';
  text: string;
  timestamp: string;
  toolCalls?: {
    toolName: string;
    input: any;
    result?: string;
    status: 'PENDING' | 'SUCCESS' | 'ABORTED' | 'FAILED';
  }[];
}

export type MessageSubscriber = (messages: AgentMessage[]) => void;

class InPageAgentEngine {
  private messages: AgentMessage[] = [
    {
      id: 'msg-init-1',
      sender: 'SYSTEM',
      text: 'AEGIS WARROOM v3.8 ONLINE. WebMCP Agent Protocol initialized and listening on document.modelContext.',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: 'msg-init-2',
      sender: 'AGENT',
      text: 'Greetings Operator. I am connected to your live infrastructure topology via WebMCP. I am monitoring Prometheus telemetry, Edge WAF logs, and cluster connection pools. Select a threat scenario or issue direct tactical commands.',
      timestamp: new Date().toLocaleTimeString()
    }
  ];

  private subscribers: Set<MessageSubscriber> = new Set();
  public isThinking: boolean = false;
  private currentAbortController: AbortController | null = null;

  public subscribe(cb: MessageSubscriber): () => void {
    this.subscribers.add(cb);
    cb(this.messages);
    return () => this.subscribers.delete(cb);
  }

  private notify() {
    this.subscribers.forEach((cb) => cb([...this.messages]));
  }

  public abortCurrentAction() {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
      this.isThinking = false;
      this.addMessage({
        sender: 'SYSTEM',
        text: 'Operator aborted the ongoing agent operation via WebMCP AbortSignal.'
      });
    }
  }

  public addMessage(msg: Omit<AgentMessage, 'id' | 'timestamp'>) {
    const fullMsg: AgentMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString()
    };
    this.messages.push(fullMsg);
    this.notify();
    return fullMsg;
  }

  public async runCommand(prompt: string, apiKey?: string): Promise<void> {
    this.addMessage({ sender: 'OPERATOR', text: prompt });
    this.isThinking = true;
    this.currentAbortController = new AbortController();
    const signal = this.currentAbortController.signal;

    try {
      const tools = await webMCPManager.getTools();
      const lowerPrompt = prompt.toLowerCase();

      // If user provided a real Gemini or OpenAI API key, we could invoke them, but let's provide
      // an intelligent, context-aware reasoning engine that executes real WebMCP tools!
      if (apiKey && apiKey.startsWith('AIza') && typeof fetch !== 'undefined') {
        // Real Gemini Live LLM Tool Execution
        await this.executeWithGemini(prompt, apiKey, tools, signal);
        return;
      }

      // Intelligent deterministic agent reasoning
      await this.executeDeterministicAgent(lowerPrompt, signal);
    } catch (err: any) {
      if (err.name === 'AbortError' || signal.aborted) {
        console.log('[InPageAgent] Action was aborted.');
      } else {
        this.addMessage({
          sender: 'AGENT',
          text: `Error executing tactical response: ${err.message || String(err)}`
        });
      }
    } finally {
      this.isThinking = false;
      this.currentAbortController = null;
      this.notify();
    }
  }

  private async executeDeterministicAgent(prompt: string, signal: AbortSignal) {
    // Check for packet trace
    if (prompt.includes('trace') || prompt.includes('packet') || prompt.includes('sniff')) {
      await this.stepThink('Initiating deep packet inspection heuristics via trace_network_packets...');
      const result = await webMCPManager.executeTool('trace_network_packets', {
        protocol: 'HTTP2',
        sampleSize: 2500
      }, { signal });

      this.addMessage({
        sender: 'AGENT',
        text: `Packet inspection complete. Identified distributed Layer 7 anomaly targeting authentication endpoints.\n\nSummary:\n${result}`,
        toolCalls: [{
          toolName: 'trace_network_packets',
          input: { protocol: 'HTTP2', sampleSize: 2500 },
          result,
          status: 'SUCCESS'
        }]
      });
      return;
    }

    // Check for WAF rule deployment
    if (prompt.includes('waf') || prompt.includes('block') || prompt.includes('firewall') || prompt.includes('rule')) {
      await this.stepThink('Synthesizing Cloudflare edge WAF mitigation rule...');
      const result = await webMCPManager.executeTool('deploy_waf_defense_rule', {
        ruleName: 'EMERGENCY_DROP_MALICIOUS_BOTNET',
        targetVector: 'IP_RATE_LIMIT',
        expression: 'http.request.uri.path contains "/auth" and ip.geoip.asnum in {13335, 209242}',
        action: 'MANAGED_CHALLENGE'
      }, { signal });

      this.addMessage({
        sender: 'AGENT',
        text: `WAF defense rule applied across global edge fleet. Malicious ingress dropped by 94.2%.\n\n${result}`,
        toolCalls: [{
          toolName: 'deploy_waf_defense_rule',
          input: { ruleName: 'EMERGENCY_DROP_MALICIOUS_BOTNET', action: 'MANAGED_CHALLENGE' },
          result,
          status: 'SUCCESS'
        }]
      });
      return;
    }

    // Check for failover simulation
    if (prompt.includes('simulate') || prompt.includes('monte carlo') || prompt.includes('failover')) {
      await this.stepThink('Executing Monte Carlo multi-region failover simulation...');
      const result = await webMCPManager.executeTool('simulate_failover_latency', {
        sourceRegion: 'us-east-1',
        targetRegion: 'eu-central-1',
        iterations: 10000
      }, { signal });

      this.addMessage({
        sender: 'AGENT',
        text: `Simulation complete:\n\n${result}`,
        toolCalls: [{
          toolName: 'simulate_failover_latency',
          input: { sourceRegion: 'us-east-1', targetRegion: 'eu-central-1', iterations: 10000 },
          result,
          status: 'SUCCESS'
        }]
      });
      return;
    }

    // Check for traffic rebalancing
    if (prompt.includes('rebalance') || prompt.includes('reroute') || prompt.includes('shift')) {
      await this.stepThink('Rebalancing global Anycast traffic from US-East to EU-Central...');
      const result = await webMCPManager.executeTool('rebalance_traffic_load', {
        sourceRegion: 'us-east-1',
        targetRegion: 'eu-central-1',
        shiftPercentage: 80
      }, { signal });

      this.addMessage({
        sender: 'AGENT',
        text: `Traffic rebalancing active. Healthy standby region EU-Central now absorbing 80% ingress volume.\n\n${result}`,
        toolCalls: [{
          toolName: 'rebalance_traffic_load',
          input: { sourceRegion: 'us-east-1', targetRegion: 'eu-central-1', shiftPercentage: 80 },
          result,
          status: 'SUCCESS'
        }]
      });
      return;
    }

    // Check for quarantine / break-glass
    if (prompt.includes('quarantine') || prompt.includes('isolate') || prompt.includes('break glass')) {
      await this.stepThink('Triggering Declarative WebMCP Break-Glass Quarantine Form...');
      // Execute the declarative tool registered from the HTML form!
      const result = await webMCPManager.executeTool('emergencySubnetQuarantine', {
        subnetId: 'auth-ingress-us-east-1',
        drainPercent: 100,
        failoverRegion: 'eu-central-1',
        authSignature: 'SIG_BREAK_GLASS_OPERATOR_0x7F9B'
      }, { signal });

      this.addMessage({
        sender: 'AGENT',
        text: `Break-glass quarantine protocol executed via Declarative WebMCP.\n\n${result}`,
        toolCalls: [{
          toolName: 'emergencySubnetQuarantine',
          input: { subnetId: 'auth-ingress-us-east-1', drainPercent: 100 },
          result,
          status: 'SUCCESS'
        }]
      });
      return;
    }

    // Default telemetry inspection
    await this.stepThink('Querying full infrastructure telemetry metrics via inspect_telemetry_metrics...');
    const result = await webMCPManager.executeTool('inspect_telemetry_metrics', {
      targetTier: 'all',
      metricWindowSeconds: 30
    }, { signal });

    this.addMessage({
      sender: 'AGENT',
      text: `Tactical telemetry analysis:\n\n${result}`,
      toolCalls: [{
        toolName: 'inspect_telemetry_metrics',
        input: { targetTier: 'all', metricWindowSeconds: 30 },
        result,
        status: 'SUCCESS'
      }]
    });
  }

  private async stepThink(text: string): Promise<void> {
    this.addMessage({ sender: 'SYSTEM', text: `[AGENT REASONING] ${text}` });
    await new Promise((r) => setTimeout(r, 600));
  }

  private async executeWithGemini(prompt: string, apiKey: string, tools: any[], signal: AbortSignal) {
    // Format tools for Gemini API
    const functionDeclarations = tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.inputSchema
    }));

    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ functionDeclarations }]
    };

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal
    });

    const data = await res.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0];

    if (candidate?.functionCall) {
      const { name, args } = candidate.functionCall;
      this.addMessage({
        sender: 'SYSTEM',
        text: `Gemini requested tool execution: ${name}(${JSON.stringify(args)})`
      });

      const toolResult = await webMCPManager.executeTool(name, args, { signal });
      this.addMessage({
        sender: 'AGENT',
        text: `Executed ${name} successfully:\n${toolResult}`,
        toolCalls: [{
          toolName: name,
          input: args,
          result: toolResult,
          status: 'SUCCESS'
        }]
      });
    } else if (candidate?.text) {
      this.addMessage({ sender: 'AGENT', text: candidate.text });
    }
  }
}

export const inPageAgent = new InPageAgentEngine();
