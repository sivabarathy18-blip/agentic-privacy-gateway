import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Cpu, RefreshCw, Lock, Sparkles, Terminal } from 'lucide-react';
import { PrivacyMode, RiskAssessment } from '../types/privacy';

interface HeaderProps {
  privacyMode: PrivacyMode;
  onModeChange: (mode: PrivacyMode) => void;
  onResetSession: () => void;
  isBackendHealthy: boolean;
  useLiveGemini: boolean;
  onToggleLiveGemini: (val: boolean) => void;
  lastAssessment?: RiskAssessment | null;
}

export const Header: React.FC<HeaderProps> = ({
  privacyMode,
  onModeChange,
  onResetSession,
  isBackendHealthy,
  useLiveGemini,
  onToggleLiveGemini,
  lastAssessment
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & App Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Agentic Privacy Gateway
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  v1.0 MVP
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Zero-Exposure Privacy Layer for Large Language Models
            </p>
          </div>
        </div>

        {/* Status Indicators & Mode Control */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Gateway Status Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="relative flex h-2 w-2">
              {isBackendHealthy ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              )}
            </span>
            <span className="font-mono text-slate-300">
              {isBackendHealthy ? 'GATEWAY: ONLINE' : 'GATEWAY: CONNECTING'}
            </span>
          </div>

          {/* Privacy Mode Selector */}
          <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700 rounded-lg p-1">
            <div className="flex items-center text-xs text-slate-400 px-2 font-medium">
              <Lock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Mode:
            </div>
            <button
              onClick={() => onModeChange('standard')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                privacyMode === 'standard'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Standard Mode: LOW->ALLOW, MEDIUM->MASK, HIGH->MASK, CRITICAL->BLOCK"
            >
              Standard
            </button>
            <button
              onClick={() => onModeChange('strict')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                privacyMode === 'strict'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Strict Mode: LOW->ALLOW, MEDIUM->MASK, HIGH->BLOCK, CRITICAL->BLOCK"
            >
              Strict
            </button>
          </div>

          {/* Optional Live Gemini switch */}
          <div className="hidden sm:flex items-center space-x-2 bg-slate-800/60 border border-slate-700/70 rounded-lg px-2.5 py-1 text-xs">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-xs">Sandbox Engine:</span>
            <span className="font-mono text-cyan-400 text-xs font-medium">Deterministic</span>
          </div>

          {/* Reset Session */}
          <button
            onClick={onResetSession}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition"
            title="Reset session & clear tokens"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>
        </div>
      </div>
    </header>
  );
};
