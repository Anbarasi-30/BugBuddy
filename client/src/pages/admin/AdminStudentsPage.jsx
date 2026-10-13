/**
 * AdminStudentsPage.jsx
 * 
 * Student Management Module: View, Search, Filter, Add, Edit, Suspend, and Delete Students.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Lock,
  Mail,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminStudentsPage() {
  const { user: currentAdmin } = useAuth();

  const [students, setStudents] = useState([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, inactive: 0, suspended: 0, verified: 0, unverified: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form State
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '' });
  const [editForm, setEditForm] = useState({ id: '', name: '', email: '', status: 'active' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/students', {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          verificationStatus: verificationFilter,
          accountStatus: statusFilter,
        },
      });
      setStudents(res.data.students || []);
      if (res.data.counts) {
        setCounts(res.data.counts);
      }
      setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not fetch student list.');
    } finally {
      setLoading(false);
    }
  }, [search, verificationFilter, statusFilter]);

  useEffect(() => {
    fetchStudents(1);
  }, [fetchStudents]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents(1);
  };

  // Add Student Handler
  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email || !addForm.password) {
      setModalError('All fields are required.');
      return;
    }
    if (addForm.password.length < 8) {
      setModalError('Password must be at least 8 characters long.');
      return;
    }

    setFormSubmitting(true);
    setModalError('');
    try {
      await api.post('/admin/students', addForm);
      setSuccessMsg(`Student account created for ${addForm.email}`);
      setShowAddModal(false);
      setAddForm({ name: '', email: '', password: '' });
      fetchStudents(1);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setModalError(err.response?.data?.error || 'Could not add student.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Edit Student Handler
  const openEditModal = (student) => {
    setEditForm({
      id: student._id,
      name: student.name,
      email: student.email,
      status: student.status,
    });
    setModalError('');
    setShowEditModal(true);
  };

  const handleEditStudentSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.email) {
      setModalError('Name and email are required.');
      return;
    }

    setFormSubmitting(true);
    setModalError('');
    try {
      await api.patch(`/admin/students/${editForm.id}`, {
        name: editForm.name,
        email: editForm.email,
        status: editForm.status,
      });
      setSuccessMsg(`Student ${editForm.email} updated successfully.`);
      setShowEditModal(false);
      fetchStudents(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setModalError(err.response?.data?.error || 'Could not update student.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle Suspend / Reactivate
  const handleToggleStatus = async (student) => {
    const newStatus = student.status === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/admin/students/${student._id}/status`, { status: newStatus });
      setSuccessMsg(`Student ${student.email} is now ${newStatus}.`);
      fetchStudents(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update student status.');
    }
  };

  // Delete Student Handler
  const openDeleteModal = (student) => {
    if (student._id === currentAdmin?.id) {
      setError('You cannot delete your own admin account.');
      return;
    }
    setSelectedStudent(student);
    setModalError('');
    setShowDeleteModal(true);
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    setFormSubmitting(true);
    setModalError('');
    try {
      await api.delete(`/admin/students/${selectedStudent._id}`);
      setSuccessMsg(`Student ${selectedStudent.email} deleted successfully.`);
      setShowDeleteModal(false);
      setSelectedStudent(null);
      fetchStudents(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setModalError(err.response?.data?.error || 'Could not delete student account.');
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
            Student Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
            Manage registered students, create accounts, update status, and track progress.
          </p>
        </div>

        <button
          onClick={() => {
            setAddForm({ name: '', email: '', password: '' });
            setModalError('');
            setShowAddModal(true);
          }}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem' }}
        >
          <UserPlus size={16} />
          Add New Student
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div
          style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '10px',
            padding: '0.875rem 1.25rem',
            color: '#4ade80',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {successMsg}
        </div>
      )}

      {/* Global Error */}
      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px',
            padding: '0.875rem 1.25rem',
            color: '#f87171',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Students</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{counts.total}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4ade80', textTransform: 'uppercase' }}>Active</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e', marginTop: '0.25rem' }}>{counts.active}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase' }}>Inactive</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>{counts.inactive}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f87171', textTransform: 'uppercase' }}>Suspended</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>{counts.suspended}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8', textTransform: 'uppercase' }}>Verified Emails</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.25rem' }}>{counts.verified}</div>
        </div>
      </div>

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
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="input-field"
            style={{ width: '160px' }}
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified Email</option>
            <option value="unverified">Unverified Email</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
            style={{ width: '140px' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <button
            onClick={() => fetchStudents(1)}
            className="btn-secondary"
            style={{ padding: '0.625rem 0.875rem' }}
            title="Reload list"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Student Data Table */}
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
        ) : students.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 500 }}>No students found.</p>
            <p style={{ margin: 0, fontSize: '0.8125rem', marginTop: '0.25rem' }}>Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Student</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Verification</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Account Status</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Registered</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Submissions</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Solved</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr
                    key={st._id}
                    style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}
                  >
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{st.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.email}</div>
                    </td>

                    <td style={{ padding: '0.875rem 1rem' }}>
                      {st.isVerified ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#22c55e', fontSize: '0.75rem', fontWeight: 600 }}>
                          <CheckCircle2 size={14} /> Verified
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600 }}>
                          <XCircle size={14} /> Unverified
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.625rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: st.status === 'active' ? 'rgba(34,197,94,0.15)' : st.status === 'inactive' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                          color: st.status === 'active' ? '#4ade80' : st.status === 'inactive' ? '#f59e0b' : '#f87171',
                          textTransform: 'capitalize',
                        }}
                      >
                        {st.status}
                      </span>
                    </td>

                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      {new Date(st.createdAt).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {st.totalSubmissions || 0}
                    </td>

                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#22c55e' }}>
                      {st.problemsSolved || 0}
                    </td>

                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleToggleStatus(st)}
                          style={{
                            background: 'none',
                            border: '1px solid var(--border-default)',
                            borderRadius: '6px',
                            padding: '0.375rem 0.625rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: st.status === 'active' ? '#f59e0b' : '#22c55e',
                            cursor: 'pointer',
                          }}
                        >
                          {st.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>

                        <button
                          onClick={() => openEditModal(st)}
                          style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', padding: '0.25rem' }}
                          title="Edit Student"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          onClick={() => openDeleteModal(st)}
                          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.25rem' }}
                          title="Delete Student"
                        >
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
              Page {pagination.page} of {pagination.pages} ({pagination.total} total students)
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchStudents(pagination.page - 1)}
                className="btn-secondary"
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchStudents(pagination.page + 1)}
                className="btn-secondary"
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Student */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%',
                maxWidth: '440px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '16px',
                padding: '2rem',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowAddModal(false)}
                style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, marginBottom: '0.5rem' }}>
                Add New Student
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Create a student user account. Student role is automatically assigned.
              </p>

              {modalError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem', borderRadius: '8px', color: '#f87171', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                  {modalError}
                </div>
              )}

              <form onSubmit={handleAddStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={addForm.name}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 8 characters"
                    value={addForm.password}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={formSubmitting} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    {formSubmitting ? 'Creating...' : 'Create Student'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit Student */}
      <AnimatePresence>
        {showEditModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%',
                maxWidth: '440px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '16px',
                padding: '2rem',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowEditModal(false)}
                style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, marginBottom: '0.5rem' }}>
                Edit Student Details
              </h2>

              {modalError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem', borderRadius: '8px', color: '#f87171', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                  {modalError}
                </div>
              )}

              <form onSubmit={handleEditStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                    Account Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="input-field"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={formSubmitting} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    {formSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Delete Student */}
      <AnimatePresence>
        {showDeleteModal && selectedStudent && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%',
                maxWidth: '420px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', color: '#f87171', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <AlertTriangle size={24} />
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, marginBottom: '0.5rem' }}>
                Delete Student Account
              </h2>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{selectedStudent.email}</strong>?
                This action will remove their skill profile and authentication records.
              </p>

              {modalError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem', borderRadius: '8px', color: '#f87171', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                  {modalError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowDeleteModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteStudent}
                  disabled={formSubmitting}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '0.625rem',
                  }}
                >
                  {formSubmitting ? 'Deleting...' : 'Delete Student'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
