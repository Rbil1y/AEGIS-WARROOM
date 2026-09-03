import React, { useEffect, useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Activity, Cpu, Clock, ChevronRight, CheckCircle2, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react';
import { telemetryEngine, TelemetryState } from '../domain/telemetry';
import { ATTACK_SCENARIOS } from '../domain/attacks';

export const Header: React.FC = () => {
  const [state, setState] = useState<TelemetryState>(telemetryEngine.getState());
  const [audioMuted, setAudioMuted] = useState(true);

  useEffect(() => {
    return telemetryEngine.subscribe(setState);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getActiveStep = () => {
    if (state.threatLevel === 'STABLE') return 4;
    if (state.quarantinedSubnets.length > 0) return 4;
    if (state.mitigationPercent >= 70) return 3;
    if (state.activeWafRules.length > 0) return 2;
    return 1;
  };

  const currentStep = getActiveStep();

  const steps = [
    { num: 1, label: '1. Incident Detected' },
    { num: 2, label: '2. Signature Identified' },
    { num: 3, label: '3. Traffic Mitigated' },
    { num: 4, label: '4. Subnet Protected' }
  ];

  return (
    <header className="border-b border-canvas-border bg-canvas-subtle/95 backdrop-blur-sm sticky top-0 z-30 select-none">
      {/* Top Bar: Brand, Scenario Selector & Key Telemetry */}
      <div className="max-w-[1800px] mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & System Status */}
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-white">
                Aegis Incident Command
              </h1>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                WebMCP Native
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Autonomous Cloud Defense & Human SRE Co-Presence
            </p>
          </div>
        </div>

        {/* Incident Scenario Selector */}
        <div className="flex items-center gap-2.5 bg-canvas-surface border border-canvas-border rounded-lg px-3 py-1.5 shadow-sm">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Scenario:</span>
          <select
            value={state.scenario.id}
            onChange={(e) => telemetryEngine.selectScenario(e.target.value)}
            className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer pr-1"
          >
            {ATTACK_SCENARIOS.map((scenario) => (
              <option key={scenario.id} value={scenario.id} className="bg-canvas-surface text-slate-200">
                {scenario.name}
              </option>
            ))}
          </select>
        </div>

        {/* Real-Time Telemetry Stats */}
        <div className="flex items-center gap-3 text-xs">
          {/* Status Badge */}
          <div
            className={`px-3 py-1 rounded-md border font-medium flex items-center gap-1.5 ${
              state.threatLevel === 'CRITICAL'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : state.threatLevel === 'STABLE'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {state.threatLevel === 'STABLE' ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5" />
            )}
            <span>{state.threatLevel}</span>
          </div>

          {/* Ingress Volume */}
          <div className="bg-canvas-surface border border-canvas-border rounded-md px-3 py-1 flex items-center gap-2 font-mono">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Ingress:</span>
            <span className="font-semibold text-white">{(state.globalRps / 1000).toFixed(1)}k RPS</span>
          </div>

          {/* P99 Latency */}
          <div className="bg-canvas-surface border border-canvas-border rounded-md px-3 py-1 flex items-center gap-2 font-mono">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">P99:</span>
            <span className={`font-semibold ${state.p99LatencyMs > 300 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {state.p99LatencyMs}ms
            </span>
          </div>

          {/* Incident Clock */}
          <div className="bg-canvas-surface border border-canvas-border rounded-md px-3 py-1 flex items-center gap-1.5 font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>T+{formatTime(state.incidentTimerSeconds)}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setAudioMuted(!audioMuted)}
            className="p-1.5 rounded-md bg-canvas-surface border border-canvas-border text-slate-400 hover:text-white transition-colors"
            title={audioMuted ? 'Muted' : 'Sound active'}
          >
            {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
          </button>
        </div>
      </div>

      {/* Understated Triage Workflow Ribbon */}
      <div className="border-t border-canvas-border/60 bg-canvas-bg/60 px-6 py-2">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4 text-xs font-sans">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            {steps.map((step, idx) => {
              const isDone = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <React.Fragment key={step.num}>
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs transition-colors ${
                      isDone
                        ? 'text-emerald-400 font-medium'
                        : isCurrent
                        ? 'text-blue-400 font-semibold bg-blue-500/10 border border-blue-500/20'
                        : 'text-slate-500'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-400 text-[10px] flex items-center justify-center font-mono">
                        {step.num}
                      </span>
                    )}
                    <span>{step.label}</span>
                  </div>

                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-slate-700 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Mitigation:</span>
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${state.mitigationPercent}%` }}
              />
            </div>
            <span className="text-white font-semibold">{state.mitigationPercent}%</span>
          </div>
        </div>
      </div>
    </header>
  );
};
