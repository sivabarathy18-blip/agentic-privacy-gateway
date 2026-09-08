import React from 'react';
import { Shield, ShieldCheck, ArrowRight, EyeOff, Bot, Lock, AlertCircle, Copy, Check } from 'lucide-react';
import { PreSendGateBadge } from './PreSendGateBadge';
import { ProtectResponse, DetectedEntity, EntityType } from '../types/privacy';

interface ProtectedViewProps {
  protectData?: ProtectResponse | null;
  originalPrompt: string;
  onTransmitToAI: () => void;
  isLoading: boolean;
  onBackToAnalysis: () => void;
}

export const ProtectedView: React.FC<ProtectedViewProps> = ({
  protectData,
  originalPrompt,
  onTransmitToAI,
  isLoading,
  onBackToAnalysis
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!protectData) {
    return (
      <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <EyeOff className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Protection Not Yet Generated</h3>
        <p className="text-sm text-slate-400 mb-4">Please scan your prompt first to generate the masked session payload.</p>
        <button
          onClick={onBackToAnalysis}
          className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-500"
        >
          Go to Analysis
        </button>
      </div>
    );
  }

  const handleCopyProtected = () => {
    navigator.clipboard.writeText(protectData.protectedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Section 11: Protected Transmission Indicator */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border-2 border-cyan-500/50 rounded-2xl p-6 shadow-2xl shadow-cyan-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                AUDIT VERIFICATION
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                🛡️ PROTECTED TRANSMISSION
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              SAFE FOR EXTERNAL LLM
            </span>
          </div>
        </div>

        {/* Transmission Payload Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-slate-950/80 border border-cyan-900/60 rounded-xl p-4">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 block mb-2 font-bold">
              External AI Receives:
            </span>
            <div className="flex flex-wrap gap-2">
              {protectData.tokens.length > 0 ? (
                protectData.tokens.map((t, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-700/60"
                  >
                    {t.placeholder}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 font-mono">
                  [Standard Clean Prompt - No PII Tokens Required]
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">
              Only anonymous, session-bound placeholder identifiers are transmitted over the wire.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-rose-900/60 rounded-xl p-4">
            <span className="text-xs font-mono uppercase tracking-wider text-rose-300 block mb-2 font-bold">
              Raw Sensitive Information:
            </span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-md bg-rose-950 text-rose-300 border border-rose-800">
                BLOCKED (0 Bytes Transmitted)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">
              Zero raw names, emails, phone numbers, or account details leave the gateway container boundary.
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-Side Prompt Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Original Prompt */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold">
                  Original User Prompt (Client-Side)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {originalPrompt.length} chars
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 leading-relaxed min-h-[160px] whitespace-pre-wrap">
              {originalPrompt}
            </div>
          </div>

          <div className="mt-3 text-[11px] text-amber-400/80 flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Contains raw identifiable values. Never shared with external LLM.</span>
          </div>
        </div>

        {/* Right: Protected Prompt */}
        <div className="bg-slate-900 border border-cyan-800/50 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold">
                  Protected Prompt (External AI Payload)
                </h3>
              </div>
              <button
                onClick={handleCopyProtected}
                className="flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/50 font-mono text-xs text-cyan-200 leading-relaxed min-h-[160px] whitespace-pre-wrap">
              {protectData.protectedPrompt}
            </div>
          </div>

          <div className="mt-3 text-[11px] text-cyan-400 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Sanitized by Agent 3. Ready for safe external transmission.</span>
          </div>
        </div>
      </div>

      {/* Pre-Send Security Gate Verification */}
      <PreSendGateBadge gateResult={protectData.preSendGate} />

      {/* Session Tokens Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
              Active Session Tokens ({protectData.tokens.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Mappings held exclusively in volatile server RAM for temporary response restoration
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Ephemeral RAM Only
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {protectData.tokens.map((token, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-mono font-bold text-cyan-300 block">
                  {token.placeholder}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {token.type}
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                Masked ✓
              </span>
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-800">
          <button
            onClick={onBackToAnalysis}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
          >
            ← Back to Analysis
          </button>

          <button
            onClick={onTransmitToAI}
            disabled={isLoading || !protectData.preSendGate.passed}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Bot className="w-4 h-4" />
            <span>{isLoading ? 'Transmitting to AI...' : 'Transmit Protected Prompt to External LLM'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
