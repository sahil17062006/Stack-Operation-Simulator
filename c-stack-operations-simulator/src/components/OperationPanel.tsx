// ============================================================
// components/OperationPanel.tsx
// Console-style menu-driven operation interface
// ============================================================

import { useState } from 'react';
import type { MultiStackEntry } from '../types/stack';


interface Props {
  activeStack: MultiStackEntry;
  onPush: (val: number) => void;
  onPop: () => void;
  onPeek: () => void;
  onClear: () => void;
  onUndo: () => void;
  onCheckEmpty: () => void;
  onCheckFull: () => void;
  onSize: () => void;
  disabled?: boolean;
}

const OPS = [
  { id: 'push',   label: '2. Push',        icon: '⬆',  color: 'from-violet-600 to-purple-700',   key: 'violet', needsVal: true  },
  { id: 'pop',    label: '3. Pop',         icon: '⬇',  color: 'from-rose-600 to-red-700',        key: 'rose',   needsVal: false },
  { id: 'peek',   label: '4. Peek / Top',  icon: '👁',  color: 'from-emerald-600 to-green-700',   key: 'green',  needsVal: false },
  { id: 'empty',  label: '5. Is Empty?',   icon: '○',  color: 'from-sky-600 to-blue-700',        key: 'blue',   needsVal: false },
  { id: 'full',   label: '6. Is Full?',    icon: '●',  color: 'from-amber-600 to-yellow-700',    key: 'amber',  needsVal: false },
  { id: 'size',   label: '7. Size',        icon: '#',  color: 'from-teal-600 to-cyan-700',       key: 'cyan',   needsVal: false },
  { id: 'undo',   label: '8. Undo',        icon: '↩',  color: 'from-orange-600 to-amber-700',   key: 'orange', needsVal: false },
  { id: 'clear',  label: '9. Clear All',   icon: '🗑',  color: 'from-slate-600 to-gray-700',     key: 'slate',  needsVal: false },
];

export default function OperationPanel({
  activeStack, onPush, onPop, onPeek, onClear, onUndo,
  onCheckEmpty, onCheckFull, onSize, disabled,
}: Props) {
  const [pushValue, setPushValue] = useState('');
  const [pushError, setPushError] = useState('');
  const [activeOp, setActiveOp] = useState<string | null>(null);



  const handlePush = () => {
    const trimmed = pushValue.trim();
    if (trimmed === '') { setPushError('Enter a value to push.'); return; }
    const n = Number(trimmed);
    if (!Number.isInteger(n) || isNaN(n)) {
      setPushError(`"${trimmed}" is not a valid integer.`); return;
    }
    if (n < -999999 || n > 999999) {
      setPushError('Value must be between -999999 and 999999.'); return;
    }
    setPushError('');
    setPushValue('');
    setActiveOp('push');
    onPush(n);
    setTimeout(() => setActiveOp(null), 400);
  };

  const handleOp = (id: string) => {
    setActiveOp(id);
    setTimeout(() => setActiveOp(null), 400);

    switch (id) {
      case 'pop':   return onPop();
      case 'peek':  return onPeek();
      case 'clear':  return onClear();
      case 'undo':  return onUndo();
      case 'empty': return onCheckEmpty();
      case 'full':  return onCheckFull();
      case 'size':  return onSize();
    }
  };

  return (
    <div className="space-y-4">
      {/* Push Input */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
        <div className="text-xs font-mono text-violet-400 font-bold mb-3 tracking-wider uppercase">
          ⬆ Push Element
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="number"
              value={pushValue}
              onChange={(e) => { setPushValue(e.target.value); setPushError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handlePush()}
              placeholder="Enter integer value..."
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-slate-500
                         focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all"
              disabled={disabled}
            />
            {pushError && (
              <p className="text-red-400 text-xs mt-1 font-mono">⚠ {pushError}</p>
            )}
          </div>
          <button
            onClick={handlePush}
            disabled={disabled}
            className={`
              px-4 py-2 rounded-lg font-bold text-sm font-mono transition-all duration-200
              bg-gradient-to-br from-violet-600 to-purple-700 text-white
              hover:from-violet-500 hover:to-purple-600
              active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
              shadow-lg shadow-violet-900/30
              ${activeOp === 'push' ? 'scale-95 brightness-90' : ''}
            `}
          >
            PUSH
          </button>
        </div>
      </div>

      {/* Quick push buttons */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
        <div className="text-xs font-mono text-slate-500 mb-2">Quick push:</div>
        <div className="flex flex-wrap gap-1.5">
          {[1, 5, 10, 25, 50, 100, -1, -10, 42, 99].map((v) => (
            <button
              key={v}
              onClick={() => { setActiveOp('push'); onPush(v); setTimeout(() => setActiveOp(null), 400); }}
              disabled={disabled}
              className="px-2.5 py-1 bg-slate-700 hover:bg-violet-700 text-slate-300 hover:text-white
                         rounded text-xs font-mono transition-all duration-150 active:scale-95 disabled:opacity-40"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Operation Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        {OPS.filter(o => o.id !== 'push').map((op) => (
          <button
            key={op.id}
            onClick={() => handleOp(op.id)}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-3 py-2.5 rounded-lg font-mono text-sm font-medium
              bg-gradient-to-br ${op.color} text-white
              hover:brightness-110 active:scale-95 transition-all duration-150
              disabled:opacity-40 disabled:cursor-not-allowed
              shadow-md
              ${activeOp === op.id ? 'scale-95 brightness-75' : ''}
            `}
          >
            <span className="text-base leading-none">{op.icon}</span>
            <span className="text-xs">{op.label}</span>
          </button>
        ))}
      </div>

      {/* Stack type info */}
      <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-3 font-mono text-xs space-y-1">
        <div className="text-slate-400">
          Implementation:
          <span className={`ml-1 font-bold ${
            activeStack.state.type === 'array' ? 'text-violet-400' : 'text-cyan-400'
          }`}>
            {activeStack.state.type === 'array' ? 'Array-based' : 'Linked List-based'}
          </span>
        </div>
        <div className="text-slate-400">
          Capacity:
          <span className="ml-1 text-white font-bold">
            {activeStack.state.type === 'array' ? activeStack.state.capacity : '∞ (dynamic)'}
          </span>
        </div>
        <div className="text-slate-400">
          Elements:
          <span className="ml-1 text-white font-bold">{activeStack.state.items.length}</span>
        </div>
        <div className="text-slate-400">
          Undo history:
          <span className="ml-1 text-white font-bold">{activeStack.history.length} ops</span>
        </div>
      </div>
    </div>
  );
}
