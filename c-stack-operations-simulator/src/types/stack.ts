// ============================================================
// types/stack.ts — Type definitions mirroring C structures
// Equivalent to struct Stack and struct Node in C
// ============================================================

export type StackType = 'array' | 'linkedlist';

export type OperationName =
  | 'PUSH'
  | 'POP'
  | 'PEEK'
  | 'CLEAR'
  | 'INIT'
  | 'LOAD'
  | 'UNDO'
  | 'SIZE'
  | 'IS_EMPTY'
  | 'IS_FULL'
  | 'DISPLAY';

export interface LogEntry {
  id: string;
  timestamp: string;
  operation: OperationName;
  value?: number;
  stackType: StackType;
  success: boolean;
  message: string;
}

// Mirrors struct Node { int data; struct Node* next; }
export interface LinkedNode {
  data: number;
  id: string;
}

// Mirrors struct Stack { int arr[MAX]; int top; int capacity; }
export interface StackState {
  items: number[];
  capacity: number; // MAX size for array-based
  type: StackType;
  label: string;
}

export interface HistorySnapshot {
  items: number[];
  operation: OperationName;
  value?: number;
}

export interface MultiStackEntry {
  id: string;
  name: string;
  state: StackState;
  history: HistorySnapshot[];
  logs: LogEntry[];
}
