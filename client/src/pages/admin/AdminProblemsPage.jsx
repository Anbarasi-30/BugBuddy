/**
 * AdminProblemsPage.jsx
 * 
 * Coding Problem Management Module: View, Search, Filter, Add, Edit, Preview, and Archive/Delete Problems.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Archive,
  RefreshCw,
  X,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Code,
} from 'lucide-react';
import api from '../../services/api';

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form State
  const defaultProblemForm = {
    title: '',
    description: '',
    difficulty: 'easy',
    tagsStr: 'Arrays, Logic',
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: '',
    starterCodePython: 'def solution():\n    # Write code here\n    pass',
    starterCodeJava: 'public class Main {\n    public static void main(String[] args) {\n        // Write code here\n    }\n}',
    starterCodeC: '#include <stdio.h>\n\nint main() {\n    // Write code here\n    return 0;\n}',
    starterCodeCpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write code here\n    return 0;\n}',
    testCases: [
      { input: '1 2', expectedOutput: '3', isHidden: false, description: 'Sample Test Case' },
      { input: '5 10', expectedOutput: '15', isHidden: true, description: 'Hidden Test Case' },
    ],
    isPublished: true,
  };

  const [problemForm, setProblemForm] = useState(defaultProblemForm);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [editProblemId, setEditProblemId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchProblems = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/problems', {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          difficulty: difficultyFilter,
          status: statusFilter,
        },
      });
      setProblems(res.data.problems || []);
      setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not fetch problem list.');
    } finally {
      setLoading(false);
    }
  }, [search, difficultyFilter, statusFilter]);

  useEffect(() => {
    fetchProblems(1);
  }, [fetchProblems]);

  // Open Add Modal
  const openAddModal = () => {
    setProblemForm(defaultProblemForm);
    setModalError('');
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = async (prob) => {
    setModalError('');
    setLoading(true);
    try {
      const res = await api.get(`/admin/problems/${prob._id}`);
      const data = res.data;
      setEditProblemId(data._id);

      const getCode = (targetLang) => {
        if (!data.starterCode) return '';
        if (Array.isArray(data.starterCode)) {
          const found = data.starterCode.find((s) => {
            const l = s.language === 'c++' ? 'cpp' : s.language?.toLowerCase();
            return l === targetLang;
          });
          return found ? (found.code ?? '') : '';
        } else if (typeof data.starterCode === 'object') {
          return data.starterCode[targetLang] ?? (targetLang === 'cpp' ? data.starterCode['c++'] : '') ?? '';
        }
        return '';
      };

      setProblemForm({
        title: data.title || '',
        description: data.description || '',
        difficulty: data.difficulty || 'easy',
        tagsStr: Array.isArray(data.tags) ? data.tags.join(', ') : '',
        supportedLanguages: data.supportedLanguages || ['python', 'java', 'c', 'cpp'],
        expectedBehavior: data.expectedBehavior || '',
        starterCodePython: getCode('python'),
        starterCodeJava: getCode('java'),
        starterCodeC: getCode('c'),
        starterCodeCpp: getCode('cpp'),
        testCases: data.testCases || [],
        isPublished: Boolean(data.isPublished),
      });

      setShowEditModal(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not fetch problem details for editing.');
    } finally {
      setLoading(false);
    }
  };

  // Open Preview Modal
  const openPreviewModal = (prob) => {
    setSelectedProblem(prob);
    setShowPreviewModal(true);
  };

  // Test Case Helper functions
  const addTestCaseRow = () => {
    setProblemForm((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false, description: '' }],
    }));
  };

  const removeTestCaseRow = (index) => {
    setProblemForm((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index),
    }));
  };

  const updateTestCase = (index, field, value) => {
    setProblemForm((prev) => {
      const updated = [...prev.testCases];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, testCases: updated };
    });
  };

  // Save / Submit Problem
  const handleProblemSubmit = async (e) => {
    e.preventDefault();
    if (!problemForm.title || !problemForm.description) {
      setModalError('Title and description are required.');
      return;
    }
    if (problemForm.testCases.length === 0) {
      setModalError('At least one test case is required.');
      return;
    }

    const tags = problemForm.tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
    const starterCode = [
      { language: 'python', code: problemForm.starterCodePython || '' },
      { language: 'java', code: problemForm.starterCodeJava || '' },
      { language: 'c', code: problemForm.starterCodeC || '' },
      { language: 'cpp', code: problemForm.starterCodeCpp || '' },
    ];

    const payload = {
      title: problemForm.title,
      description: problemForm.description,
      difficulty: problemForm.difficulty,
      tags,
      supportedLanguages: ['python', 'java', 'c', 'cpp'],
      starterCode,
      expectedBehavior: problemForm.expectedBehavior,
      testCases: problemForm.testCases,
      isPublished: problemForm.isPublished,
    };

    setFormSubmitting(true);
    setModalError('');

    try {
      if (showEditModal && editProblemId) {
        await api.patch(`/admin/problems/${editProblemId}`, payload);
        setSuccessMsg(`Problem "${problemForm.title}" updated successfully.`);
        setShowEditModal(false);
      } else {
        await api.post('/admin/problems', payload);
        setSuccessMsg(`Problem "${problemForm.title}" created successfully.`);
        setShowAddModal(false);
      }
      fetchProblems(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setModalError(err.response?.data?.error || 'Could not save problem.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (prob) => {
    setSelectedProblem(prob);
    setModalError('');
    setShowDeleteModal(true);
  };

  const handleDeleteProblem = async () => {
    if (!selectedProblem) return;
    setFormSubmitting(true);
    setModalError('');
    try {
      const res = await api.delete(`/admin/problems/${selectedProblem._id}`);
      setSuccessMsg(res.data.message || 'Problem deleted/archived successfully.');
      setShowDeleteModal(false);
      setSelectedProblem(null);
      fetchProblems(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setModalError(err.response?.data?.error || 'Could not delete or archive problem.');
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
            Coding Problem Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
            Create, edit, test, preview, and manage coding challenges for BugBuddy students.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem' }}
        >
          <Plus size={16} />
          Create New Problem
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '0.875rem 1.25rem', color: '#4ade80', fontSize: '0.875rem', fontWeight: 500 }}>
          {successMsg}
        </div>
      )}

      {/* Global Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.875rem 1.25rem', color: '#f87171', fontSize: '0.875rem', fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* Filters Bar */}
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
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search problems by title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="input-field"
          style={{ width: '150px' }}
        >
          <option value="all">All Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field"
          style={{ width: '140px' }}
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>

        <button onClick={() => fetchProblems(1)} className="btn-secondary" style={{ padding: '0.625rem 0.875rem' }}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Problem Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '14px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="loading-spinner" />
          </div>
        ) : problems.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Code2 size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 500 }}>No coding problems found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Title</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Difficulty</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Topics / Tags</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Languages</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.title}
                    </td>

                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span
                        style={{
                          textTransform: 'capitalize',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          color: p.difficulty === 'easy' ? '#22c55e' : p.difficulty === 'medium' ? '#f59e0b' : '#ef4444',
                        }}
                      >
                        {p.difficulty}
                      </span>
                    </td>

                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {p.tags?.map((t, idx) => (
                          <span key={idx} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.125rem 0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.supportedLanguages?.join(', ')}
                    </td>

                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: p.isPublished ? '#22c55e' : '#f59e0b' }}>
                        {p.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>

                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => openPreviewModal(p)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }} title="Preview">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => openEditModal(p)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer' }} title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => openDeleteModal(p)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }} title="Archive / Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <div>Page {pagination.page} of {pagination.pages} ({pagination.total} total problems)</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button disabled={pagination.page <= 1} onClick={() => fetchProblems(pagination.page - 1)} className="btn-secondary" style={{ padding: '0.375rem 0.75rem' }}>
                <ChevronLeft size={14} /> Previous
              </button>
              <button disabled={pagination.page >= pagination.pages} onClick={() => fetchProblems(pagination.page + 1)} className="btn-secondary" style={{ padding: '0.375rem 0.75rem' }}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add or Edit Problem */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%',
                maxWidth: '720px',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '16px',
                padding: '2rem',
                position: 'relative',
              }}
            >
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, marginBottom: '0.5rem' }}>
                {showEditModal ? 'Edit Coding Problem' : 'Create New Problem'}
              </h2>

              {modalError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem', borderRadius: '8px', color: '#f87171', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                  {modalError}
                </div>
              )}

              <form onSubmit={handleProblemSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Title</label>
                  <input type="text" required placeholder="Problem Title" value={problemForm.title} onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })} className="input-field" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Difficulty</label>
                    <select value={problemForm.difficulty} onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })} className="input-field">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Topic Tags (Comma separated)</label>
                    <input type="text" placeholder="Arrays, Strings, Loops" value={problemForm.tagsStr} onChange={(e) => setProblemForm({ ...problemForm, tagsStr: e.target.value })} className="input-field" />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Description</label>
                  <textarea rows={4} required placeholder="Detailed problem description..." value={problemForm.description} onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })} className="input-field" style={{ resize: 'vertical' }} />
                </div>

                {/* Starter Code Sections for All Four Languages */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Language Starter Code
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                      Python Starter Code
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter Python starter code..."
                      value={problemForm.starterCodePython}
                      onChange={(e) => setProblemForm({ ...problemForm, starterCodePython: e.target.value })}
                      className="input-field font-mono"
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                      Java Starter Code
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter Java starter code..."
                      value={problemForm.starterCodeJava}
                      onChange={(e) => setProblemForm({ ...problemForm, starterCodeJava: e.target.value })}
                      className="input-field font-mono"
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                      C Starter Code
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter C starter code..."
                      value={problemForm.starterCodeC}
                      onChange={(e) => setProblemForm({ ...problemForm, starterCodeC: e.target.value })}
                      className="input-field font-mono"
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                      C++ Starter Code
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter C++ starter code..."
                      value={problemForm.starterCodeCpp}
                      onChange={(e) => setProblemForm({ ...problemForm, starterCodeCpp: e.target.value })}
                      className="input-field font-mono"
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                {/* Test Cases */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Test Cases</label>
                    <button type="button" onClick={addTestCaseRow} className="btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>
                      <PlusCircle size={14} /> Add Test Case
                    </button>
                  </div>

                  {problemForm.testCases.map((tc, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.875rem', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Test Case #{idx + 1}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <label style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                            <input type="checkbox" checked={tc.isHidden} onChange={(e) => updateTestCase(idx, 'isHidden', e.target.checked)} /> Hidden from student
                          </label>
                          {problemForm.testCases.length > 1 && (
                            <button type="button" onClick={() => removeTestCaseRow(idx)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <input type="text" placeholder="Input" value={tc.input} onChange={(e) => updateTestCase(idx, 'input', e.target.value)} className="input-field" style={{ fontSize: '0.8125rem' }} />
                        <input type="text" placeholder="Expected Output" value={tc.expectedOutput} onChange={(e) => updateTestCase(idx, 'expectedOutput', e.target.value)} className="input-field" style={{ fontSize: '0.8125rem' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="isPublished" checked={problemForm.isPublished} onChange={(e) => setProblemForm({ ...problemForm, isPublished: e.target.checked })} />
                  <label htmlFor="isPublished" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Publish problem immediately to student library
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                  <button type="submit" disabled={formSubmitting} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    {formSubmitting ? 'Saving...' : showEditModal ? 'Update Problem' : 'Create Problem'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Preview Problem */}
      <AnimatePresence>
        {showPreviewModal && selectedProblem && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: '100%', maxWidth: '640px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '2rem', position: 'relative' }}>
              <button onClick={() => setShowPreviewModal(false)} style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, marginBottom: '0.25rem' }}>{selectedProblem.title}</h2>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase' }}>{selectedProblem.difficulty}</span>
              <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selectedProblem.description}</p>
              <button onClick={() => setShowPreviewModal(false)} className="btn-secondary" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}>Close Preview</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Delete / Archive Problem */}
      <AnimatePresence>
        {showDeleteModal && selectedProblem && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: '100%', maxWidth: '420px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', color: '#f87171', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><AlertTriangle size={24} /></div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, marginBottom: '0.5rem' }}>Archive / Delete Problem</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{selectedProblem.title}</strong>? If historical submissions exist, it will be safely archived instead of deleted.
              </p>
              {modalError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem', borderRadius: '8px', color: '#f87171', fontSize: '0.8125rem', marginBottom: '1rem' }}>{modalError}</div>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowDeleteModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="button" onClick={handleDeleteProblem} disabled={formSubmitting} style={{ flex: 1, justifyContent: 'center', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', padding: '0.625rem' }}>{formSubmitting ? 'Processing...' : 'Confirm'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
