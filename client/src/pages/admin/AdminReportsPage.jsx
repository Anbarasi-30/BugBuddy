/**
 * AdminReportsPage.jsx
 * 
 * Feedback & Bug Reports Management Module for Administrators.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
} from 'lucide-react';
import api from '../../services/api';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchReports = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/reports', {
        params: {
          page,
          limit: 10,
          status: statusFilter,
        },
      });
      setReports(res.data.reports || []);
      setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not fetch report list.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReports(1);
  }, [fetchReports]);

  const openReviewModal = (report) => {
    setSelectedReport(report);
    setReviewStatus(report.status);
    setAdminNotes(report.adminNotes || '');
    setModalError('');
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    setFormSubmitting(true);
    setModalError('');

    try {
      await api.patch(`/admin/reports/${selectedReport._id}`, {
        status: reviewStatus,
        adminNotes,
      });
      setSuccessMsg('Report updated successfully.');
      setSelectedReport(null);
      fetchReports(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setModalError(err.response?.data?.error || 'Could not update report.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Student Reports & Feedback
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
            Review feedback, problem issue reports, and platform bug submissions from students.
          </p>
        </div>

        <button onClick={() => fetchReports(1)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '0.875rem 1.25rem', color: '#4ade80', fontSize: '0.875rem' }}>
          {successMsg}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.875rem 1.25rem', color: '#f87171', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter by Status:</span>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field" style={{ width: '180px' }}>
          <option value="all">All Reports</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {/* Reports Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '14px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}><div className="loading-spinner" /></div>
        ) : reports.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 500 }}>No feedback or reports found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Subject</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Student</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Submitted</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep) => (
                  <tr key={rep._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{rep.subject}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 500 }}>{rep.userName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rep.userEmail}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{rep.category || 'general'}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '4px', background: rep.status === 'resolved' ? 'rgba(34,197,94,0.15)' : rep.status === 'pending' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)', color: rep.status === 'resolved' ? '#4ade80' : rep.status === 'pending' ? '#f59e0b' : '#818cf8' }}>
                        {rep.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{new Date(rep.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                      <button onClick={() => openReviewModal(rep)} className="btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                        <Eye size={14} /> Review Report
                      </button>
                    </td>
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
              <button disabled={pagination.page <= 1} onClick={() => fetchReports(pagination.page - 1)} className="btn-secondary" style={{ padding: '0.375rem 0.75rem' }}><ChevronLeft size={14} /> Previous</button>
              <button disabled={pagination.page >= pagination.pages} onClick={() => fetchReports(pagination.page + 1)} className="btn-secondary" style={{ padding: '0.375rem 0.75rem' }}>Next <ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: '100%', maxWidth: '540px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '2rem', position: 'relative' }}>
              <button onClick={() => setSelectedReport(null)} style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, marginBottom: '0.5rem' }}>Review Report</h2>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#38bdf8', margin: 0 }}>Subject: {selectedReport.subject}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Submitted by {selectedReport.userName} ({selectedReport.userEmail})</p>

              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {selectedReport.description}
              </div>

              {modalError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem', borderRadius: '8px', color: '#f87171', fontSize: '0.8125rem', marginTop: '1rem' }}>{modalError}</div>}

              <form onSubmit={handleUpdateReport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Update Status</label>
                  <select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)} className="input-field">
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Admin Resolution Notes</label>
                  <textarea rows={3} placeholder="Notes for admin record..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="input-field" />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setSelectedReport(null)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                  <button type="submit" disabled={formSubmitting} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{formSubmitting ? 'Updating...' : 'Save Resolution'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
