// ============================================================
// App.tsx — Stack Operations Simulator
// Main application shell — equivalent to main.c in C project
//
// Architecture mirrors:
//   main.c → App.tsx (entry point, menu loop)
//   stack_array.c → engine/stack_array.ts
//   stack_linkedlist.c → engine/stack_linkedlist.ts
//   file_handler.c → engine/file_handler.ts
//   utils.c → engine/utils.ts
// ============================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ConsoleMessage } from './components/Console';
import Console, { logEntryToConsole } from './components/Console';
import StackVisualizer from './components/StackVisualizer';
import OperationPanel from './components/OperationPanel';
import MultiStackManager from './components/MultiStackManager';
import LogPanel from './components/LogPanel';
import CodePanel from './components/CodePanel';
import PerformancePanel from './components/PerformancePanel';
import AsciiPanel from './components/AsciiPanel';
import { stackEngine } from './engine/stack_engine';
import {
  saveAllStacks, loadAllStacks, exportStackAsText, loadAllLogs,
} from './engine/file_handler';
import { createLogEntry, generateId, getTimestamp } from './engine/utils';
import type { LogEntry, MultiStackEntry, OperationName, StackType } from './types/stack';

type RightPanel = 'log' | 'code' | 'perf' | 'ascii';

/* ─── Initial system boot ─── */
function bootSystem(): MultiStackEntry[] {
  // Try loading from localStorage first (file_handler equivalent)
  const saved = loadAllStacks();
  if (saved && saved.length > 0) {
    stackEngine.loadStacks(saved);
    return saved;
  }
  // Create default stacks
  const arr = stackEngine.createStack('Stack-1 (Array)', 'array', 20);
  const ll  = stackEngine.createStack('Stack-2 (Linked)', 'linkedlist');
  return [arr, ll];
}

const _initialStacks = bootSystem();

export default function App() {
  const [stacks, setStacks] = useState<MultiStackEntry[]>(_initialStacks);
  const [activeId, setActiveId] = useState<string>(_initialStacks[0]?.id ?? '');
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [globalLogs, setGlobalLogs] = useState<LogEntry[]>(() => loadAllLogs());
  const [rightPanel, setRightPanel] = useState<RightPanel>('ascii');
  const [lastOp, setLastOp] = useState<OperationName | undefined>();
  const [lastPushPop, setLastPushPop] = useState<'push' | 'pop' | null>(null);
  const [savedIndicator, setSavedIndicator] = useState(false);

  const activeStack = useMemo(
    () => stacks.find((s) => s.id === activeId),
    [stacks, activeId]
  );

  /* ── Auto-save on any change ── */
  useEffect(() => {
    if (stacks.length > 0) {
      saveAllStacks(stacks);
      setSavedIndicator(true);
      const t = setTimeout(() => setSavedIndicator(false), 1200);
      return () => clearTimeout(t);
    }
  }, [stacks]);

  /* ── Sync stacks from engine ── */
  const syncStacks = useCallback(() => {
    const updated = stackEngine.getAllStacks();
    setStacks([...updated]);
    setGlobalLogs(loadAllLogs());
  }, []);

  /* ── Add console message ── */
  const addConsole = useCallback(
    (text: string, type: ConsoleMessage['type']) => {
      const msg: ConsoleMessage = {
        id:        generateId(),
        text,
        type,
        timestamp: getTimestamp().split(' ')[1] ?? '',
      };
      setConsoleMessages((prev) => [...prev.slice(-200), msg]);
    },
    []
  );

  /* ── Dispatch result to console ── */
  const dispatchResult = useCallback(
    (log: LogEntry) => {
      const cm = logEntryToConsole(log);
      setConsoleMessages((prev) => [...prev.slice(-200), cm]);
      setGlobalLogs(loadAllLogs());
    },
    []
  );

  /* ── Boot message ── */
  useEffect(() => {
    const saved = loadAllStacks();
    if (saved && saved.length > 0) {
      addConsole('Stack state loaded from storage (stack_data.txt).', 'system');
      addConsole(`Loaded ${saved.length} stack(s) successfully.`, 'success');
    } else {
      addConsole('Stack Simulator initialized. Default stacks created.', 'system');
      addConsole('Array stack (cap=20) + Linked List stack ready.', 'info');
    }
    addConsole('Type an operation using the panel. Results appear here.', 'system');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─────────────────────────────────────────────────── */
  /*  OPERATIONS                                         */
  /* ─────────────────────────────────────────────────── */

  const handlePush = useCallback((val: number) => {
    if (!activeId) return;
    const result = stackEngine.push(activeId, val);
    setLastOp('PUSH');
    setLastPushPop('push');
    dispatchResult(result.entry.logs[result.entry.logs.length - 1]);
    syncStacks();
    setTimeout(() => setLastPushPop(null), 700);
  }, [activeId, dispatchResult, syncStacks]);

  const handlePop = useCallback(() => {
    if (!activeId) return;
    const result = stackEngine.pop(activeId);
    setLastOp('POP');
    setLastPushPop('pop');
    dispatchResult(result.entry.logs[result.entry.logs.length - 1]);
    syncStacks();
    setTimeout(() => setLastPushPop(null), 700);
  }, [activeId, dispatchResult, syncStacks]);

  const handlePeek = useCallback(() => {
    if (!activeId) return;
    const result = stackEngine.peek(activeId);
    setLastOp('PEEK');
    const log = createLogEntry('PEEK', activeStack?.state.type ?? 'array', result.success, result.message, result.value);
    dispatchResult(log);
    syncStacks();
  }, [activeId, activeStack, dispatchResult, syncStacks]);

  const handleClear = useCallback(() => {
    if (!activeId) return;
    const result = stackEngine.clear(activeId);
    setLastOp('CLEAR');
    dispatchResult(result.entry.logs[result.entry.logs.length - 1]);
    syncStacks();
  }, [activeId, dispatchResult, syncStacks]);

  const handleUndo = useCallback(() => {
    if (!activeId) return;
    const result = stackEngine.undo(activeId);
    setLastOp('UNDO');
    dispatchResult(result.entry.logs[result.entry.logs.length - 1]);
    syncStacks();
  }, [activeId, dispatchResult, syncStacks]);

  const handleCheckEmpty = useCallback(() => {
    if (!activeId) return;
    const result = stackEngine.checkEmpty(activeId);
    setLastOp('IS_EMPTY');
    const log = createLogEntry('IS_EMPTY', activeStack?.state.type ?? 'array', true, result.message);
    dispatchResult(log);
    syncStacks();
  }, [activeId, activeStack, dispatchResult, syncStacks]);

  const handleCheckFull = useCallback(() => {
    if (!activeId) return;
    const result = stackEngine.checkFull(activeId);
    setLastOp('IS_FULL');
    const log = createLogEntry('IS_FULL', activeStack?.state.type ?? 'array', true, result.message);
    dispatchResult(log);
    syncStacks();
  }, [activeId, activeStack, dispatchResult, syncStacks]);

  const handleSize = useCallback(() => {
    if (!activeId) return;
    const sz = stackEngine.getSize(activeId);
    setLastOp('SIZE');
    const log = createLogEntry('SIZE', activeStack?.state.type ?? 'array', true, `Stack size = ${sz} element(s).`);
    dispatchResult(log);
    syncStacks();
  }, [activeId, activeStack, dispatchResult, syncStacks]);

  /* ─── Stack management ─── */
  const handleCreateStack = useCallback(
    (name: string, type: StackType, capacity?: number) => {
      const entry = stackEngine.createStack(name, type, capacity);
      syncStacks();
      setActiveId(entry.id);
      addConsole(`Created new ${type} stack: "${name}"`, 'system');
    },
    [syncStacks, addConsole]
  );

  const handleDeleteStack = useCallback(
    (id: string) => {
      stackEngine.deleteStack(id);
      const remaining = stackEngine.getAllStacks();
      syncStacks();
      if (activeId === id && remaining.length > 0) {
        setActiveId(remaining[0].id);
      }
      addConsole('Stack deleted.', 'system');
    },
    [activeId, syncStacks, addConsole]
  );

  /* ─── Export stack data ─── */
  const handleExportData = () => {
    const text = exportStackAsText(stacks);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stack_data.txt';
    a.click();
    URL.revokeObjectURL(url);
    addConsole('Stack data exported to stack_data.txt', 'success');
  };

  /* ─── Performance stacks ─── */
  const arrayStack  = stacks.find((s) => s.state.type === 'array');
  const linkedStack = stacks.find((s) => s.state.type === 'linkedlist');

  const RIGHT_TABS: { id: RightPanel; label: string; icon: string }[] = [
    { id: 'ascii', label: 'Visualize', icon: '📊' },
    { id: 'log',   label: 'Log',       icon: '📋' },
    { id: 'code',  label: 'C Code',    icon: '💻' },
    { id: 'perf',  label: 'Perf',      icon: '⚡' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-900/40">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="18" height="4" rx="1" />
                <rect x="3" y="10" width="18" height="4" rx="1" />
                <rect x="3" y="17" width="18" height="4" rx="1" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Stack Operations Simulator</h1>
              <p className="text-[11px] text-slate-500 font-mono">C Programming · DSA · Array & Linked List</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Save indicator */}
            {savedIndicator && (
              <span className="text-xs font-mono text-emerald-400 animate-pulse">
                💾 saved
              </span>
            )}
            {/* Export buttons */}
            <button
              onClick={handleExportData}
              className="text-xs font-mono text-slate-400 hover:text-white transition-colors
                         bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <span>↓</span> stack_data.txt
            </button>
            {/* Active stack badge */}
            {activeStack && (
              <div className={`text-xs font-mono px-3 py-1.5 rounded-lg border ${
                activeStack.state.type === 'array'
                  ? 'bg-violet-900/30 border-violet-700/50 text-violet-300'
                  : 'bg-cyan-900/30 border-cyan-700/50 text-cyan-300'
              }`}>
                {activeStack.state.type === 'array' ? '▤ Array' : '⛓ Linked'} · {activeStack.name}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-4 grid grid-cols-1 xl:grid-cols-[260px,1fr,300px] gap-4 min-h-0">

        {/* ═══ LEFT SIDEBAR ═══ */}
        <aside className="flex flex-col gap-4">
          {/* Stack Manager */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <MultiStackManager
              stacks={stacks}
              activeId={activeId}
              onSelect={setActiveId}
              onCreate={handleCreateStack}
              onDelete={handleDeleteStack}
            />
          </div>

          {/* Operation Panel */}
          {activeStack && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">
                1. Select Operation
              </div>
              <OperationPanel
                activeStack={activeStack}
                onPush={handlePush}
                onPop={handlePop}
                onPeek={handlePeek}
                onClear={handleClear}
                onUndo={handleUndo}
                onCheckEmpty={handleCheckEmpty}
                onCheckFull={handleCheckFull}
                onSize={handleSize}
              />
            </div>
          )}
        </aside>

        {/* ═══ CENTER PANEL ═══ */}
        <main className="flex flex-col gap-4 min-h-0">
          {/* Stack Visualizers */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-5">
              Stack Visualization
            </div>

            {stacks.length === 0 ? (
              <div className="text-center py-12 text-slate-600 font-mono">
                No stacks created. Use the panel to create one.
              </div>
            ) : (
              <div className="flex flex-wrap gap-10 justify-center">
                {stacks.map((s) => (
                  <div
                    key={s.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      s.id === activeId
                        ? 'opacity-100'
                        : 'opacity-50 hover:opacity-75 grayscale'
                    }`}
                    onClick={() => setActiveId(s.id)}
                  >
                    <StackVisualizer
                      stack={s.state}
                      highlightTop={s.id === activeId}
                      lastOp={s.id === activeId ? lastPushPop : null}
                    />
                    <div className="text-center mt-2">
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                        s.id === activeId
                          ? 'bg-violet-900/40 text-violet-300'
                          : 'text-slate-600'
                      }`}>
                        {s.id === activeId ? '● active' : s.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Console Output */}
          <div className="flex-1 min-h-0 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden" style={{ minHeight: '220px' }}>
            <Console
              messages={consoleMessages}
              onClear={() => setConsoleMessages([])}
            />
          </div>
        </main>

        {/* ═══ RIGHT PANEL ═══ */}
        <aside className="flex flex-col gap-0 min-h-0">
          {/* Tab switcher */}
          <div className="flex gap-1 mb-3 flex-wrap">
            {RIGHT_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setRightPanel(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  rightPanel === t.id
                    ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            {rightPanel === 'log' && (
              <LogPanel
                logs={globalLogs}
                onClearLogs={() => {
                  setGlobalLogs([]);
                  addConsole('Operation log cleared.', 'system');
                }}
              />
            )}
            {rightPanel === 'code' && (
              <CodePanel
                lastOp={lastOp}
                stackType={activeStack?.state.type ?? 'array'}
              />
            )}
            {rightPanel === 'perf' && (
              <PerformancePanel
                arrayStack={arrayStack}
                linkedStack={linkedStack}
              />
            )}
            {rightPanel === 'ascii' && activeStack && (
              <AsciiPanel stack={activeStack.state} />
            )}
          </div>
        </aside>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 py-3 px-4 bg-slate-900/50">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between text-[11px] font-mono text-slate-600">
          <div className="flex gap-4">
            <span>Stack Operations Simulator v1.0</span>
            <span>·</span>
            <span>C Programming · DSA Concepts</span>
          </div>
          <div className="flex gap-4">
            <span className="text-violet-600">■ Array Stack</span>
            <span className="text-cyan-600">■ Linked List Stack</span>
            <span>· gcc -std=c99 -o sim main.c *.c</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
