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
      <div className="flex items-center justify-between border-b border-canvas-border px-5 py-3.5 bg-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              SRE Co-Pilot & WebMCP Triage
            </h3>
            <p className="text-[11px] text-slate-300 font-sans">
              Autonomous execution with human supervision
            </p>
          </div>
        </div>

        {isThinking && (
          <button
            onClick={() => inPageAgent.abortCurrentAction()}
            className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <XCircle className="w-4 h-4" /> Cancel Execution
          </button>
        )}
      </div>

      {/* High-Contrast Action Presets */}
      <div className="p-3.5 bg-slate-950 border-b border-canvas-border">
        <span className="text-xs font-semibold text-slate-200 block mb-2 font-sans">
          Quick Incident Actions:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-sans">
          <button
            onClick={() => handleSend('Sniff and trace network packets for protocol HTTP2')}
            disabled={isThinking}
            className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-colors group disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <span className="text-blue-300 font-bold block text-xs flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-400" /> 1. Sniff Packets
            </span>
            <span className="text-[11px] text-slate-300 block mt-1">
              Analyze RST_STREAM frames
            </span>
          </button>

          <button
            onClick={() => handleSend('Synthesize and deploy Cloudflare Edge WAF rule to block botnet ASN')}
            disabled={isThinking}
            className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-colors group disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <span className="text-amber-300 font-bold block text-xs flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> 2. Deploy Edge WAF
            </span>
            <span className="text-[11px] text-slate-300 block mt-1">
              Drop botnet ASN traffic
            </span>
          </button>

          <button
            onClick={() => handleSend('Rebalance 80% traffic from us-east-1 to standby region eu-central-1')}
            disabled={isThinking}
            className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-colors group disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <span className="text-emerald-300 font-bold block text-xs flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" /> 3. Shift 80% Traffic
            </span>
            <span className="text-[11px] text-slate-300 block mt-1">
              Reroute to EU-Central
            </span>
          </button>

          <button
            onClick={() => handleSend('Run 10000 iteration Monte Carlo failover simulation from us-east-1 to eu-central-1')}
            disabled={isThinking}
            className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-colors group disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <span className="text-indigo-300 font-bold block text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" /> 4. Failover Sim
            </span>
            <span className="text-[11px] text-slate-300 block mt-1">
              Monte Carlo simulation
            </span>
          </button>

          <button
            onClick={() => handleSend('Execute break-glass quarantine on auth-ingress-us-east-1 with 100% drain')}
            disabled={isThinking}
            className="col-span-2 p-3 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-left transition-colors group disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <span className="text-rose-200 font-bold block text-xs flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-400" /> 5. Break-Glass Quarantine (Declarative WebMCP)
            </span>
            <span className="text-[11px] text-slate-300 block mt-1">
              Auto-fills & triggers W3C quarantine form
            </span>
          </button>
        </div>
      </div>

      {/* Message Timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 font-sans text-xs">
        {messages.map((msg) => {
          if (msg.sender === 'SYSTEM') {
            return (
              <div key={msg.id} className="text-center text-xs text-slate-300 my-1">
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 font-mono text-[11px] text-slate-200">
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
              <div className="flex items-center gap-2 text-[11px] text-slate-300 mb-1 font-sans">
                {isOperator ? (
                  <>
                    <span className="font-bold text-blue-400">Operator</span>
                    <User className="w-3.5 h-3.5 text-blue-400" />
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-emerald-400">Aegis Co-Pilot</span>
                  </>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              <div
                className={`p-3.5 rounded-xl max-w-[90%] text-xs leading-relaxed ${
                  isOperator
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'bg-slate-900 text-slate-100 border border-slate-700 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Executed Tools Summary */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700 space-y-2">
                    {msg.toolCalls.map((call, i) => {
                      const callId = `${msg.id}-${i}`;
                      const isExpanded = expandedCalls[callId];

                      return (
                        <div key={i} className="rounded-lg bg-slate-950 border border-slate-700 p-2.5 font-sans text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-semibold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              Executed: <code className="text-blue-300 font-mono font-bold">{call.toolName}()</code>
                            </span>
                            <button
                              onClick={() => toggleCallExpand(callId)}
                              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              {isExpanded ? <>Hide <ChevronUp className="w-3.5 h-3.5" /></> : <>Inspect Result <ChevronDown className="w-3.5 h-3.5" /></>}
                            </button>
                          </div>

                          {isExpanded && call.result && (
                            <pre className="mt-2 text-[11px] text-slate-200 bg-slate-900 p-2.5 rounded font-mono overflow-x-auto max-h-32 border border-slate-800">
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
          <div className="flex items-center gap-2 text-white font-sans text-xs p-3 rounded-lg bg-slate-900 border border-slate-700 w-fit shadow-sm">
            <Bot className="w-4 h-4 animate-spin text-blue-400" />
            <span>Agent synthesizing tactical response via WebMCP...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-3.5 border-t border-canvas-border bg-slate-900 flex items-center gap-2">
        <input
          type="text"
          placeholder="Issue incident command (e.g. 'Deploy WAF rule', 'Shift traffic', 'Isolate auth cluster')..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isThinking}
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 placeholder:text-slate-400"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputPrompt.trim() || isThinking}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};
