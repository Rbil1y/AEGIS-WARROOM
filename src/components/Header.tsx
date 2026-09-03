import React, { useEffect, useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Activity, Cpu, Clock, Radio, Volume2, VolumeX, CheckCircle2, ChevronRight } from 'lucide-react';
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

  // Determine active incident step in the 4-step triage pipeline
  const getActiveStep = () => {
    if (state.threatLevel === 'STABLE') return 4;
    if (state.quarantinedSubnets.length > 0) return 4;
    if (state.mitigationPercent >= 70) return 3;
    if (state.activeWafRules.length > 0) return 2;
    return 1;
  };

  const currentStep = getActiveStep();

  const steps = [
    { num: 1, label: 'Threat Active' },
    { num: 2, label: 'Packet Sniffed' },
    { num: 3, label: 'Traffic Shifted' },
    { num: 4, label: 'Subnet Secured' }
  ];

  return (
    <header className="border-b border-warroom-border/80 bg-warroom-card/95 backdrop-blur-md px-6 py-3 select-none">
      <div className="flex flex-col gap-3">
        {/* Upper Row: Brand, Scenario Selector, Vital Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Protocol Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Shield className="w-5 h-5 text-warroom-cyber" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-wider font-mono text-white">
                  AEGIS <span className="text-warroom-cyber">WARROOM</span>
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                  WebMCP 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Autonomous SRE & Human Co-Pilot Cockpit
              </p>
            </div>
          </div>

          {/* Scenario Selector Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-warroom-border rounded-lg px-3 py-1.5 shadow-inner">
            <span className="text-xs font-medium text-slate-400">Incident:</span>
            <select
              value={state.scenario.id}
              onChange={(e) => telemetryEngine.selectScenario(e.target.value)}
              className="bg-transparent text-xs font-semibold text-cyan-300 focus:outline-none cursor-pointer pr-2"
            >
              {ATTACK_SCENARIOS.map((scenario) => (
                <option key={scenario.id} value={scenario.id} className="bg-slate-950 text-slate-200">
                  {scenario.name}
                </option>
              ))}
            </select>
          </div>

          {/* Key Gauges (Clean, intuitive pills) */}
          <div className="flex items-center gap-3">
            {/* Threat Badge */}
            <div
              className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${
                state.threatLevel === 'CRITICAL'
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 animate-pulse'
                  : state.threatLevel === 'STABLE'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
              }`}
            >
              {state.threatLevel === 'STABLE' ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5" />
              )}
              {state.threatLevel}
            </div>

            {/* Ingress Volume Pill */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1 flex items-center gap-2 text-xs font-mono">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Ingress:</span>
              <span className="font-bold text-white">{(state.globalRps / 1000).toFixed(1)}k <span className="text-[10px] text-slate-400 font-normal">RPS</span></span>
            </div>

            {/* P99 Latency Pill */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1 flex items-center gap-2 text-xs font-mono">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Latency:</span>
              <span className={`font-bold ${state.p99LatencyMs > 300 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {state.p99LatencyMs}ms
              </span>
            </div>

            {/* Timer */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1 flex items-center gap-1.5 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{formatTime(state.incidentTimerSeconds)}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
              title={soundEnabled ? 'Audio alerts active' : 'Audio alerts muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Lower Row: Intuitive 4-Step Incident Triage Pipeline */}
        <div className="bg-slate-950/60 border border-warroom-border/60 rounded-lg px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 whitespace-nowrap">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Incident Triage Pipeline:</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
            {steps.map((step, idx) => {
              const isPassed = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <React.Fragment key={step.num}>
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                      isPassed
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold'
                        : isCurrent
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.2)] font-bold animate-pulse'
                        : 'text-slate-500 bg-slate-900/40 border border-slate-800/40'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
                        {step.num}
                      </span>
                    )}
                    <span className="text-xs whitespace-nowrap">{step.label}</span>
                  </div>

                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Resolution:</span>
            <span className="text-cyan-400 font-bold">{state.mitigationPercent}%</span>
          </div>
        </div>
      </div>
    </header>
  );
};
