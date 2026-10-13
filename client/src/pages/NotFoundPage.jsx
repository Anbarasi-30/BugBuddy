/**
 * NotFoundPage.jsx — 404 page
 */

import { Link } from 'react-router-dom';
import BugBuddyLogo from '../components/BugBuddyLogo';

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <BugBuddyLogo size={60} showWordmark={false} />
      </div>
      <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>404</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        Page Not Found
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
        Looks like this page took a wrong turn or doesn't exist.
      </p>
      <Link to="/dashboard" className="btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
}
