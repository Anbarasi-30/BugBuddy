/**
 * Sidebar — Main navigation for the authenticated app.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import BugBuddyLogo from './BugBuddyLogo';
import {
  LayoutDashboard,
  Code2,
  BookOpen,
  History,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  User,
  LogOut,
  Sun,
  Moon,
  X,
  Bug,
  Gamepad2,
} from 'lucide-react';


const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/problems', icon: BookOpen, label: 'Problems' },
  { to: '/workspace', icon: Code2, label: 'Workspace' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/mistakes', icon: AlertCircle, label: 'Mistakes' },
  { to: '/skills', icon: TrendingUp, label: 'Skills' },
  { to: '/feedback', icon: MessageSquare, label: 'Feedback & Report' },
  { to: '/arcade', icon: Gamepad2, label: 'Arcade', accent: '#10b981' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const avatarInitial = user?.name ? user.name[0].toUpperCase() : '?';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}

      <aside
        style={{
          width: '220px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)',
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflow: 'hidden',
          zIndex: 50,
        }}
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Logo */}
        <div
          style={{
            padding: '1.25rem 1.25rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <NavLink to="/dashboard" style={{ textDecoration: 'none' }}>
            <BugBuddyLogo size={30} showWordmark={true} />          
          </NavLink>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'none',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0.5rem 0.75rem', overflow: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {user?.role === 'admin' && (
              <NavLink
                to="/admin/dashboard"
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '7px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.1)',
                  marginBottom: '0.5rem',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                }}
              >
                <Bug size={16} />
                Admin Dashboard
              </NavLink>
            )}

            {NAV_ITEMS.map(({ to, icon: Icon, label, accent }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                style={({ isActive }) => {
                  const activeColor = accent || '#22c55e';
                  return {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '7px',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? activeColor : accent ? accent + 'cc' : 'var(--text-secondary)',
                    background: isActive ? `${activeColor}18` : 'transparent',
                    transition: 'all 0.15s ease',
                    border: isActive ? `1px solid ${activeColor}35` : '1px solid transparent',
                  };
                }}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom section */}
        <div
          style={{
            padding: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '7px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              width: '100%',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            className="sidebar-btn"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* Profile */}
          <NavLink
            to="/profile"
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '7px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              color: isActive ? '#22c55e' : 'var(--text-secondary)',
              background: isActive ? 'rgba(34, 197, 94, 0.08)' : 'transparent',
              transition: 'all 0.15s ease',
            })}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#052e16',
                }}
              >
                {avatarInitial}
              </div>
            )}
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Profile'}
            </span>
          </NavLink>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '7px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              width: '100%',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            className="sidebar-btn"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <style>{`
        .sidebar-btn:hover {
          background: var(--bg-tertiary) !important;
          color: var(--text-primary) !important;
        }
        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }
          .sidebar.sidebar-open {
            transform: translateX(0);
          }
          .sidebar-overlay { display: block !important; }
          .sidebar-close-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
