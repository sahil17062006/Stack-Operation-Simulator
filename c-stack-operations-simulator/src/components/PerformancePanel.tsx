// ============================================================
// components/PerformancePanel.tsx
// Array vs Linked List performance comparison
// ============================================================

import type { MultiStackEntry } from '../types/stack';
import { getMemoryInfo } from '../engine/utils';

interface Props {
  arrayStack?: MultiStackEntry;
  linkedStack?: MultiStackEntry;
}

const COMPARISONS = [
  {
    feature: 'Memory Allocation',
    array: 'Static — allocated at compile time\narr[MAX] reserves fixed memory',
    linked: 'Dynamic — malloc() per node\nOnly uses what it needs',
    winner: 'linked',
  },
  {
    feature: 'Push Time',
    array: 'O(1) — arr[++top] = val',
    linked: 'O(1) — malloc + pointer update',
    winner: 'tie',
  },
  {
    feature: 'Pop Time',
    array: 'O(1) — top--',
    linked: 'O(1) — free + pointer update',
    winner: 'array',
  },
  {
    feature: 'Peek Time',
    array: 'O(1) — return arr[top]',
    linked: 'O(1) — return top->data',
    winner: 'tie',
  },
  {
    feature: 'Overflow Risk',
    array: '⚠ YES — fixed capacity\nMAX elements maximum',
    linked: '✓ NO — limited only by RAM\nNo fixed upper bound',
    winner: 'linked',
  },
  {
    feature: 'Cache Performance',
    array: '✓ Excellent — contiguous memory\nCPU cache friendly',
    linked: '⚠ Poor — scattered nodes\nMore cache misses',
    winner: 'array',
  },
  {
    feature: 'Memory Overhead',
    array: 'Only int values\n4 bytes per element',
    linked: 'int data + Node* next\n12 bytes per element (64-bit)',
    winner: 'array',
  },
  {
    feature: 'Clear Operation',
    array: 'O(1) — just set top = -1',
    linked: 'O(n) — must free() each node',
    winner: 'array',
  },
  {
    feature: 'Implementation',
    array: '✓ Simple — just an array\nEasy to understand',
    linked: '⚠ Complex — pointer management\nMust avoid memory leaks',
    winner: 'array',
  },
];

export default function PerformancePanel({ arrayStack, linkedStack }: Props) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h3 className="text-sm font-bold text-slate-200">⚡ Performance Comparison</h3>
        <p className="text-xs text-slate-500 font-mono mt-0.5">Array-based vs Linked List-based Stack</p>
      </div>

      {/* Live memory info */}
      {(arrayStack || linkedStack) && (
        <div className="grid grid-cols-1 gap-2">
          {arrayStack && (
            <div className="bg-violet-900/20 border border-violet-800/30 rounded-lg p-3">
              <div className="text-xs font-bold text-violet-400 mb-1">🗃 Array Stack — {arrayStack.name}</div>
              <div className="text-[11px] font-mono text-slate-300">{getMemoryInfo(arrayStack.state)}</div>
            </div>
          )}
          {linkedStack && (
            <div className="bg-cyan-900/20 border border-cyan-800/30 rounded-lg p-3">
              <div className="text-xs font-bold text-cyan-400 mb-1">🔗 Linked List Stack — {linkedStack.name}</div>
              <div className="text-[11px] font-mono text-slate-300">{getMemoryInfo(linkedStack.state)}</div>
            </div>
          )}
        </div>
      )}

      {/* Big-O Summary */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-3 py-2 bg-slate-800 border-b border-slate-700">
          <span className="text-xs font-mono font-bold text-slate-300">Big-O Complexity</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-3 py-2 text-slate-400 font-medium">Operation</th>
                <th className="text-center px-3 py-2 text-violet-400 font-medium">Array</th>
                <th className="text-center px-3 py-2 text-cyan-400 font-medium">Linked List</th>
              </tr>
            </thead>
            <tbody>
              {[
                { op: 'push()',   arr: 'O(1)', ll: 'O(1)' },
                { op: 'pop()',    arr: 'O(1)', ll: 'O(1)' },
                { op: 'peek()',   arr: 'O(1)', ll: 'O(1)' },
                { op: 'clear()', arr: 'O(1)', ll: 'O(n)' },
                { op: 'size()',   arr: 'O(1)', ll: 'O(1)' },
                { op: 'Space',   arr: 'O(n)', ll: 'O(n)' },
              ].map((row) => (
                <tr key={row.op} className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/40">
                  <td className="px-3 py-1.5 text-slate-300">{row.op}</td>
                  <td className="px-3 py-1.5 text-center text-violet-300">{row.arr}</td>
                  <td className="px-3 py-1.5 text-center text-cyan-300">{row.ll}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed comparison */}
      <div className="space-y-2">
        {COMPARISONS.map((c) => (
          <div key={c.feature} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-slate-200">{c.feature}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                c.winner === 'array'  ? 'bg-violet-900/40 text-violet-300' :
                c.winner === 'linked' ? 'bg-cyan-900/40 text-cyan-300' :
                'bg-slate-700 text-slate-400'
              }`}>
                {c.winner === 'tie' ? 'TIE' : c.winner === 'array' ? '✓ Array wins' : '✓ LinkedList wins'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-[10px] font-mono text-slate-400 whitespace-pre-line">{c.array}</div>
              <div className="text-[10px] font-mono text-slate-400 whitespace-pre-line">{c.linked}</div>
            </div>
          </div>
        ))}
      </div>

      {/* When to use */}
      <div className="grid grid-cols-1 gap-2 text-[11px] font-mono">
        <div className="bg-violet-900/20 border border-violet-800/30 rounded-lg p-3">
          <div className="font-bold text-violet-300 mb-1">Use Array Stack when:</div>
          <div className="text-slate-400 space-y-0.5">
            <div>• Maximum size is known in advance</div>
            <div>• Cache performance matters (gaming, DSP)</div>
            <div>• Simple implementation needed</div>
            <div>• Frequent push/pop operations</div>
          </div>
        </div>
        <div className="bg-cyan-900/20 border border-cyan-800/30 rounded-lg p-3">
          <div className="font-bold text-cyan-300 mb-1">Use Linked List Stack when:</div>
          <div className="text-slate-400 space-y-0.5">
            <div>• Size is unpredictable</div>
            <div>• Memory is precious (no waste)</div>
            <div>• Overflow must be avoided</div>
            <div>• Dynamic applications (interpreters, etc.)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
