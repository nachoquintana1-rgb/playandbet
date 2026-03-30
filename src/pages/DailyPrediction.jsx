import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, increment, serverTimestamp, setDoc, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target } from 'lucide-react';

export default function DailyPrediction() {
  const { user, userProfile } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const canPlay = () => {
    if (!userProfile?.lastDailyPrediction) return true;
    const hours = Math.abs(new Date() - userProfile.lastDailyPrediction.toDate()) / 36e5;
    return hours >= 24;
  };

  const handlePredict = async (winner) => {
    setLoading(true);
    // Hardcoded logic for demo Daily Prediction that instantly resolves for testing purposes
    const won = Math.random() > 0.5; 
    const pnl = won ? 500 : 0;

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
       balance: increment(pnl),
       lastDailyPrediction: serverTimestamp()
    });

    if (won) {
       await setDoc(doc(collection(db, 'transactions')), {
           userId: user.uid, amount: pnl, type: 'minigame_daily',
           description: 'Won Daily Prediction: ' + winner, timestamp: serverTimestamp()
       });
       alert("🎉 Your prediction was correct! You won 500 Coins!");
    } else {
       alert("😢 Incorrect prediction. Try again tomorrow!");
    }

    setLoading(false);
  };

  return (
    <>
      <div className="top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft />
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Daily Prediction</h2>
        </div>
      </div>

      <div className="container" style={{ textAlign: 'center' }}>
         <Target size={64} color="var(--primary)" style={{ marginBottom: '16px' }} />
         <h3 style={{ marginBottom: '8px' }}>Free Daily Pool</h3>
         <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Guess the outcome of the match of the day to win 500 Coins for free.</p>

         {!canPlay() ? (
            <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '16px', fontWeight: 'bold' }}>
              You already played today. Come back tomorrow!
            </div>
         ) : (
            <div className="card">
               <div style={{ fontWeight: 800, fontSize: '18px', marginBottom: '16px' }}>Real Madrid vs Barcelona</div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <button className="btn-primary" onClick={() => handlePredict('1')} disabled={loading}>Real Madrid</button>
                 <button className="btn-primary" style={{ background: '#64748b' }} onClick={() => handlePredict('X')} disabled={loading}>Empate</button>
                 <button className="btn-primary" style={{ background: 'var(--accent)' }} onClick={() => handlePredict('2')} disabled={loading}>Barcelona</button>
               </div>
            </div>
         )}
      </div>
    </>
  );
}
