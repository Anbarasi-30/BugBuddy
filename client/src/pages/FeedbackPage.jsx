/**
 * FeedbackPage.jsx
 *
 * Student-facing Feedback & Report page.
 * Allows students to submit reports and view their report history.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileText,
} from 'lucide-react';
import api from '../services/api';

const REPORT_TYPE_LABELS = {
  bug_report: 'Bug Report',
  incorrect_coding_problem: 'Incorrect Coding Problem',
  incorrect_test_case: 'Incorrect Test Case',
  ai_hint_feedback: 'AI Hint Feedback',
  feature_request: 'Feature Request',
  general_feedback: 'General Feedback',
  other: 'Other',
};

const CATEGORY_LABELS = {
  coding_workspace: 'Coding Workspace',
  code_execution: 'Code Execution',
  test_cases: 'Test Cases',
  ai_hints: 'AI Hints',
  login_and_authentication: 'Login & Authentication',
  learning_progress: 'Learning Progress',
  user_interface: 'User Interface',
  other: 'Other',
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Clock },
  under_review: { label: 'Under Review', color: '#818cf8', bg: 'rgba(99,102,241,0.12)', icon: RefreshCw },
  resolved: { label: 'Resolved', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: CheckCircle },
  dismissed: { label: 'Dismissed', color: '#64748b', bg: 'rgba(100,116,139,0.12)', icon: XCircle },
};

const EMPTY_FORM = {
  reportType: '',
  category: '',
  subject: '',
  description: '',
  problemId: '',
};

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'history'

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);
  const [problems, setProblems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // History state
  const [reports, setReports] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState({ total: 0, pages: 1 });

  // Load problems for optional dropdown
  useEffect(() => {
    api.get('/problems')
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.problems || []);
        setProblems(list);
      })
      .catch(() => {});
  }, []);

  const fetchHistory = useCallback(async (page = 1) => {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const res = await api.get('/reports/my', { params: { page, limit: 8 } });
      setReports(res.data.reports || []);
      setHistoryPagination(res.data.pagination || { total: 0, pages: 1 });
      setHistoryPage(page);
    } catch (err) {
      setHistoryError(err.response?.data?.error || 'Could not load your reports.');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') fetchHistory(1);
  }, [activeTab, fetchHistory]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Client-side validation
    if (!form.reportType) return setFormError('Please select a report type.');
    if (!form.category) return setFormError('Please select a category.');
    if (!form.subject.trim() || form.subject.trim().length < 5) return setFormError('Subject must be at least 5 characters.');
    if (!form.description.trim() || form.description.trim().length < 10) return setFormError('Description must be at least 10 characters.');

    setSubmitting(true);
    try {
      await api.post('/reports', {
        reportType: form.reportType,
        category: form.category,
        subject: form.subject.trim(),
        description: form.description.trim(),
        problemId: form.problemId || undefined,
      });
      setFormSuccess('Your report was submitted successfully! We will review it shortly.');
      setForm(EMPTY_FORM);
      // Refresh history count
      fetchHistory(1);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Could not submit your report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const labelStyle = { display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' };
  const required = <span style={{ color: '#f87171' }}> *</span>;

  return (
    <div style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <MessageSquare size={28} style={{ color: '#6366f1' }} />
          Feedback &amp; Report
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.375rem', margin: 0 }}>
          Help us improve BugBuddy — report issues, share feedback, or request features.
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0' }}>
        {[
          { id: 'submit', label: '📝 Submit Report' },
          { id: 'history', label: `📋 My Reports${historyPagination.total > 0 ? ` (${historyPagination.total})` : ''}` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
              borderRadius: 0,
              padding: '0.75rem 1.25rem',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.9375rem',
              color: activeTab === tab.id ? '#6366f1' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'submit' && (
          <motion.div key="submit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
            {/* Success Banner */}
            {formSuccess && (
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '1rem 1.25rem', color: '#4ade80', fontSize: '0.9375rem', fontWeight: 500, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle size={20} />
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {/* Report Type */}
                <div>
                  <label style={labelStyle}>Report Type{required}</label>
                  <select id="reportType" value={form.reportType} onChange={(e) => handleChange('reportType', e.target.value)} className="input-field" required>
                    <option value="">Select a type…</option>
                    {Object.entries(REPORT_TYPE_LABELS).map(([val, lbl]) => (
                      <option key={val} value={val}>{lbl}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label style={labelStyle}>Category{required}</label>
                  <select id="category" value={form.category} onChange={(e) => handleChange('category', e.target.value)} className="input-field" required>
                    <option value="">Select a category…</option>
                    {Object.entries(CATEGORY_LABELS).map(([val, lbl]) => (
                      <option key={val} value={val}>{lbl}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label style={labelStyle}>Subject{required}</label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Brief summary of your report (5–200 characters)"
                  value={form.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className="input-field"
                  maxLength={200}
                  required
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>{form.subject.length}/200</div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description{required}</label>
                <textarea
                  id="description"
                  rows={5}
                  placeholder="Please describe the issue or feedback in detail (at least 10 characters)…"
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="input-field"
                  maxLength={5000}
                  required
                  style={{ resize: 'vertical', minHeight: '120px' }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>{form.description.length}/5000</div>
              </div>

              {/* Related Problem (optional) */}
              <div>
                <label style={labelStyle}>Related Coding Problem <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                <select id="problemId" value={form.problemId} onChange={(e) => handleChange('problemId', e.target.value)} className="input-field">
                  <option value="">None</option>
                  {problems.map((p) => (
                    <option key={p._id} value={p._id}>{p.title} ({p.difficulty})</option>
                  ))}
                </select>
              </div>

              {/* Error */}
              {formError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.875rem 1rem', color: '#f87171', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <AlertCircle size={16} /> {formError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', fontSize: '0.9375rem', fontWeight: 700, alignSelf: 'flex-start', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
              >
                <Send size={16} />
                {submitting ? 'Submitting…' : 'Submit Report'}
              </button>
            </form>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {historyPagination.total > 0 ? `${historyPagination.total} report${historyPagination.total !== 1 ? 's' : ''} submitted` : 'No reports submitted yet.'}
              </p>
              <button onClick={() => fetchHistory(historyPage)} className="btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            {historyLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="loading-spinner" /></div>
            ) : historyError ? (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '1rem 1.25rem', color: '#f87171', fontSize: '0.875rem' }}>{historyError}</div>
            ) : reports.length === 0 ? (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
                <FileText size={48} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '1rem' }} />
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9375rem' }}>You haven't submitted any reports yet.</p>
                <button onClick={() => setActiveTab('submit')} className="btn-secondary" style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Submit Your First Report</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {reports.map((report) => {
                  const sc = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
                  const StatusIcon = sc.icon;
                  const isExpanded = expandedId === report._id;

                  return (
                    <div key={report._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '14px', overflow: 'hidden' }}>
                      {/* Report Header */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : report._id)}
                        style={{ width: '100%', padding: '1.125rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {report.subject}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <span>{REPORT_TYPE_LABELS[report.reportType] || report.reportType}</span>
                            <span>·</span>
                            <span>{CATEGORY_LABELS[report.category] || report.category}</span>
                            <span>·</span>
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.7rem', borderRadius: '20px', background: sc.bg, color: sc.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          <StatusIcon size={12} />
                          {sc.label}
                        </span>
                        {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                      </button>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                              <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {report.problemTitle && (
                                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Related Problem: </span>
                                    {report.problemTitle}
                                  </div>
                                )}
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-secondary)', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border-subtle)', whiteSpace: 'pre-wrap' }}>
                                  {/* Note: description not returned by getMyReports — fetch on expand if needed */}
                                  <em style={{ color: 'var(--text-muted)' }}>Submitted {new Date(report.createdAt).toLocaleString()}</em>
                                </div>

                                {/* Admin Response */}
                                {report.adminResponse ? (
                                  <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                                      Admin Response
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{report.adminResponse}</p>
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                    No admin response yet. We'll get back to you soon.
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {/* Pagination */}
                {historyPagination.pages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button disabled={historyPage <= 1} onClick={() => fetchHistory(historyPage - 1)} className="btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>← Previous</button>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Page {historyPage} of {historyPagination.pages}</span>
                    <button disabled={historyPage >= historyPagination.pages} onClick={() => fetchHistory(historyPage + 1)} className="btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>Next →</button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
