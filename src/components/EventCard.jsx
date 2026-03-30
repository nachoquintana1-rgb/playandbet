import React from 'react';
import { Star } from 'lucide-react';

export default function EventCard({ event, onBetClick }) {
  const isLive = ['1H', '2H', 'HT', 'LIVE'].includes(event.status);

  return (
    <div className="card" onClick={() => onBetClick(event)} style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
          {event.competitionName}
        </span>
        {isLive ? (
          <div className="live-badge">
            <span style={{ width: 6, height: 6, backgroundColor: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }}></span>
            EN VIVO
          </div>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {new Date(event.startTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1, fontWeight: 'bold', fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {event.homeTeamName}
        </div>
        
        {event.currentScore ? (
          <div style={{ fontWeight: 800, fontSize: '20px', padding: '0 16px', color: isLive ? 'var(--primary)' : 'inherit' }}>
            {event.currentScore.home} - {event.currentScore.away}
          </div>
        ) : (
          <div style={{ fontWeight: 800, fontSize: '14px', padding: '0 16px', color: 'var(--text-muted)' }}>
            VS
          </div>
        )}

        <div style={{ flex: 1, fontWeight: 'bold', fontSize: '16px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {event.awayTeamName}
        </div>
      </div>

      {event.jackpotPool > 0 && (
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontSize: '12px', fontWeight: 700 }}>
          <Star size={14} fill="var(--accent)" />
          Jackpot Pool: {event.jackpotPool} Coins
        </div>
      )}
    </div>
  );
}
