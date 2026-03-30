import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useStore } from '../store/useStore';

export default function Ranking() {
  const { user } = useStore();
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    if (!db) return;
    const q = query(
      collection(db, 'users'),
      orderBy('balance', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setLeaders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    return () => unsubscribe();
  }, []);

  const getRankColor = (index) => {
    if (index === 0) return '#FFD700'; // Gold
    if (index === 1) return '#C0C0C0'; // Silver
    if (index === 2) return '#CD7F32'; // Bronze
    return '#E2E8F0';
  };

  return (
    <>
      <div className="top-bar">
        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Ranking Global</h2>
      </div>

      <div className="container">
        {leaders.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Cargando ranking...</p>
        ) : (
          <div style={{ background: 'var(--card-bg)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            {leaders.map((leader, idx) => {
               const isMe = leader.id === user?.uid;
               return (
                 <div key={leader.id} style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: idx === leaders.length -1 ? 'none' : '1px solid var(--border-color)', background: isMe ? 'rgba(0,200,83,0.05)' : 'white' }}>
                   
                   <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: getRankColor(idx), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: idx < 3 ? 'white' : 'var(--text-muted)', marginRight: '16px' }}>
                     {idx + 1}
                   </div>
                   
                   <div style={{ flex: 1 }}>
                     <div style={{ fontWeight: isMe ? 800 : 600, color: isMe ? 'var(--primary)' : 'var(--text-main)', fontSize: '16px' }}>
                       {leader.username}
                     </div>
                     <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                       Nivel {leader.level} • {leader.totalReferrals} Ref
                     </div>
                   </div>

                   <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--accent)' }}>
                     {leader.balance} 🪙
                   </div>
                 </div>
               );
            })}
          </div>
        )}
      </div>
    </>
  );
}
