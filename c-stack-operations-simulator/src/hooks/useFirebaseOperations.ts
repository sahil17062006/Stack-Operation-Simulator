import { useCallback } from 'react';
import { saveStackOperation, clearAllStackOperations } from '../utils/firebaseService';
import type { StackOperationData } from '../utils/firebaseService';

export const useFirebaseOperations = () => {
  const saveOperation = useCallback(async (
    operation: string,
    value: number | string | undefined,
    stackState: any[]
  ): Promise<void> => {
    try {
      const operationData: Omit<StackOperationData, 'id'> = {
        operation,
        value,
        timestamp: new Date(),
        stackState: [...stackState] // Create a copy of the stack state
      };

      await saveStackOperation(operationData);
      console.log(`Operation "${operation}" saved to Firebase`);
    } catch (error) {
      console.error('Failed to save operation to Firebase:', error);
      // Don't throw error to avoid breaking the app if Firebase is unavailable
    }
  }, []);

  const clearOperations = useCallback(async (): Promise<void> => {
    try {
      await clearAllStackOperations();
      console.log('All operations cleared from Firebase');
    } catch (error) {
      console.error('Failed to clear operations from Firebase:', error);
    }
  }, []);

  return {
    saveOperation,
    clearOperations
  };
};