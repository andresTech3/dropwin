import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Bot, Settings, 
  Zap, TrendingUp, LogOut, ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/products', icon: Package, label: 'Productos' },
  { to: '/trends', icon: Sparkles, label: 'Cazador Tendencias' },
  { to: '/ai-chat', icon: Bot, label: 'IA Asistente' },
  { to: '/admin', icon: Settings, label: 'Admin' },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <TrendingUp size={16} />
        </div>
        <span className="logo-text">DropWin</span>
        <span className="logo-badge">AI</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-label">Menú</span>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* AI Quick Stats */}
      <div className="sidebar-stats">
        <div className="sidebar-stat">
          <Zap size={12} />
          <span>IA Activa</span>
          <span className="stat-dot" />
        </div>
      </div>

      {/* User */}
      <div className="sidebar-user">
        <div className="user-avatar">
          <Sparkles size={14} />
        </div>
        <div className="user-info">
          <span className="user-email">{user?.email?.split('@')[0] || 'Admin'}</span>
          <span className="user-role">Administrador</span>
        </div>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={handleSignOut} title="Cerrar sesión">
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}
