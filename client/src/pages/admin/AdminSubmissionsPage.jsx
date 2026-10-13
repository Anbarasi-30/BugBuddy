/**
 * AdminSubmissionsPage.jsx
 * 
 * Admin Submission History Page: View, search, filter, and inspect student code submissions.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCode,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Code,
  X,
  Filter,
} from 'lucide-react';
import api from '../../services/api';

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const fetchSubmissions = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/submissions', {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          status: statusFilter,
          language: languageFilter,
        },
      });
      setSubmissions(res.data.submissions || []);
      setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not fetch submission history.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, languageFilter]);

  useEffect(() => {
    fetchSubmissions(1);
  }, [fetchSubmissions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSubmissions(1);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'passed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
            <CheckCircle2 size={13} /> Passed
          </span>
        );
      case 'failed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
            <XCircle size={13} /> Failed
          </span>
        );
      case 'error':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
            <AlertTriangle size={13} /> Error
          </span>
        );
      default:
        return (
          <span style={{ padding: '0.25rem 0.625rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            {status}
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Submission History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
            Inspect student code submissions, test results, and error logs across all problems.
          </p>
        </div>

        <button onClick={() => fetchSubmissions(pagination.page)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh List
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Search & Filters */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '14px',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
          />
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
            style={{ width: '150px' }}
          >
            <option value="">All Statuses</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="error">Error</option>
          </select>

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="input-field"
            style={{ width: '150px' }}
          >
            <option value="">All Languages</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="loading-spinner" />
          </div>
        ) : submissions.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileCode size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 500 }}>No submissions found.</p>
            <p style={{ margin: 0, fontSize: '0.8125rem', marginTop: '0.25rem' }}>Try adjusting your search terms or status filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Student</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Problem</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Language</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Test Cases</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Submitted At</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sub.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.studentEmail}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {sub.problemTitle}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                      {sub.language}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {getStatusBadge(sub.status)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {sub.passedTestCases} / {sub.totalTestCases}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {new Date(sub.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="btn-secondary"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                      >
                        <Code size={13} /> View Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.pages > 1 && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div>
              Page {pagination.page} of {pagination.pages} ({pagination.total} total submissions)
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchSubmissions(pagination.page - 1)}
                className="btn-secondary"
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchSubmissions(pagination.page + 1)}
                className="btn-secondary"
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Code Preview Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%',
                maxWidth: '700px',
                maxHeight: '90vh',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '16px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Submission Code Preview
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>
                  Submitted by <strong>{selectedSubmission.studentName}</strong> ({selectedSubmission.studentEmail}) for <strong>{selectedSubmission.problemTitle}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                <div>Language: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{selectedSubmission.language}</strong></div>
                <div>Status: {getStatusBadge(selectedSubmission.status)}</div>
                <div>Passed: <strong style={{ color: '#22c55e' }}>{selectedSubmission.passedTestCases}/{selectedSubmission.totalTestCases}</strong></div>
              </div>

              {selectedSubmission.errorMessage && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.8125rem' }}>
                  <strong>Error Message:</strong> {selectedSubmission.errorMessage}
                </div>
              )}

              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Source Code:</label>
                <pre
                  style={{
                    flex: 1,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '1rem',
                    color: '#e2e8f0',
                    fontFamily: 'Fira Code, monospace',
                    fontSize: '0.84rem',
                    overflow: 'auto',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {selectedSubmission.submittedCode || '// No code recorded'}
                </pre>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button onClick={() => setSelectedSubmission(null)} className="btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
