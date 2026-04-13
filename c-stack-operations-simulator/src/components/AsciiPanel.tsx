// ============================================================
// components/AsciiPanel.tsx
// ASCII art visualization of the stack + pointer diagram
// Mirrors the display() function console output in C
// ============================================================

import type { StackState } from '../types/stack';
import { generateAsciiStack, getMemoryInfo } from '../engine/utils';

interface Props {
  stack: StackState;
}

export default function AsciiPanel({ stack }: Props) {
  const lines = generateAsciiStack(stack);
  const isEmpty = stack.items.length === 0;

  // Build pointer diagram for linked list
  const buildLinkedDiagram = () => {
    if (stack.type !== 'linkedlist') return null;
    if (isEmpty) return <span className="text-slate-500">top → NULL</span>;

    const reversed = [...stack.items].reverse();
    return (
      <div className="space-y-0">
        <div className="text-emerald-400">top</div>
        <div className="text-slate-500"> │</div>
        {reversed.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-center gap-1">
              <span className="text-slate-500"> └→</span>
              <span className="text-cyan-300 border border-cyan-800/50 px-2 py-0.5 rounded bg-cyan-900/20">
                [{item}|•]
              </span>
              {idx === reversed.length - 1
                ? <span className="text-slate-500">→ NULL</span>
                : <span className="text-slate-500">→</span>
              }
            </div>
            {idx < reversed.length - 1 && (
              <div className="text-slate-700 ml-5">│</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* ASCII Stack Visualization */}
      <div>
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">
          📊 ASCII Visualization
        </div>
        <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm">
          <div className="text-slate-400 text-xs mb-2">
            {'/* display() output: */'}
          </div>
          {lines.map((line, i) => (
            <div key={i} className={`
              leading-relaxed
              ${line.includes('← TOP')    ? 'text-emerald-400' :
                line.includes('← BOTTOM') ? 'text-yellow-600' :
                line.includes('┌') || line.includes('└') || line.includes('─') ? 'text-slate-600' :
                line.includes('├') ? 'text-slate-700' :
                'text-slate-300'}
            `}>
              {line}
            </div>
          ))}

          {/* Index annotations (array mode) */}
          {stack.type === 'array' && !isEmpty && (
            <div className="mt-2 text-slate-600 text-xs">
              {'  '}arr[0..{stack.items.length - 1}] active
              {' | '}arr[{stack.items.length}..{stack.capacity - 1}] unused
            </div>
          )}
        </div>
      </div>

      {/* Pointer Diagram (Linked List) */}
      {stack.type === 'linkedlist' && (
        <div>
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">
            🔗 Pointer Diagram
          </div>
          <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs">
            <div className="text-slate-400 mb-2">{'/* Node layout: [data | *next] */'}</div>
            {buildLinkedDiagram()}
          </div>
        </div>
      )}

      {/* Memory layout */}
      <div>
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">
          🧠 Memory Layout
        </div>
        <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs space-y-2">
          <div className="text-slate-400">{'/* sizeof analysis: */'}</div>
          {stack.type === 'array' ? (
            <>
              <div className="text-slate-300">sizeof(int) = 4 bytes</div>
              <div className="text-slate-300">sizeof(arr) = {stack.capacity} × 4 = {stack.capacity * 4} bytes</div>
              <div className="text-slate-300">sizeof(Stack) ≈ {stack.capacity * 4 + 8} bytes (arr + top + cap)</div>
              <div className="mt-2 grid grid-cols-[auto,1fr] gap-x-2 gap-y-0.5">
                {Array.from({ length: Math.min(stack.capacity, 12) }, (_, i) => (
                  <div key={i} className="contents">
                    <span className="text-slate-600">[{i}]</span>
                    <span className={`px-1 rounded ${
                      i < stack.items.length
                        ? i === stack.items.length - 1
                          ? 'text-emerald-400 bg-emerald-900/30'
                          : 'text-violet-300 bg-violet-900/20'
                        : 'text-slate-700'
                    }`}>
                      {i < stack.items.length ? stack.items[i] : '??'}
                    </span>
                  </div>
                ))}
                {stack.capacity > 12 && (
                  <div className="col-span-2 text-slate-700">... {stack.capacity - 12} more slots</div>
                )}
              </div>
              <div className="text-slate-500 text-[10px] mt-1">
                Active: indices 0..{stack.items.length - 1} | top = {stack.items.length - 1}
              </div>
            </>
          ) : (
            <>
              <div className="text-slate-300">sizeof(Node) = 4 (data) + 8 (ptr) = 12 bytes</div>
              <div className="text-slate-300">Total allocated = {stack.items.length} × 12 = {stack.items.length * 12} bytes</div>
              <div className="text-slate-300">Wasted memory = 0 bytes ✓</div>
            </>
          )}
          <div className="border-t border-slate-800 pt-2 text-slate-400">
            {getMemoryInfo(stack)}
          </div>
        </div>
      </div>

      {/* State summary */}
      <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-3 font-mono text-xs">
        <div className="text-slate-400 mb-1">{'/* Current State */'}</div>
        <div className="space-y-0.5 text-slate-300">
          {stack.type === 'array' ? (
            <>
              <div>Stack.top      = <span className="text-yellow-400">{stack.items.length - 1}</span></div>
              <div>Stack.capacity = <span className="text-blue-400">{stack.capacity}</span></div>
              <div>isEmpty()      = <span className={isEmpty ? 'text-green-400' : 'text-red-400'}>{isEmpty ? 'true' : 'false'}</span></div>
              <div>isFull()       = <span className={stack.items.length >= stack.capacity ? 'text-red-400' : 'text-green-400'}>
                {stack.items.length >= stack.capacity ? 'true' : 'false'}
              </span></div>
            </>
          ) : (
            <>
              <div>top            = <span className="text-yellow-400">{isEmpty ? 'NULL' : `node(${stack.items[stack.items.length-1]})`}</span></div>
              <div>size           = <span className="text-blue-400">{stack.items.length}</span></div>
              <div>isEmpty()      = <span className={isEmpty ? 'text-green-400' : 'text-red-400'}>{isEmpty ? 'true (top==NULL)' : 'false'}</span></div>
              <div>isFull()       = <span className="text-green-400">false (dynamic)</span></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
