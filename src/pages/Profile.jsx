import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { auth, db, googleProvider } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { Crown, Flame, Gift, Target, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, userProfile } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleInitProfile = async (firebaseUser, usernameStr) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        id: firebaseUser.uid,
        username: usernameStr || "New User",
        email: firebaseUser.email,
        balance: 5000,
        level: 1,
        xp: 0,
        referralCode: `USR\${firebaseUser.uid.substring(0,5)}`,
        bestStreak: 0,
        currentStreak: 0,
        totalReferrals: 0,
        stats: { wins: 0 }
      });
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let cred;
      if (isRegistering) {
        cred = await createUserWithEmailAndPassword(auth, email, password);
        await handleInitProfile(cred.user, email.split('@')[0]);
      } else {
        cred = await signInWithEmailAndPassword(auth, email, password);
      }
    } catch(err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await handleInitProfile(cred.user, cred.user.displayName);
    } catch(err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const claimDailyBonus = async () => {
    if (!userProfile) return;
    
    const lastClaim = userProfile.lastDailyBonus?.toDate() || new Date(0);
    const now = new Date();
    const hoursSinceClaim = Math.abs(now - lastClaim) / 36e5;

    if (hoursSinceClaim >= 24) {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(200),
        lastDailyBonus: serverTimestamp()
      });
      alert("+200 Coins Daily Bonus Received!");
    } else {
      const hoursLeft = Math.ceil(24 - hoursSinceClaim);
      alert(`Daily Bonus on Cooldown. Please wait \${hoursLeft} hours.`);
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="container" style={{ padding: '32px 16px', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
           <Crown size={64} color="var(--primary)" />
           <h2>{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
           <p style={{ color: 'var(--text-muted)' }}>Te regalamos <strong>5,000 Coins</strong> al registrarte!</p>
        </div>

        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <input 
            type="email" 
            placeholder="Correo electrónico" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}
            required 
          />
           <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}
            required 
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Cargando...' : (isRegistering ? 'Registrarse' : 'Entrar')}
          </button>
        </form>

        <button onClick={handleGoogleAuth} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '24px' }}>
           Entrar con Google
        </button>

        <button onClick={() => setIsRegistering(!isRegistering)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>
           {isRegistering ? '¿Ya tienes cuenta? Entrar' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="top-bar">
        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Mi Perfil</h2>
      </div>

      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
           <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
             <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(0,200,83,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '40px', fontWeight: 900 }}>
               {userProfile.username ? userProfile.username[0].toUpperCase() : 'U'}
             </div>
             <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--accent)', color: 'white', fontWeight: 900, borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white' }}>
               {userProfile.level}
             </div>
           </div>
           
           <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{userProfile.username}</h2>
           <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{userProfile.email}</p>

           <div style={{ fontWeight: 900, fontSize: '32px', color: 'var(--accent)', marginTop: '16px' }}>
             {userProfile.balance} 🪙
           </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ marginBottom: 0, textAlign: 'center' }}>
             <Flame size={24} color="var(--accent)" style={{ margin: '0 auto 8px' }} />
             <div style={{ fontSize: '20px', fontWeight: 900 }}>{userProfile.bestStreak || 0}</div>
             <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mejor Racha</div>
          </div>
          <div className="card" style={{ marginBottom: 0, textAlign: 'center' }}>
             <Crown size={24} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
             <div style={{ fontSize: '20px', fontWeight: 900 }}>XP: {userProfile.xp || 0}</div>
             <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Proxima meta: {(userProfile.level || 1) * 100}</div>
          </div>
        </div>

        <div className="card" style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Gift size={32} />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Bono Diario</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Reclama +200 Coins</div>
            </div>
          </div>
          <button onClick={claimDailyBonus} style={{ background: 'white', color: 'var(--primary)', fontWeight: 'bold', padding: '8px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>
             Reclamar
          </button>
        </div>

        <h3 style={{ margin: '24px 0 16px' }}>Minijuegos</h3>
        
        <div className="card" onClick={() => navigate('/minigames/daily')} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '12px' }}>
           <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '12px' }}>
             <Target color="white" />
           </div>
           <div>
             <div style={{ fontWeight: 'bold' }}>Predicción Diaria</div>
             <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gana 500 Coins gratis cada 24h</div>
           </div>
        </div>

        <div className="card" onClick={() => navigate('/minigames/coinflip')} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
           <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '12px' }}>
             <Gamepad2 color="var(--accent)" />
           </div>
           <div>
             <div style={{ fontWeight: 'bold' }}>Coin Flip</div>
             <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gana el 100% o pierde todo</div>
           </div>
        </div>

        <div style={{ marginTop: '40px' }}>
          <button className="btn-primary" onClick={() => signOut(auth)} style={{ background: '#fef2f2', color: '#ef4444' }}>
            Cerrar Sesión
          </button>
        </div>

      </div>
    </>
  );
}
