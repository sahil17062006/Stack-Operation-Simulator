// ============================================================
// engine/file_handler.ts — Persistent Storage Handler
// Mirrors: file_handler.c in C project
//
// Simulates fopen/fclose/fprintf/fscanf using localStorage
// stack_data.txt → localStorage key: 'stack_data'
// log.txt        → localStorage key: 'stack_log'
//
// Functions: saveStackState, loadStackState,
//            appendLog, loadLogs, exportAsText
// ============================================================

import type { LogEntry, MultiStackEntry } from '../types/stack';

const STORAGE_KEY_STACKS = 'stack_simulator_data';
const STORAGE_KEY_LOGS   = 'stack_simulator_logs';

/**
 * saveStackState() — Serialize and write stack state to storage
 * Equivalent to: fopen("stack_data.txt", "w"); fprintf(fp, ...);
 */
export function saveAllStacks(stacks: MultiStackEntry[]): void {
  try {
    const serialized = JSON.stringify(stacks);
    localStorage.setItem(STORAGE_KEY_STACKS, serialized);
  } catch (e) {
    console.error('[file_handler] Failed to save stack state:', e);
  }
}

/**
 * loadStackState() — Read and deserialize stack state from storage
 * Equivalent to: fopen("stack_data.txt", "r"); fscanf(fp, ...);
 */
export function loadAllStacks(): MultiStackEntry[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STACKS);
    if (!raw) return null;
    return JSON.parse(raw) as MultiStackEntry[];
  } catch (e) {
    console.error('[file_handler] Failed to load stack state:', e);
    return null;
  }
}

/**
 * appendLog() — Append a single log entry to log storage
 * Equivalent to: fopen("log.txt", "a"); fprintf(fp, "[TIME] OP VALUE\n");
 */
export function appendLog(entry: LogEntry): void {
  try {
    const existing = loadAllLogs();
    const updated = [...existing, entry];
    // Keep last 500 log entries max
    const trimmed = updated.slice(-500);
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(trimmed));
  } catch (e) {
    console.error('[file_handler] Failed to append log:', e);
  }
}

/**
 * loadAllLogs() — Read all log entries from storage
 */
export function loadAllLogs(): LogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) return [];
    return JSON.parse(raw) as LogEntry[];
  } catch (e) {
    console.error('[file_handler] Failed to load logs:', e);
    return [];
  }
}

/**
 * clearStorage() — Delete all persisted data
 * Equivalent to: fopen("stack_data.txt", "w"); fclose(fp);
 */
export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY_STACKS);
  localStorage.removeItem(STORAGE_KEY_LOGS);
}

/**
 * exportLogsAsText() — Format logs as plain text (log.txt simulation)
 * Example: [2024-01-01 12:00:00] PUSH 10 [Array Stack] SUCCESS
 */
export function exportLogsAsText(logs: LogEntry[]): string {
  if (logs.length === 0) return '-- No log entries found --\n';
  const header = `${'='.repeat(70)}\n  Stack Operations Simulator — Operation Log\n${'='.repeat(70)}\n\n`;
  const rows = logs
    .map(
      (l) =>
        `[${l.timestamp}] ${l.operation.padEnd(8)} ${
          l.value !== undefined ? String(l.value).padStart(5) : '     '
        }  [${l.stackType === 'array' ? 'Array    ' : 'LinkedList'}]  ${
          l.success ? 'SUCCESS' : 'FAILED '
        }  — ${l.message}`
    )
    .join('\n');
  return header + rows + '\n';
}

/**
 * exportStackAsText() — Format stack state as plain text (stack_data.txt)
 */
export function exportStackAsText(entries: MultiStackEntry[]): string {
  if (entries.length === 0) return '-- No stack data saved --\n';
  let out = `${'='.repeat(70)}\n  Stack Operations Simulator — Stack Data\n${'='.repeat(70)}\n\n`;
  entries.forEach((e) => {
    out += `Stack: ${e.name} [${e.state.type}]\n`;
    out += `Items: [${e.state.items.join(', ')}]\n`;
    out += `Size: ${e.state.items.length} / Capacity: ${
      e.state.type === 'array' ? e.state.capacity : '∞'
    }\n\n`;
  });
  return out;
}
