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
import { ShieldCheck, ExternalLink, Sliders, Terminal } from 'lucide-react';

export const App: React.FC = () => {
  const [activeBottomView, setActiveBottomView] = useState<'CONTROLS' | 'TERMINAL'>('CONTROLS');

  useEffect(() => {
    GLOBAL_WEBMCP_TOOLS.forEach((tool) => {
      webMCPManager.registerTool(tool).catch((err) => {
        console.error(`[Aegis] Failed to register global tool "${tool.name}":`, err);
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-canvas-bg text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation & Status */}
      <Header />

      {/* Main Command Center Deck */}
      <main className="flex-1 p-6 space-y-6 max-w-[1800px] w-full mx-auto">
        {/* Upper Level: Topology Map + Agent Co-Pilot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Architecture Canvas (7 Cols) */}
          <div className="lg:col-span-7 w-full">
            <TopologyCanvas />
          </div>

          {/* Right: Agent Triage Chat (5 Cols) */}
          <div className="lg:col-span-5 w-full">
            <AgentCommandChat />
          </div>
        </div>

        {/* Tactical Deck Switcher Bar */}
        <div className="flex items-center justify-between border-b border-canvas-border pb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white font-sans">
              Operations Deck:
            </span>
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs font-sans">
              <button
                onClick={() => setActiveBottomView('CONTROLS')}
                className={`px-3.5 py-1.5 rounded-md flex items-center gap-2 transition-colors cursor-pointer ${
                  activeBottomView === 'CONTROLS'
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-200 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Mitigation Controls & Diagnostics
              </button>
              <button
                onClick={() => setActiveBottomView('TERMINAL')}
                className={`px-3.5 py-1.5 rounded-md flex items-center gap-2 transition-colors cursor-pointer ${
                  activeBottomView === 'TERMINAL'
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-200 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                WebMCP Protocol Terminal & Matrix
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs font-sans">
            <span className="flex items-center gap-1.5 text-emerald-300 font-semibold bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Origin-Keyed Cluster Isolated
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">Policy: <code className="text-white font-mono font-bold">tools=(self)</code></span>
          </div>
        </div>

        {/* Lower Level: Tactical Controls OR Protocol Terminal */}
        {activeBottomView === 'CONTROLS' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Node Diagnostics */}
            <div className="w-full">
              <NodeDiagnostics />
            </div>

            {/* Column 2: Monte Carlo Simulator */}
            <div className="w-full">
              <MonteCarloModal />
            </div>

            {/* Column 3: Declarative Quarantine */}
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

      {/* Enterprise Footer */}
      <footer className="border-t border-canvas-border bg-slate-950 px-6 py-4 mt-auto">
        <div className="max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-sans text-slate-300">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold">Aegis Incident Command</span>
            <span>•</span>
            <span className="text-slate-200">The WebMCP Challenge 2026</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Open Source (MIT License)</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://webmachinelearning.github.io/webmcp/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1 text-slate-300 font-medium"
            >
              W3C Specification <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            </a>
            <a
              href="https://developer.chrome.com/docs/ai/webmcp"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1 text-slate-300 font-medium"
            >
              Chrome AI Docs <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
