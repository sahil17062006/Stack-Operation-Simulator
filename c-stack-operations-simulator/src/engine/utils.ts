// ============================================================
// engine/utils.ts — Utility Functions
// Mirrors: utils.c in C project
//
// Functions: generateId, getTimestamp, validateInput,
//            generateAsciiStack, createLogEntry
// ============================================================

import type { LogEntry, OperationName, StackState, StackType } from '../types/stack';

/**
 * generateId() — Create a unique identifier
 * Equivalent to: static int idCounter = 0; return ++idCounter;
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * getTimestamp() — Return formatted current time
 * Equivalent to: time_t t = time(NULL); strftime(buf, ...)
 */
export function getTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

/**
 * validateInput() — Check if user input is a valid integer
 * Equivalent to: if(scanf("%d", &val) != 1) { handle_error(); }
 */
export function validateInput(raw: string): { valid: boolean; value?: number; error?: string } {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { valid: false, error: 'Input cannot be empty.' };
  }
  const num = Number(trimmed);
  if (!Number.isInteger(num)) {
    return { valid: false, error: `"${trimmed}" is not a valid integer.` };
  }
  if (num < -999999 || num > 999999) {
    return { valid: false, error: 'Value must be between -999999 and 999999.' };
  }
  return { valid: true, value: num };
}

/**
 * createLogEntry() — Build a structured log record
 * Mirrors writing to log.txt: fprintf(fp, "[%s] %s %d\n", time, op, val)
 */
export function createLogEntry(
  operation: OperationName,
  stackType: StackType,
  success: boolean,
  message: string,
  value?: number
): LogEntry {
  return {
    id: generateId(),
    timestamp: getTimestamp(),
    operation,
    value,
    stackType,
    success,
    message,
  };
}

/**
 * generateAsciiStack() — Create ASCII visualization of stack
 * Renders a vertical stack diagram (top → bottom)
 *
 * Example output:
 *   ┌──────────┐
 *   │    30    │ ← TOP
 *   ├──────────┤
 *   │    20    │
 *   ├──────────┤
 *   │    10    │ ← BOTTOM
 *   └──────────┘
 */
export function generateAsciiStack(stack: StackState): string[] {
  if (stack.items.length === 0) {
    return [
      '  ┌──────────┐',
      '  │  (empty) │',
      '  └──────────┘',
    ];
  }

  const lines: string[] = [];
  const reversed = [...stack.items].reverse();

  lines.push('  ┌──────────┐');
  reversed.forEach((item, idx) => {
    const label = String(item).padStart(4).padEnd(8);
    const tag = idx === 0 ? ' ← TOP' : idx === reversed.length - 1 ? ' ← BOTTOM' : '';
    lines.push(`  │ ${label} │${tag}`);
    if (idx < reversed.length - 1) {
      lines.push('  ├──────────┤');
    }
  });
  lines.push('  └──────────┘');

  return lines;
}

/**
 * getMemoryInfo() — Simulate memory usage display
 * For array: fixed allocation = capacity * sizeof(int)
 * For linked: dynamic = size * sizeof(Node) where Node = {data, next*}
 */
export function getMemoryInfo(stack: StackState): string {
  const INT_SIZE = 4; // bytes
  const POINTER_SIZE = 8; // bytes (64-bit)

  if (stack.type === 'array') {
    const allocated = stack.capacity * INT_SIZE;
    const used = stack.items.length * INT_SIZE;
    return `Allocated: ${allocated}B | Used: ${used}B | Wasted: ${allocated - used}B`;
  } else {
    const nodeSize = INT_SIZE + POINTER_SIZE; // int data + Node* next
    const used = stack.items.length * nodeSize;
    return `Nodes: ${stack.items.length} × ${nodeSize}B = ${used}B (dynamic)`;
  }
}

/**
 * getPerformanceNote() — Explain complexity for each op
 */
export function getPerformanceNote(op: OperationName, type: StackType): string {
  const notes: Record<OperationName, Record<StackType, string>> = {
    PUSH:     { array: 'O(1) — arr[++top] = val', linkedlist: 'O(1) — malloc + link' },
    POP:      { array: 'O(1) — return arr[top--]', linkedlist: 'O(1) — unlink + free' },
    PEEK:     { array: 'O(1) — return arr[top]', linkedlist: 'O(1) — return top->data' },
    CLEAR:    { array: 'O(1) — top = -1', linkedlist: 'O(n) — free all nodes' },
    INIT:     { array: 'O(1) — set top = -1', linkedlist: 'O(1) — set top = NULL' },
    LOAD:     { array: 'O(n) — read file', linkedlist: 'O(n) — read + alloc nodes' },
    UNDO:     { array: 'O(1) — restore snapshot', linkedlist: 'O(1) — restore snapshot' },
    SIZE:     { array: 'O(1) — return top+1', linkedlist: 'O(1) — maintain counter' },
    IS_EMPTY: { array: 'O(1) — top == -1', linkedlist: 'O(1) — top == NULL' },
    IS_FULL:  { array: 'O(1) — top == MAX-1', linkedlist: 'N/A — dynamic memory' },
    DISPLAY:  { array: 'O(n) — iterate array', linkedlist: 'O(n) — traverse nodes' },
  };
  return notes[op]?.[type] ?? 'O(?) — unknown';
}
