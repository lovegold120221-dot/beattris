import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';

export type MemoryType = 'preference' | 'fact' | 'summary';

export interface Memory {
  id: string;
  userId: string;
  content: string;
  type: MemoryType;
  createdAt: Date;
  updatedAt: Date;
}

export function useMemories() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // Local demo mode using localStorage
      try {
        const stored = localStorage.getItem('demo_memories');
        if (stored) {
           const parsed = JSON.parse(stored).map((m: any) => ({
             ...m,
             createdAt: new Date(m.createdAt),
             updatedAt: new Date(m.updatedAt)
           }));
           setMemories(parsed);
        }
      } catch(e) {}
      
      setLoading(false);
      return;
    }

    const memoriesRef = collection(db, 'users', user.uid, 'memories');
    const q = query(memoriesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Memory[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          content: data.content,
          type: data.type,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
      setMemories(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching memories:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addMemory = async (content: string, type: MemoryType) => {
    if (!user) {
       // Demo local fallback
       const newMem: Memory = {
         id: Math.random().toString(36).substring(7),
         userId: 'demo-user',
         content,
         type,
         createdAt: new Date(),
         updatedAt: new Date()
       };
       const newMemories = [newMem, ...memories];
       setMemories(newMemories);
       localStorage.setItem('demo_memories', JSON.stringify(newMemories));
       return;
    }
    
    const memoriesRef = collection(db, 'users', user.uid, 'memories');
    
    await addDoc(memoriesRef, {
      userId: user.uid,
      content,
      type,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  const removeMemory = async (memoryId: string) => {
    if (!user) {
      // Demo local fallback
      const remaining = memories.filter(m => m.id !== memoryId);
      setMemories(remaining);
      localStorage.setItem('demo_memories', JSON.stringify(remaining));
      return;
    }
    
    const memoryRef = doc(db, 'users', user.uid, 'memories', memoryId);
    await deleteDoc(memoryRef);
  };

  return { memories, loading, addMemory, removeMemory };
}
