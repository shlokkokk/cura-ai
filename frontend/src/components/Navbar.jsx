import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ simple = false }) {
  const { user, saveUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    saveUser(null);
    navigate('/');
  };

  return (
    <nav className={`navbar ${simple ? 'nav-simple' : ''}`}>
      <div className="nav-container">
        <Logo size={32} dark={false} />
        
        {!simple && (
          <>
            <div className="nav-links">
              {/* Public Links */}
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
              {!user && (
                <>
                  <Link to="/features" className={`nav-link ${location.pathname === '/features' ? 'active' : ''}`}>Features</Link>
                  <Link to="/pricing" className={`nav-link ${location.pathname === '/pricing' ? 'active' : ''}`}>Pricing</Link>
                </>
              )}
              
              {/* Logged-In Links */}
              {user && (
                <>
                  <Link to="/simulator" className={`nav-link ${location.pathname === '/simulator' ? 'active' : ''}`}>Simulation Lab</Link>
                  <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Analytics</Link>
                </>
              )}
              
              {/* Always Visible */}
              <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
            </div>
            
            <div className="nav-actions">
              {user ? (
                <>
                  <Link to="/dashboard" className="btn btn-primary btn-sm" style={{borderRadius:'10px'}}>Dashboard</Link>
                  <Link to="/profile" className="user-avatar" style={{background: user.avatarColor || '#7C3AED', width:'38px', height:'38px', fontSize:'.8rem', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, borderRadius:'50%', textDecoration:'none'}}>
                    {user.name.substring(0,2).toUpperCase()}
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-primary btn-sm" style={{borderRadius:'10px'}}>Sign in</Link>
                </>
              )}
            </div>
          </>
        )}

        {simple && user && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/simulator" className="btn btn-primary btn-sm">Simulation Lab</Link>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
