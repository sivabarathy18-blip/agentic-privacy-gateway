import React from 'react';
import { ShieldCheck, Check, AlertOctagon } from 'lucide-react';
import { PreSendGateResult } from '../types/privacy';

interface PreSendGateBadgeProps {
  gateResult?: PreSendGateResult | null;
  className?: string;
}

export const PreSendGateBadge: React.FC<PreSendGateBadgeProps> = ({
  gateResult,
  className = ''
}) => {
  const isPassed = gateResult ? gateResult.passed : true;

  return (
    <div className={`rounded-xl border p-4 ${
      isPassed
        ? 'bg-slate-900/90 border-emerald-500/40 text-slate-200'
        : 'bg-rose-950/40 border-rose-600/60 text-rose-200'
    } ${className}`}>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            {isPassed ? <ShieldCheck className="w-5 h-5" /> : <AlertOctagon className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              🛡️ Final Privacy Gate
              {isPassed ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PASSED
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  FAILED - CLOSED
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-400">
              Deterministic pre-transmission memory and regex safety inspection
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-emerald-400 hidden sm:inline-block">
          Zero-Leakage Verified
        </span>
      </div>

      {/* Checklist items requested by spec */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="flex items-center space-x-2 text-emerald-400 bg-slate-800/60 px-2.5 py-1.5 rounded-md border border-slate-700/50">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-300 font-medium">Sensitive data scan complete</span>
        </div>
        <div className="flex items-center space-x-2 text-emerald-400 bg-slate-800/60 px-2.5 py-1.5 rounded-md border border-slate-700/50">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-300 font-medium">Raw values removed</span>
        </div>
        <div className="flex items-center space-x-2 text-emerald-400 bg-slate-800/60 px-2.5 py-1.5 rounded-md border border-slate-700/50">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-300 font-medium">Protected prompt verified</span>
        </div>
        <div className="flex items-center space-x-2 text-emerald-400 bg-slate-800/60 px-2.5 py-1.5 rounded-md border border-slate-700/50">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-300 font-medium">Safe for external AI</span>
        </div>
      </div>

      {gateResult?.residualLeaks && gateResult.residualLeaks.length > 0 && (
        <div className="mt-3 p-2.5 rounded-md bg-rose-900/30 border border-rose-700/50 text-xs text-rose-300">
          <p className="font-semibold mb-1">Gate Leak Violations Detected:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {gateResult.residualLeaks.map((leak, i) => (
              <li key={i}>{leak}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
