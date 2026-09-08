import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Eye, EyeOff, CheckCircle2, ArrowRight, Info } from 'lucide-react';
import { DetectedEntity, RiskAssessment, SecurityDecision } from '../types/privacy';

interface AnalysisViewProps {
  assessment?: RiskAssessment | null;
  entities: DetectedEntity[];
  entitySummary: { type: string; count: number; category: string }[];
  onProceedToProtect: () => void;
  onEditPrompt: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  assessment,
  entities,
  entitySummary,
  onProceedToProtect,
  onEditPrompt
}) => {
  const [showRawValues, setShowRawValues] = useState<boolean>(false);

  if (!assessment) {
    return (
      <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">No Active Scan Data</h3>
        <p className="text-sm text-slate-400 mb-4">Please return to the Gateway and enter a prompt to run detection analysis.</p>
        <button
          onClick={onEditPrompt}
          className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-500"
        >
          Go to Gateway
        </button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-rose-400 stroke-rose-500';
    if (score >= 50) return 'text-amber-400 stroke-amber-500';
    if (score >= 20) return 'text-yellow-400 stroke-yellow-500';
    return 'text-emerald-400 stroke-emerald-500';
  };

  const getDecisionBadge = (decision: SecurityDecision) => {
    switch (decision) {
      case 'ALLOW':
        return (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>ALLOW</span>
          </div>
        );
      case 'MASK':
        return (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs">
            <Shield className="w-4 h-4" />
            <span>MASK (Session Tokens)</span>
          </div>
        );
      case 'BLOCK':
        return (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono font-bold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>BLOCK (Fail-Closed)</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Inspection Summary Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold block mb-1">
              PRIVACY INSPECTION PANEL
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Agent 1 & 2: Detection & Risk Assessment
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400">Security Decision:</span>
            {getDecisionBadge(assessment.decision)}
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Entities Detected */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Entities Detected
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-white font-mono">{entities.length}</span>
              <span className="text-xs text-slate-400">sensitive items</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {entitySummary.length > 0 ? (
                entitySummary.map((item, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold"
                  >
                    {item.type} ({item.count})
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-400 font-mono">0 entities detected</span>
              )}
            </div>
          </div>

          {/* Card 2: Risk Score */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Privacy Risk Score
            </span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-3xl font-extrabold font-mono ${getScoreColor(assessment.score).split(' ')[0]}`}>
                {assessment.score}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 100</span>
            </div>

            {/* Score progress bar */}
            <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  assessment.score >= 80 ? 'bg-rose-500' : assessment.score >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(5, assessment.score)}%` }}
              ></div>
            </div>
          </div>

          {/* Card 3: Risk Level */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Risk Level
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`text-2xl font-extrabold tracking-tight ${
                  assessment.level === 'CRITICAL'
                    ? 'text-rose-400'
                    : assessment.level === 'HIGH'
                    ? 'text-amber-400'
                    : assessment.level === 'MEDIUM'
                    ? 'text-yellow-400'
                    : 'text-emerald-400'
                }`}
              >
                {assessment.level}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">
              Policy Mode: <strong className="text-slate-300 capitalize">{assessment.activeMode}</strong>
            </span>
          </div>
        </div>

        {/* Assessment Rationale */}
        {assessment.reasons.length > 0 && (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5 font-bold">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Security Decision Rationale
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {assessment.reasons.map((reason, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Detected Entities Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Detected Sensitive Entities ({entities.length})
            </h3>
            <p className="text-xs text-slate-400">
              Deterministic pattern matches tagged for session masking or blockage
            </p>
          </div>

          <button
            onClick={() => setShowRawValues(!showRawValues)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition font-mono"
          >
            {showRawValues ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showRawValues ? 'Obfuscate Local Values' : 'Inspect Raw Values (Local Only)'}</span>
          </button>
        </div>

        {entities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Entity Type</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Detected Content (Local)</th>
                  <th className="py-2.5 px-3">Risk Weight</th>
                  <th className="py-2.5 px-3">Protection Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {entities.map((entity, i) => (
                  <tr key={entity.id || i} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 font-bold text-cyan-300">
                      {entity.type}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
                        {entity.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {showRawValues ? (
                        <span className="text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/50">
                          {entity.raw}
                        </span>
                      ) : (
                        <span className="text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {entity.raw.substring(0, 2)}••••••••
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {entity.riskWeight} / 100
                    </td>
                    <td className="py-3 px-3">
                      {assessment.decision === 'BLOCK' ? (
                        <span className="text-rose-400 font-bold">HARD BLOCK</span>
                      ) : (
                        <span className="text-amber-400 font-bold">REPLACE WITH [TOKEN]</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
            No sensitive entities detected. Prompt is clean for direct transmission.
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={onEditPrompt}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
          >
            ← Modify Prompt
          </button>

          <button
            onClick={onProceedToProtect}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition flex items-center space-x-1.5"
          >
            <span>{assessment.decision === 'BLOCK' ? 'View Block Enforcement Screen' : 'Proceed to Session Masking & Gate'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
