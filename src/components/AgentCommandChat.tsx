import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Zap, XCircle, ChevronDown, ChevronUp, CheckCircle2, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { inPageAgent, AgentMessage } from '../webmcp/inPageAgent';

export const AgentCommandChat: React.FC = () => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [expandedCalls, setExpandedCalls] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return inPageAgent.subscribe((msgs) => {
      setMessages(msgs);
      setIsThinking(inPageAgent.isThinking);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    });
  }, []);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isThinking) return;

    setInputPrompt('');
    inPageAgent.runCommand(text);
  };

  const toggleCallExpand = (id: string) => {
    setExpandedCalls((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-canvas-subtle border border-canvas-border rounded-xl flex flex-col h-[580px] overflow-hidden select-none shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-canvas-border px-5 py-3.5 bg-canvas-surface/80 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              SRE Co-Pilot & WebMCP Triage
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Human-directed autonomous action execution
            </p>
          </div>
        </div>

        {isThinking && (
          <button
            onClick={() => inPageAgent.abortCurrentAction()}
            className="px-2.5 py-1 rounded-md bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" /> Abort Action
          </button>
        )}
      </div>

      {/* Action Presets */}
      <div className="p-3.5 bg-canvas-bg/70 border-b border-canvas-border">
        <span className="text-[11px] font-medium text-slate-400 block mb-2 font-sans">
          Recommended Incident Interventions:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-sans">
          <button
            onClick={() => handleSend('Sniff and trace network packets for protocol HTTP2')}
            disabled={isThinking}
            className="p-2.5 rounded-lg bg-canvas-surface hover:bg-canvas-elevated border border-canvas-border hover:border-slate-700 text-left transition-colors group disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <span className="text-blue-400 font-medium block text-xs flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> 1. Sniff Packets
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Analyze RST_STREAM frames
            </span>
          </button>

          <button
            onClick={() => handleSend('Synthesize and deploy Cloudflare Edge WAF rule to block botnet ASN')}
            disabled={isThinking}
            className="p-2.5 rounded-lg bg-canvas-surface hover:bg-canvas-elevated border border-canvas-border hover:border-slate-700 text-left transition-colors group disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <span className="text-amber-400 font-medium block text-xs flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> 2. Deploy Edge WAF
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Drop botnet ASN traffic
            </span>
          </button>

          <button
            onClick={() => handleSend('Rebalance 80% traffic from us-east-1 to standby region eu-central-1')}
            disabled={isThinking}
            className="p-2.5 rounded-lg bg-canvas-surface hover:bg-canvas-elevated border border-canvas-border hover:border-slate-700 text-left transition-colors group disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <span className="text-emerald-400 font-medium block text-xs flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> 3. Shift 80% Traffic
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Reroute to EU-Central
            </span>
          </button>

          <button
            onClick={() => handleSend('Run 10000 iteration Monte Carlo failover simulation from us-east-1 to eu-central-1')}
            disabled={isThinking}
            className="p-2.5 rounded-lg bg-canvas-surface hover:bg-canvas-elevated border border-canvas-border hover:border-slate-700 text-left transition-colors group disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <span className="text-indigo-400 font-medium block text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 4. Failover Sim
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Monte Carlo simulation
            </span>
          </button>

          <button
            onClick={() => handleSend('Execute break-glass quarantine on auth-ingress-us-east-1 with 100% drain')}
            disabled={isThinking}
            className="col-span-2 p-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 hover:border-rose-500/30 text-left transition-colors group disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <span className="text-rose-300 font-medium block text-xs flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-400" /> 5. Break-Glass Quarantine (Declarative WebMCP)
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Auto-fills & triggers W3C quarantine form
            </span>
          </button>
        </div>
      </div>

      {/* Message Timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
        {messages.map((msg) => {
          if (msg.sender === 'SYSTEM') {
            return (
              <div key={msg.id} className="text-center text-[11px] text-slate-400 my-1">
                <span className="px-3 py-0.5 rounded-full bg-canvas-surface border border-canvas-border font-mono text-[10px]">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isOperator = msg.sender === 'OPERATOR';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isOperator ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 font-sans">
                {isOperator ? (
                  <>
                    <span className="font-semibold text-slate-300">Operator</span>
                    <User className="w-3 h-3 text-blue-400" />
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-emerald-400" />
                    <span className="font-semibold text-slate-300">Aegis Co-Pilot</span>
                  </>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              <div
                className={`p-3.5 rounded-xl max-w-[90%] text-xs leading-relaxed ${
                  isOperator
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-canvas-surface text-slate-200 border border-canvas-border shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Executed Tools Summary */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2">
                    {msg.toolCalls.map((call, i) => {
                      const callId = `${msg.id}-${i}`;
                      const isExpanded = expandedCalls[callId];

                      return (
                        <div key={i} className="rounded-lg bg-canvas-bg border border-canvas-border p-2.5 font-sans text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-200 font-medium flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Executed: <code className="text-blue-400 font-mono">{call.toolName}()</code>
                            </span>
                            <button
                              onClick={() => toggleCallExpand(callId)}
                              className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                            >
                              {isExpanded ? <>Hide <ChevronUp className="w-3 h-3" /></> : <>Inspect Result <ChevronDown className="w-3 h-3" /></>}
                            </button>
                          </div>

                          {isExpanded && call.result && (
                            <pre className="mt-2 text-[10px] text-slate-300 bg-canvas-surface p-2.5 rounded font-mono overflow-x-auto max-h-32">
                              {call.result}
                            </pre>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-center gap-2 text-slate-300 font-sans text-xs p-2.5 rounded-lg bg-canvas-surface border border-canvas-border w-fit shadow-sm">
            <Bot className="w-4 h-4 animate-spin text-blue-400" />
            <span>Agent synthesizing response via WebMCP...</span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="p-3.5 border-t border-canvas-border bg-canvas-surface/80 backdrop-blur flex items-center gap-2">
        <input
          type="text"
          placeholder="Issue incident command (e.g. 'Deploy WAF rule', 'Shift traffic', 'Isolate auth cluster')..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isThinking}
          className="flex-1 bg-canvas-bg border border-canvas-border rounded-lg px-3.5 py-2 text-slate-200 text-xs focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 placeholder:text-slate-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputPrompt.trim() || isThinking}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};
