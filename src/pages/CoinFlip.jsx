import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { db } from '../services/firebase';
import { doc, updateDoc, increment, serverTimestamp, setDoc, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins } from 'lucide-react';

export default function CoinFlip() {
  const { user, userProfile } = useStore();
  const navigate = useNavigate();
  const [stake, setStake] = useState(100);
  const [side, setSide] = useState('Heads');
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState(null);

  const balance = userProfile?.balance || 0;

  const handleFlip = async () => {
    if (balance < stake) return alert("Not enough coins!");
    setFlipping(true);
    setResult(null);

    // Simulate flip
    setTimeout(async () => {
      const isWinner = Math.random() > 0.5;
      const coinResult = isWinner ? side : (side === 'Heads' ? 'Tails' : 'Heads');
      
      const userRef = doc(db, 'users', user.uid);
      const txRef = doc(collection(db, 'transactions'));
      
      const pnl = isWinner ? stake : -stake;
      
      await updateDoc(userRef, { balance: increment(pnl) });
      await setDoc(txRef, {
         userId: user.uid,
         amount: pnl,
         type: 'minigame_coinflip',
         description: `CoinFlip: Bet \${stake} on \${side}. Result: \${coinResult}`,
         timestamp: serverTimestamp()
      });

      setResult({ winner: isWinner, coin: coinResult });
      setFlipping(false);
    }, 1500);
  };

  return (
    <>
      <div className="top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft />
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Coin Flip</h2>
        </div>
        <div style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{balance} 🪙</div>
      </div>

      <div className="container" style={{ textAlign: 'center', paddingBottom: '100px' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Double your stake or lose it all instantly!</p>

        <div style={{ 
          width: '120px', height: '120px', margin: '0 auto 32px', borderRadius: '50%', 
          background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 16px rgba(255,109,0,0.4)', fontSize: '24px', fontWeight: 900,
          animation: flipping ? 'flip 0.5s infinite linear' : 'none',
          transformStyle: 'preserve-3d'
        }}>
           {flipping ? <Coins size={64} /> : (result ? result.coin : '?')}
        </div>

        {result && !flipping && (
          <div style={{ padding: '16px', background: result.winner ? 'rgba(0,200,83,0.1)' : 'rgba(239,68,68,0.1)', color: result.winner ? 'var(--primary)' : '#ef4444', borderRadius: '12px', fontWeight: 'bold', marginBottom: '24px' }}>
            {result.winner ? `You WON \${stake} Coins!` : `You LOST \${stake} Coins!`}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button onClick={() => setSide('Heads')} style={{ flex: 1, padding: '16px', borderRadius: '12px', background: side === 'Heads' ? 'var(--primary)' : 'white', color: side === 'Heads' ? 'white' : 'black', border: '1px solid var(--border-color)', fontWeight: 'bold' }}>Heads</button>
          <button onClick={() => setSide('Tails')} style={{ flex: 1, padding: '16px', borderRadius: '12px', background: side === 'Tails' ? 'var(--primary)' : 'white', color: side === 'Tails' ? 'white' : 'black', border: '1px solid var(--border-color)', fontWeight: 'bold' }}>Tails</button>
        </div>

        <input 
          type="range" min="100" max={balance < 100 ? 100 : Math.min(balance, 10000)} step="100"
          value={stake} onChange={(e) => setStake(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)', marginBottom: '16px' }}
        />
        <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '32px' }}>Stake: {stake} Coins</div>

        <button className="btn-accent" onClick={handleFlip} disabled={flipping || balance < stake} style={{ width: '100%', padding: '20px', fontSize: '20px' }}>
          {flipping ? 'Flipping...' : 'FLIP COIN'}
        </button>
      </div>

      <style>{`
        @keyframes flip {
          0% { transform: rotateY(0deg) scale(1); }
          50% { transform: rotateY(180deg) scale(1.2); }
          100% { transform: rotateY(360deg) scale(1); }
        }
      `}</style>
    </>
  );
}
