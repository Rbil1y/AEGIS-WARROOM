import React, { useState } from 'react';
import { Play, XCircle, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
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
        setAbortedMessage('Simulation cleanly halted by operator via WebMCP AbortSignal.');
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
    <div className="bg-canvas-subtle border border-canvas-border rounded-xl p-5 select-none flex flex-col gap-3.5 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-canvas-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide font-sans">
              Monte Carlo Failover Simulator
            </h3>
            <p className="text-[11px] text-slate-300 font-sans">
              10,000 packet stochastic queue forecast
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-semibold text-slate-200 bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
          W3C § 4.2.2 AbortSignal
        </span>
      </div>

      <p className="text-xs font-sans text-slate-200 leading-relaxed">
        Simulates 10,000 packet transfers to evaluate buffer bloat and latency spikes when shifting traffic to backup regions.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          onClick={startSimulation}
          disabled={isRunning}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          {isRunning ? `Simulating (${progress}%)...` : 'Run 10,000-Packet Test'}
        </button>

        {isRunning && (
          <button
            onClick={handleAbort}
            className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm animate-pulse"
          >
            <XCircle className="w-4 h-4" />
            Cancel Execution
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-mono font-semibold text-white">
            <span>Computing packet dynamics...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-700 font-sans text-xs space-y-2.5">
          <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="w-4 h-4" /> Simulation Complete ({result.iterationsRun} iterations):
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-white text-xs font-mono">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-700">
              Delivery: <strong className="text-emerald-300 font-bold text-sm block mt-0.5">{result.projectedDeliveryRate}</strong>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-700">
              P99 Latency: <strong className="text-blue-300 font-bold text-sm block mt-0.5">{result.projectedP99Latency}</strong>
            </div>
          </div>
          <div className="text-xs text-slate-200 pt-0.5 leading-relaxed font-sans">
            {result.verdict}
          </div>
        </div>
      )}

      {/* Aborted Message */}
      {abortedMessage && (
        <div className="p-3.5 bg-slate-950 rounded-lg border border-rose-500/50 font-sans text-xs text-rose-300 flex items-start gap-2.5 font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{abortedMessage}</span>
        </div>
      )}
    </div>
  );
};
