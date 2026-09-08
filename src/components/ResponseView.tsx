import React, { useState } from 'react';
import { Bot, RotateCcw, CheckCircle2, ShieldCheck, Copy, Check, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { ChatResponse, RestoreResponse } from '../types/privacy';

interface ResponseViewProps {
  chatData?: ChatResponse | null;
  restoreData?: RestoreResponse | null;
  onRestore: () => void;
  isLoadingRestore: boolean;
  onNewSession: () => void;
}

export const ResponseView: React.FC<ResponseViewProps> = ({
  chatData,
  restoreData,
  onRestore,
  isLoadingRestore,
  onNewSession
}) => {
  const [copiedProtected, setCopiedProtected] = useState(false);
  const [copiedFinal, setCopiedFinal] = useState(false);
  const [highlightRestored, setHighlightRestored] = useState(true);

  if (!chatData) {
    return (
      <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <Bot className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">No AI Response Received Yet</h3>
        <p className="text-sm text-slate-400 mb-4">Please transmit the protected prompt from Step 3 to communicate with the external LLM.</p>
        <button
          onClick={onNewSession}
          className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-500"
        >
          Start New Prompt
        </button>
      </div>
    );
  }

  const copyToClipboard = (text: string, isFinal: boolean) => {
    navigator.clipboard.writeText(text);
    if (isFinal) {
      setCopiedFinal(true);
      setTimeout(() => setCopiedFinal(false), 2000);
    } else {
      setCopiedProtected(true);
      setTimeout(() => setCopiedProtected(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
            GATEWAY RESPONSE LIFECYCLE
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Protected AI Output & Inversion Restoration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            External AI returned output referencing only session tokens. The gateway restores identity locally.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300">
            Engine: {chatData.provider}
          </span>
        </div>
      </div>

      {/* Two Column Layout: Raw AI Response vs Restored Final Response */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Protected AI Response (As Received from LLM) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  Protected AI Response (Direct from LLM)
                </h3>
              </div>
              <button
                onClick={() => copyToClipboard(chatData.rawAIResponse, false)}
                className="flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
              >
                {copiedProtected ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedProtected ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-200 leading-relaxed min-h-[220px] whitespace-pre-wrap">
              {chatData.rawAIResponse}
            </div>
          </div>

          <div className="mt-3 p-3 rounded-lg bg-cyan-950/40 border border-cyan-900/60 text-xs text-cyan-300">
            <span className="font-semibold block mb-0.5">External Model Containment:</span>
            Notice that the LLM only referenced placeholders like <code className="text-white font-mono">[NAME_001]</code> and was never aware of real user identities.
          </div>
        </div>

        {/* Right: Restored Final Response (After Agent 4 Inversion) */}
        <div className="bg-slate-900 border border-emerald-800/50 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold">
                  Final Response (Agent 4 Restored)
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setHighlightRestored(!highlightRestored)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  {highlightRestored ? 'Plain View' : 'Highlight Restored'}
                </button>
                {restoreData && (
                  <button
                    onClick={() => copyToClipboard(restoreData.restoredResponse, true)}
                    className="flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
                  >
                    {copiedFinal ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedFinal ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            {restoreData ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/50 font-sans text-xs sm:text-sm text-slate-100 leading-relaxed min-h-[220px] whitespace-pre-wrap">
                {restoreData.restoredResponse}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-950 border border-dashed border-slate-800 text-center flex flex-col items-center justify-center min-h-[220px]">
                <RotateCcw className="w-8 h-8 text-slate-600 mb-2 animate-spin-slow" />
                <p className="text-xs text-slate-400 mb-3">Ready to restore session placeholders into original user identity.</p>
                <button
                  onClick={onRestore}
                  disabled={isLoadingRestore}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition disabled:opacity-50"
                >
                  {isLoadingRestore ? 'Restoring Tokens...' : 'Run Agent 4: Restoration Inversion'}
                </button>
              </div>
            )}
          </div>

          <div className="mt-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-300">
            <span className="font-semibold block mb-0.5">Secure Gateway Inversion:</span>
            Restoration was executed entirely inside the local gateway. The external AI model never received or logged the original identity values.
          </div>
        </div>
      </div>

      {/* Restoration Agent Inspector Card */}
      {restoreData && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Agent 4: Session Inversion Mapping Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                {restoreData.restoredTokensCount} tokens restored via volatile in-memory session
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/40">
              Completed ✓
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {restoreData.restorationMapping.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <span className="text-cyan-300 font-bold block">{item.placeholder}</span>
                  <span className="text-slate-500 text-[10px]">{item.type}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-emerald-400 font-semibold">
                  Restored ({item.restoredLength} chars)
                </span>
              </div>
            ))}
          </div>

          {/* Action to start another demo or prompt */}
          <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400 font-mono">
              Session {restoreData.sessionId.substring(0, 14)}...
            </span>
            <button
              onClick={onNewSession}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Test Another Prompt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
