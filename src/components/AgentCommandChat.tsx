import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Zap, XCircle, ChevronDown, ChevronUp, CheckCircle, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
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
    <div className="bg-warroom-card border border-warroom-border rounded-xl flex flex-col h-[580px] overflow-hidden select-none shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-warroom-border/80 px-4 py-3 bg-warroom-card">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-white flex items-center gap-2">
              AUTONOMOUS SRE CO-PILOT
              <span className="text-[10px] font-sans font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Connected to document.modelContext
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Direct tools execution with human-in-the-loop validation
            </p>
          </div>
        </div>

        {isThinking && (
          <button
            onClick={() => inPageAgent.abortCurrentAction()}
            className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer animate-pulse"
          >
            <XCircle className="w-3.5 h-3.5" /> Abort Action
          </button>
        )}
      </div>

      {/* Ergonomic 1-Click Tactical Actions Grid */}
      <div className="p-3 bg-slate-950/70 border-b border-warroom-border/80">
        <span className="text-[11px] font-semibold text-slate-400 block mb-2">
          Recommended Incident Actions:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-sans">
          <button
            onClick={() => handleSend('Sniff and trace network packets for protocol HTTP2')}
            disabled={isThinking}
            className="p-2 rounded-lg bg-slate-900/90 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group disabled:opacity-50 cursor-pointer"
          >
            <span className="text-cyan-400 font-bold block text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <Zap className="w-3.5 h-3.5" /> 1. Sniff Packets
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Heuristic RST_STREAM trace
            </span>
          </button>

          <button
            onClick={() => handleSend('Synthesize and deploy Cloudflare Edge WAF rule to block botnet ASN')}
            disabled={isThinking}
            className="p-2 rounded-lg bg-slate-900/90 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group disabled:opacity-50 cursor-pointer"
          >
            <span className="text-cyan-400 font-bold block text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> 2. Deploy WAF
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Block malicious botnet ASN
            </span>
          </button>

          <button
            onClick={() => handleSend('Rebalance 80% traffic from us-east-1 to standby region eu-central-1')}
            disabled={isThinking}
            className="p-2 rounded-lg bg-slate-900/90 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group disabled:opacity-50 cursor-pointer"
          >
            <span className="text-cyan-400 font-bold block text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" /> 3. Shift 80% Traffic
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Reroute to EU-Central
            </span>
          </button>

          <button
            onClick={() => handleSend('Run 10000 iteration Monte Carlo failover simulation from us-east-1 to eu-central-1')}
            disabled={isThinking}
            className="p-2 rounded-lg bg-slate-900/90 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group disabled:opacity-50 cursor-pointer"
          >
            <span className="text-cyan-400 font-bold block text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> 4. Failover Sim
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Monte Carlo prediction
            </span>
          </button>

          <button
            onClick={() => handleSend('Execute break-glass quarantine on auth-ingress-us-east-1 with 100% drain')}
            disabled={isThinking}
            className="col-span-2 p-2 rounded-lg bg-red-950/40 hover:bg-red-950/70 border border-red-500/30 hover:border-red-500/60 text-left transition-all group disabled:opacity-50 cursor-pointer"
          >
            <span className="text-red-300 font-bold block text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <XCircle className="w-3.5 h-3.5 text-red-400" /> 5. Break-Glass Quarantine (Declarative WebMCP)
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Auto-fills & submits W3C quarantine form
            </span>
          </button>
        </div>
      </div>

      {/* Message Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
        {messages.map((msg) => {
          if (msg.sender === 'SYSTEM') {
            return (
              <div key={msg.id} className="text-center text-[11px] text-slate-400 my-1">
                <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 font-mono text-[10px]">
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
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 font-mono">
                {isOperator ? (
                  <>
                    <span className="font-semibold text-cyan-300">YOU (OPERATOR)</span>
                    <User className="w-3 h-3 text-cyan-400" />
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-emerald-400" />
                    <span className="font-semibold text-emerald-300">AEGIS SRE AGENT</span>
                  </>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              <div
                className={`p-3.5 rounded-xl max-w-[90%] text-xs leading-relaxed ${
                  isOperator
                    ? 'bg-cyan-950/40 text-cyan-100 border border-cyan-500/30'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800/80 shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Collapsible Tool Calls Display */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2">
                    {msg.toolCalls.map((call, i) => {
                      const callId = `${msg.id}-${i}`;
                      const isExpanded = expandedCalls[callId];

                      return (
                        <div key={i} className="rounded-lg bg-slate-950/80 border border-slate-800/90 p-2.5 font-mono text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              Executed: {call.toolName}()
                            </span>
                            <button
                              onClick={() => toggleCallExpand(callId)}
                              className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                            >
                              {isExpanded ? <>Hide JSON <ChevronUp className="w-3 h-3" /></> : <>Inspect Payload <ChevronDown className="w-3 h-3" /></>}
                            </button>
                          </div>

                          {isExpanded && call.result && (
                            <pre className="mt-2 text-[10px] text-slate-300 bg-slate-900 p-2 rounded overflow-x-auto max-h-32">
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
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/20 w-fit">
            <Bot className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Agent reasoning and preparing WebMCP tool call...</span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="p-3 border-t border-warroom-border/80 bg-warroom-card flex items-center gap-2">
        <input
          type="text"
          placeholder="Issue tactical command (e.g. 'Reroute traffic', 'Deploy WAF', 'Inspect Auth cluster')..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isThinking}
          className="flex-1 bg-slate-950 border border-warroom-border rounded-lg px-3.5 py-2.5 text-cyan-200 text-xs focus:outline-none focus:border-cyan-400 transition-colors disabled:opacity-50"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputPrompt.trim() || isThinking}
          className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)]"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Execute</span>
        </button>
      </div>
    </div>
  );
};
