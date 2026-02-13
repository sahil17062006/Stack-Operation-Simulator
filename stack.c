#include <stdio.h>
#define MAX 5

int stack[MAX];
int top = -1;

// Check if stack is full
int isFull() {
    return (top == MAX - 1);
}

// Check if stack is empty
int isEmpty() {
    return (top == -1);
}

// Push operation
void push(int value) {
    if (isFull()) {
        printf("\n❌ STACK OVERFLOW! Cannot insert %d\n", value);
        return;
    }
    stack[++top] = value;
    printf("\n✅ %d inserted successfully.\n", value);
}

// Pop operation
void pop() {
    if (isEmpty()) {
        printf("\n❌ STACK UNDERFLOW! Stack is empty.\n");
        return;
    }
    printf("\n✅ %d removed successfully.\n", stack[top--]);
}

// Peek operation
void peek() {
    if (isEmpty()) {
        printf("\n⚠ Stack is empty.\n");
        return;
    }
    printf("\n🔝 Top element is: %d\n", stack[top]);
}

// Display stack vertically
void display() {
    if (isEmpty()) {
        printf("\n⚠ Stack is empty.\n");
        return;
    }

    printf("\n----- STACK -----\n");
    for (int i = top; i >= 0; i--) {
        printf("|\t%d\t|\n", stack[i]);
    }
    printf("-----------------\n");
}

int main() {
    int choice, value;

    printf("===== STACK OPERATION DEMONSTRATION =====\n");

    do {
        printf("\n1. Push");
        printf("\n2. Pop");
        printf("\n3. Peek");
        printf("\n4. Display");
        printf("\n5. Exit");
        printf("\nEnter your choice: ");
        scanf("%d", &choice);

        switch(choice) {
            case 1:
                printf("Enter value to insert: ");
                scanf("%d", &value);
                push(value);
                break;

            case 2:
                pop();
                break;

            case 3:
                peek();
                break;

            case 4:
                display();
                break;

            case 5:
                printf("\nProgram Ended.\n");
                break;

            default:
                printf("\nInvalid Choice! Try Again.\n");
        }

    } while (choice != 5);

    return 0;
}