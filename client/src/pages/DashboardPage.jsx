/**
 * DashboardPage — Premium Learning Dashboard
 *
 * All data is sourced from the live /api/dashboard endpoint.
 * No mock values, no fabricated statistics.
 *
 * Layout order:
 *  1. Welcome + primary CTA
 *  2. AI-driven personalized learning insight
 *  3. Recommended next problem
 *  4. Six-metric stat grid (3×2 → responsive down to 2×3 → 1×6)
 *  5. Activity chart (14 days, distinguishes runs vs. submissions)
 *  6. Error patterns + recent submissions columns
 *  7. Skill improvement focus (if available)
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Target, Flame, AlertCircle, ArrowRight,
  Code2, TrendingUp, RefreshCw, ShieldCheck, Play, Lightbulb,
  Activity, ChevronRight, Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const ERROR_LABELS = {
  SyntaxError: 'Syntax Error',
  TypeError: 'Type Error',
  IndexError: 'Index / Boundary',
  NullError: 'Null Pointer',
  RuntimeError: 'Runtime Error',
  CompilationError: 'Compilation',
  LogicError: 'Wrong Answer',
  TimeLimitExceeded: 'Time Limit',
};

const LANG_LABELS = { python: 'Python', java: 'Java', c: 'C', cpp: 'C++' };

// ─── Skeleton blocks ──────────────────────────────────────────────────────────

function Skeleton({ w = '100%', h = '1rem', br = '6px', style = {} }) {
  return (
    <div
      style={{
        width: w, height: h, borderRadius: br,
        background: 'var(--bg-tertiary)',
        animation: 'bb-pulse 1.6s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '10px',
        padding: '0.875rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
        <div style={{ width: 28, height: 28, borderRadius: '7px', background: accent + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={14} color={accent} />
        </div>
      </div>
      <div style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--text-primary)' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{sub}</div>
      )}
    </motion.div>
  );
}

// ─── Activity chart ───────────────────────────────────────────────────────────

function ActivityChart({ data }) {
  const [tooltip, setTooltip] = useState(null);
  const containerRef = useRef(null);

  if (!data || data.length === 0) return null;

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Y-axis hint */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px', paddingBottom: '0' }}>
        {data.map((item, i) => {
          const pct = item.count > 0 ? Math.max(12, Math.round((item.count / maxCount) * 100)) : 3;
          const failed = item.count - item.passed;
          const isToday = i === data.length - 1;
          return (
            <div
              key={item.date}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end', cursor: 'pointer', position: 'relative' }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const parent = containerRef.current?.getBoundingClientRect();
                setTooltip({ idx: i, item, x: rect.left - (parent?.left || 0) + rect.width / 2 });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Stacked bar: passed (green) + failed (amber) */}
              <div style={{ width: '100%', maxWidth: 20, display: 'flex', flexDirection: 'column-reverse', height: `${pct}%`, borderRadius: '4px 4px 2px 2px', overflow: 'hidden', opacity: item.count === 0 ? 0.3 : 1 }}>
                {item.passed > 0 && (
                  <div style={{ background: 'linear-gradient(180deg, #4ade80, #22c55e)', flex: item.passed }} />
                )}
                {failed > 0 && (
                  <div style={{ background: 'linear-gradient(180deg, #fbbf24, #f59e0b)', flex: failed }} />
                )}
                {item.count === 0 && (
                  <div style={{ background: 'var(--bg-tertiary)', flex: 1 }} />
                )}
              </div>
              <span style={{ fontSize: '0.6rem', color: isToday ? 'var(--text-secondary)' : 'var(--text-muted)', fontWeight: isToday ? 700 : 400, marginTop: 2 }}>
                {fmtDate(item.date).split(' ')[1]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            key={tooltip.idx}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute',
              top: 0,
              left: Math.min(Math.max(tooltip.x - 70, 0), (containerRef.current?.offsetWidth || 300) - 140),
              width: 140,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              padding: '0.5rem 0.75rem',
              fontSize: '0.72rem',
              zIndex: 10,
              pointerEvents: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {fmtDate(tooltip.item.date)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4ade80' }}>✓ Passed</span>
              <span style={{ fontWeight: 700 }}>{tooltip.item.passed}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#fbbf24' }}>✗ Failed</span>
              <span style={{ fontWeight: 700 }}>{tooltip.item.count - tooltip.item.passed}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2, paddingTop: 2, borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total</span>
              <span style={{ fontWeight: 700 }}>{tooltip.item.count}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '2px', background: '#22c55e', display: 'inline-block' }} />
          Passed
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '2px', background: '#f59e0b', display: 'inline-block' }} />
          Failed
        </span>
      </div>
    </div>
  );
}

// ─── Error pattern row ────────────────────────────────────────────────────────

function ErrorRow({ m, delay }) {
  const uncorrectedPct = m.count > 0 ? Math.round((m.uncorrectedCount / m.count) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.6rem 0.75rem',
        borderRadius: '8px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        minWidth: 0,
      }}
    >
      {/* Color swatch */}
      <div style={{
        width: 3, height: 32, borderRadius: '2px', flexShrink: 0,
        background: m.isRecurring ? '#f87171' : m.correctedCount > 0 ? '#4ade80' : '#fbbf24',
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {ERROR_LABELS[m.errorType] || m.errorType}
          {m.isRecurring && (
            <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              RECURRING
            </span>
          )}
        </div>
        {/* Progress bar: corrected vs total */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px' }}>
          <div style={{ flex: 1, height: 3, background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${100 - uncorrectedPct}%`, background: '#22c55e', borderRadius: '2px', transition: 'width 0.5s ease' }} />
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {m.correctedCount}/{m.count} fixed
          </span>
        </div>
      </div>

      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>
        {m.count}×
      </span>
    </motion.div>
  );
}

// ─── Recent submission row ────────────────────────────────────────────────────

function SubRow({ item, delay }) {
  const passed = item.status === 'passed';
  return (
    <motion.div
      initial={{ opacity: 0, x: 6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.6rem 0.75rem',
        borderRadius: '8px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        minWidth: 0,
      }}
    >
      <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: passed ? '#22c55e' : '#f87171' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.problemTitle}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: '0.3rem', alignItems: 'center', marginTop: '2px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>{LANG_LABELS[item.language] || item.language}</span>
          <span>·</span>
          <span style={{ color: passed ? '#4ade80' : '#f87171' }}>{passed ? 'Passed' : (item.errorType ? (ERROR_LABELS[item.errorType] || item.errorType) : 'Failed')}</span>
          {item.createdAt && (
            <>
              <span>·</span>
              <span>{fmtDate(item.createdAt)}</span>
            </>
          )}
        </div>
      </div>
      {item.problemId && (
        <Link
          to={`/workspace/${item.problemId}`}
          title="Open problem"
          style={{ color: 'var(--text-muted)', flexShrink: 0, display: 'flex', alignItems: 'center' }}
        >
          <ChevronRight size={15} />
        </Link>
      )}
    </motion.div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div style={{ padding: 'clamp(1.25rem, 2.5vw, 2rem)', maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Skeleton w="280px" h="2rem" br="8px" />
      <Skeleton h="72px" br="10px" />
      <Skeleton h="80px" br="10px" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {[...Array(6)].map((_, i) => <Skeleton key={i} h="88px" br="10px" />)}
      </div>
      <Skeleton h="180px" br="10px" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Skeleton h="260px" br="10px" />
        <Skeleton h="260px" br="10px" />
      </div>
      <style>{`
        @keyframes bb-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load dashboard data. Please check your connection.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  // ─── Loading skeleton ────────────────────────────────────────────────────
  if (loading) return <DashboardSkeleton />;

  // ─── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ padding: 'clamp(1.25rem, 2.5vw, 2rem)', maxWidth: '1120px', margin: '0 auto' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '40vh', gap: '1rem', textAlign: 'center',
        }}>
          <AlertCircle size={36} color="#f87171" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{error}</p>
          <button onClick={load} className="btn-secondary" style={{ fontSize: '0.8125rem' }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const isNewUser = (stats.totalSubmissions || 0) === 0 && (stats.totalRuns || 0) === 0;
  const totalActivity = (data?.learningProgressOverTime || []).reduce((s, d) => s + d.count, 0);

  // Six metrics
  const METRICS = [
    {
      icon: CheckCircle,
      label: 'Problems Solved',
      value: `${stats.totalProblemsSolved || 0}/${stats.totalProblemsAttempted || 0}`,
      sub: 'unique problems',
      accent: '#22c55e',
    },
    {
      icon: Play,
      label: 'Code Runs',
      value: stats.totalRuns || 0,
      sub: `${stats.avgRunsPerProblem || 0} avg per problem`,
      accent: '#3b82f6',
    },
    {
      icon: Target,
      label: 'Submissions',
      value: stats.totalSubmissions || 0,
      sub: `${stats.successRate || 0}% success rate`,
      accent: '#a78bfa',
    },
    {
      icon: Lightbulb,
      label: 'AI Assists',
      value: (stats.hintsUsed || 0) + (stats.explainErrorUsed || 0),
      sub: `${stats.hintsUsed || 0} hints · ${stats.explainErrorUsed || 0} explain`,
      accent: '#f59e0b',
    },
    {
      icon: ShieldCheck,
      label: 'Bugs Fixed',
      value: stats.totalCorrectedMistakes || 0,
      sub: `${stats.recurringMistakesCount || 0} recurring patterns`,
      accent: '#10b981',
    },
    {
      icon: Flame,
      label: 'Streak',
      value: `${stats.streak || 0}d`,
      sub: 'learning streak',
      accent: '#ef4444',
    },
  ];

  const hasActivity = totalActivity > 0;
  const hasErrors = (data?.commonMistakes || []).length > 0;
  const hasRecent = (data?.recentActivity || []).length > 0;

  return (
    <>
      <style>{`
        @keyframes bb-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.35; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
        }
        .dash-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 860px) {
          .dash-grid-2col { grid-template-columns: 1fr; }
          .dash-metrics { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 520px) {
          .dash-metrics { grid-template-columns: repeat(2, 1fr) !important; }
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.875rem;
        }
        .section-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .section-link {
          font-size: 0.75rem;
          color: #22c55e;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 3px;
          opacity: 0.85;
        }
        .section-link:hover { opacity: 1; }
        .dash-card {
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: 12px;
          padding: 1.125rem 1.25rem;
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1rem;
          gap: 0.5rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.82rem;
        }
      `}</style>

      <div style={{ padding: 'clamp(1.25rem, 2.5vw, 2rem)', maxWidth: '1120px', margin: '0 auto' }}>

        {/* ── A. Welcome ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '0.75rem', marginBottom: '1.25rem' }}
        >
          <div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)', fontWeight: 800, letterSpacing: '-0.035em', margin: '0 0 0.25rem' }}>
              {getGreeting()}, {firstName} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              {isNewUser
                ? 'Start with your first coding problem to begin tracking your debugging progress.'
                : hasActivity
                  ? `${totalActivity} submission${totalActivity !== 1 ? 's' : ''} in the last 14 days · ${stats.successRate || 0}% success rate`
                  : 'Your personalized debugging analytics are ready below.'}
            </p>
          </div>
          <Link to="/workspace" className="btn-primary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}>
            <Code2 size={14} /> Open Workspace
          </Link>
        </motion.div>

        {/* ── B. AI learning insight ──────────────────────────────────────────── */}
        {data?.focusMessage && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.875rem',
              padding: '0.875rem 1.1rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(139,92,246,0.06) 100%)',
              border: '1px solid rgba(16,185,129,0.18)',
              marginBottom: '1rem',
            }}
          >
            <Lightbulb size={15} color="#34d399" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                Personalized Insight
              </div>
              <div style={{ fontSize: '0.845rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                {data.focusMessage}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── C. Recommended problem ──────────────────────────────────────────── */}
        {data?.nextRecommendedProblem && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="dash-card"
            style={{
              marginBottom: '1rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.875rem',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(59,130,246,0.05) 100%)',
              border: '1px solid rgba(16,185,129,0.18)',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Next Recommended
                </span>
                <span className={`badge badge-${data.nextRecommendedProblem.difficulty}`}>
                  {data.nextRecommendedProblem.difficulty}
                </span>
                {data.nextRecommendedProblem.estimatedTime && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={11} /> {data.nextRecommendedProblem.estimatedTime}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                {data.nextRecommendedProblem.title}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {(data.nextRecommendedProblem.tags || []).map((t) => (
                  <span key={t} style={{ fontSize: '0.67rem', padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: '4px', color: 'var(--text-muted)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <Link
              to={`/workspace/${data.nextRecommendedProblem._id}`}
              className="btn-primary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
            >
              Start Debugging <ArrowRight size={13} />
            </Link>
          </motion.div>
        )}

        {/* ── D. Six metrics ──────────────────────────────────────────────────── */}
        <div
          className="dash-metrics"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.625rem', marginBottom: '1.25rem' }}
        >
          {METRICS.map((m, i) => (
            <StatCard key={m.label} {...m} delay={0.1 + i * 0.04} />
          ))}
        </div>

        {/* ── E. Activity chart ────────────────────────────────────────────────── */}
        {!isNewUser && (data?.learningProgressOverTime?.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="dash-card"
            style={{ marginBottom: '1.25rem' }}
          >
            <div className="section-header">
              <div className="section-title">
                <Activity size={15} color="#3b82f6" />
                Submission Activity — Last 14 Days
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                <span>Total: <strong style={{ color: 'var(--text-secondary)' }}>{totalActivity}</strong></span>
                <span>Passed: <strong style={{ color: '#4ade80' }}>{(data?.learningProgressOverTime || []).reduce((s, d) => s + d.passed, 0)}</strong></span>
              </div>
            </div>
            <ActivityChart data={data.learningProgressOverTime} />
          </motion.div>
        )}

        {/* ── F. Error patterns + recent submissions ───────────────────────────── */}
        <div className="dash-grid-2col" style={{ marginBottom: '1.25rem' }}>

          {/* Error patterns */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            className="dash-card"
          >
            <div className="section-header">
              <div className="section-title">
                <AlertCircle size={14} color="#f87171" /> Error Patterns
              </div>
              <Link to="/mistakes" className="section-link">
                Detailed view <ChevronRight size={12} />
              </Link>
            </div>

            {hasErrors ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(data.commonMistakes || []).slice(0, 5).map((m, i) => (
                  <ErrorRow key={m.errorType} m={m} delay={0.38 + i * 0.05} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span style={{ fontSize: '1.625rem' }}>🎉</span>
                <span>No error patterns recorded yet.</span>
                {isNewUser && <Link to="/problems" className="btn-primary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.875rem', marginTop: '0.5rem', textDecoration: 'none' }}>Browse Problems</Link>}
              </div>
            )}
          </motion.div>

          {/* Recent submissions */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.38 }}
            className="dash-card"
          >
            <div className="section-header">
              <div className="section-title">
                <Code2 size={14} color="#3b82f6" /> Recent Submissions
              </div>
              <Link to="/history" className="section-link">
                View history <ChevronRight size={12} />
              </Link>
            </div>

            {hasRecent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(data.recentActivity || []).slice(0, 6).map((item, i) => (
                  <SubRow key={item._id} item={item} delay={0.4 + i * 0.045} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span style={{ fontSize: '1.625rem' }}>📝</span>
                <span>No submissions yet.</span>
                <Link to="/problems" className="btn-primary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.875rem', marginTop: '0.5rem', textDecoration: 'none' }}>Start a Problem</Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── G. Skills needing improvement ─────────────────────────────────────── */}
        {(data?.skillsNeedingImprovement?.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.45 }}
            className="dash-card"
          >
            <div className="section-header">
              <div className="section-title">
                <TrendingUp size={14} color="#a78bfa" /> Skills to Improve
              </div>
              <Link to="/skills" className="section-link">
                Skill analytics <ChevronRight size={12} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.625rem' }}>
              {data.skillsNeedingImprovement.map((skill) => (
                <div
                  key={skill.name}
                  style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{skill.name}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b' }}>{skill.accuracy}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${skill.accuracy}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', borderRadius: '999px', transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {skill.solved}/{skill.attempted} solved
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </>
  );
}
