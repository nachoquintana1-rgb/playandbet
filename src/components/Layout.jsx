import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Trophy, ReceiptText, LineChart, Users, Store } from 'lucide-react';
import { useSportsPolling } from '../hooks/useSportsPolling';
import { useBetResolution } from '../hooks/useBetResolution';
import { useAutoTopup } from '../hooks/useAutoTopup';

export default function Layout() {
  const location = useLocation();
  
  // Initialize the "backend" active workers in the root layout
  useSportsPolling();
  useBetResolution();
  useAutoTopup();

  return (
    <div className="app-wrapper">
      <main>
        <Outlet />
      </main>
      
      <nav className="bottom-nav">
        <Link to="/eventos" className={`nav-item \${location.pathname === '/eventos' ? 'active' : ''}`}>
          <Trophy size={24} />
          <span>Eventos</span>
        </Link>
        <Link to="/apuestas" className={`nav-item \${location.pathname === '/apuestas' ? 'active' : ''}`}>
          <ReceiptText size={24} />
          <span>Apuestas</span>
        </Link>
        <Link to="/ranking" className={`nav-item \${location.pathname === '/ranking' ? 'active' : ''}`}>
          <LineChart size={24} />
          <span>Ranking</span>
        </Link>
        <Link to="/amigos" className={`nav-item \${location.pathname === '/amigos' ? 'active' : ''}`}>
          <Users size={24} />
          <span>Amigos</span>
        </Link>
        <Link to="/tienda" className={`nav-item \${location.pathname === '/tienda' ? 'active' : ''}`}>
          <Store size={24} />
          <span>Tienda</span>
        </Link>
      </nav>
    </div>
  );
}
