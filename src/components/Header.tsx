import React, { useEffect, useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Activity, Cpu, Clock, Radio, Volume2, VolumeX } from 'lucide-react';
import { telemetryEngine, TelemetryState } from '../domain/telemetry';
import { ATTACK_SCENARIOS } from '../domain/attacks';

export const Header: React.FC = () => {
  const [state, setState] = useState<TelemetryState>(telemetryEngine.getState());
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    return telemetryEngine.subscribe(setState);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const threatColor = {
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    ELEVATED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    STABLE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
  }[state.threatLevel];

  const ThreatIcon = {
    CRITICAL: ShieldAlert,
    HIGH: ShieldAlert,
    ELEVATED: Shield,
    STABLE: ShieldCheck
  }[state.threatLevel];

  return (
    <header className="border-b border-warroom-border bg-warroom-card/90 backdrop-blur-md px-6 py-3 select-none">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-warroom-cyber/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.25)]">
              <Shield className="w-5 h-5 text-warroom-cyber" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-wider font-mono text-white flex items-center gap-2">
                AEGIS <span className="text-warroom-cyber">WARROOM</span>
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-500/30">
                v3.8 WebMCP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              W3C ModelContext Protocol Active • Origin-Keyed Cluster
            </p>
          </div>
        </div>

        {/* Middle: Scenario Switcher */}
        <div className="flex items-center gap-3 bg-slate-900/70 border border-warroom-border rounded-lg px-3 py-1.5">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Scenario:</span>
          <select
            value={state.scenario.id}
            onChange={(e) => telemetryEngine.selectScenario(e.target.value)}
            className="bg-slate-950 text-xs font-mono text-cyan-300 border border-warroom-border rounded px-2.5 py-1 focus:outline-none focus:border-warroom-cyber cursor-pointer"
          >
            {ATTACK_SCENARIOS.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                [{scenario.codeName}] {scenario.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Key Telemetry Gauges */}
        <div className="flex items-center gap-6">
          {/* Threat Level */}
          <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded border text-xs font-mono font-bold flex items-center gap-1.5 ${threatColor}`}>
              <ThreatIcon className="w-3.5 h-3.5" />
              {state.threatLevel}
            </div>
          </div>

          {/* Ingress Volume */}
          <div className="hidden lg:flex flex-col text-right font-mono">
            <span className="text-[10px] text-slate-400 uppercase">Ingress Traffic</span>
            <span className="text-sm font-bold text-white flex items-center justify-end gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              {(state.globalRps / 1000).toFixed(1)}k <span className="text-[10px] text-slate-400 font-normal">RPS</span>
            </span>
          </div>

          {/* P99 Latency */}
          <div className="hidden md:flex flex-col text-right font-mono">
            <span className="text-[10px] text-slate-400 uppercase">P99 Latency</span>
            <span className={`text-sm font-bold flex items-center justify-end gap-1 ${state.p99LatencyMs > 400 ? 'text-rose-400' : 'text-cyan-400'}`}>
              <Cpu className="w-3 h-3" />
              {state.p99LatencyMs}ms
            </span>
          </div>

          {/* Error Rate */}
          <div className="hidden sm:flex flex-col text-right font-mono">
            <span className="text-[10px] text-slate-400 uppercase">5xx Error</span>
            <span className={`text-sm font-bold ${state.errorRatePercent > 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {state.errorRatePercent}%
            </span>
          </div>

          {/* Mitigation Progress Bar */}
          <div className="flex flex-col w-28">
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>Mitigation</span>
              <span className="text-cyan-400 font-bold">{state.mitigationPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${state.mitigationPercent}%` }}
              />
            </div>
          </div>

          {/* Incident Clock */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300 bg-slate-950 px-2.5 py-1 rounded border border-warroom-border">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>T+{formatTime(state.incidentTimerSeconds)}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title={soundEnabled ? 'Disable Tactical Audio' : 'Enable Tactical Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
