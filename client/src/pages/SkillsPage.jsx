/**
 * Skills Page — Data-driven skill progress tracking.
 * Strictly uses real user data from SkillProfile — shows empty state for new users.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Code2, BookOpen, AlertTriangle, Sparkles, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

function SkillBar({ name, attempted, solved }) {
  const pct = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;
  const levelLabel = pct >= 80 ? 'Mastered' : pct >= 50 ? 'Developing' : 'Needs Practice';
  const levelColor = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#f87171';

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.375rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>{name}</span>
          <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: `${levelColor}15`, color: levelColor, fontWeight: 700 }}>
            {levelLabel}
          </span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          {solved}/{attempted} solved ({pct}%)
        </span>
      </div>
      <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: pct >= 80 ? 'linear-gradient(90deg, #22c55e, #4ade80)' : pct >= 50 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #ef4444, #f87171)',
            borderRadius: '999px',
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </div>
  );
}

export default function SkillsPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/skills')
      .then((res) => setProfile(res.data))
      .catch(() => setError('Could not load skill profile.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)', maxWidth: '950px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 'clamp(1.375rem, 3vw, 1.75rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <TrendingUp size={24} color="#8b5cf6" />
          Skill Development &amp; Proficiency
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Data-driven analytics tracking your language fluency, topic mastery, and mistake pattern trends.
        </p>
      </motion.div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: '3rem', textAlign: 'center' }}>
          <RefreshCw size={20} className="animate-spin" style={{ display: 'inline', marginRight: '8px' }} />
          Loading skill analytics...
        </div>
      ) : error ? (
        <div style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '8px' }}>{error}</div>
      ) : !profile?.hasData ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📈</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No skill data recorded yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            BugBuddy measures real progress from your workspace activity. Solve problem challenges to build your skill profile!
          </p>
          <Link to="/problems" className="btn-primary" style={{ display: 'inline-flex' }}>
            Browse Problems <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Overview Stat Grid */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="#4ade80" /> Overall Accuracy &amp; Solved Stats
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Problems Solved</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e' }}>{profile.totalSolved}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Attempts</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{profile.totalAttempts}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Accuracy</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{profile.accuracy}%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Streak</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{profile.streak} days</div>
              </div>
            </div>
          </div>

          {/* Language Skills */}
          {profile.languages?.length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code2 size={16} color="#3b82f6" /> Programming Language Proficiency
              </h2>
              {profile.languages.map((l) => (
                <SkillBar key={l.name} name={l.name.toUpperCase()} attempted={l.attempted} solved={l.solved} />
              ))}
            </div>
          )}

          {/* Topic Skills */}
          {profile.topics?.length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={16} color="#8b5cf6" /> Topic &amp; Concept Mastery
              </h2>
              {profile.topics.map((t) => (
                <SkillBar key={t.name} name={t.name} attempted={t.attempted} solved={t.solved} />
              ))}
            </div>
          )}

          {/* Error Distribution Breakdown */}
          {profile.errorPatterns?.length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} color="#f87171" /> Error Type Breakdown &amp; Frequency
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {profile.errorPatterns.map((ep) => (
                  <div
                    key={ep.errorType}
                    style={{
                      padding: '0.5rem 0.875rem',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>{ep.errorType}</span>
                    <span style={{ fontWeight: 700, color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                      {ep.count}×
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
