import { useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useStore } from '../store/useStore';

export function useAutoTopup() {
  const { user, userProfile } = useStore();

  useEffect(() => {
    if (!user || !userProfile || !db) return;

    const checkTopup = async () => {
      if (userProfile.balance <= 0) {
        // Double check no pending bets to avoid cheating the topup
        const q = query(
          collection(db, 'bets'),
          where('userId', '==', user.uid),
          where('status', '==', 'pending')
        );
        const snaps = await getDocs(q);
        
        if (snaps.empty) {
          console.log("Auto Top-Up triggered! Assinging 1000 coins.");
          await updateDoc(doc(db, 'users', user.uid), {
            balance: 1000
          });
        }
      }
    };

    checkTopup();
  }, [userProfile?.balance]); // Triggers whenever balance changes (e.g., hits 0)
}
