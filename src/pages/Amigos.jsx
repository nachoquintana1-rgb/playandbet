import React from 'react';
import { Users, Share2, Award } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Amigos() {
  const { userProfile } = useStore();

  const referralCode = userProfile?.referralCode || 'YOURCODE';

  return (
    <>
      <div className="top-bar">
        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Mis Amigos</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
          <Users size={20} />
          <span style={{ fontWeight: 800 }}>{userProfile?.totalReferrals || 0}</span>
        </div>
      </div>

      <div className="container">
        
        <div style={{ background: 'rgba(0,200,83,0.05)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,200,83,0.2)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
             <Award color="var(--primary)" size={24} />
             <h3 style={{ margin: 0, color: 'var(--primary)' }}>Programa de Referidos</h3>
          </div>
          <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-main)', marginBottom: '16px' }}>
            Invita a un amigo usando tu código y llévate <strong style={{color: 'var(--primary)'}}>1,500 Coins</strong> + <strong style={{color: 'var(--accent)'}}>10% de bono de por vida</strong> en todo lo que tu amigo gane!
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
            <div style={{ flex: 1, border: '1px solid var(--border-color)', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px', letterSpacing: '2px' }}>
              {referralCode}
            </div>
            <button className="btn-primary" style={{ flex: 'none', width: 'auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Share2 size={18} /> Compartir
            </button>
          </div>
        </div>

        <h3 style={{ marginBottom: '16px' }}>Lista de Amigos</h3>

        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
          <Users size={48} color="var(--border-color)" style={{ marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Aún no tienes amigos añadidos.</p>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 'bold', marginTop: '8px', cursor: 'pointer' }}>
             Buscar usuarios
          </button>
        </div>

      </div>
    </>
  );
}
