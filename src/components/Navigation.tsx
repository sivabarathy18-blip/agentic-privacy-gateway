import React from 'react';
import { Terminal, Search, EyeOff, Bot, Activity, Lock, AlertTriangle } from 'lucide-react';
import { RiskAssessment } from '../types/privacy';

export type ActiveTab = 'gateway' | 'analyze' | 'protected' | 'response' | 'activity';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  assessment?: RiskAssessment | null;
  entitiesCount: number;
  isBlocked: boolean;
  hasProtectedPrompt: boolean;
  hasAIResponse: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  assessment,
  entitiesCount,
  isBlocked,
  hasProtectedPrompt,
  hasAIResponse
}) => {
  const tabs = [
    {
      id: 'gateway' as ActiveTab,
      label: '1. Gateway',
      icon: Terminal,
      badge: null,
      description: 'Input & Mode'
    },
    {
      id: 'analyze' as ActiveTab,
      label: '2. Security Analysis',
      icon: Search,
      badge: assessment ? (
        <span
          className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
            assessment.level === 'CRITICAL'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : assessment.level === 'HIGH'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : assessment.level === 'MEDIUM'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}
        >
          {assessment.level} ({entitiesCount})
        </span>
      ) : null,
      description: 'Risk & Decision'
    },
    {
      id: 'protected' as ActiveTab,
      label: isBlocked ? '3. Block Screen' : '3. Protected AI',
      icon: isBlocked ? AlertTriangle : EyeOff,
      badge: isBlocked ? (
        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
          BLOCKED
        </span>
      ) : hasProtectedPrompt ? (
        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
          MASKED
        </span>
      ) : null,
      description: isBlocked ? 'Fail-Closed Halted' : 'Gate & Masking'
    },
    {
      id: 'response' as ActiveTab,
      label: '4. Response',
      icon: Bot,
      badge: hasAIResponse ? (
        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          RESTORED
        </span>
      ) : null,
      description: 'AI & Restoration'
    },
    {
      id: 'activity' as ActiveTab,
      label: '5. Safe Activity',
      icon: Activity,
      badge: null,
      description: 'Zero-PII Audit'
    }
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <div className="flex flex-col text-left">
                  <div className="flex items-center space-x-1.5">
                    <span>{tab.label}</span>
                    {tab.badge}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
