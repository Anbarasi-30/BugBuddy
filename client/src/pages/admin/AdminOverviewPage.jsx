/**
 * AdminOverviewPage.jsx
 * Admin Overview dashboard landing page.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Code2,
  CheckCircle2,
  Activity,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import api from '../../services/api';

export default function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/overview');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load admin overview stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOverview(); }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}><div className="loading-spinner" /></div>;

  if (error) return (
    <div style={{ padding: '2rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#f87171' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <AlertCircle size={24} />
        <h3 style={{ margin: 0 }}>Failed to Load Dashboard</h3>
      </div>
      <p style={{ margin: 0, marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>
      <button onClick={fetchOverview} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Retry</button>
    </div>
  );

  const statCard = (label, value, sub, icon, iconBg, iconColor, delay = 0) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '14px', padding: '1.5rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.75rem' }}>{value}</div>
      <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</div>
    </motion.div>
  );

  const dbConnected = data?.systemStatus?.dbConnected;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Platform Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>Real-time BugBuddy platform status, user metrics, and pending actions.</p>
        </div>
        <button onClick={fetchOverview} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {statCard('Total Students', data?.students?.total || 0,
          <><span style={{ color: '#22c55e', fontWeight: 600 }}>{data?.students?.verified || 0} Verified</span> &nbsp;·&nbsp; <span style={{ color: '#f87171', fontWeight: 600 }}>{data?.students?.suspended || 0} Suspended</span></>,
          <Users size={20} />, 'rgba(99,102,241,0.15)', '#6366f1', 0)}
        {statCard('Coding Problems', data?.problems?.total || 0,
          <span style={{ color: '#38bdf8', fontWeight: 600 }}>{data?.problems?.published || 0} Published</span>,
          <Code2 size={20} />, 'rgba(56,189,248,0.15)', '#38bdf8', 0.05)}
        {statCard('Total Submissions', data?.submissions?.total || 0,
          <><span style={{ color: '#22c55e', fontWeight: 600 }}>{data?.submissions?.passRate}% Pass Rate</span> ({data?.submissions?.passed || 0} passed)</>,
          <CheckCircle2 size={20} />, 'rgba(34,197,94,0.15)', '#22c55e', 0.1)}
        {statCard('System Status',
          <span style={{ fontSize: '1.125rem', color: dbConnected ? '#22c55e' : '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: dbConnected ? '#22c55e' : '#f87171', display: 'inline-block' }} />
            {dbConnected ? 'Operational' : 'DB Error'}
          </span>,
          `Uptime: ${Math.floor(data?.systemStatus?.uptimeSeconds / 60 || 0)} mins`,
          <Activity size={20} />, 'rgba(168,85,247,0.15)', '#a855f7', 0.15)}
      </div>

      {/* Two Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Pending Reports */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '14px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Pending Student Reports</h3>
            </div>
            <Link to="/admin/reports" style={{ fontSize: '0.8125rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {!data?.recentReports || data.recentReports.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No pending reports right now. Good job!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {data.recentReports.map((r) => (
                <div key={r._id} style={{ padding: '0.875rem', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{r.subject}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '4px', background: r.status === 'pending' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)', color: r.status === 'pending' ? '#f59e0b' : '#818cf8', textTransform: 'capitalize' }}>{r.status}</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>By: {r.userName}</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Summary */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '14px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <MessageSquare size={18} style={{ color: '#38bdf8' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Student Feedback Summary</h3>
            </div>
            <Link to="/admin/reports" style={{ fontSize: '0.8125rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              Manage <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', background: 'rgba(245,158,11,0.1)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Pending Review</span>
              <span style={{ fontWeight: 800, fontSize: '1.5rem', color: '#f59e0b' }}>{data?.pendingReports ?? '—'}</span>
            </div>
            <Link to="/admin/reports"
              style={{ display: 'block', textAlign: 'center', padding: '0.875rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '10px', color: '#818cf8', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', marginTop: '0.25rem' }}
            >
              Open Reports &amp; Feedback →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
