import React from 'react';
import { AlertTriangle, ShieldX, Ban, ArrowLeft, Key, Lock, CheckCircle2 } from 'lucide-react';
import { DetectedEntity, RiskAssessment } from '../types/privacy';

interface BlockScreenProps {
  assessment?: RiskAssessment | null;
  entities: DetectedEntity[];
  onEditPrompt: () => void;
  rawPrompt: string;
}

export const BlockScreen: React.FC<BlockScreenProps> = ({
  assessment,
  entities,
  onEditPrompt,
  rawPrompt
}) => {
  const credentials = entities.filter((e) => e.category === 'CREDENTIAL' || e.riskWeight >= 80);

  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="bg-slate-900 border-2 border-rose-600/70 rounded-2xl shadow-2xl shadow-rose-950/50 overflow-hidden">
        {/* Header Alert Strip */}
        <div className="bg-gradient-to-r from-rose-900 via-red-900 to-rose-950 px-6 py-4 border-b border-rose-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-lg animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-rose-300 uppercase">
                🚨 Critical Privacy Risk Enforcement
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                REQUEST BLOCKED
              </h2>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-rose-950 border border-rose-500/50 text-xs font-mono font-bold text-rose-300">
            FAIL-CLOSED HALT
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-slate-300 text-sm leading-relaxed">
            <p className="font-semibold text-rose-400 text-base mb-2">
              A highly sensitive credential, secret, or strict policy violation was detected in this request.
            </p>
            <p className="text-slate-400">
              In accordance with the zero-exposure privacy model, the gateway has immediately halted execution.
              The external Large Language Model was <strong className="text-white">never contacted</strong> and
              raw data was <strong className="text-white">not dispatched</strong> over the wire.
            </p>
          </div>

          {/* Verification Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/70 border border-rose-900/60 rounded-xl p-4 flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Ban className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">External AI Transmission</span>
                <span className="text-sm font-bold text-rose-300 flex items-center gap-1.5 mt-0.5">
                  BLOCKED <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </span>
                <p className="text-[11px] text-slate-500 mt-1">Socket closed. 0 bytes transmitted to LLM.</p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-emerald-900/60 rounded-xl p-4 flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldX className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Original Sensitive Information</span>
                <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5 mt-0.5">
                  NOT SENT <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </span>
                <p className="text-[11px] text-slate-500 mt-1">Confidential credentials retained locally.</p>
              </div>
            </div>
          </div>

          {/* Triggering Violations */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-rose-400" />
              Detected Critical Identifiers ({credentials.length || entities.length})
            </h4>

            <div className="space-y-2">
              {(credentials.length > 0 ? credentials : entities).map((entity, i) => (
                <div
                  key={entity.id || i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
                      {entity.type}
                    </span>
                    <span className="text-slate-300 font-medium">{entity.label}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Risk Weight: {entity.riskWeight}/100
                  </span>
                </div>
              ))}
            </div>

            {assessment?.reasons && assessment.reasons.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
                {assessment.reasons.map((r, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Area: strictly NO bypass button, only [Edit Prompt] as demanded by prompt */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              Security Policy Enforcement: Requests containing secrets or hard-blocked policies cannot be bypassed.
            </p>
            <button
              onClick={onEditPrompt}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center space-x-2 border border-slate-700 transition shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>[ Edit Prompt ]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
