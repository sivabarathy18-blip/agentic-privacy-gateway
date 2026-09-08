import React from 'react';
import { Play, Sparkles, AlertCircle, Shield, CheckCircle, Lock, ArrowRight } from 'lucide-react';
import { DEMO_PRESETS, DemoPreset } from '../data/presets';
import { PrivacyMode } from '../types/privacy';

interface GatewayViewProps {
  prompt: string;
  onPromptChange: (val: string) => void;
  privacyMode: PrivacyMode;
  onModeChange: (mode: PrivacyMode) => void;
  onScan: () => void;
  onAutoRunPipeline: () => void;
  isLoading: boolean;
  selectedPresetId: string | null;
  onSelectPreset: (preset: DemoPreset) => void;
}

export const GatewayView: React.FC<GatewayViewProps> = ({
  prompt,
  onPromptChange,
  privacyMode,
  onModeChange,
  onScan,
  onAutoRunPipeline,
  isLoading,
  selectedPresetId,
  onSelectPreset
}) => {
  return (
    <div className="space-y-6">
      {/* Hero / Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-xs font-mono font-semibold border border-cyan-800">
                PROMPT PRIVACY GATEWAY
              </span>
              <span className="text-xs text-slate-400 font-mono">Port 3000 Ingress</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Zero Raw PII Exposure to External LLMs
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every prompt is parsed by deterministic detection agents, graded for risk, masked with ephemeral session tokens, and verified by a fail-closed pre-send security gate.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Security Policy</span>
              <span className="text-sm font-bold text-cyan-300 capitalize">{privacyMode} Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Pickers for Judges & Demo */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Hackathon Demo Presets (1-Click Test Scenarios)
          </h3>
          <span className="text-xs text-slate-500">Select to load prompt & target outcomes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {DEMO_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/80 ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white tracking-tight">{preset.title}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        preset.expectedDecision === 'BLOCK'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : preset.expectedDecision === 'MASK'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {preset.expectedDecision}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{preset.description}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Risk: {preset.expectedRisk}</span>
                  <span className="text-cyan-400 hover:underline flex items-center gap-0.5">
                    Load & Test <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Input Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Dynamic Prompt Input
            </label>
            {prompt && (
              <button
                onClick={() => onPromptChange('')}
                className="text-[11px] text-slate-400 hover:text-rose-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/80 transition"
              >
                Clear Text
              </button>
            )}
          </div>

          {/* Privacy Mode Pills */}
          <div className="flex items-center space-x-2 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">Privacy Enforcement:</span>
            <button
              onClick={() => onModeChange('standard')}
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                privacyMode === 'standard' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard (High=Mask)
            </button>
            <button
              onClick={() => onModeChange('strict')}
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                privacyMode === 'strict' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Strict (High=Block)
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            rows={5}
            placeholder="Type or paste any arbitrary customer prompt, business email, or sensitive message to process (e.g., 'Draft a follow-up for Carlos Mendoza, email carlos@acme.org, phone +1 555-0199...')"
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 rounded-xl p-4 text-sm text-slate-100 font-mono placeholder:text-slate-600 resize-y transition"
          />

          <div className="absolute bottom-3 right-3 text-[11px] font-mono text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
            {prompt.length} chars
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>External LLM receives only masked session tokens. Guaranteed 0-PII transit.</span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              onClick={onScan}
              disabled={isLoading || !prompt.trim()}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
            >
              <span>Scan & Inspect</span>
            </button>

            <button
              onClick={onAutoRunPipeline}
              disabled={isLoading || !prompt.trim()}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isLoading ? 'Processing Pipeline...' : 'Run Full Agentic Pipeline'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
