import React, { useState } from 'react';
import { Activity, ShieldCheck, RefreshCw, Trash2, Filter, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { ActivityEvent } from '../types/privacy';

interface ActivityLogViewProps {
  logs: ActivityEvent[];
  onRefresh: () => void;
  onClear: () => void;
  isLoading: boolean;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  logs,
  onRefresh,
  onClear,
  isLoading
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredLogs = filterType === 'ALL'
    ? logs
    : logs.filter((l) => l.type === filterType || l.decision === filterType);

  const getEventBadge = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'SCAN':
        return <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">SCAN</span>;
      case 'PROTECT':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">PROTECT</span>;
      case 'GATE_CHECK':
        return <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">GATE CHECK</span>;
      case 'EXTERNAL_AI_TX':
        return <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">AI TRANSMIT</span>;
      case 'AI_RX':
        return <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">AI RECEIVE</span>;
      case 'RESTORE':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">RESTORE</span>;
      case 'BLOCK':
        return <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">BLOCK</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-bold">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Zero PII Guarantee Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold block mb-1">
                COMPLIANCE & AUDIT INTEGRITY
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Zero-PII Safe Activity & Telemetry Log
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Complies with Section 13: Raw personal data, phone numbers, and secrets are strictly excluded from all audit records.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center space-x-1.5 border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onClear}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs font-mono flex items-center space-x-1.5 border border-slate-700 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-slate-800 overflow-x-auto no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-xs text-slate-500 font-mono">Filter:</span>
          {['ALL', 'SCAN', 'PROTECT', 'GATE_CHECK', 'EXTERNAL_AI_TX', 'RESTORE', 'BLOCK'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition ${
                filterType === f
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Events Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Audit Trail Records ({filteredLogs.length})
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Real-Time Socket Synced
          </span>
        </div>

        {filteredLogs.length > 0 ? (
          <div className="space-y-2.5 font-mono">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start sm:items-center space-x-3">
                  <span className="text-slate-500 text-[11px] shrink-0 font-mono">
                    {log.timeFormatted}
                  </span>
                  <div className="shrink-0">
                    {getEventBadge(log.type)}
                  </div>
                  <div>
                    <span className="text-slate-200 font-medium block">
                      {log.event}
                    </span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      {log.safeDetails}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.decision === 'BLOCK'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : log.decision === 'MASK'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {log.decision}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            No audit events found matching active filter.
          </div>
        )}
      </div>
    </div>
  );
};
