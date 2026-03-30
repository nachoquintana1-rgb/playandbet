import React, { useState } from 'react';
import { auth, db, googleProvider } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Trophy } from 'lucide-react';

export default function Login() {
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', padding: '24px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
         <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '24px', background: 'var(--primary)', marginBottom: '16px', boxShadow: '0 8px 16px rgba(0, 200, 83, 0.3)' }}>
            <Trophy size={40} color="white" />
         </div>
         <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', color: 'var(--text-main)' }}>PlayandBet</h1>
         <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Social Sports Betting</p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '20px', marginBottom: '8px' }}>
           {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </h2>
        {isRegistering && (
           <p style={{ textAlign: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: '14px', marginBottom: '24px' }}>
             ¡Gana 5,000 Coins al registrarte!
           </p>
        )}

        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', marginTop: isRegistering ? '0' : '24px' }}>
          <input 
            type="email" 
            placeholder="Correo electrónico" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '16px' }}
            required 
          />
           <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '16px' }}
            required 
          />
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px', padding: '16px' }}>
            {loading ? 'Cargando...' : (isRegistering ? 'Registrarse' : 'Entrar')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
           <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
           <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>O ENTRA CON</span>
           <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        <button onClick={handleGoogleAuth} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px' }}>
           <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
           Google
        </button>

        <button onClick={() => setIsRegistering(!isRegistering)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>
           {isRegistering ? '¿Ya tienes cuenta? Entrar' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>

    </div>
  );
}
