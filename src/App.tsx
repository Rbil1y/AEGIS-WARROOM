import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { TopologyCanvas } from './components/TopologyCanvas';
import { NodeDiagnostics } from './components/NodeDiagnostics';
import { DeclarativeQuarantineForm } from './components/DeclarativeQuarantineForm';
import { MonteCarloModal } from './components/MonteCarloModal';
import { ProtocolTerminal } from './components/ProtocolTerminal';
import { AgentCommandChat } from './components/AgentCommandChat';
import { webMCPManager } from './webmcp/manager';
import { GLOBAL_WEBMCP_TOOLS } from './domain/toolsRegistry';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const App: React.FC = () => {
  const [activeBottomView, setActiveBottomView] = useState<'CONTROLS' | 'TERMINAL'>('CONTROLS');

  useEffect(() => {
    // 1. Register global WebMCP tools on application mount per W3C WebMCP § 4.2
    GLOBAL_WEBMCP_TOOLS.forEach((tool) => {
      webMCPManager.registerTool(tool).catch((err) => {
        console.error(`[Aegis] Failed to register global tool "${tool.name}":`, err);
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-warroom-bg text-slate-100 flex flex-col font-sans selection:bg-warroom-cyber selection:text-black">
      {/* Top Telemetry Header */}
      <Header />

      {/* Main Mission Control Grid */}
      <main className="flex-1 p-6 space-y-6 max-w-[1800px] w-full mx-auto">
        {/* Upper Level: Topology Map + Agent Co-Pilot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Topology Canvas (7 Cols) */}
          <div className="lg:col-span-7 w-full">
            <TopologyCanvas />
          </div>

          {/* Right Column: Agent War Room Chat & Incident Triage (5 Cols) */}
          <div className="lg:col-span-5 w-full">
            <AgentCommandChat />
          </div>
        </div>

        {/* View Switcher for Lower Deck */}
        <div className="flex items-center justify-between border-b border-warroom-border/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Tactical Operations Deck:
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveBottomView('CONTROLS')}
                className={`px-3 py-1 rounded transition-colors ${activeBottomView === 'CONTROLS' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Diagnostic & Mitigation Controls
              </button>
              <button
                onClick={() => setActiveBottomView('TERMINAL')}
                className={`px-3 py-1 rounded transition-colors ${activeBottomView === 'TERMINAL' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
              >
                WebMCP Protocol Terminal & Inspector
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Origin Isolation Active
            </span>
            <span className="text-slate-600">|</span>
            <span>Permissions: <code className="text-cyan-400">tools=(self)</code></span>
          </div>
        </div>

        {/* Lower Level: Tactical Controls OR Protocol Terminal */}
        {activeBottomView === 'CONTROLS' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Node Diagnostics & Mounted Contextual Tools */}
            <div className="w-full">
              <NodeDiagnostics />
            </div>

            {/* Column 2: Monte Carlo Simulator (AbortSignal Demo) */}
            <div className="w-full">
              <MonteCarloModal />
            </div>

            {/* Column 3: Pure Declarative WebMCP Break-Glass Form */}
            <div className="w-full">
              <DeclarativeQuarantineForm />
            </div>
          </div>
        ) : (
          <div className="w-full">
            <ProtocolTerminal />
          </div>
        )}
      </main>

      {/* Global War Room Footer */}
      <footer className="border-t border-warroom-border/80 bg-warroom-card/90 px-6 py-4 mt-auto">
        <div className="max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold">AEGIS WARROOM</span>
            <span>•</span>
            <span>The WebMCP Challenge 2026</span>
            <span>•</span>
            <span className="text-cyan-400">Open Source (MIT License)</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://webmachinelearning.github.io/webmcp/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              W3C WebMCP Specification <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://developer.chrome.com/docs/ai/webmcp"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              Chrome Developer Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
