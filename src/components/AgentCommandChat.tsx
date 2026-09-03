import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Terminal, Zap, XCircle, ShieldAlert } from 'lucide-react';
import { inPageAgent, AgentMessage } from '../webmcp/inPageAgent';

export const AgentCommandChat: React.FC = () => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
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
    inPageAgent.runCommand(text, apiKey || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="bg-warroom-card border border-warroom-border rounded-xl flex flex-col h-[580px] overflow-hidden select-none shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-warroom-border/80 px-4 py-2.5 bg-warroom-card/90">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Aegis Autonomous SRE Co-Pilot
          </span>
          {isThinking && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isThinking && (
            <button
              onClick={() => inPageAgent.abortCurrentAction()}
              className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-red-900 transition-colors animate-pulse"
            >
              <XCircle className="w-3 h-3 text-red-400" /> Abort Action
            </button>
          )}

          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 underline cursor-pointer"
          >
            {apiKey ? 'API Key Set' : 'Optional API Key'}
          </button>
        </div>
      </div>

      {/* Optional API Key Drawer */}
      {showKeyInput && (
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 text-[11px]">Gemini/OpenAI Key:</span>
          <input
            type="password"
            placeholder="AIzaSy... (leave blank to use built-in SRE Agent)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-cyan-300 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
      )}

      {/* 1-Click Tactical Quick Presets for Judges */}
      <div className="bg-slate-950/70 border-b border-warroom-border/80 px-3 py-2 flex flex-wrap gap-1.5 font-mono text-[10px]">
        <button
          onClick={() => handleSend('Sniff and trace network packets for protocol HTTP2')}
          disabled={isThinking}
          className="px-2 py-1 rounded bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          <Zap className="w-3 h-3 text-cyan-400" /> 1. Trace Packets
        </button>
        <button
          onClick={() => handleSend('Synthesize and deploy Cloudflare Edge WAF rule to block botnet ASN')}
          disabled={isThinking}
          className="px-2 py-1 rounded bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          <Zap className="w-3 h-3 text-cyan-400" /> 2. Deploy Edge WAF
        </button>
        <button
          onClick={() => handleSend('Run 10000 iteration Monte Carlo failover simulation from us-east-1 to eu-central-1')}
          disabled={isThinking}
          className="px-2 py-1 rounded bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          <Zap className="w-3 h-3 text-cyan-400" /> 3. Run Failover Sim
        </button>
        <button
          onClick={() => handleSend('Rebalance 80% traffic from us-east-1 to standby region eu-central-1')}
          disabled={isThinking}
          className="px-2 py-1 rounded bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          <Zap className="w-3 h-3 text-cyan-400" /> 4. Rebalance Traffic
        </button>
        <button
          onClick={() => handleSend('Execute break-glass quarantine on auth-ingress-us-east-1 with 100% drain')}
          disabled={isThinking}
          className="px-2 py-1 rounded bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/30 transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          <ShieldAlert className="w-3 h-3 text-red-400" /> 5. Break-Glass Quarantine
        </button>
      </div>

      {/* Message Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
        {messages.map((msg) => {
          if (msg.sender === 'SYSTEM') {
            return (
              <div key={msg.id} className="text-center text-[10px] text-slate-500 my-1">
                <span className="px-2 py-0.5 rounded bg-slate-900/60 border border-slate-800/80">
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
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-0.5">
                {isOperator ? (
                  <>
                    <span>OPERATOR</span> <User className="w-3 h-3 text-cyan-400" />
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-emerald-400" /> <span>AEGIS AGENT</span>
                  </>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              <div
                className={`p-3 rounded-lg max-w-[88%] text-[11px] leading-relaxed whitespace-pre-wrap ${
                  isOperator
                    ? 'bg-cyan-950/50 text-cyan-100 border border-cyan-500/30'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800'
                }`}
              >
                {msg.text}

                {/* Tool Calls Summary */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-800 space-y-1 text-[10px]">
                    {msg.toolCalls.map((call, i) => (
                      <div key={i} className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                        <div className="text-cyan-400 font-bold flex items-center justify-between">
                          <span>Called: {call.toolName}()</span>
                          <span className="text-emerald-400">{call.status}</span>
                        </div>
                        {call.result && (
                          <pre className="text-slate-400 mt-1 overflow-x-auto max-h-20 text-[9px]">
                            {call.result}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
            <Bot className="w-3.5 h-3.5 animate-spin" />
            <span>Agent reasoning via WebMCP tools...</span>
          </div>
        )}
      </div>

      {/* Command Input Bar */}
      <div className="p-3 border-t border-warroom-border/80 bg-warroom-card/90 flex items-center gap-2">
        <div className="relative flex-1">
          <Terminal className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Issue command (e.g., 'Agent, inspect cluster telemetry and rebalance traffic')..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
            className="w-full bg-slate-950 border border-warroom-border rounded-lg pl-9 pr-3 py-2 text-cyan-300 font-mono text-xs focus:outline-none focus:border-warroom-cyber transition-colors disabled:opacity-50"
          />
        </div>

        <button
          onClick={() => handleSend()}
          disabled={!inputPrompt.trim() || isThinking}
          className="p-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
