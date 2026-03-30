import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useStore } from '../store/useStore';

export default function Apuestas() {
  const { user } = useStore();
  const [bets, setBets] = useState([]);
  const [filter, setFilter] = useState('All'); // All, Pending, Won, Lost

  useEffect(() => {
    if (!user || !db) return;
    
    const q = query(
      collection(db, 'bets'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      bts.sort((a,b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setBets(bts);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredBets = filter === 'All' ? bets : bets.filter(b => b.status.toLowerCase() === filter.toLowerCase());

  const getStatusColor = (status) => {
    switch(status) {
      case 'won': return '#00C853';
      case 'lost': return '#EF4444';
      case 'pending': return '#FF6D00';
      default: return '#1E293B';
    }
  };

  return (
    <>
      <div className="top-bar">
        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Mis Apuestas</h2>
      </div>

      <div style={{ display: 'flex', gap: '8px', padding: '16px', overflowX: 'auto', whiteSpace: 'nowrap', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {['All', 'Pending', 'Won', 'Lost'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            style={{ padding: '8px 16px', borderRadius: '20px', border: `1px solid \${filter === f ? getStatusColor(f.toLowerCase()) : '#E2E8F0'}`, background: filter === f ? `\${getStatusColor(f.toLowerCase())}20` : 'transparent', color: filter === f ? getStatusColor(f.toLowerCase()) : '#64748B', fontWeight: filter === f ? 700 : 500, cursor: 'pointer' }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="container">
        {!user ? (
           <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Debes iniciar sesión para ver tus apuestas.</p>
        ) : filteredBets.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No tienes apuestas aquí.</p>
        ) : (
          filteredBets.map(bet => (
            <div key={bet.id} className="card">
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                 <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>{bet.sport.toUpperCase()}</span>
                 <span style={{ fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', background: `\${getStatusColor(bet.status)}15`, color: getStatusColor(bet.status) }}>
                   {bet.status.toUpperCase()}
                 </span>
               </div>
               
               <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '12px' }}>{bet.eventName}</div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px' }}>
                 <div style={{ flex: 1 }}>
                   <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Selección</div>
                   <div style={{ fontWeight: 700 }}>{bet.selection}</div>
                 </div>
                 <div style={{ flex: 1, textAlign: 'center' }}>
                   <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Cuota</div>
                   <div style={{ fontWeight: 700 }}>{bet.odds.toFixed(2)}</div>
                 </div>
                 <div style={{ flex: 1, textAlign: 'right' }}>
                   <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Apostado</div>
                   <div style={{ fontWeight: 700 }}>{bet.stake}</div>
                 </div>
               </div>

               <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                   {bet.createdAt ? bet.createdAt.toDate().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Ayer'}
                 </span>
                 <span style={{ fontWeight: 'bold', color: bet.status === 'won' ? 'var(--primary)' : 'var(--text-main)' }}>
                   {bet.status === 'won' ? `+\${bet.potentialReturn}` : `\${bet.potentialReturn} pot.`}
                 </span>
               </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
