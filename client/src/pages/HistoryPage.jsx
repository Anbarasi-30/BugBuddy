/**
 * History Page — View past submission history from MongoDB.
 * Features pagination, search/filtering, and status badges.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { History, CheckCircle, XCircle, ExternalLink, RefreshCw, Filter } from 'lucide-react';
import api from '../services/api';

export default function HistoryPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'PASSED' | 'FAILED'

  useEffect(() => {
    api.get('/submissions?limit=50')
      .then((res) => setSubmissions(res.data.submissions || []))
      .catch(() => setError('Could not load submission history.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = submissions.filter((sub) => {
    if (filterStatus === 'PASSED') return sub.status === 'passed';
    if (filterStatus === 'FAILED') return sub.status !== 'passed';
    return true;
  });

  return (
    <div style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)', maxWidth: '950px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.375rem, 3vw, 1.75rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <History size={24} color="#3b82f6" />
            Submission History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Review past coding attempts, execution results, and track your debugging progress over time.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'var(--bg-secondary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
          <button
            onClick={() => setFilterStatus('ALL')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: filterStatus === 'ALL' ? 'var(--bg-card)' : 'transparent',
              color: filterStatus === 'ALL' ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            All ({submissions.length})
          </button>
          <button
            onClick={() => setFilterStatus('PASSED')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: filterStatus === 'PASSED' ? 'var(--bg-card)' : 'transparent',
              color: filterStatus === 'PASSED' ? '#4ade80' : 'var(--text-muted)',
            }}
          >
            Passed ({submissions.filter(s => s.status === 'passed').length})
          </button>
          <button
            onClick={() => setFilterStatus('FAILED')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: filterStatus === 'FAILED' ? 'var(--bg-card)' : 'transparent',
              color: filterStatus === 'FAILED' ? '#f87171' : 'var(--text-muted)',
            }}
          >
            Failed ({submissions.filter(s => s.status !== 'passed').length})
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: '3rem', textAlign: 'center' }}>
          <RefreshCw size={20} className="animate-spin" style={{ display: 'inline', marginRight: '8px' }} />
          Loading submission history...
        </div>
      ) : error ? (
        <div style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '8px' }}>{error}</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📜</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No matching submissions found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            When you attempt problems in the workspace, your submission history will appear here.
          </p>
          <Link to="/problems" className="btn-primary" style={{ display: 'inline-flex' }}>
            Browse Problems
          </Link>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 0.8fr 1fr 1.2fr 0.8fr auto',
              gap: '1rem',
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <div>Problem</div>
            <div>Language</div>
            <div>Status</div>
            <div>Error Diagnostic</div>
            <div>Date</div>
            <div>Action</div>
          </div>

          {filtered.map((sub, i) => {
            const passed = sub.status === 'passed';
            return (
              <div
                key={sub._id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 0.8fr 1fr 1.2fr 0.8fr auto',
                  gap: '1rem',
                  padding: '0.875rem 1.25rem',
                  alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sub.problemId?.title || 'Problem Challenge'}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {sub.language}
                </div>
                <div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: passed ? '#4ade80' : '#f87171',
                      border: `1px solid ${passed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}
                  >
                    {passed ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
                <div style={{ color: sub.errorType !== 'None' ? '#f87171' : 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {sub.errorType !== 'None' ? sub.errorType : `${sub.passedTestCases}/${sub.totalTestCases} Test Cases`}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  {new Date(sub.createdAt).toLocaleDateString()}
                </div>
                <div>
                  {sub.problemId?._id && (
                    <Link
                      to={`/workspace/${sub.problemId._id}`}
                      style={{ color: '#22c55e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.8rem' }}
                    >
                      Open <ExternalLink size={12} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
