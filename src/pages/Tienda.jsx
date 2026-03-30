import React from 'react';
import { Store, Gift, Gamepad2 } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Tienda() {
  const { userProfile } = useStore();

  const mockPrizes = [
    { id: 'p1', name: 'Amazon $10', cost: 10000, category: 'giftcard' },
    { id: 'p2', name: 'Google Play $10', cost: 10000, category: 'giftcard' },
    { id: 'p3', name: 'PSN $20', cost: 20000, category: 'gaming' },
    { id: 'p4', name: 'Streak Shield', cost: 5000, category: 'perk' },
  ];

  const getIcon = (cat) => {
    switch(cat) {
      case 'giftcard': return <Gift size={40} color="var(--primary)" />;
      case 'gaming': return <Gamepad2 size={40} color="var(--primary)" />;
      default: return <Store size={40} color="var(--primary)" />;
    }
  };

  const balance = userProfile?.balance || 0;

  return (
    <>
      <div className="top-bar">
        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Tienda de Premios</h2>
      </div>

      <div className="container">
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {mockPrizes.map((prize) => {
            const canAfford = balance >= prize.cost;
            return (
              <div key={prize.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: '#f8fafc', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getIcon(prize.category)}
                </div>
                <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{prize.name}</div>
                  <div style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '14px', marginBottom: '12px' }}>{prize.cost} Coins</div>
                  
                  <div style={{ marginTop: 'auto' }}>
                    <button 
                      className="btn-primary" 
                      style={{ padding: '8px', fontSize: '14px', background: canAfford ? 'var(--primary)' : 'var(--border-color)', color: canAfford ? 'white' : 'var(--text-muted)' }}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Canjear' : 'Bloqueado'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
