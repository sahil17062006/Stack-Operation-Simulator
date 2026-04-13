// ============================================================
// components/CodePanel.tsx
// Shows equivalent C source code for current operation
// ============================================================

import { useState } from 'react';
import type { OperationName, StackType } from '../types/stack';
import { getPerformanceNote } from '../engine/utils';

interface Props {
  lastOp?: OperationName;
  stackType: StackType;
}

const C_SOURCES: Record<string, string> = {
  array_struct: `/* stack_array.h */
#define MAX 20

typedef struct {
    int arr[MAX];
    int top;
    int capacity;
} Stack;

/* Initialize stack */
void initStack(Stack *s) {
    s->top = -1;
    s->capacity = MAX;
}`,

  linkedlist_struct: `/* stack_linkedlist.h */
typedef struct Node {
    int data;
    struct Node *next;
} Node;

typedef struct {
    Node *top;
    int size;
} LinkedStack;

/* Initialize linked stack */
void initStack(LinkedStack *s) {
    s->top = NULL;
    s->size = 0;
}`,

  PUSH_array: `/* push() — Array Implementation */
/* Time: O(1) | Space: O(1) */
int push(Stack *s, int value) {
    /* Check overflow */
    if (s->top == s->capacity - 1) {
        printf("\\033[31mERROR: Stack Overflow!\\033[0m\\n");
        return 0; /* FAILURE */
    }
    /* Insert at top */
    s->arr[++(s->top)] = value;
    printf("\\033[32mPushed %d\\033[0m\\n", value);
    return 1; /* SUCCESS */
}`,

  PUSH_linkedlist: `/* push() — Linked List Implementation */
/* Time: O(1) | Space: O(1) — dynamic alloc */
int push(LinkedStack *s, int value) {
    /* Allocate new node */
    Node *newNode = (Node*)malloc(sizeof(Node));
    if (!newNode) {
        printf("\\033[31mERROR: malloc failed!\\033[0m\\n");
        return 0;
    }
    newNode->data = value;
    newNode->next = s->top; /* Link to old top */
    s->top = newNode;       /* Update top */
    s->size++;
    printf("\\033[32mPushed node(%d)\\033[0m\\n", value);
    return 1;
}`,

  POP_array: `/* pop() — Array Implementation */
/* Time: O(1) | Space: O(1) */
int pop(Stack *s, int *value) {
    /* Check underflow */
    if (s->top == -1) {
        printf("\\033[31mERROR: Stack Underflow!\\033[0m\\n");
        return 0; /* FAILURE */
    }
    *value = s->arr[(s->top)--]; /* Return & decrement */
    printf("\\033[32mPopped %d\\033[0m\\n", *value);
    return 1;
}`,

  POP_linkedlist: `/* pop() — Linked List Implementation */
/* Time: O(1) | Space: O(1) — frees memory */
int pop(LinkedStack *s, int *value) {
    if (s->top == NULL) {
        printf("\\033[31mERROR: Stack Underflow!\\033[0m\\n");
        return 0;
    }
    Node *temp = s->top;
    *value = temp->data;
    s->top = s->top->next; /* Move top */
    free(temp);            /* Free memory! */
    s->size--;
    printf("\\033[32mPopped %d\\033[0m\\n", *value);
    return 1;
}`,

  PEEK_array: `/* peek() — Array Implementation */
/* Time: O(1) — just read arr[top] */
int peek(Stack *s, int *value) {
    if (s->top == -1) {
        printf("Stack is empty!\\n");
        return 0;
    }
    *value = s->arr[s->top]; /* No removal */
    printf("Top element: %d\\n", *value);
    return 1;
}`,

  PEEK_linkedlist: `/* peek() — Linked List Implementation */
/* Time: O(1) — read top->data */
int peek(LinkedStack *s, int *value) {
    if (s->top == NULL) {
        printf("Stack is empty! (top == NULL)\\n");
        return 0;
    }
    *value = s->top->data; /* No node removed */
    printf("top->data = %d\\n", *value);
    return 1;
}`,

  CLEAR_array: `/* clear() — Array Implementation */
/* Time: O(1) — just reset top */
void clear(Stack *s) {
    s->top = -1;
    /* Elements still in memory,
       but logically stack is empty */
    printf("Stack cleared.\\n");
}`,

  CLEAR_linkedlist: `/* clear() — Linked List Implementation */
/* Time: O(n) — must free all nodes! */
void clear(LinkedStack *s) {
    Node *curr = s->top;
    while (curr != NULL) {
        Node *temp = curr;
        curr = curr->next;
        free(temp); /* Free each node */
    }
    s->top = NULL;
    s->size = 0;
    printf("All nodes freed.\\n");
}`,

  IS_EMPTY_array: `/* isEmpty() — Array */
int isEmpty(Stack *s) {
    return (s->top == -1);
    /* true  → top == -1 (no elements) */
    /* false → top >= 0  */
}`,

  IS_EMPTY_linkedlist: `/* isEmpty() — Linked List */
int isEmpty(LinkedStack *s) {
    return (s->top == NULL);
    /* true  → top == NULL (no nodes) */
    /* false → top points to a node   */
}`,

  IS_FULL_array: `/* isFull() — Array */
int isFull(Stack *s) {
    return (s->top == s->capacity - 1);
    /* true  → no more space in arr[] */
    /* false → space available        */
}`,

  IS_FULL_linkedlist: `/* isFull() — Linked List */
/* Theoretically never full! */
int isFull(LinkedStack *s) {
    return 0; /* Always false */
    /* Limited only by system RAM */
    /* Dynamic allocation — malloc() */
}`,

  UNDO_array: `/* undo() — snapshot-based approach */
/* Save state before each operation */
void saveSnapshot(Stack *s, Stack *backup) {
    memcpy(backup->arr, s->arr,
           sizeof(int) * s->capacity);
    backup->top = s->top;
}

void undo(Stack *s, Stack *backup) {
    memcpy(s->arr, backup->arr,
           sizeof(int) * backup->capacity);
    s->top = backup->top;
    printf("Undo successful!\\n");
}`,

  display_array: `/* display() — Array Stack */
/* Time: O(n) */
void display(Stack *s) {
    if (isEmpty(s)) {
        printf("Stack is empty!\\n");
        return;
    }
    printf("  +--------+\\n");
    for (int i = s->top; i >= 0; i--) {
        printf("  |  %4d  |", s->arr[i]);
        if (i == s->top) printf(" ← TOP");
        printf("\\n");
        if (i > 0) printf("  +--------+\\n");
    }
    printf("  +========+\\n");
}`,

  file_handler: `/* file_handler.c */
#include <stdio.h>
#include <time.h>

/* Save stack to file */
void saveStack(Stack *s, const char *filename) {
    FILE *fp = fopen(filename, "w");
    if (!fp) return;
    fprintf(fp, "%d %d\\n", s->top, s->capacity);
    for (int i = 0; i <= s->top; i++)
        fprintf(fp, "%d\\n", s->arr[i]);
    fclose(fp);
}

/* Log operation to log.txt */
void logOperation(const char *op, int val) {
    FILE *fp = fopen("log.txt", "a");
    if (!fp) return;
    time_t t = time(NULL);
    char *ts = ctime(&t);
    ts[strlen(ts)-1] = '\\0';
    fprintf(fp, "[%s] %s %d\\n", ts, op, val);
    fclose(fp);
}`,
};

const OP_CODE_MAP: Partial<Record<OperationName, string>> = {
  PUSH:     'PUSH',
  POP:      'POP',
  PEEK:     'PEEK',
  CLEAR:    'CLEAR',
  IS_EMPTY: 'IS_EMPTY',
  IS_FULL:  'IS_FULL',
  UNDO:     'UNDO',
};

const TABS = [
  { id: 'struct',  label: 'struct' },
  { id: 'op',      label: 'operation' },
  { id: 'display', label: 'display()' },
  { id: 'file',    label: 'file_handler.c' },
];

export default function CodePanel({ lastOp, stackType }: Props) {
  const [tab, setTab] = useState('struct');

  const getCode = () => {
    switch (tab) {
      case 'struct':
        return stackType === 'array' ? C_SOURCES.array_struct : C_SOURCES.linkedlist_struct;
      case 'op': {
        const opKey = lastOp ? OP_CODE_MAP[lastOp] : null;
        if (!opKey) return `/* Select an operation to see its C implementation */\n\n/* Available operations:\n   push(), pop(), peek(), clear(),\n   isEmpty(), isFull(), undo(), display() */`;
        const key = `${opKey}_${stackType}`;
        return C_SOURCES[key] ?? C_SOURCES[`${opKey}_array`] ?? '/* Code not available */';
      }
      case 'display':
        return C_SOURCES.display_array;
      case 'file':
        return C_SOURCES.file_handler;
      default:
        return '';
    }
  };

  const perfNote = lastOp ? getPerformanceNote(lastOp, stackType) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex gap-1 mb-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded transition-all ${
              tab === t.id
                ? 'bg-violet-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Performance note */}
      {perfNote && tab === 'op' && (
        <div className="mb-2 px-2.5 py-1.5 bg-emerald-900/20 border border-emerald-800/30 rounded-lg">
          <span className="text-[11px] font-mono text-emerald-400">
            ⚡ Complexity: {perfNote}
          </span>
        </div>
      )}

      {/* Code block */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-slate-950 rounded-xl p-3">
        <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
          <code>{getCode()}</code>
        </pre>
      </div>

      {/* GCC compile hint */}
      <div className="mt-2 px-2.5 py-1.5 bg-slate-900/60 border border-slate-700 rounded-lg">
        <span className="text-[10px] font-mono text-slate-500">
          $ gcc -o simulator main.c stack_array.c stack_linkedlist.c file_handler.c utils.c -lm
        </span>
      </div>
    </div>
  );
}
