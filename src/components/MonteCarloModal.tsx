import React, { useState } from 'react';
import { Play, XSquare, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
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

    // Progress counter visual interval
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 200);

    try {
      // Execute simulate_failover_latency via WebMCP with AbortSignal passed (§ 4.2.2)
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
        setAbortedMessage('Simulation cleanly aborted by operator via WebMCP AbortSignal. In-flight tasks terminated.');
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
    <div className="bg-warroom-card border border-warroom-border rounded-xl p-4 select-none flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-warroom-border/80">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
            Monte Carlo Failover Engine (WebMCP AbortSignal Demo)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
          W3C § 4.2.2 Signal
        </span>
      </div>

      <p className="text-xs font-mono text-slate-400">
        Streams 10,000 simulated packet transfers across US-East and EU-Central to forecast buffer bloat. Pass a live <code className="text-cyan-300">AbortSignal</code> to test execution cancellation.
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={startSimulation}
          disabled={isRunning}
          className="px-4 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
          {isRunning ? `Computing (${progress}%)...` : 'Run 10,000-Packet Simulation'}
        </button>

        {isRunning && (
          <button
            onClick={handleAbort}
            className="px-4 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-500/50 text-red-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,51,102,0.3)] animate-pulse cursor-pointer"
          >
            <XSquare className="w-4 h-4 text-red-400" />
            Abort via AbortSignal
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-cyan-400">
            <span>Evaluating Stochastic Network Queues...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="p-3 bg-slate-950 rounded-lg border border-emerald-500/40 font-mono text-xs space-y-1">
          <div className="text-emerald-400 font-bold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Simulation Results ({result.iterationsRun} Iterations):
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 text-slate-300 text-[11px]">
            <div>Delivery Rate: <span className="text-cyan-300 font-bold">{result.projectedDeliveryRate}</span></div>
            <div>Projected P99: <span className="text-cyan-300 font-bold">{result.projectedP99Latency}</span></div>
          </div>
          <div className="text-[11px] text-emerald-300/90 pt-1">
            {result.verdict}
          </div>
        </div>
      )}

      {/* Aborted Message Display */}
      {abortedMessage && (
        <div className="p-3 bg-red-950/40 rounded-lg border border-red-500/40 font-mono text-xs text-red-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{abortedMessage}</span>
        </div>
      )}
    </div>
  );
};
