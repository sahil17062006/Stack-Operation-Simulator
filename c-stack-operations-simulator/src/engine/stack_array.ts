// ============================================================
// engine/stack_array.ts — Array-based Stack Implementation
// Mirrors: stack_array.c in C project
//
// Equivalent C structures:
//   #define MAX 100
//   typedef struct { int arr[MAX]; int top; int capacity; } Stack;
//
// Functions: initStack, push, pop, peek, isEmpty, isFull,
//            display, size, clear
// ============================================================

import type { StackState } from '../types/stack';

export const MAX_ARRAY_CAPACITY = 20;

/**
 * initStack() — Initialize an empty array-based stack
 * Sets top = -1, capacity = MAX
 */
export function initArrayStack(capacity = MAX_ARRAY_CAPACITY): StackState {
  return {
    items: [],
    capacity,
    type: 'array',
    label: 'Array Stack',
  };
}

/**
 * isEmpty() — Check if stack has no elements
 * Returns true if top == -1
 */
export function isEmptyArray(stack: StackState): boolean {
  return stack.items.length === 0;
}

/**
 * isFull() — Check if stack has reached max capacity
 * Returns true if top == capacity - 1
 */
export function isFullArray(stack: StackState): boolean {
  return stack.items.length >= stack.capacity;
}

/**
 * size() — Returns current number of elements
 * Equivalent to top + 1
 */
export function sizeArray(stack: StackState): number {
  return stack.items.length;
}

/**
 * push() — Insert element at top of stack
 * Checks overflow before insertion
 * Returns new state or throws error on overflow
 */
export function pushArray(
  stack: StackState,
  value: number
): { success: boolean; state: StackState; message: string } {
  if (isFullArray(stack)) {
    return {
      success: false,
      state: stack,
      message: `⚠️  Stack OVERFLOW! Cannot push ${value}. Stack is full (capacity: ${stack.capacity}).`,
    };
  }
  const newState: StackState = {
    ...stack,
    items: [...stack.items, value],
  };
  return {
    success: true,
    state: newState,
    message: `✅ Pushed ${value} onto the array stack. Top = ${value}.`,
  };
}

/**
 * pop() — Remove and return top element
 * Checks underflow before removal
 */
export function popArray(
  stack: StackState
): { success: boolean; state: StackState; value?: number; message: string } {
  if (isEmptyArray(stack)) {
    return {
      success: false,
      state: stack,
      message: `⚠️  Stack UNDERFLOW! Cannot pop. Stack is empty.`,
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
    message: `✅ Popped ${value} from the array stack.`,
  };
}

/**
 * peek() — View top element without removing
 * Checks underflow before peeking
 */
export function peekArray(
  stack: StackState
): { success: boolean; value?: number; message: string } {
  if (isEmptyArray(stack)) {
    return {
      success: false,
      message: `⚠️  Stack is empty. No element to peek.`,
    };
  }
  const value = stack.items[stack.items.length - 1];
  return {
    success: true,
    value,
    message: `🔍 Top element is: ${value}`,
  };
}

/**
 * clear() — Remove all elements from stack
 * Resets top to -1
 */
export function clearArray(stack: StackState): StackState {
  return { ...stack, items: [] };
}
