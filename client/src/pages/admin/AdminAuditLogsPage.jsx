/**
 * AdminAuditLogsPage.jsx
 * 
 * Audit Log Viewer for tracking administrative actions across BugBuddy.
 */

import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchAuditLogs = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/audit-logs', {
        params: {
          page,
          limit: 15,
          action: actionFilter,
        },
      });
      setLogs(res.data.logs || []);
      setPagination(res.data.pagination || { page: 1, limit: 15, total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not fetch audit logs.');
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    fetchAuditLogs(1);
  }, [fetchAuditLogs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Administrative Audit Logs
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
            Immutable tracking record of student management, problem edits, and admin activity.
          </p>
        </div>

        <button onClick={() => fetchAuditLogs(1)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Logs
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Filter */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Action Type:</span>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="input-field" style={{ width: '220px' }}>
          <option value="all">All Actions</option>
          <option value="STUDENT_CREATED">STUDENT_CREATED</option>
          <option value="STUDENT_UPDATED">STUDENT_UPDATED</option>
          <option value="STUDENT_STATUS_CHANGED">STUDENT_STATUS_CHANGED</option>
          <option value="STUDENT_DELETED">STUDENT_DELETED</option>
          <option value="PROBLEM_CREATED">PROBLEM_CREATED</option>
          <option value="PROBLEM_UPDATED">PROBLEM_UPDATED</option>
          <option value="PROBLEM_DELETED">PROBLEM_DELETED</option>
          <option value="PROBLEM_ARCHIVED">PROBLEM_ARCHIVED</option>
          <option value="REPORT_UPDATED">REPORT_UPDATED</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '14px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}><div className="loading-spinner" /></div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShieldAlert size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 500 }}>No audit logs found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Action</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Summary</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Admin Email</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', background: 'rgba(99,102,241,0.12)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 500, color: 'var(--text-primary)' }}>{log.summary}</td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{log.adminEmail}</td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <div>Page {pagination.page} of {pagination.pages}</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button disabled={pagination.page <= 1} onClick={() => fetchAuditLogs(pagination.page - 1)} className="btn-secondary" style={{ padding: '0.375rem 0.75rem' }}><ChevronLeft size={14} /> Previous</button>
              <button disabled={pagination.page >= pagination.pages} onClick={() => fetchAuditLogs(pagination.page + 1)} className="btn-secondary" style={{ padding: '0.375rem 0.75rem' }}>Next <ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
