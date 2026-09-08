import React from 'react';
import { Search, ShieldAlert, KeyRound, Cpu, RotateCcw, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { RiskAssessment, SecurityDecision } from '../types/privacy';

interface PipelineFlowProps {
  currentStage: 'input' | 'detection' | 'decision' | 'protected' | 'ai' | 'restoration' | 'completed' | 'blocked';
  assessment?: RiskAssessment | null;
  decision?: SecurityDecision | null;
}

export const PipelineFlow: React.FC<PipelineFlowProps> = ({
  currentStage,
  assessment,
  decision
}) => {
  const steps = [
    {
      id: 'detection',
      name: 'Agent 1: Detection',
      desc: 'Regex & Deterministic Rules',
      icon: Search,
      isActive: currentStage === 'detection',
      isPassed: ['decision', 'protected', 'ai', 'restoration', 'completed', 'blocked'].includes(currentStage)
    },
    {
      id: 'decision',
      name: 'Agent 2: Decision',
      desc: assessment ? `${assessment.level} (${assessment.score}/100)` : 'Risk Evaluation',
      icon: ShieldAlert,
      isActive: currentStage === 'decision',
      isPassed: ['protected', 'ai', 'restoration', 'completed', 'blocked'].includes(currentStage)
    },
    {
      id: 'protected',
      name: 'Agent 3: Masking',
      desc: decision === 'BLOCK' ? 'HALTED (BLOCK)' : 'Session Tokens',
      icon: KeyRound,
      isActive: currentStage === 'protected',
      isPassed: ['ai', 'restoration', 'completed'].includes(currentStage),
      isBlocked: decision === 'BLOCK'
    },
    {
      id: 'ai',
      name: 'External AI',
      desc: 'Zero-Raw Exposure',
      icon: Cpu,
      isActive: currentStage === 'ai',
      isPassed: ['restoration', 'completed'].includes(currentStage),
      isBlocked: decision === 'BLOCK'
    },
    {
      id: 'restoration',
      name: 'Agent 4: Restoration',
      desc: 'Session Token Inversion',
      icon: RotateCcw,
      isActive: currentStage === 'restoration' || currentStage === 'completed',
      isPassed: currentStage === 'completed',
      isBlocked: decision === 'BLOCK'
    }
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Agentic Security Pipeline Architecture
        </span>
        <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          Fail-Closed Ingress Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`relative flex items-center sm:flex-col sm:items-start p-2.5 rounded-lg border transition-all ${
                step.isBlocked
                  ? 'bg-rose-950/20 border-rose-900/50 text-rose-300'
                  : step.isActive
                  ? 'bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/30 text-cyan-200'
                  : step.isPassed
                  ? 'bg-slate-800/80 border-slate-700/80 text-slate-200'
                  : 'bg-slate-900/30 border-slate-800/60 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center ${
                    step.isBlocked
                      ? 'bg-rose-900/40 text-rose-400'
                      : step.isActive
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : step.isPassed
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {step.isBlocked ? (
                  <XCircle className="w-4 h-4 text-rose-500 hidden sm:block" />
                ) : step.isPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 hidden sm:block" />
                ) : null}
              </div>

              <div className="ml-2.5 sm:ml-0">
                <h4 className="text-xs font-semibold tracking-tight">{step.name}</h4>
                <p className="text-[11px] text-slate-400 truncate">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
