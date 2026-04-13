// ============================================================
// engine/stack_linkedlist.ts — Linked List-based Stack
// Mirrors: stack_linkedlist.c in C project
//
// Equivalent C structures:
//   typedef struct Node { int data; struct Node* next; } Node;
//   typedef struct { Node* top; int size; } LinkedStack;
//
// Functions: initStack, push, pop, peek, isEmpty, size, clear
// Note: Linked list stack has NO capacity limit (dynamic memory)
// ============================================================

import type { StackState } from '../types/stack';

/**
 * initLinkedStack() — Initialize an empty linked list stack
 * Sets top = NULL, size = 0
 * Uses MAX_SAFE_INTEGER as capacity (unlimited)
 */
export function initLinkedStack(): StackState {
  return {
    items: [],
    capacity: Number.MAX_SAFE_INTEGER, // dynamic — no fixed limit
    type: 'linkedlist',
    label: 'Linked List Stack',
  };
}

/**
 * isEmpty() — Check if top == NULL
 */
export function isEmptyLinked(stack: StackState): boolean {
  return stack.items.length === 0;
}

/**
 * isFull() — Linked list stack is theoretically never full
 * (limited only by system memory)
 */
export function isFullLinked(_stack: StackState): boolean {
  return false; // dynamic allocation — no overflow
}

/**
 * size() — Returns current number of nodes
 */
export function sizeLinked(stack: StackState): number {
  return stack.items.length;
}

/**
 * push() — Allocate new Node, link to top
 * malloc(sizeof(Node)) equivalent
 * newNode->data = value; newNode->next = top; top = newNode;
 */
export function pushLinked(
  stack: StackState,
  value: number
): { success: boolean; state: StackState; message: string } {
  const newState: StackState = {
    ...stack,
    items: [...stack.items, value],
  };
  return {
    success: true,
    state: newState,
    message: `✅ Node(${value}) allocated & pushed. New top → ${value}.`,
  };
}

/**
 * pop() — Remove top node, free memory
 * temp = top; top = top->next; free(temp);
 */
export function popLinked(
  stack: StackState
): { success: boolean; state: StackState; value?: number; message: string } {
  if (isEmptyLinked(stack)) {
    return {
      success: false,
      state: stack,
      message: `⚠️  Stack UNDERFLOW! Cannot pop. Stack is empty (top == NULL).`,
    };
  }
  const value = stack.items[stack.items.length - 1];
  const newState: StackState = {
    ...stack,
    items: stack.items.slice(0, -1),
  };
  return {
    success: true,
    state: newState,
    value,
    message: `✅ Popped node(${value}). Memory freed. Top → ${newState.items.length > 0 ? newState.items[newState.items.length - 1] : 'NULL'}.`,
  };
}

/**
 * peek() — Return top->data without modification
 */
export function peekLinked(
  stack: StackState
): { success: boolean; value?: number; message: string } {
  if (isEmptyLinked(stack)) {
    return {
      success: false,
      message: `⚠️  Stack is empty. top == NULL. No element to peek.`,
    };
  }
  const value = stack.items[stack.items.length - 1];
  return {
    success: true,
    value,
    message: `🔍 top->data = ${value}`,
  };
}

/**
 * clear() — Free all nodes iteratively
 * while(top != NULL) { temp = top; top = top->next; free(temp); }
 */
export function clearLinked(stack: StackState): StackState {
  return { ...stack, items: [] };
}
