// ============================================================
// engine/stack_engine.ts — Unified Stack Controller
// Mirrors: main.c dispatch logic in C project
//
// Routes operations to correct implementation (array / linkedlist)
// Handles undo stack, history snapshots, and logging
// ============================================================

import {
  pushArray, popArray, peekArray, clearArray,
  isEmptyArray, isFullArray, sizeArray, initArrayStack,
} from './stack_array';
import {
  pushLinked, popLinked, peekLinked, clearLinked,
  isEmptyLinked, isFullLinked, sizeLinked, initLinkedStack,
} from './stack_linkedlist';
import { createLogEntry, generateId } from './utils';
import { appendLog } from './file_handler';
import type {
  HistorySnapshot, MultiStackEntry, OperationName, StackState, StackType,
} from '../types/stack';

/* ─── Helper: dispatch to correct implementation ─── */

function isEmpty(s: StackState)  { return s.type === 'array' ? isEmptyArray(s)  : isEmptyLinked(s);  }
function isFull(s: StackState)   { return s.type === 'array' ? isFullArray(s)   : isFullLinked(s);   }
function size(s: StackState)     { return s.type === 'array' ? sizeArray(s)     : sizeLinked(s);     }

/* ─── Stack Engine Class ─── */

export class StackEngine {
  private stacks: Map<string, MultiStackEntry> = new Map();

  /* ── createStack ── */
  createStack(name: string, type: StackType, capacity?: number): MultiStackEntry {
    const state = type === 'array'
      ? initArrayStack(capacity ?? 20)
      : initLinkedStack();

    const entry: MultiStackEntry = {
      id:      generateId(),
      name,
      state,
      history: [],
      logs:    [],
    };

    this.stacks.set(entry.id, entry);
    const log = createLogEntry('INIT', type, true, `Stack "${name}" initialized.`);
    appendLog(log);
    return entry;
  }

  /* ── getStack ── */
  getStack(id: string): MultiStackEntry | undefined {
    return this.stacks.get(id);
  }

  /* ── getAllStacks ── */
  getAllStacks(): MultiStackEntry[] {
    return Array.from(this.stacks.values());
  }

  /* ── deleteStack ── */
  deleteStack(id: string): void {
    this.stacks.delete(id);
  }

  /* ── loadStacks (from file_handler) ── */
  loadStacks(entries: MultiStackEntry[]): void {
    this.stacks.clear();
    entries.forEach((e) => this.stacks.set(e.id, e));
  }

  /* ── saveSnapshot (for undo) ── */
  private saveSnapshot(entry: MultiStackEntry, op: OperationName, value?: number): void {
    const snapshot: HistorySnapshot = {
      items: [...entry.state.items],
      operation: op,
      value,
    };
    entry.history.push(snapshot);
    // Keep last 50 snapshots
    if (entry.history.length > 50) entry.history.shift();
  }

  /* ─────────────────────────────────────────────────── */
  /*  PUSH                                               */
  /* ─────────────────────────────────────────────────── */
  push(id: string, value: number): { success: boolean; message: string; entry: MultiStackEntry } {
    const entry = this.stacks.get(id);
    if (!entry) return { success: false, message: 'Stack not found.', entry: entry! };

    this.saveSnapshot(entry, 'PUSH', value);
    const result = entry.state.type === 'array'
      ? pushArray(entry.state, value)
      : pushLinked(entry.state, value);

    if (result.success) {
      entry.state = result.state;
    } else {
      entry.history.pop(); // rollback snapshot
    }

    const log = createLogEntry('PUSH', entry.state.type, result.success, result.message, value);
    entry.logs.push(log);
    appendLog(log);

    return { success: result.success, message: result.message, entry };
  }

  /* ─────────────────────────────────────────────────── */
  /*  POP                                                */
  /* ─────────────────────────────────────────────────── */
  pop(id: string): { success: boolean; message: string; value?: number; entry: MultiStackEntry } {
    const entry = this.stacks.get(id);
    if (!entry) return { success: false, message: 'Stack not found.', entry: entry! };

    this.saveSnapshot(entry, 'POP');
    const result = entry.state.type === 'array'
      ? popArray(entry.state)
      : popLinked(entry.state);

    if (result.success) {
      entry.state = result.state;
    } else {
      entry.history.pop();
    }

    const log = createLogEntry('POP', entry.state.type, result.success, result.message, result.value);
    entry.logs.push(log);
    appendLog(log);

    return { success: result.success, message: result.message, value: result.value, entry };
  }

  /* ─────────────────────────────────────────────────── */
  /*  PEEK                                               */
  /* ─────────────────────────────────────────────────── */
  peek(id: string): { success: boolean; message: string; value?: number } {
    const entry = this.stacks.get(id);
    if (!entry) return { success: false, message: 'Stack not found.' };

    const result = entry.state.type === 'array'
      ? peekArray(entry.state)
      : peekLinked(entry.state);

    const log = createLogEntry('PEEK', entry.state.type, result.success, result.message, result.value);
    entry.logs.push(log);
    appendLog(log);

    return { success: result.success, message: result.message, value: result.value };
  }

  /* ─────────────────────────────────────────────────── */
  /*  CLEAR                                              */
  /* ─────────────────────────────────────────────────── */
  clear(id: string): { success: boolean; message: string; entry: MultiStackEntry } {
    const entry = this.stacks.get(id);
    if (!entry) return { success: false, message: 'Stack not found.', entry: entry! };

    this.saveSnapshot(entry, 'CLEAR');
    const prev = entry.state.items.length;
    entry.state = entry.state.type === 'array'
      ? clearArray(entry.state)
      : clearLinked(entry.state);

    const msg = `🗑️  Stack cleared. ${prev} element(s) removed.`;
    const log = createLogEntry('CLEAR', entry.state.type, true, msg);
    entry.logs.push(log);
    appendLog(log);

    return { success: true, message: msg, entry };
  }

  /* ─────────────────────────────────────────────────── */
  /*  UNDO                                               */
  /* ─────────────────────────────────────────────────── */
  undo(id: string): { success: boolean; message: string; entry: MultiStackEntry } {
    const entry = this.stacks.get(id);
    if (!entry) return { success: false, message: 'Stack not found.', entry: entry! };

    if (entry.history.length === 0) {
      return { success: false, message: '⚠️  Nothing to undo.', entry };
    }

    const snapshot = entry.history.pop()!;
    entry.state = { ...entry.state, items: [...snapshot.items] };

    const msg = `↩️  Undo successful. Reverted last ${snapshot.operation} operation.`;
    const log = createLogEntry('UNDO', entry.state.type, true, msg);
    entry.logs.push(log);
    appendLog(log);

    return { success: true, message: msg, entry };
  }

  /* ─────────────────────────────────────────────────── */
  /*  STATUS CHECKS                                      */
  /* ─────────────────────────────────────────────────── */
  checkEmpty(id: string): { isEmpty: boolean; message: string } {
    const entry = this.stacks.get(id);
    if (!entry) return { isEmpty: true, message: 'Stack not found.' };
    const empty = isEmpty(entry.state);
    const msg = empty
      ? `Stack is EMPTY (top == ${entry.state.type === 'array' ? '-1' : 'NULL'})`
      : `Stack is NOT empty. Size = ${size(entry.state)}`;
    const log = createLogEntry('IS_EMPTY', entry.state.type, true, msg);
    entry.logs.push(log);
    return { isEmpty: empty, message: msg };
  }

  checkFull(id: string): { isFull: boolean; message: string } {
    const entry = this.stacks.get(id);
    if (!entry) return { isFull: false, message: 'Stack not found.' };
    const full = isFull(entry.state);
    const cap = entry.state.type === 'array' ? entry.state.capacity : '∞';
    const msg = full
      ? `Stack is FULL (top == capacity-1 == ${entry.state.capacity - 1})`
      : `Stack is NOT full. ${size(entry.state)} / ${cap} used.`;
    const log = createLogEntry('IS_FULL', entry.state.type, true, msg);
    entry.logs.push(log);
    return { isFull: full, message: msg };
  }

  getSize(id: string): number {
    const entry = this.stacks.get(id);
    return entry ? size(entry.state) : 0;
  }
}

// Singleton instance — equivalent to global stack in main.c
export const stackEngine = new StackEngine();
