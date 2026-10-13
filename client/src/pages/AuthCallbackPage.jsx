/**
 * Auth Callback Page
 * Handles the Google OAuth redirect and token consumption.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BugBuddyLogo from '../components/BugBuddyLogo';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login?error=google_failed', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        background: 'var(--bg-primary)',
      }}
    >
      <BugBuddyLogo size={56} showWordmark={true} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Signing you in...</p>
    </div>
  );
}
