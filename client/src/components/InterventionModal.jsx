/**
 * InterventionModal — Recurring Mistake mini-challenge overlay.
 *
 * Appears ONLY after a real failed Run when a recurring pattern is detected.
 * Two-step flow: Challenge → Quick Check.
 * Does NOT predict mistakes before they happen.
 * Does NOT say "You mastered it" — says "🎯 Pattern practiced".
 * Automatically returns to the exact same coding session when closed.
 *
 * Props:
 *   data       — { active, intervention, template, mistakeCategory, distinctProblemsCount }
 *   onClose    — closes the modal, preserving workspace state
 *   onComplete — called after full flow; same as onClose
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle2, AlertTriangle, ArrowRight, X, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function InterventionModal({ data, onClose, onComplete }) {
  if (!data || !data.template) return null;

  const { intervention, template, mistakeCategory, distinctProblemsCount } = data;
  const [currentStep, setCurrentStep] = useState('challenge');
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [quickCheckFeedback, setQuickCheckFeedback] = useState(null);

  const activeQuestion = currentStep === 'challenge' ? template.challenge : template.quickCheck;

  const handleSelectOption = async (index) => {
    if (submitting) return;
    setSelectedOption(index);
    setSubmitting(true);

    try {
      const res = await api.post('/interventions/submit', {
        interventionId: intervention._id,
        step: currentStep,
        selectedIndex: index,
      });

      if (currentStep === 'challenge') {
        setFeedback(res.data);
      } else if (currentStep === 'quickCheck') {
        setQuickCheckFeedback(res.data);
      }
    } catch (err) {
      console.error('[InterventionModal] Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvanceToQuickCheck = () => {
    setSelectedOption(null);
    setFeedback(null);
    setCurrentStep('quickCheck');
  };

  const handleFinish = () => {
    if (onComplete) onComplete();
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ duration: 0.22 }}
          style={{
            background: 'var(--bg-secondary, #18181b)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '540px',
            boxShadow: '0 18px 40px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              padding: '1.125rem 1.35rem',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.13) 0%, rgba(59,130,246,0.13) 100%)',
              borderBottom: '1px solid rgba(34,197,94,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '9px',
                  background: 'rgba(34,197,94,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4ade80',
                }}
              >
                <Brain size={19} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {currentStep === 'quickCheck' ? "🎯 Quick Check" : "🧠 Let's Fix This Pattern"}
                </h3>
                <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                  ~20 seconds • {template.concept}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close challenge"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '6px',
              }}
            >
              <X size={17} />
            </button>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            {/* Friendly intro — only on challenge step before answering */}
            {currentStep === 'challenge' && !feedback && (
              <div
                style={{
                  padding: '0.8rem 0.95rem',
                  borderRadius: '9px',
                  background: 'rgba(34,197,94,0.07)',
                  border: '1px solid rgba(34,197,94,0.14)',
                  fontSize: '0.84rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.55,
                }}
              >
                You've run into this type of mistake before.
                Take a quick 20-second challenge to recognize what caused it.
              </div>
            )}

            {/* Question + code snippet */}
            <div>
              <p style={{ fontSize: '0.93rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.7rem' }}>
                {activeQuestion.question}
              </p>

              {activeQuestion.code && (
                <pre
                  style={{
                    background: 'var(--bg-tertiary, #09090b)',
                    padding: '0.8rem 0.95rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                    fontFamily: 'monospace',
                    fontSize: '0.84rem',
                    color: '#e4e4e7',
                    overflowX: 'auto',
                    margin: 0,
                  }}
                >
                  {activeQuestion.code}
                </pre>
              )}
            </div>

            {/* ── Options (show when no correct feedback yet) ── */}
            {(!feedback || !feedback.correct) && !quickCheckFeedback && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {activeQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={submitting}
                      style={{
                        padding: '0.7rem 0.95rem',
                        borderRadius: '8px',
                        textAlign: 'left',
                        fontSize: '0.86rem',
                        fontWeight: 500,
                        background: isSelected ? 'rgba(34,197,94,0.11)' : 'var(--bg-tertiary, #27272a)',
                        border: isSelected ? '1px solid #22c55e' : '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                        color: isSelected ? '#4ade80' : 'var(--text-primary)',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Step 1 Feedback ── */}
            {currentStep === 'challenge' && feedback && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '0.95rem',
                  borderRadius: '9px',
                  background: feedback.correct ? 'rgba(34,197,94,0.09)' : 'rgba(239,68,68,0.09)',
                  border: `1px solid ${feedback.correct ? 'rgba(34,197,94,0.22)' : 'rgba(239,68,68,0.22)'}`,
                  color: feedback.correct ? '#4ade80' : '#f87171',
                  fontSize: '0.86rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {feedback.correct ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
                  {feedback.correct ? 'Nice! You identified the issue.' : 'Almost.'}
                </div>

                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {feedback.correct ? feedback.explanation : feedback.incorrectHint}
                </div>

                {feedback.correct ? (
                  <button
                    onClick={handleAdvanceToQuickCheck}
                    className="btn-primary"
                    style={{ alignSelf: 'flex-start', fontSize: '0.8rem', padding: '0.45rem 0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    Next: Quick Check <ArrowRight size={13} />
                  </button>
                ) : (
                  <button
                    onClick={() => { setFeedback(null); setSelectedOption(null); }}
                    style={{
                      alignSelf: 'flex-start',
                      fontSize: '0.8rem',
                      padding: '0.38rem 0.8rem',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <RefreshCw size={13} /> Try once more
                  </button>
                )}
              </motion.div>
            )}

            {/* ── Step 2 (Quick Check) Feedback ── */}
            {currentStep === 'quickCheck' && quickCheckFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '0.95rem',
                  borderRadius: '9px',
                  background: quickCheckFeedback.correct ? 'rgba(34,197,94,0.09)' : 'rgba(239,68,68,0.09)',
                  border: `1px solid ${quickCheckFeedback.correct ? 'rgba(34,197,94,0.22)' : 'rgba(239,68,68,0.22)'}`,
                  color: quickCheckFeedback.correct ? '#4ade80' : '#f87171',
                  fontSize: '0.86rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {quickCheckFeedback.correct ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
                  {quickCheckFeedback.correct ? '🎯 Pattern practiced' : 'Almost.'}
                </div>

                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {quickCheckFeedback.correct
                    ? "Nice! You recognized the mistake. Now let's get back to your problem and try applying what you learned."
                    : quickCheckFeedback.incorrectHint
                  }
                </div>

                <button
                  onClick={handleFinish}
                  className="btn-primary"
                  style={{ alignSelf: 'flex-start', fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
                >
                  Back to My Code
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
