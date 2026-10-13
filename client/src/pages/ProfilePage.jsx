/**
 * Profile Page — Manage user settings, preferred language, and theme.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Sun, Moon, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const [language, setLanguage] = useState(user?.preferredLanguage || 'python');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/preferences', { preferredLanguage: language, theme });
      updateUser({ preferredLanguage: language, theme });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const initial = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <div style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)', maxWidth: '700px' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 'clamp(1.375rem, 3vw, 1.75rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
          Account Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Manage your BugBuddy profile and preferences.
        </p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* User Card */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 700,
                color: '#052e16',
              }}
            >
              {initial}
            </div>
          )}
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>{user?.name}</h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Mail size={14} /> {user?.email}
            </div>
          </div>
        </div>

        {/* Preferences Form */}
        <form onSubmit={handleSave} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>Preferences</h3>

          {/* Preferred Language */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>
              Preferred Programming Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input-field"
              style={{ cursor: 'pointer' }}
            >
              <option value="python">Python 3</option>
              <option value="java">Java 13</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>
              Interface Theme
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => { if (!isDark) toggleTheme(); }}
                className={isDark ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
              >
                <Moon size={15} /> Dark Mode
              </button>
              <button
                type="button"
                onClick={() => { if (isDark) toggleTheme(); }}
                className={!isDark ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
              >
                <Sun size={15} /> Light Mode
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            {savedMsg && (
              <span style={{ color: '#22c55e', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} /> Saved!
              </span>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
