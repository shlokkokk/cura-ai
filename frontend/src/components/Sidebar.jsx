import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, saveUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    saveUser(null);
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Simulation Lab', path: '/simulator', icon: '🏥' },
    { name: 'Previous Cases', path: '/history', icon: '📋' },
    { name: 'My Profile', path: '/profile', icon: '👤' },
  ];

  if (!user) return null;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo size={28} dark={false} />
        </Link>
      </div>
      
      <nav className="sidebar-nav">
        <div className="sidebar-heading">MENU</div>
        {navItems.map(item => {
          const isActive = location.pathname === item.path && 
                           (item.hash ? location.hash === item.hash : !location.hash);
          return (
            <Link 
              key={item.name} 
              to={`${item.path}${item.hash || ''}`} 
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-text">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-profile">
          <div className="profile-avatar-small" style={{ background: user.avatarColor || 'var(--primary)' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <strong>{user.name}</strong>
            <small>{user.role || 'Student'}</small>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-logout" title="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>
  );
}
