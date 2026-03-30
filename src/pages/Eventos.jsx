import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import EventCard from '../components/EventCard';
import BetModal from '../components/BetModal';
import { Trophy } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Eventos() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { userProfile } = useStore();

  useEffect(() => {
    if (!db) return;
    const q = query(
      collection(db, 'events'),
      where('status', 'in', ['NS', 'LIVE', '1H', '2H', 'HT', 'IN PLAY'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eVs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort in memory to avoid needing composite index creation for now
      eVs.sort((a,b) => new Date(a.startTime) - new Date(b.startTime));
      setEvents(eVs);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <div className="top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '20px' }}>
          <Trophy color="var(--primary)" />
          PlayandBet
        </div>
        <div style={{ background: 'rgba(255, 109, 0, 0.1)', color: 'var(--accent)', padding: '6px 12px', borderRadius: '16px', fontWeight: 'bold', fontSize: '14px' }}>
           🪙 {userProfile?.balance || 0}
        </div>
      </div>

      <div className="container">
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)' }}>
            No live or upcoming events right now. Check back soon.
          </div>
        ) : (
          events.map(ev => (
            <EventCard key={ev.id} event={ev} onBetClick={setSelectedEvent} />
          ))
        )}
      </div>

      {selectedEvent && (
        <BetModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </>
  );
}
