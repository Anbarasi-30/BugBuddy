/**
 * Mistakes Page — View real recorded mistake patterns & analytics from MongoDB.
 *
 * Features:
 *  - Categorized mistake list with compiler/runtime error evidence
 *  - Aggregate pattern analytics with recurring mistake detection
 *  - Personal practice recommendation generator per error type
 *  - Proper zero states and real MongoDB data
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle, ArrowRight, CheckCircle2, Clock, Sparkles, Filter, RefreshCw, BookOpen, AlertTriangle
} from 'lucide-react';
import api from '../services/api';

// ----------------------------------------------------------------
// Category metadata with actionable beginner tips
// ----------------------------------------------------------------
const ERROR_CATEGORIES = {
  SyntaxError: {
    label: 'Syntax Error',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.10)',
    border: 'rgba(251,146,60,0.25)',
    what: 'The language interpreter found a mistake in the grammar or syntax of your code.',
    tip: 'Look for missing colons, unbalanced parentheses/quotes, or invalid indentation.',
  },
  CompilationError: {
    label: 'Compilation Error',
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.10)',
    border: 'rgba(244,114,182,0.25)',
    what: 'The compiler failed to compile your program into an executable binary.',
    tip: 'Read the exact compiler error message to locate missing imports, symbols, or semicolon syntax.',
  },
  TypeError: {
    label: 'Type Error',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.10)',
    border: 'rgba(167,139,250,0.25)',
    what: 'An operation was attempted on an incompatible data type.',
    tip: 'Check variable types before combining them or calling type-specific methods.',
  },
  IndexError: {
    label: 'Index / Boundary Error',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.10)',
    border: 'rgba(96,165,250,0.25)',
    what: 'Your code tried to access an element beyond valid list or string bounds.',
    tip: 'Valid indices range from 0 to length - 1. Verify loop termination conditions.',
  },
  NullError: {
    label: 'Null / None Pointer',
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.10)',
    border: 'rgba(148,163,184,0.25)',
    what: 'Your code attempted to call a method or access an attribute on a null / None object.',
    tip: 'Ensure variables are initialized before use and add null check guards.',
  },
  TimeLimitExceeded: {
    label: 'Time Limit Exceeded',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.10)',
    border: 'rgba(251,191,36,0.25)',
    what: 'Your solution ran longer than the allowed time limit (often caused by infinite loops or inefficient algorithms).',
    tip: 'Check loop update variables and verify time complexity against test limits.',
  },
  RuntimeError: {
    label: 'Runtime Error',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.10)',
    border: 'rgba(248,113,113,0.25)',
    what: 'An unhandled exception or crash occurred while your program was executing.',
    tip: 'Check for division by zero, stack overflows from unchecked recursion, or invalid memory operations.',
  },
  LogicError: {
    label: 'Wrong Answer (Logic Error)',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.20)',
    what: 'Your program completed without crashing, but its output did not match expected test results.',
    tip: 'Trace your program logic step-by-step with the failing input to verify edge case handling.',
  },
  UnknownError: {
    label: 'Unknown Error',
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.08)',
    border: 'rgba(148,163,184,0.2)',
    what: 'Execution completed with an undetermined failure state.',
    tip: 'Review terminal stderr output or re-run the test cases.',
  },
};

function getCategoryInfo(errorType) {
  if (!errorType) return ERROR_CATEGORIES.UnknownError;
  return (
    ERROR_CATEGORIES[errorType] ||
    ERROR_CATEGORIES[errorType.replace(/\s+/g, '')] || {
      label: errorType,
      color: '#94a3b8',
      bg: 'rgba(148,163,184,0.08)',
      border: 'rgba(148,163,184,0.2)',
      what: 'An error occurred during code execution.',
      tip: 'Check the error output in the workspace for details.',
    }
  );
}

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'analytics'
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [recommendation, setRecommendation] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/mistakes'),
      api.get('/mistakes/analytics'),
    ])
      .then(([mistakesRes, analyticsRes]) => {
        setMistakes(mistakesRes.data || []);
        setAnalytics(analyticsRes.data || null);
      })
      .catch(() => setError('Could not load mistake history and analytics.'))
      .finally(() => setLoading(false));
  }, []);

  const handleGetRecommendation = (errorType) => {
    setRecLoading(true);
    setRecError('');
    setRecommendation(null);

    api.get(`/mistakes/recommend?errorType=${encodeURIComponent(errorType)}`)
      .then((res) => {
        if (res.data?.recommendation) {
          setRecommendation(res.data.recommendation);
        } else {
          setRecError(res.data?.message || 'No recommendation available for this error type.');
        }
      })
      .catch(() => setRecError('Failed to fetch recommendation.'))
      .finally(() => setRecLoading(false));
  };

  const filteredMistakes = selectedFilter === 'ALL'
    ? mistakes
    : mistakes.filter(m => m.errorType === selectedFilter);

  const availableCategories = Array.from(new Set(mistakes.map(m => m.errorType)));

  return (
    <div style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}
      >
        <div>
          <h1
            style={{
              fontSize: 'clamp(1.375rem, 3vw, 1.75rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              marginBottom: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
            }}
          >
            <AlertCircle size={24} color="#f87171" />
            Mistake History &amp; Error Patterns
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real recorded execution failures, compiler diagnostics, and recurring weakness analytics.
          </p>
        </div>

        {/* Tab Toggle */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            padding: '3px',
          }}
        >
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '0.4rem 0.875rem',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'history' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'history' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            Recorded Log ({mistakes.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '0.4rem 0.875rem',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'analytics' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'analytics' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            Pattern Analytics
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div style={{ padding: '3rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          <RefreshCw size={20} className="animate-spin" style={{ display: 'inline', marginRight: '8px' }} />
          Loading mistake history...
        </div>
      ) : error ? (
        <div style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '1.25rem', borderRadius: '8px' }}>
          {error}
        </div>
      ) : activeTab === 'analytics' ? (
        /* ================= ANALYTICS TAB ================= */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Submissions</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{analytics?.overview?.totalSubmissions || 0}</div>
            </div>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Submission Accuracy</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e' }}>{analytics?.overview?.successRate || 0}%</div>
            </div>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Recurring Weaknesses</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171' }}>{analytics?.recurringWeaknesses?.length || 0}</div>
            </div>
          </div>

          {/* Practice Recommendation Widget */}
          <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(34,197,94,0.06) 100%)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="#a78bfa" /> Target Your Weaknesses with AI Practice
            </h3>
            <p style={{ fontSize: '0.8375rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Select an error category below to generate a tailored problem recommendation to help overcome that mistake.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {(analytics?.mistakeCategories || []).map((cat) => (
                <button
                  key={cat.errorType}
                  onClick={() => handleGetRecommendation(cat.errorType)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}
                >
                  <span>{cat.errorType}</span>
                  {cat.isRecurring && (
                    <span style={{ fontSize: '0.65rem', background: 'rgba(239,68,68,0.2)', color: '#f87171', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                      Recurring
                    </span>
                  )}
                </button>
              ))}
            </div>

            {recLoading && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Generating recommendation...</div>
            )}

            {recError && (
              <div style={{ color: '#f87171', fontSize: '0.85rem' }}>{recError}</div>
            )}

            {recommendation && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Recommended Challenge
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                    {recommendation.title}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {recommendation.reason}
                  </div>
                </div>
                <Link
                  to={`/workspace/${recommendation._id}`}
                  className="btn-primary"
                  style={{ fontSize: '0.8125rem', padding: '0.45rem 0.875rem', flexShrink: 0 }}
                >
                  Practice Problem <ArrowRight size={13} />
                </Link>
              </motion.div>
            )}
          </div>

          {/* Categorized Pattern List */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>
              Recorded Error Distribution &amp; Targeted Practice Status
            </h3>
            {analytics?.mistakeCategories?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {analytics.mistakeCategories.map((cat) => {
                  const info = getCategoryInfo(cat.errorType);

                  const statusColor = cat.practiceStatus === 'UNDERSTOOD'
                    ? '#22c55e'
                    : cat.practiceStatus === 'IMPROVING'
                    ? '#3b82f6'
                    : cat.practiceStatus === 'PRACTICING'
                    ? '#f59e0b'
                    : '#f87171';

                  const statusBg = cat.practiceStatus === 'UNDERSTOOD'
                    ? 'rgba(34,197,94,0.1)'
                    : cat.practiceStatus === 'IMPROVING'
                    ? 'rgba(59,130,246,0.1)'
                    : cat.practiceStatus === 'PRACTICING'
                    ? 'rgba(245,158,11,0.1)'
                    : 'rgba(239,68,68,0.1)';

                  return (
                    <div
                      key={cat.errorType}
                      style={{
                        padding: '1.25rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: '10px',
                        border: `1px solid ${cat.isRecurring ? 'rgba(239,68,68,0.3)' : 'var(--border-subtle)'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      {/* Top Bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: info.bg, color: info.color, border: `1px solid ${info.border}` }}>
                            {info.label}
                          </span>

                          {cat.isRecurring && (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <AlertTriangle size={12} /> Recurring Pattern
                            </span>
                          )}

                          {cat.practiceStatus && cat.practiceStatus !== 'NONE' && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: statusBg,
                                color: statusColor,
                              }}
                            >
                              {cat.practiceStatus === 'UNDERSTOOD'
                                ? '🎉 Pattern Understood'
                                : cat.practiceStatus === 'IMPROVING'
                                ? '📈 Improving'
                                : cat.practiceStatus === 'PRACTICING'
                                ? '⌛ Practice Completed'
                                : '🔁 Practice Pending'}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Occurrences: <strong style={{ color: 'var(--text-primary)' }}>{cat.totalOccurrences}</strong> across <strong style={{ color: 'var(--text-primary)' }}>{cat.distinctProblems || 1}</strong> problems
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {info.what}
                      </div>

                      {/* Practice Status Breakdown */}
                      {cat.isRecurring && (
                        <div
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.78rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <BookOpen size={14} color="#3b82f6" /> Practice &amp; Real Coding Progress
                          </div>

                          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', color: 'var(--text-secondary)' }}>
                            <div>
                              Mini-Challenge Practice:{' '}
                              <strong style={{ color: cat.practiceCompleted ? '#4ade80' : '#f87171' }}>
                                {cat.practiceCompleted ? '✅ Completed' : '⌛ Pending Practice'}
                              </strong>
                            </div>

                            {cat.practiceCompleted && (
                              <div>
                                Quick Check:{' '}
                                <strong style={{ color: cat.improvementCheckCorrect ? '#4ade80' : '#f59e0b' }}>
                                  {cat.improvementCheckCorrect ? '✅ Passed' : '⚠️ Review Needed'}
                                </strong>
                              </div>
                            )}
                          </div>

                          {/* Real Coding Progress Timeline */}
                          {cat.realCodingProgress && cat.realCodingProgress.length > 0 && (
                            <div style={{ marginTop: '0.25rem' }}>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                                Real Problem History:
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {cat.realCodingProgress.map((p, pIdx) => (
                                  <div
                                    key={pIdx}
                                    style={{
                                      padding: '0.25rem 0.625rem',
                                      borderRadius: '6px',
                                      background: p.passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                      border: `1px solid ${p.passed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                      fontSize: '0.72rem',
                                      color: p.passed ? '#4ade80' : '#f87171',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.375rem',
                                    }}
                                  >
                                    <span>{p.passed ? '✅' : '❌'}</span>
                                    <span>{p.title}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ fontSize: '0.75rem', color: '#fbbf24', background: 'rgba(251,191,36,0.06)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                        <strong>Action Tip: </strong>{info.tip}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No mistake pattern analytics recorded yet.</div>
            )}
          </div>

        </motion.div>
      ) : (
        /* ================= LOG / HISTORY TAB ================= */
        <div>
          {/* Category Filter Pills */}
          {availableCategories.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <Filter size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Filter:</span>
              <button
                onClick={() => setSelectedFilter('ALL')}
                style={{
                  padding: '0.25rem 0.625rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedFilter === 'ALL' ? 'var(--text-primary)' : 'var(--bg-secondary)',
                  color: selectedFilter === 'ALL' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                }}
              >
                All ({mistakes.length})
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  style={{
                    padding: '0.25rem 0.625rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: selectedFilter === cat ? 'var(--text-primary)' : 'var(--bg-secondary)',
                    color: selectedFilter === cat ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {filteredMistakes.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {mistakes.length === 0 ? 'No mistakes recorded yet!' : 'No mistakes match this filter.'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                When you submit code with errors in the workspace, BugBuddy logs them here automatically.
              </p>
              <Link to="/problems" className="btn-primary" style={{ display: 'inline-flex' }}>
                Browse Problems
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredMistakes.map((item, idx) => {
                const cat = getCategoryInfo(item.errorType);
                const formattedDate = item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';

                return (
                  <motion.div
                    key={item._id || idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className="card"
                    style={{ padding: '1.25rem' }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.875rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
                            {cat.label}
                          </span>

                          {item.resolved ? (
                            <span style={{ fontSize: '0.7rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <CheckCircle2 size={11} /> Corrected
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              Attempt #{item.attemptNumber}
                            </span>
                          )}

                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            • {item.language}
                          </span>

                          {formattedDate && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              • {formattedDate}
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
                          {item.problemTitle}
                        </h3>
                      </div>

                      {item.problemId && (
                        <Link
                          to={`/workspace/${item.problemId}`}
                          className="btn-secondary"
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', flexShrink: 0 }}
                        >
                          Try Again <ArrowRight size={12} />
                        </Link>
                      )}
                    </div>

                    {/* Cause */}
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.6 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Issue: </strong>
                      {cat.what}
                    </div>

                    {/* Compiler/Runtime Error Message Output */}
                    {item.errorMessage && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                          Compiler / Runtime Diagnostic
                        </div>
                        <pre
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.775rem',
                            color: '#f87171',
                            background: 'rgba(239,68,68,0.05)',
                            border: '1px solid rgba(239,68,68,0.15)',
                            borderRadius: '6px',
                            padding: '0.625rem 0.75rem',
                            margin: 0,
                            overflowX: 'auto',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxHeight: '120px',
                          }}
                        >
                          {item.errorMessage}
                        </pre>
                      </div>
                    )}

                    {/* Failed Test Evidence */}
                    {item.failedTestCase && (
                      <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.625rem 0.875rem', marginBottom: '0.75rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', lineHeight: 1.7 }}>
                        <div style={{ fontWeight: 700, color: '#f87171', marginBottom: '0.25rem', fontSize: '0.68rem', textTransform: 'uppercase' }}>
                          Failing Test Case Evidence
                        </div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Input: </span><span style={{ color: 'var(--text-primary)' }}>{item.failedTestCase.input}</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Expected: </span><span style={{ color: '#4ade80' }}>{item.failedTestCase.expectedOutput}</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Received: </span><span style={{ color: '#f87171' }}>{item.failedTestCase.actualOutput || 'Execution error / mismatch'}</span></div>
                      </div>
                    )}

                    {/* Actionable Tip */}
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#fbbf24', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <Clock size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontWeight: 600 }}>Action Tip: </span>{cat.tip}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
