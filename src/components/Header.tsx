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
    { num: 1, label: '1. Incident Active' },
    { num: 2, label: '2. Signature Analyzed' },
    { num: 3, label: '3. Traffic Mitigated' },
    { num: 4, label: '4. Subnet Protected' }
  ];

  return (
    <header className="border-b border-canvas-border bg-canvas-subtle sticky top-0 z-30 select-none shadow-sm">
      {/* Top Bar: Brand, Scenario Selector & Key Telemetry */}
      <div className="max-w-[1800px] mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & System Status */}
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">
                Aegis Incident Command
              </h1>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                WebMCP Native
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans">
              Autonomous Cloud Defense & Human SRE Co-Presence
            </p>
          </div>
        </div>

        {/* Incident Scenario Selector */}
        <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 shadow-sm">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs text-slate-300 font-medium">Scenario:</span>
          <select
            value={state.scenario.id}
            onChange={(e) => telemetryEngine.selectScenario(e.target.value)}
            className="bg-slate-900 text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
          >
            {ATTACK_SCENARIOS.map((scenario) => (
              <option key={scenario.id} value={scenario.id} className="bg-slate-900 text-white font-medium">
                {scenario.name}
              </option>
            ))}
          </select>
        </div>

        {/* Real-Time Telemetry Stats */}
        <div className="flex items-center gap-3 text-xs">
          {/* Status Badge */}
          <div
            className={`px-3 py-1.5 rounded-md border font-semibold flex items-center gap-1.5 shadow-sm ${
              state.threatLevel === 'CRITICAL'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : state.threatLevel === 'STABLE'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {state.threatLevel === 'STABLE' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            )}
            <span>{state.threatLevel}</span>
          </div>

          {/* Ingress Volume */}
          <div className="bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 flex items-center gap-2 font-mono">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300 font-sans">Ingress:</span>
            <span className="font-bold text-white">{(state.globalRps / 1000).toFixed(1)}k RPS</span>
          </div>

          {/* P99 Latency */}
          <div className="bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 flex items-center gap-2 font-mono">
            <Cpu className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-300 font-sans">P99:</span>
            <span className={`font-bold ${state.p99LatencyMs > 300 ? 'text-amber-300' : 'text-emerald-300'}`}>
              {state.p99LatencyMs}ms
            </span>
          </div>

          {/* Incident Clock */}
          <div className="bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 flex items-center gap-1.5 font-mono text-white">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold">T+{formatTime(state.incidentTimerSeconds)}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setAudioMuted(!audioMuted)}
            className="p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={audioMuted ? 'Muted' : 'Sound active'}
          >
            {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
          </button>
        </div>
      </div>

      {/* Understated Triage Workflow Ribbon */}
      <div className="border-t border-canvas-border bg-slate-950 px-6 py-2.5">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4 text-xs font-sans">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            {steps.map((step, idx) => {
              const isDone = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <React.Fragment key={step.num}>
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      isDone
                        ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-500/30'
                        : isCurrent
                        ? 'text-white bg-blue-600 border border-blue-400 shadow-sm'
                        : 'text-slate-300 bg-slate-900 border border-slate-800'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-200 text-[10px] flex items-center justify-center font-mono">
                        {step.num}
                      </span>
                    )}
                    <span>{step.label}</span>
                  </div>

                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-300 font-sans">Mitigation:</span>
            <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${state.mitigationPercent}%` }}
              />
            </div>
            <span className="text-white font-bold">{state.mitigationPercent}%</span>
          </div>
        </div>
      </div>
    </header>
  );
};
