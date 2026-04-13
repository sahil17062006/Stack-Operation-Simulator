// ============================================================
// components/Console.tsx
// ANSI-styled console output panel
// Mirrors the printf() / colorful terminal output in C
// ============================================================

import { useEffect, useRef } from 'react';
import type { LogEntry } from '../types/stack';

interface ConsoleMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info' | 'warn' | 'system' | 'result';
  timestamp: string;
}

interface Props {
  messages: ConsoleMessage[];
  onClear: () => void;
}

export type { ConsoleMessage };

const typeStyles: Record<ConsoleMessage['type'], string> = {
  success: 'text-emerald-400',
  error:   'text-red-400',
  info:    'text-sky-400',
  warn:    'text-yellow-400',
  system:  'text-slate-500',
  result:  'text-violet-300',
};

const typePrefix: Record<ConsoleMessage['type'], string> = {
  success: '[OK]   ',
  error:   '[ERR]  ',
  info:    '[INFO] ',
  warn:    '[WARN] ',
  system:  '[SYS]  ',
  result:  '[RES]  ',
};

export function logEntryToConsole(entry: LogEntry): ConsoleMessage {
  return {
    id:        entry.id,
    text:      entry.message,
    type:      entry.success ? (
      ['PUSH', 'POP', 'CLEAR', 'UNDO'].includes(entry.operation) ? 'success' : 'result'
    ) : 'error',
    timestamp: entry.timestamp.split(' ')[1] ?? '',
  };
}

export default function Console({ messages, onClear }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Console header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-700 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs font-mono text-slate-400 ml-2">console — stack_simulator</span>
        </div>
        <button
          onClick={onClear}
          className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors"
        >
          clear
        </button>
      </div>

      {/* Console body */}
      <div className="flex-1 bg-slate-950 rounded-b-xl overflow-y-auto p-3 font-mono text-xs space-y-0.5 min-h-0">
        {messages.length === 0 && (
          <div className="text-slate-600 italic">
            {'// Stack Simulator ready. Perform an operation to see output.'}
          </div>
        )}

        {/* Boot message */}
        {messages.length > 0 && (
          <div className="text-slate-600 border-b border-slate-800 pb-1 mb-1">
            {'// ═══════════════════════════════════════'}
            <br />
            {'//   Stack Operations Simulator v1.0      '}
            <br />
            {'// ═══════════════════════════════════════'}
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2 items-start leading-relaxed">
            <span className="text-slate-700 shrink-0 select-none">{msg.timestamp}</span>
            <span className={`shrink-0 font-bold ${typeStyles[msg.type]}`}>
              {typePrefix[msg.type]}
            </span>
            <span className={`${typeStyles[msg.type]} break-all`}>{msg.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
