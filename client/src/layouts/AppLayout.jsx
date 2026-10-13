/**
 * AppLayout — Shell layout for all authenticated pages.
 * Contains the sidebar navigation and main content area.
 */

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useState } from 'react';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile top bar */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-primary)',
          }}
          className="mobile-topbar"
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              padding: '0.375rem',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <img src="/bugbuddy-mascot.png" alt="BugBuddy" style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px' }} />
            BugBuddy
          </span>
        </div>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-topbar { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
