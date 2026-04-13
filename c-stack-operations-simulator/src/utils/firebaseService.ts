import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

// Collection name for stack operations
const STACK_OPERATIONS_COLLECTION = 'stackOperations';

// Interface for stack operation data
export interface StackOperationData {
  id?: string;
  operation: string;
  value?: number | string;
  timestamp: Date;
  stackState: any[];
  userId?: string;
}

// Save a stack operation to Firestore
export const saveStackOperation = async (operationData: Omit<StackOperationData, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, STACK_OPERATIONS_COLLECTION), {
      ...operationData,
      timestamp: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving stack operation:', error);
    throw error;
  }
};

// Get all stack operations for a user (optional userId filter)
export const getStackOperations = async (userId?: string): Promise<StackOperationData[]> => {
  try {
    let q = query(
      collection(db, STACK_OPERATIONS_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    if (userId) {
      q = query(
        collection(db, STACK_OPERATIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as StackOperationData[];
  } catch (error) {
    console.error('Error getting stack operations:', error);
    throw error;
  }
};

// Update a stack operation
export const updateStackOperation = async (id: string, updates: Partial<StackOperationData>): Promise<void> => {
  try {
    const docRef = doc(db, STACK_OPERATIONS_COLLECTION, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating stack operation:', error);
    throw error;
  }
};

// Delete a stack operation
export const deleteStackOperation = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, STACK_OPERATIONS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting stack operation:', error);
    throw error;
  }
};

// Clear all stack operations (useful for reset functionality)
export const clearAllStackOperations = async (userId?: string): Promise<void> => {
  try {
    const operations = await getStackOperations(userId);
    const deletePromises = operations.map(op => deleteStackOperation(op.id!));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error clearing stack operations:', error);
    throw error;
  }
};