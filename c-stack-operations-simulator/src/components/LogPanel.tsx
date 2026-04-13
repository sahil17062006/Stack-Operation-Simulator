// ============================================================
// components/LogPanel.tsx
// Operation history log viewer — mirrors log.txt content
// ============================================================

import type { LogEntry } from '../types/stack';
import { exportLogsAsText } from '../engine/file_handler';

interface Props {
  logs: LogEntry[];
  onClearLogs: () => void;
}

const opColors: Record<string, string> = {
  PUSH:     'bg-violet-500/20 text-violet-300 border-violet-500/30',
  POP:      'bg-rose-500/20 text-rose-300 border-rose-500/30',
  PEEK:     'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  CLEAR:    'bg-slate-500/20 text-slate-300 border-slate-500/30',
  UNDO:     'bg-orange-500/20 text-orange-300 border-orange-500/30',
  IS_EMPTY: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  IS_FULL:  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  SIZE:     'bg-teal-500/20 text-teal-300 border-teal-500/30',
  INIT:     'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  LOAD:     'bg-pink-500/20 text-pink-300 border-pink-500/30',
  DISPLAY:  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
};

export default function LogPanel({ logs, onClearLogs }: Props) {
  const handleExport = () => {
    const text = exportLogsAsText(logs);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'log.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-200">📋 Operation Log</span>
          <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
            {logs.length} entries
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors
                       bg-emerald-900/20 border border-emerald-800/30 px-2 py-1 rounded"
          >
            ↓ log.txt
          </button>
          <button
            onClick={onClearLogs}
            className="text-xs font-mono text-slate-400 hover:text-red-400 transition-colors
                       bg-slate-800 border border-slate-700 px-2 py-1 rounded"
          >
            clear
          </button>
        </div>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-600 font-mono text-xs italic">
            -- No operations logged yet --<br />
            <span className="text-slate-700">fopen("log.txt", "r") → empty</span>
          </div>
        ) : (
          [...logs].reverse().map((log) => (
            <div
              key={log.id}
              className={`border rounded-lg px-3 py-2 text-xs font-mono ${
                log.success
                  ? 'bg-slate-800/60 border-slate-700/50'
                  : 'bg-red-950/30 border-red-800/30'
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                {/* Timestamp */}
                <span className="text-slate-600 shrink-0">{log.timestamp}</span>

                {/* Operation badge */}
                <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-bold ${
                  opColors[log.operation] ?? 'bg-slate-700 text-slate-300 border-slate-600'
                }`}>
                  {log.operation}
                </span>

                {/* Value */}
                {log.value !== undefined && (
                  <span className="text-white font-bold">= {log.value}</span>
                )}

                {/* Stack type */}
                <span className={`text-[10px] px-1 rounded ${
                  log.stackType === 'array' ? 'text-violet-400 bg-violet-900/20' : 'text-cyan-400 bg-cyan-900/20'
                }`}>
                  {log.stackType === 'array' ? '[ARR]' : '[LL]'}
                </span>

                {/* Status */}
                <span className={log.success ? 'text-emerald-500' : 'text-red-400'}>
                  {log.success ? '✓' : '✗'}
                </span>
              </div>

              {/* Message */}
              <div className="text-slate-400 mt-1 ml-0 text-[11px] break-all">
                {log.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
