// ============================================================
// components/MultiStackManager.tsx
// Create and switch between multiple stacks
// ============================================================

import { useState } from 'react';
import type { MultiStackEntry, StackType } from '../types/stack';

interface Props {
  stacks: MultiStackEntry[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: (name: string, type: StackType, capacity?: number) => void;
  onDelete: (id: string) => void;
}

export default function MultiStackManager({
  stacks, activeId, onSelect, onCreate, onDelete,
}: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<StackType>('array');
  const [newCapacity, setNewCapacity] = useState('20');
  const [nameError, setNameError] = useState('');

  const handleCreate = () => {
    const name = newName.trim() || `Stack-${stacks.length + 1}`;
    const cap = parseInt(newCapacity);
    if (isNaN(cap) || cap < 1 || cap > 100) {
      setNameError('Capacity must be 1–100.'); return;
    }
    setNameError('');
    onCreate(name, newType, newType === 'array' ? cap : undefined);
    setNewName('');
    setNewType('array');
    setNewCapacity('20');
    setShowCreate(false);
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
          📦 Stacks ({stacks.length})
        </span>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-xs font-mono text-violet-400 hover:text-violet-300 transition-colors
                     bg-violet-900/20 border border-violet-800/30 px-2 py-0.5 rounded"
        >
          {showCreate ? 'cancel' : '+ new'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Stack name (optional)"
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-xs font-mono text-white
                       placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as StackType)}
              className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-xs font-mono text-white
                         focus:outline-none focus:border-violet-500 transition-all"
            >
              <option value="array">Array-based</option>
              <option value="linkedlist">Linked List</option>
            </select>
            {newType === 'array' && (
              <input
                type="number"
                value={newCapacity}
                onChange={(e) => { setNewCapacity(e.target.value); setNameError(''); }}
                placeholder="Capacity (1-100)"
                min={1} max={100}
                className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-xs font-mono text-white
                           focus:outline-none focus:border-violet-500 transition-all"
              />
            )}
          </div>
          {nameError && <p className="text-red-400 text-[11px] font-mono">⚠ {nameError}</p>}
          <button
            onClick={handleCreate}
            className="w-full py-1.5 bg-gradient-to-r from-violet-600 to-purple-700 text-white
                       rounded-lg text-xs font-mono font-bold hover:brightness-110 active:scale-98 transition-all"
          >
            Create Stack
          </button>
        </div>
      )}

      {/* Stack list */}
      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
        {stacks.map((s) => (
          <div
            key={s.id}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-all duration-150
              ${s.id === activeId
                ? 'bg-violet-900/40 border-violet-600/50 text-white'
                : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600'}
            `}
            onClick={() => onSelect(s.id)}
          >
            {/* Type indicator */}
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              s.state.type === 'array' ? 'bg-violet-400' : 'bg-cyan-400'
            }`} />

            {/* Name & info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono font-medium truncate">{s.name}</div>
              <div className="text-[10px] font-mono text-slate-500">
                {s.state.type === 'array' ? 'ARR' : 'LL'} ·{' '}
                {s.state.items.length}/{s.state.type === 'array' ? s.state.capacity : '∞'} items
              </div>
            </div>

            {/* Active indicator */}
            {s.id === activeId && (
              <span className="text-[10px] text-violet-400 font-mono shrink-0">● active</span>
            )}

            {/* Delete button */}
            {stacks.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                className="text-slate-600 hover:text-red-400 transition-colors text-sm shrink-0 ml-1"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
