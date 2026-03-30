import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { useStore } from './store/useStore';
import Layout from './components/Layout';

import Eventos from './pages/Eventos';
import Apuestas from './pages/Apuestas';
import Ranking from './pages/Ranking';
import Amigos from './pages/Amigos';
import Tienda from './pages/Tienda';
import Profile from './pages/Profile';
import CoinFlip from './pages/CoinFlip';
import DailyPrediction from './pages/DailyPrediction';
import Login from './pages/Login';

function AuthWrapper({ children }) {
  const { setUser, setUserProfile, user } = useStore();
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    if (!auth) return;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser && db) {
        const unsubscribeProfile = onSnapshot(doc(db, 'users', firebaseUser.uid), (docsnap) => {
          if (docsnap.exists()) {
             setUserProfile(docsnap.data());
          }
          setLoadingInitial(false);
        });
        return () => unsubscribeProfile();
      } else {
        setUserProfile(null);
        setLoadingInitial(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loadingInitial) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', color: 'var(--primary)', fontWeight: 'bold' }}>Cargando PlayandBet...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthWrapper>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/eventos" replace />} />
            <Route path="eventos" element={<Eventos />} />
            <Route path="apuestas" element={<Apuestas />} />
            <Route path="ranking" element={<Ranking />} />
            <Route path="amigos" element={<Amigos />} />
            <Route path="tienda" element={<Tienda />} />
            <Route path="profile" element={<Profile />} />
            <Route path="minigames/coinflip" element={<CoinFlip />} />
            <Route path="minigames/daily" element={<DailyPrediction />} />
          </Route>
        </Routes>
      </AuthWrapper>
    </BrowserRouter>
  );
}
