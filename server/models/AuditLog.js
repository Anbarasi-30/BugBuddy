/**
 * AuditLog Model
 * 
 * Records all significant administrative actions for accountability and auditing.
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'STUDENT_CREATED',
        'STUDENT_UPDATED',
        'STUDENT_SUSPENDED',
        'STUDENT_REACTIVATED',
        'STUDENT_DELETED',
        'PROBLEM_CREATED',
        'PROBLEM_UPDATED',
        'PROBLEM_DELETED',
        'PROBLEM_ARCHIVED',
        'REPORT_STATUS_UPDATED',
        'INITIAL_ADMIN_CREATED',
      ],
    },
    targetId: {
      type: String,
      default: null,
    },
    targetModel: {
      type: String,
      default: null,
    },
    summary: {
      type: String,
      required: true,
    },
    details: {
      type: Object,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
