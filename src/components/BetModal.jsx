import React, { useState } from 'react';
import { runTransaction, doc, collection, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useStore } from '../store/useStore';

export default function BetModal({ event, onClose }) {
  const { user, userProfile } = useStore();
  
  const [betType, setBetType] = useState('1X2');
  const [selection, setSelection] = useState(null);
  const [odds, setOdds] = useState(1.0);
  const [stake, setStake] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Mock odds for UI display
  const mockOdds = { '1': 2.1, 'X': 3.0, '2': 3.5 };

  const handleConfirm = async () => {
    if (!user || !userProfile) {
      setErrorMsg("Must be logged in.");
      return;
    }
    if (!selection) {
       setErrorMsg("Please select an outcome.");
       return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await runTransaction(db, async (t) => {
        const userRef = doc(db, 'users', user.uid);
        const eventRef = doc(db, 'events', event.id);

        const uSnap = await t.get(userRef);
        const eSnap = await t.get(eventRef);

        if (!uSnap.exists()) throw new Error("User not found");
        if (uSnap.data().balance < stake) throw new Error("Insufficient Coins");
        if (eSnap.data()?.bettingLocked) throw new Error("Betting is currently locked for this event.");

        // Deduct balance
        t.update(userRef, { balance: increment(-stake) });

        if (betType === 'ExactScore') {
          t.update(eventRef, { jackpotPool: increment(stake) });
        }

        const potentialReturn = Math.round(stake * odds);
        const betRef = doc(collection(db, 'bets'));
        
        t.set(betRef, {
          userId: user.uid,
          eventId: event.id,
          type: betType,
          selection,
          odds,
          stake,
          status: 'pending',
          potentialReturn,
          createdAt: serverTimestamp(),
          sport: event.sport,
          eventName: `\${event.homeTeamName} vs \${event.awayTeamName}`
        });

        t.set(doc(collection(db, 'transactions')), {
          userId: user.uid,
          amount: -stake,
          type: 'bet_placed',
          description: `Placed \${stake} Coins on \${event.homeTeamName} vs \${event.awayTeamName}`,
          timestamp: serverTimestamp()
        });
      });

      onClose(); // Success
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const balance = userProfile?.balance || 0;
  const maxStake = balance > 0 ? balance : 100;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px 24px 0 0', padding: '24px', paddingBottom: 'calc(24px + var(--sab))', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Place your Bet</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
        </div>

        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px', marginBottom: '24px' }}>
          {event.homeTeamName} vs {event.awayTeamName}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>Winner Match (1X2)</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['1', 'X', '2'].map(res => (
              <button 
                key={res}
                onClick={() => { setBetType('1X2'); setSelection(res); setOdds(mockOdds[res]); }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `2px solid \${selection === res && betType === '1X2' ? 'var(--primary)' : 'var(--border-color)'}`, background: selection === res && betType === '1X2' ? 'rgba(0,200,83,0.1)' : 'transparent', color: selection === res && betType === '1X2' ? 'var(--primary)' : 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer' }}
              >
                <div>{res}</div>
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>{mockOdds[res].toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>

        {event.sport === 'football' && (
          <div style={{ marginBottom: '24px' }}>
            <button 
               onClick={() => { setBetType('ExactScore'); setSelection('2-1'); setOdds(1.0); }} // Mock fixed exact score target
               style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `2px solid \${betType === 'ExactScore' ? 'var(--accent)' : 'var(--border-color)'}`, background: betType === 'ExactScore' ? 'rgba(255,109,0,0.1)' : 'transparent', color: betType === 'ExactScore' ? 'var(--accent)' : 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Exact Score Jackpot Pool ({event.jackpotPool} Coins)
            </button>
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600 }}>Stake: {stake} Coins</span>
            <span style={{ color: 'var(--text-muted)' }}>Balance: {balance}</span>
          </div>
          <input 
            type="range" 
            min="100" 
            max={maxStake < 100 ? 100 : maxStake} 
            step="100"
            value={stake} 
            onChange={(e) => setStake(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)' }}
          />
        </div>

        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Potential Return:</span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>{Math.round(stake * odds)} Coins</span>
        </div>

        {errorMsg && <div style={{ color: 'red', textAlign: 'center', marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>{errorMsg}</div>}

        <button 
          className="btn-primary" 
          onClick={handleConfirm}
          disabled={isLoading || event.bettingLocked}
        >
          {isLoading ? 'Processing...' : (event.bettingLocked ? 'BETTING LOCKED' : 'CONFIRM BET')}
        </button>

      </div>
    </div>
  );
}
