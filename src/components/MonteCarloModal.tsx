import React, { useState } from 'react';
import { Play, XCircle, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { webMCPManager } from '../webmcp/manager';

interface SimulationResult {
  simulationStatus: string;
  sourceRegion: string;
  targetRegion: string;
  iterationsRun: number;
  projectedDeliveryRate: string;
  projectedP99Latency: string;
  verdict: string;
}

export const MonteCarloModal: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [abortedMessage, setAbortedMessage] = useState<string | null>(null);

  const startSimulation = async () => {
    setIsRunning(true);
    setProgress(0);
    setResult(null);
    setAbortedMessage(null);

    const controller = new AbortController();
    setAbortController(controller);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 200);

    try {
      const res = await webMCPManager.executeTool('simulate_failover_latency', {
        sourceRegion: 'us-east-1',
        targetRegion: 'eu-central-1',
        iterations: 10000
      }, { signal: controller.signal });

      clearInterval(interval);
      setProgress(100);
      setResult(JSON.parse(res));
    } catch (err: any) {
      clearInterval(interval);
      if (err.name === 'AbortError' || controller.signal.aborted) {
        setAbortedMessage('Simulation cleanly cancelled by operator via WebMCP AbortSignal. Memory freed and background loops halted.');
      } else {
        setAbortedMessage(`Simulation Error: ${err.message}`);
      }
    } finally {
      setIsRunning(false);
      setAbortController(null);
    }
  };

  const handleAbort = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  return (
    <div className="bg-warroom-card border border-warroom-border rounded-xl p-5 select-none flex flex-col gap-3 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-warroom-border/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              Monte Carlo Failover Simulator
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              10,000 packet stochastic queue forecast
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
          W3C § 4.2.2 AbortSignal
        </span>
      </div>

      <p className="text-xs font-sans text-slate-300 leading-relaxed">
        Simulates 10,000 packet transfers to calculate buffer bloat risk when shifting US-East to EU-Central. Supports real-time execution cancellation.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          onClick={startSimulation}
          disabled={isRunning}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-black text-black" />
          {isRunning ? `Simulating (${progress}%)...` : 'Run 10,000-Packet Simulation'}
        </button>

        {isRunning && (
          <button
            onClick={handleAbort}
            className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,51,102,0.3)] animate-pulse cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-red-400" />
            Cancel via AbortSignal
          </button>
        )}
      </div>

      {/* Visual Progress Bar */}
      {isRunning && (
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-[11px] font-mono text-cyan-400">
            <span>Evaluating Stochastic Network Queues...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/40 font-sans text-xs space-y-2">
          <div className="text-emerald-400 font-bold flex items-center gap-1.5 font-mono">
            <CheckCircle className="w-4 h-4" /> Simulation Complete ({result.iterationsRun} Iterations):
          </div>
          <div className="grid grid-cols-2 gap-3 text-slate-300 text-xs font-mono">
            <div className="bg-slate-900 p-2 rounded">Delivery Rate: <strong className="text-emerald-400">{result.projectedDeliveryRate}</strong></div>
            <div className="bg-slate-900 p-2 rounded">Projected P99: <strong className="text-cyan-400">{result.projectedP99Latency}</strong></div>
          </div>
          <div className="text-xs text-slate-300 pt-1 font-sans">
            {result.verdict}
          </div>
        </div>
      )}

      {/* Aborted Message Display */}
      {abortedMessage && (
        <div className="p-3.5 bg-red-950/40 rounded-xl border border-red-500/40 font-mono text-xs text-red-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{abortedMessage}</span>
        </div>
      )}
    </div>
  );
};
