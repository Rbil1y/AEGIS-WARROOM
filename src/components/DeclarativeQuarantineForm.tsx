import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert, Key, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { declarativeEngine } from '../webmcp/declarative';
import { telemetryEngine, TelemetryState } from '../domain/telemetry';

export const DeclarativeQuarantineForm: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [telemetry, setTelemetry] = useState<TelemetryState>(telemetryEngine.getState());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auditReceipt, setAuditReceipt] = useState<string | null>(null);

  useEffect(() => {
    return telemetryEngine.subscribe(setTelemetry);
  }, []);

  useEffect(() => {
    if (formRef.current) {
      const unregister = declarativeEngine.registerForm(formRef.current);
      return unregister;
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const subnetId = String(formData.get('subnetId') || 'auth-ingress-us-east-1');
    const drainPercent = Number(formData.get('drainPercent') || 100);
    const failoverRegion = String(formData.get('failoverRegion') || 'eu-central-1');
    const authSignature = String(formData.get('authSignature') || 'SIG_BREAK_GLASS_OPERATOR');

    const isAgent = (e as any).agentInvoked === true;

    const executionPromise = new Promise((resolve) => {
      setTimeout(() => {
        telemetryEngine.quarantineNode(subnetId, failoverRegion);
        const receipt = {
          quarantineStatus: 'ENFORCED_GLOBALLY',
          isolatedSubnet: subnetId,
          trafficDrained: `${drainPercent}%`,
          standbyAbsorber: failoverRegion,
          sreSignature: authSignature,
          cryptographicAuditSignature: `0xAEGIS_${Date.now().toString(16).toUpperCase()}_SEC_VERIFIED`,
          agentActuated: isAgent,
          timestamp: new Date().toISOString()
        };
        const receiptStr = JSON.stringify(receipt, null, 2);
        setAuditReceipt(receiptStr);
        setIsSubmitting(false);
        resolve(receiptStr);
      }, 700);
    });

    if (isAgent && typeof (e as any).respondWith === 'function') {
      (e as any).respondWith(executionPromise);
    }
  };

  const isQuarantined = telemetry.quarantinedSubnets.length > 0;

  return (
    <div className="bg-warroom-card border border-warroom-border rounded-xl p-5 select-none relative overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-warroom-border/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-white flex items-center gap-2">
              BREAK-GLASS QUARANTINE PROTOCOL
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                DECLARATIVE WEBMCP
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Auto-filled & submitted by AI Agent with SRE cryptographic sign-off
            </p>
          </div>
        </div>

        <div>
          {isQuarantined ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              QUARANTINE ENFORCED
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
              ARMED / AWAITING ACTION
            </span>
          )}
        </div>
      </div>

      {/* Pure W3C Declarative WebMCP Form */}
      <form
        ref={formRef}
        id="quarantine-form"
        toolname="emergencySubnetQuarantine"
        tooldescription="Immediately quarantines compromised cloud subnet, severs ingress connections, and activates cold-standby infrastructure."
        toolautosubmit
        action="/api/v1/quarantine"
        onSubmit={handleSubmit}
        className="space-y-4 font-sans text-xs relative z-10 transition-all duration-300 p-2 rounded-lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Subnet Field */}
          <div>
            <label htmlFor="subnetId" className="block text-slate-300 mb-1.5 font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Target Subnet ID
            </label>
            <input
              type="text"
              id="subnetId"
              name="subnetId"
              defaultValue="auth-ingress-us-east-1"
              required
              toolparamdescription="Exact cluster or subnet identifier to isolate (e.g. auth-ingress-us-east-1)"
              className="w-full bg-slate-950 border border-warroom-border rounded-lg px-3.5 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Traffic Drain % */}
          <div>
            <label htmlFor="drainPercent" className="block text-slate-300 mb-1.5 font-medium">
              Traffic Drain Percentage
            </label>
            <input
              type="number"
              id="drainPercent"
              name="drainPercent"
              min="10"
              max="100"
              defaultValue="100"
              required
              toolparamdescription="Percentage of ingress traffic to immediately drop or redirect (10-100)"
              className="w-full bg-slate-950 border border-warroom-border rounded-lg px-3.5 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Destination Region */}
          <div>
            <label htmlFor="failoverRegion" className="block text-slate-300 mb-1.5 font-medium">
              Failover Standby Region
            </label>
            <select
              id="failoverRegion"
              name="failoverRegion"
              required
              toolparamdescription="Destination cloud region designated to absorb redirected workloads"
              className="w-full bg-slate-950 border border-warroom-border rounded-lg px-3.5 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
            >
              <option value="eu-central-1">EU-Central (Frankfurt Anycast)</option>
              <option value="ap-south-1">APAC-South (Singapore Secondary)</option>
            </select>
          </div>

          {/* 2FA Token Signature */}
          <div>
            <label htmlFor="authSignature" className="block text-slate-300 mb-1.5 font-medium flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              SRE Cryptographic 2FA Token
            </label>
            <input
              type="password"
              id="authSignature"
              name="authSignature"
              defaultValue="SIG_BREAK_GLASS_OPERATOR_0x7F9B"
              required
              toolparamdescription="High-privilege emergency operator token for break-glass audit trail"
              className="w-full bg-slate-950 border border-warroom-border rounded-lg px-3.5 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>

        {/* Submit Section */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 font-mono">
            W3C Attributes: <code className="text-cyan-400 font-bold">toolname</code>, <code className="text-cyan-400 font-bold">toolautosubmit</code>, <code className="text-cyan-400 font-bold">:tool-form-active</code>
          </span>

          <button
            type="submit"
            id="quarantine-submit-btn"
            disabled={isSubmitting || isQuarantined}
            className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(255,51,102,0.4)] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>Executing Protocol...</>
            ) : isQuarantined ? (
              <>Subnet Quarantined</>
            ) : (
              <>
                Execute Quarantine <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Audit Receipt Modal / Box */}
      {auditReceipt && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-emerald-500/40 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            CRYPTOGRAPHIC QUARANTINE AUDIT RECEIPT (RETURNED VIA e.respondWith):
          </div>
          <pre className="text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
            {auditReceipt}
          </pre>
        </div>
      )}
    </div>
  );
};
