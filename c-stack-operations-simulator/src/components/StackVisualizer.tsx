// ============================================================
// components/StackVisualizer.tsx
// ASCII + animated visual representation of the stack
// ============================================================

import { useEffect, useRef, useState } from 'react';
import type { StackState } from '../types/stack';

interface Props {
  stack: StackState;
  highlightTop?: boolean;
  lastOp?: 'push' | 'pop' | null;
}

export default function StackVisualizer({ stack, highlightTop, lastOp }: Props) {
  const [animIndex, setAnimIndex] = useState<number | null>(null);
  const prevLengthRef = useRef(stack.items.length);

  useEffect(() => {
    const prev = prevLengthRef.current;
    const curr = stack.items.length;
    if (curr > prev) {
      // PUSH animation: highlight top item briefly
      setAnimIndex(curr - 1);
      const t = setTimeout(() => setAnimIndex(null), 600);
      prevLengthRef.current = curr;
      return () => clearTimeout(t);
    } else if (curr < prev) {
      // POP animation: flash null to signal removal
      setAnimIndex(-1);
      const t = setTimeout(() => setAnimIndex(null), 600);
      prevLengthRef.current = curr;
      return () => clearTimeout(t);
    }
    prevLengthRef.current = curr;
  }, [stack.items.length]);

  const reversed = [...stack.items].reverse();
  const isEmpty = stack.items.length === 0;
  const isFull  = stack.type === 'array' && stack.items.length >= stack.capacity;

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${
          stack.type === 'array' ? 'bg-violet-400' : 'bg-cyan-400'
        }`} />
        <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400">
          {stack.type === 'array' ? 'Array Stack' : 'Linked List Stack'}
        </span>
      </div>

      {/* Top pointer indicator */}
      <div className="text-xs font-mono text-slate-400 mb-1 h-4">
        {!isEmpty && (
          <span className="text-emerald-400 font-bold animate-pulse">
            top = {stack.type === 'array' ? stack.items.length - 1 : 'node→' + stack.items[stack.items.length - 1]}
          </span>
        )}
      </div>

      {/* Stack body */}
      <div className="relative w-40 font-mono text-sm">
        {/* Full warning */}
        {isFull && (
          <div className="text-center text-xs text-red-400 font-bold mb-1 animate-pulse">
            ⚠ FULL
          </div>
        )}

        {/* Ghost pop slot */}
        {lastOp === 'pop' && animIndex === -1 && (
          <div className="w-full h-9 border-2 border-dashed border-red-400 rounded mb-0.5 flex items-center justify-center animate-ping-once opacity-50">
            <span className="text-red-400 text-xs">freed</span>
          </div>
        )}

        {/* Stack frames */}
        <div className="border-2 border-slate-600 rounded overflow-hidden">
          {isEmpty ? (
            <div className="bg-slate-800 h-16 flex items-center justify-center">
              <span className="text-slate-500 text-xs italic">
                {stack.type === 'array' ? 'top = -1' : 'top = NULL'}
              </span>
            </div>
          ) : (
            reversed.map((item, idx) => {
              const originalIdx = stack.items.length - 1 - idx;
              const isTop = idx === 0;
              const isAnimated = animIndex === originalIdx;
              return (
                <div
                  key={`${originalIdx}-${item}`}
                  className={`
                    relative flex items-center justify-between px-3 py-2 border-b border-slate-700 last:border-b-0
                    transition-all duration-300
                    ${isTop && highlightTop
                      ? 'bg-emerald-900/60 border-l-2 border-l-emerald-400'
                      : 'bg-slate-800 hover:bg-slate-750'}
                    ${isAnimated ? 'bg-violet-900/80 scale-105' : ''}
                  `}
                >
                  {/* Index label (array mode) */}
                  {stack.type === 'array' && (
                    <span className="text-slate-600 text-[10px] absolute left-1">
                      [{originalIdx}]
                    </span>
                  )}
                  {/* Linked list pointer */}
                  {stack.type === 'linkedlist' && !isTop && (
                    <span className="text-slate-600 text-[10px] absolute left-1">↑</span>
                  )}

                  <span className={`w-full text-center font-bold ${
                    isTop ? 'text-emerald-300' : 'text-slate-200'
                  }`}>
                    {item}
                  </span>

                  {isTop && (
                    <span className="absolute right-1 text-[9px] text-emerald-400 font-bold">
                      TOP
                    </span>
                  )}
                  {idx === reversed.length - 1 && !isTop && (
                    <span className="absolute right-1 text-[9px] text-slate-500">
                      BTM
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Base */}
        <div className="w-full h-2 bg-slate-600 rounded-b" />
      </div>

      {/* Stats */}
      <div className="mt-3 flex gap-3 text-[11px] font-mono">
        <span className="text-slate-400">
          size: <span className="text-white font-bold">{stack.items.length}</span>
        </span>
        {stack.type === 'array' && (
          <span className="text-slate-400">
            cap: <span className="text-white font-bold">{stack.capacity}</span>
          </span>
        )}
        <span className="text-slate-400">
          {stack.type === 'linkedlist'
            ? <span className="text-cyan-400">∞ dynamic</span>
            : <span className={isFull ? 'text-red-400' : 'text-slate-300'}>
                {Math.round((stack.items.length / stack.capacity) * 100)}% full
              </span>
          }
        </span>
      </div>

      {/* Capacity bar (array only) */}
      {stack.type === 'array' && (
        <div className="mt-2 w-40 bg-slate-700 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isFull ? 'bg-red-500' : stack.items.length > stack.capacity * 0.7 ? 'bg-yellow-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${(stack.items.length / stack.capacity) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
