import { useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDocs, runTransaction, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../services/firebase';

export function useBetResolution() {
  useEffect(() => {
    if (!db) return;

    const q = query(
      collection(db, 'events'),
      where('status', 'in', ['FT', 'AET', 'PEN', 'AW', 'POST'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          resolveBetsForEvent(change.doc.id, change.doc.data());
        }
      });
    }, (error) => console.warn(error));

    return () => unsubscribe();
  }, []);

  const resolveBetsForEvent = async (eventId, eventData) => {
    if (!eventData.currentScore) return;
    
    const h = eventData.currentScore.home || 0;
    const a = eventData.currentScore.away || 0;
    const winning1X2 = h > a ? '1' : (h === a ? 'X' : '2');
    const exactScoreStr = `\${h}-\${a}`;

    try {
      const pendingBetsQ = query(
         collection(db, 'bets'), 
         where('eventId', '==', eventId), 
         where('status', '==', 'pending')
      );
      const pendingSnaps = await getDocs(pendingBetsQ);
      if (pendingSnaps.empty) return;

      let jackpotWinnersCount = 0;
      pendingSnaps.forEach(d => {
        if (d.data().type === 'ExactScore' && d.data().selection === exactScoreStr) jackpotWinnersCount++;
      });

      for (const betDoc of pendingSnaps.docs) {
        const betData = betDoc.data();

        await runTransaction(db, async (t) => {
          const freshBetSnap = await t.get(betDoc.ref);
          if (!freshBetSnap.exists() || freshBetSnap.data().status !== 'pending') return;

          let didWin = false;
          let finalPayout = 0;

          if (betData.type === '1X2') {
            didWin = (betData.selection === winning1X2);
            finalPayout = betData.potentialReturn || 0;
          } else if (betData.type === 'ExactScore') {
             didWin = (betData.selection === exactScoreStr);
             finalPayout = jackpotWinnersCount > 0 ? Math.floor((eventData.jackpotPool || 0) / jackpotWinnersCount) : 0;
          }

          const userRef = doc(db, 'users', betData.userId);
          const uSnap = await t.get(userRef);
          if (!uSnap.exists()) return;
          const uData = uSnap.data();

          const txRef = doc(collection(db, 'transactions'));

          if (didWin) {
            t.update(betDoc.ref, { 
              status: 'won', 
              ...(betData.type === 'ExactScore' && { potentialReturn: finalPayout })
            });

            // Calculate Streak & Levelling Variables
            let newStreak = (uData.currentStreak || 0) + 1;
            let streakBonus = 0;
            if (newStreak === 3) streakBonus = 500;
            if (newStreak === 5) streakBonus = 2000;
            
            let bestStreak = Math.max((uData.bestStreak || 0), newStreak);
            let newXp = (uData.xp || 0) + 15; // 15 XP per win
            let level = uData.level || 1;
            
            if (newXp >= level * 100) {
               level++; // Level Up !
               newXp = 0;
               streakBonus += 100; // Level up bonus
            }

            t.update(userRef, {
              balance: increment(finalPayout + streakBonus),
              xp: newXp,
              level,
              currentStreak: newStreak,
              bestStreak,
              'stats.wins': increment(1)
            });

            t.set(txRef, {
              userId: betData.userId,
              amount: finalPayout + streakBonus,
              type: 'bet_won',
              description: `Won \${eventData.homeTeamName} vs \${eventData.awayTeamName}\${streakBonus > 0 ? ' (Includes Streak/Level Bonus)' : ''}`,
              timestamp: serverTimestamp()
            });

            // 10% Referral Logic
            await handleReferralBonus(t, betData.userId, finalPayout, uData.referredBy);
          } else {
            // Bet Lost. Reset Streak.
            t.update(betDoc.ref, { status: 'lost' });
            t.update(userRef, { currentStreak: 0 });
          }
        });
      }
    } catch (e) {
      console.warn("Bet resolution fail:", e);
    }
  };

  const handleReferralBonus = async (t, userId, winAmount, referredBy) => {
    if (!referredBy) return;
    const bonus = Math.floor(winAmount * 0.10);
    if (bonus <= 0) return;

    // Inside transaction, external read:
    const referrerQ = query(collection(db, 'users'), where('referralCode', '==', referredBy));
    const refQuerySnap = await getDocs(referrerQ); 
    
    if (!refQuerySnap.empty) {
      const referrerDoc = refQuerySnap.docs[0];
      t.update(doc(db, 'users', referrerDoc.id), { balance: increment(bonus) });
    }
  }
}
