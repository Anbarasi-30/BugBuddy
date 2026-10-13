/**
 * AdminSystemPage.jsx
 * 
 * System Health and Infrastructure Monitoring Page.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Database,
  Cpu,
  Server,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import api from '../../services/api';

export default function AdminSystemPage() {
  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSystemStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/system');
      setSystem(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not fetch system monitoring details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            System Monitoring
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
            Live status of database connections, AI hints engine, execution engine, and server memory.
          </p>
        </div>

        <button onClick={fetchSystemStatus} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh Health
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Infrastructure Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Express Server */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '14px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Server size={20} style={{ color: '#6366f1' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Express API Server</h3>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#22c55e', fontSize: '0.75rem', fontWeight: 700 }}>
              <CheckCircle size={14} /> ONLINE
            </span>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <div>Uptime: <strong>{Math.floor((system?.server?.uptime || 0) / 60)} minutes</strong></div>
            <div>Node Version: <strong>{system?.server?.nodeVersion}</strong></div>
            <div>Platform: <strong>{system?.server?.platform}</strong></div>
          </div>
        </div>

        {/* MongoDB Atlas */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '14px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Database size={20} style={{ color: '#38bdf8' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>MongoDB Atlas</h3>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: system?.services?.mongodb === 'connected' ? '#22c55e' : '#f87171', fontSize: '0.75rem', fontWeight: 700 }}>
              {system?.services?.mongodb === 'connected' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {system?.services?.mongodb === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Database State: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{system?.services?.mongodb}</strong>
          </div>
        </div>

        {/* Gemini AI Engine */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '14px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Zap size={20} style={{ color: '#a855f7' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Gemini AI Mentor</h3>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: system?.services?.gemini === 'configured' ? '#22c55e' : '#f59e0b', fontSize: '0.75rem', fontWeight: 700 }}>
              {system?.services?.gemini === 'configured' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {system?.services?.gemini === 'configured' ? 'CONFIGURED' : 'FALLBACK MODE'}
            </span>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Status: <strong style={{ color: 'var(--text-primary)' }}>{system?.services?.gemini}</strong>
          </div>
        </div>

        {/* Judge0 Execution Engine */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '14px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Cpu size={20} style={{ color: '#22c55e' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Judge0 Code Execution</h3>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: system?.services?.judge0 === 'configured' ? '#22c55e' : '#f59e0b', fontSize: '0.75rem', fontWeight: 700 }}>
              {system?.services?.judge0 === 'configured' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {system?.services?.judge0 === 'configured' ? 'CONFIGURED' : 'LOCAL RUNTIME'}
            </span>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Status: <strong style={{ color: 'var(--text-primary)' }}>{system?.services?.judge0}</strong>
          </div>
        </div>
      </div>

      {/* Memory Utilization */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '14px', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, marginBottom: '1rem' }}>
          Process Memory Heap Utilization
        </h3>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem' }}>
          <div>Heap Used: <strong style={{ color: '#6366f1' }}>{system?.memory?.heapUsedMB} MB</strong></div>
          <div>Heap Total: <strong style={{ color: 'var(--text-primary)' }}>{system?.memory?.heapTotalMB} MB</strong></div>
          <div>RSS: <strong style={{ color: 'var(--text-primary)' }}>{system?.memory?.rssMB} MB</strong></div>
        </div>
      </div>
    </div>
  );
}
