/**
 * Problems Page — Curated, High-Quality Problem Library
 *
 * Features:
 *  - Filtering by difficulty, topic tags, and user completion status (Solved / In Progress / Unattempted)
 *  - Fast instant search by title, keyword, or topic
 *  - Clean metadata display: difficulty, tags, estimated completion time, status chip
 *  - High-level progress counter (Total, Solved, In Progress)
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, CheckCircle, Clock, Code2, Filter, Sparkles, BookOpen, ChevronRight, X
} from 'lucide-react';
import api from '../services/api';

const DIFFICULTIES = [
  { value: 'all', label: 'All Difficulties' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const TOPICS = [
  'all',
  'Arrays',
  'Strings',
  'Loops',
  'Two Pointer',
  'HashMap',
  'Sorting',
  'Recursion',
  'Binary Search',
  'Math',
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All Status' },
  { value: 'solved', label: 'Solved' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'unattempted', label: 'Unattempted' },
];

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [tag, setTag] = useState('all');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (difficulty !== 'all') params.difficulty = difficulty;
    if (tag !== 'all') params.tag = tag;
    if (status !== 'all') params.status = status;

    api.get('/problems', { params })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.problems || []);
        setProblems(list);
      })
      .catch(() => setError('Could not load problems.'))
      .finally(() => setLoading(false));
  }, [search, difficulty, tag, status]);

  // Overall catalog statistics
  const stats = useMemo(() => {
    const total = problems.length;
    const solved = problems.filter((p) => p.status === 'solved' || p.completed).length;
    const inProgress = problems.filter((p) => p.status === 'in_progress').length;
    return { total, solved, inProgress };
  }, [problems]);

  return (
    <div style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              CURATED LIBRARY
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              • Python, Java, C, C++
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.875rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
            Coding &amp; Debugging Library
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem', margin: 0 }}>
            Practice real algorithmic problems with step-by-step guidance from BugBuddy.
          </p>
        </div>

        {/* Quick Progress Summary Pills */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem 0.875rem', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Catalog</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>{stats.total}</div>
          </div>
          <div style={{ padding: '0.5rem 0.875rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600, textTransform: 'uppercase' }}>Solved</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#34d399' }}>{stats.solved}</div>
          </div>
          <div style={{ padding: '0.5rem 0.875rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 600, textTransform: 'uppercase' }}>In Progress</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#60a5fa' }}>{stats.inProgress}</div>
          </div>
        </div>
      </motion.div>

      {/* Search & Filter Toolbar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            id="problem-search"
            type="text"
            placeholder="Search problems by title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.5rem', paddingRight: search ? '2rem' : '1rem' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Difficulty Filter */}
        <select
          id="difficulty-filter"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="input-field"
          style={{ width: 'auto', cursor: 'pointer', minWidth: '140px' }}
        >
          {DIFFICULTIES.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>

        {/* Topic / Tag Filter */}
        <select
          id="tag-filter"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="input-field"
          style={{ width: 'auto', cursor: 'pointer', minWidth: '130px' }}
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>{t === 'all' ? 'All Topics' : t}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          id="status-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input-field"
          style={{ width: 'auto', cursor: 'pointer', minWidth: '130px' }}
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </motion.div>

      {/* Problem List */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', marginBottom: '0.75rem' }}>⏳</div>
          <div>Loading problem catalog...</div>
        </div>
      ) : error ? (
        <div style={{ color: '#f87171', padding: '2rem', background: 'rgba(239,68,68,0.1)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      ) : problems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-default)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>No problems found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Try adjusting your search keywords or resetting difficulty and topic filters.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(240px, 2fr) 110px 140px 180px 110px 40px',
              gap: '1rem',
              padding: '0.875rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              alignItems: 'center',
            }}
          >
            <div>Problem</div>
            <div>Difficulty</div>
            <div>Estimated Time</div>
            <div>Topics</div>
            <div>Status</div>
            <div></div>
          </div>

          {/* Rows */}
          {problems.map((problem, i) => {
            const isSolved = problem.status === 'solved' || problem.completed;
            const isInProgress = problem.status === 'in_progress';

            return (
              <Link
                key={problem._id}
                to={`/workspace/${problem._id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(240px, 2fr) 110px 140px 180px 110px 40px',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    alignItems: 'center',
                    borderBottom: i < problems.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                  }}
                  className="problem-row"
                >
                  {/* Title & Languages */}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {problem.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '0.35rem' }}>
                      {(problem.supportedLanguages || ['python', 'java', 'c', 'cpp']).map((l) => (
                        <span key={l} style={{ textTransform: 'capitalize' }}>
                          {l === 'cpp' ? 'C++' : l}
                        </span>
                      )).reduce((acc, curr, idx) => idx === 0 ? [curr] : [...acc, '•', curr], [])}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <span className={`badge badge-${problem.difficulty}`}>
                      {problem.difficulty}
                    </span>
                  </div>

                  {/* Estimated Completion Time */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={13} color="var(--text-muted)" />
                    {problem.estimatedTime || '15–20 min'}
                  </div>

                  {/* Topic Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(problem.tags || []).slice(0, 2).map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 7px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                    {(problem.tags || []).length > 2 && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        +{problem.tags.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {isSolved ? (
                      <span className="badge badge-solved" style={{ gap: '0.3rem' }}>
                        <CheckCircle size={11} /> Solved
                      </span>
                    ) : isInProgress ? (
                      <span className="badge badge-in-progress" style={{ gap: '0.3rem' }}>
                        <Clock size={11} /> In Progress
                      </span>
                    ) : (
                      <span className="badge badge-unattempted">
                        Unattempted
                      </span>
                    )}
                  </div>

                  {/* Action arrow */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--text-muted)' }}>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </Link>
            );
          })}
        </motion.div>
      )}

      <style>{`
        .problem-row:hover {
          background: var(--bg-card-hover) !important;
        }
      `}</style>
    </div>
  );
}
