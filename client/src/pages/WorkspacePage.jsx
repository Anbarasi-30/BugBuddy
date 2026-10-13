/**
 * Workspace Page — Modern 3-Column AI Debugging Workspace
 *
 * Column 1: Problem Statement, Constraints, Examples
 * Column 2: Monaco Code Editor, Language Selector, Reset (with modal confirm), Run, Submit
 * Column 3: Test cases, Execution Output, Diagnostics, and BugBuddy AI Mentor (3-level hints)
 *
 * Responsive on mobile/tablets with a clean top tab switcher.
 * Full keyboard shortcuts: Ctrl/Cmd + Enter (Run), Ctrl/Cmd + Shift + Enter (Submit).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  Play, Send, RotateCcw, Lightbulb, BookOpen, AlertTriangle,
  CheckCircle2, Clock, ChevronRight, Terminal, Sparkles, HelpCircle,
  FileCode, Cpu, Layers
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import BugBuddyAiIcon from '../components/BugBuddyAiIcon';
import InterventionModal from '../components/InterventionModal';

function DifficultyBadge({ level }) {
  return <span className={`badge badge-${level}`}>{level}</span>;
}

const getStarterCodeForLanguage = (problemData, targetLang) => {
  if (!problemData || !problemData.starterCode) return '';
  const normTarget = targetLang === 'c++' ? 'cpp' : targetLang?.toLowerCase();

  if (Array.isArray(problemData.starterCode)) {
    const found = problemData.starterCode.find((s) => {
      const sLang = s.language === 'c++' ? 'cpp' : s.language?.toLowerCase();
      return sLang === normTarget;
    });
    return found ? (found.code ?? '') : '';
  } else if (typeof problemData.starterCode === 'object') {
    return (
      problemData.starterCode[normTarget] ??
      (normTarget === 'cpp' ? problemData.starterCode['c++'] : '') ??
      ''
    );
  }
  return '';
};

function getActiveError(res) {
  if (!res) return null;
  if (res.status === 'passed') return null;
  if (res.status === 'unavailable') return null;

  const hasFailedTests = res.testResults && res.testResults.some((t) => !t.passed);
  const isErrorStatus = res.status === 'failed' || res.status === 'error' || res.status === 'timeout';
  const hasErrorMessage = Boolean(res.errorMessage && String(res.errorMessage).trim());
  const errorType = (res.errorType && res.errorType !== 'None')
    ? res.errorType
    : (hasFailedTests ? 'Wrong Answer' : null);

  if (isErrorStatus || hasFailedTests || hasErrorMessage || errorType) {
    return {
      errorType: errorType || 'Execution Error',
      errorMessage: res.errorMessage || '',
      errorLine: res.errorLine || null,
      testResults: res.testResults || [],
      status: res.status,
    };
  }
  return null;
}

/**
 * Formatted Hint Renderer supporting the 3-level progressive hierarchy
 */
function HintRenderer({ hintLevel, hintText, isExplanation }) {
  const SECTION_COLORS = {
    'Gentle Clue': '#4ade80',
    'Next Step': '#60a5fa',
    'Quick Example': '#a78bfa',
    'Why This Helps': '#34d399',
    'Targeted Correction': '#f43f5e',
    'Corrected Snippet': '#c084fc',
    'Key Takeaway': '#fbbf24',
    'What Went Wrong': '#f87171',
    'Why It Happened': '#fbbf24',
    'How to Fix It': '#4ade80',
  };

  const sections = [];
  let currentSection = null;
  let currentLines = [];
  let inCodeBlock = false;
  let codeLang = '';
  let codeLines = [];

  const lines = (hintText || '').split('\n');

  const flushSection = () => {
    if (currentSection !== null || currentLines.length > 0) {
      sections.push({ heading: currentSection, lines: currentLines });
    }
    currentSection = null;
    currentLines = [];
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      } else {
        inCodeBlock = false;
        currentLines.push({ type: 'code', lang: codeLang, content: codeLines.join('\n') });
        codeLines = [];
        codeLang = '';
      }
      continue;
    }
    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }
    if (line.startsWith('### ')) {
      flushSection();
      currentSection = line.slice(4).replace(/^[^\w\s]+/, '').trim();
    } else if (line.trim() === '') {
      if (currentLines.length > 0 && currentLines[currentLines.length - 1]?.type !== 'br') {
        currentLines.push({ type: 'br' });
      }
    } else {
      currentLines.push({ type: 'text', content: line });
    }
  }
  flushSection();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: isExplanation ? '#fbbf24' : '#34d399',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '2px 8px',
            background: isExplanation ? 'rgba(251,191,36,0.1)' : 'rgba(16,185,129,0.1)',
            borderRadius: '4px',
            border: `1px solid ${isExplanation ? 'rgba(251,191,36,0.25)' : 'rgba(16,185,129,0.25)'}`,
          }}
        >
          {isExplanation ? '🔍 Error Explanation' : `Level ${hintLevel} Hint`}
        </span>
      </div>

      {sections.map((sec, si) => (
        <div
          key={si}
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '0.875rem',
          }}
        >
          {sec.heading && (
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: SECTION_COLORS[sec.heading] || 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              {sec.heading}
            </div>
          )}
          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            {sec.lines.map((item, li) => {
              if (item.type === 'br') return <br key={li} />;
              if (item.type === 'code') {
                return (
                  <pre
                    key={li}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      padding: '0.625rem 0.75rem',
                      overflowX: 'auto',
                      margin: '0.5rem 0',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: '#a78bfa',
                    }}
                  >
                    {item.content}
                  </pre>
                );
              }
              const text = item.content;
              const isBullet = text.trimStart().startsWith('- ') || text.trimStart().startsWith('* ');
              if (isBullet) {
                return (
                  <div key={li} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <span style={{ color: '#34d399', flexShrink: 0 }}>•</span>
                    <span>{text.replace(/^[-*]\s/, '')}</span>
                  </div>
                );
              }
              return <div key={li}>{text}</div>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WorkspacePage() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [problem, setProblem] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [codeByLanguage, setCodeByLanguage] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [hintData, setHintData] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [hintError, setHintError] = useState(null);
  const [interventionData, setInterventionData] = useState(null);
  const [rightTab, setRightTab] = useState('output'); // 'output' | 'mentor'
  const [mobileTab, setMobileTab] = useState('code'); // 'problem' | 'code' | 'output' | 'mentor'
  const [showResetModal, setShowResetModal] = useState(false);

  const shownInterventionsRef = useRef(new Set());

  // Fetch problem details
  useEffect(() => {
    if (!problemId) {
      api.get('/problems').then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.problems || []);
        setProblems(list);
      }).catch(() => {});
      return;
    }

    setLoading(true);
    api.get(`/problems/${problemId}`)
      .then((res) => {
        const prob = res.data;
        setProblem(prob);

        const initialCodeMap = {};
        const supported = prob.supportedLanguages || ['python'];
        supported.forEach((lang) => {
          initialCodeMap[lang] = getStarterCodeForLanguage(prob, lang);
        });

        const defaultLang = supported.includes('python') ? 'python' : supported[0];
        setLanguage(defaultLang);
        setCodeByLanguage(initialCodeMap);
        setCode(initialCodeMap[defaultLang] || '');
      })
      .catch((err) => {
        console.error('Failed to load problem:', err);
      })
      .finally(() => setLoading(false));
  }, [problemId]);

  // Language switching
  const handleLanguageChange = (newLang) => {
    setCodeByLanguage((prev) => ({ ...prev, [language]: code }));
    setLanguage(newLang);
    const existing = codeByLanguage[newLang];
    if (existing !== undefined && existing !== '') {
      setCode(existing);
    } else {
      const starter = getStarterCodeForLanguage(problem, newLang);
      setCode(starter);
      setCodeByLanguage((prev) => ({ ...prev, [newLang]: starter }));
    }
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode || '');
    setCodeByLanguage((prev) => ({ ...prev, [language]: newCode || '' }));
  };

  // Reset starter code
  const handleConfirmReset = () => {
    const starter = getStarterCodeForLanguage(problem, language);
    setCode(starter);
    setCodeByLanguage((prev) => ({ ...prev, [language]: starter }));
    setShowResetModal(false);
  };

  // Check recurring mistake pattern
  const checkInterventionPattern = async (runResult, sessionAttempt) => {
    if (!runResult || !problem) return;
    const sessionId = sessionAttempt?._id || attempt?._id;
    if (!sessionId) return;

    const errorType = runResult.errorType || 'LogicError';
    if (['None', 'Execution Service Unavailable'].includes(errorType)) return;

    const dedupeKey = `${sessionId}__${errorType}`;
    if (shownInterventionsRef.current.has(dedupeKey)) return;

    try {
      const res = await api.post('/interventions/check', {
        problemId: problem._id,
        sessionId,
        errorType,
        errorMessage: runResult.errorMessage || '',
        errorLine: runResult.errorLine || null,
        code,
        passedTestCases: runResult.passedTestCases || 0,
        totalTestCases: runResult.totalTestCases || 0,
      });

      if (res.data?.active) {
        shownInterventionsRef.current.add(dedupeKey);
        setInterventionData(res.data);
      }
    } catch (err) {
      console.error('[Intervention] Check error:', err);
    }
  };

  // Run code (Debugging mode)
  const handleRun = async () => {
    if (!problem || submitting || running) return;
    setRunning(true);
    setRightTab('output');
    try {
      const res = await api.post('/submissions/run', {
        problemId: problem._id,
        language,
        code,
      });

      const runRes = res.data.runResult;
      setResult(runRes);
      if (res.data.attempt) setAttempt(res.data.attempt);

      if (runRes.status !== 'passed') {
        await checkInterventionPattern(runRes, res.data.attempt);
      }
    } catch (err) {
      console.error('Run failed:', err.message);
      setResult({
        status: 'error',
        errorMessage: err.response?.data?.error || 'Run failed to execute.',
        passedTestCases: 0,
        totalTestCases: problem.testCases?.length || 0,
        testResults: [],
      });
    } finally {
      setRunning(false);
    }
  };

  // Submit code (Evaluation mode)
  const handleSubmit = async () => {
    if (!problem || submitting || running) return;
    setSubmitting(true);
    setRightTab('output');
    try {
      const res = await api.post('/submissions', {
        problemId: problem._id,
        language,
        code,
      });

      setSubmission(res.data.submission);
      setResult(res.data.submission);
      if (res.data.attempt) setAttempt(res.data.attempt);
    } catch (err) {
      console.error('Submit failed:', err.message);
      setResult({
        status: 'error',
        errorMessage: err.response?.data?.error || 'Submission failed.',
        passedTestCases: 0,
        totalTestCases: problem.testCases?.length || 0,
        testResults: [],
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Keyboard shortcuts (Ctrl+Enter to Run, Ctrl+Shift+Enter to Submit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmit();
        } else {
          handleRun();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, problem, submitting, running]);

  // Request progressive hint (Level 1, 2, 3)
  const handleHintRequest = async () => {
    if (!problem || hintLoading || explainLoading) return;
    setHintLoading(true);
    setHintError(null);
    setRightTab('mentor');
    try {
      const payload = {
        problemId: problem._id,
        code,
        language,
        currentHintLevel: hintData?.hintLevel || attempt?.hintLevel || 0,
      };
      if (attempt?._id) payload.attemptId = attempt._id;
      if (submission?._id) payload.submissionId = submission._id;

      const res = await api.post('/hints', payload);
      setHintData(res.data);
      if (attempt) setAttempt((prev) => ({ ...prev, hintLevel: res.data.hintLevel }));
    } catch (err) {
      console.error('Hint request failed:', err.message);
      setHintError('Could not generate hint at this moment.');
    } finally {
      setHintLoading(false);
    }
  };

  // Request error explanation
  const handleExplainRequest = async () => {
    const activeErr = getActiveError(result || submission);
    if (!problem || hintLoading || explainLoading || !activeErr) return;
    setExplainLoading(true);
    setHintError(null);
    setRightTab('mentor');
    try {
      const payload = {
        problemId: problem._id,
        code,
        language,
        explainError: true,
        errorDetails: activeErr,
        currentHintLevel: hintData?.hintLevel || attempt?.hintLevel || 0,
      };
      if (attempt?._id) payload.attemptId = attempt._id;
      if (submission?._id) payload.submissionId = submission._id;

      const res = await api.post('/hints', payload);
      setHintData(res.data);
    } catch (err) {
      console.error('Explain request failed:', err.message);
      setHintError('Could not generate error explanation at this moment.');
    } finally {
      setExplainLoading(false);
    }
  };

  const getMonacoLang = (l) => {
    if (l === 'python') return 'python';
    if (l === 'java') return 'java';
    if (l === 'c') return 'c';
    if (l === 'cpp' || l === 'c++') return 'cpp';
    return 'python';
  };

  if (!problemId) {
    return (
      <div style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)', maxWidth: '960px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          Select a Problem to Debug
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Choose any challenge from our curated problem catalog:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {problems.map((p) => (
            <Link
              key={p._id}
              to={`/workspace/${p._id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <span style={{ fontWeight: 600 }}>{p.title}</span>
              <span className={`badge badge-${p.difficulty}`}>{p.difficulty}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (loading || !problem) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text-muted)' }}>
        ⏳ Loading workspace...
      </div>
    );
  }

  const activeError = getActiveError(result || submission);
  const currentHintLevel = hintData?.hintLevel || attempt?.hintLevel || 0;
  const isPassed = (result?.status === 'passed') || (submission?.status === 'passed');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', background: 'var(--bg-primary)' }}>
      {/* Mobile/Tablet Tab Switcher */}
      <div className="workspace-mobile-tabs" style={{ display: 'none', padding: '0.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', gap: '0.5rem' }}>
        {['problem', 'code', 'output', 'mentor'].map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            style={{
              flex: 1,
              padding: '0.4rem',
              borderRadius: '6px',
              border: mobileTab === tab ? '1px solid var(--brand-500)' : '1px solid var(--border-subtle)',
              background: mobileTab === tab ? 'var(--bg-card)' : 'transparent',
              color: mobileTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main 3-Column Layout */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* ── COLUMN 1: Problem Statement & Context (~28% width) ── */}
        <div
          className={`workspace-col-1 ${mobileTab !== 'problem' ? 'mobile-hidden' : ''}`}
          style={{
            width: '30%',
            minWidth: '320px',
            maxWidth: '420px',
            borderRight: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
          }}
        >
          {/* Header */}
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
              <DifficultyBadge level={problem.difficulty} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} /> {problem.estimatedTime || '15–20 min'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
              {problem.title}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.625rem' }}>
              {(problem.tags || []).map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 7px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Body Content */}
          <div style={{ padding: '1.25rem', flex: 1 }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
              {problem.description}
            </div>

            {problem.expectedBehavior && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                  Expected Behavior
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-card)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  {problem.expectedBehavior}
                </div>
              </div>
            )}

            {/* Examples */}
            {problem.testCases?.filter((t) => !t.isHidden).length > 0 && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.625rem' }}>
                  Sample Test Cases
                </div>
                {problem.testCases.filter((t) => !t.isHidden).slice(0, 3).map((tc, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      marginBottom: '0.625rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                    }}
                  >
                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Input: <span style={{ color: 'var(--text-primary)' }}>{tc.input}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      Output: <span style={{ color: '#34d399' }}>{tc.expectedOutput}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── COLUMN 2: Monaco Editor (~42% width) ── */}
        <div
          className={`workspace-col-2 ${mobileTab !== 'code' ? 'mobile-hidden' : ''}`}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: '400px',
            borderRight: '1px solid var(--border-subtle)',
            background: 'var(--bg-primary)',
          }}
        >
          {/* Editor Action Toolbar */}
          <div
            style={{
              padding: '0.625rem 1rem',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            {/* Language Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                id="language-selector"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="input-field"
                style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                {(problem.supportedLanguages || ['python', 'java', 'c', 'cpp']).map((l) => (
                  <option key={l} value={l}>
                    {l === 'python' ? '🐍 Python' : l === 'java' ? '☕ Java' : l === 'c' ? '⚡ C' : '🚀 C++'}
                  </option>
                ))}
              </select>
            </div>

            {/* Run & Submit Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                id="reset-code-btn"
                onClick={() => setShowResetModal(true)}
                className="btn-ghost"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                title="Reset code to original starter"
              >
                <RotateCcw size={13} />
                Reset
              </button>

              <button
                id="run-code-btn"
                onClick={handleRun}
                disabled={running || submitting}
                className="btn-secondary"
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  opacity: (running || submitting) ? 0.7 : 1,
                }}
                title="Run test cases (Ctrl + Enter)"
              >
                <Play size={13} />
                {running ? 'Running...' : 'Run'}
                <span className="kbd" style={{ fontSize: '0.65rem', marginLeft: '2px' }}>Ctrl↵</span>
              </button>

              <button
                id="submit-code-btn"
                onClick={handleSubmit}
                disabled={submitting || running}
                className="btn-primary"
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  opacity: (submitting || running) ? 0.7 : 1,
                }}
                title="Submit solution (Ctrl + Shift + Enter)"
              >
                <Send size={13} />
                {submitting && !running ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>

          {/* Monaco Editor Component */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <Editor
              height="100%"
              language={getMonacoLang(language)}
              value={code}
              onChange={handleCodeChange}
              theme={isDark ? 'vs-dark' : 'light'}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                renderLineHighlight: 'line',
                tabSize: 4,
              }}
            />
          </div>

          {/* Bottom Editor Status Bar */}
          <div
            style={{
              padding: '0.35rem 1rem',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
            }}
          >
            <span>Language: <strong style={{ color: 'var(--text-secondary)' }}>{language.toUpperCase()}</strong></span>
            <span>Shortcuts: <span className="kbd">Ctrl+Enter</span> Run • <span className="kbd">Ctrl+Shift+Enter</span> Submit</span>
          </div>
        </div>

        {/* ── COLUMN 3: Diagnostic Output & BugBuddy AI Mentor (~30% width) ── */}
        <div
          className={`workspace-col-3 ${mobileTab !== 'output' && mobileTab !== 'mentor' ? 'mobile-hidden' : ''}`}
          style={{
            width: '30%',
            minWidth: '320px',
            maxWidth: '440px',
            background: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Top Panel Tabs (Diagnostics vs AI Mentor) */}
          <div
            style={{
              padding: '0.5rem 0.75rem',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <button
              onClick={() => setRightTab('output')}
              style={{
                flex: 1,
                padding: '0.45rem',
                borderRadius: '6px',
                border: 'none',
                background: rightTab === 'output' ? 'var(--bg-tertiary)' : 'transparent',
                color: rightTab === 'output' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <Terminal size={14} />
              Diagnostics &amp; Tests
            </button>

            <button
              onClick={() => setRightTab('mentor')}
              style={{
                flex: 1,
                padding: '0.45rem',
                borderRadius: '6px',
                border: 'none',
                background: rightTab === 'mentor' ? 'rgba(16,185,129,0.12)' : 'transparent',
                color: rightTab === 'mentor' ? '#34d399' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={14} />
              AI Mentor
              {currentHintLevel > 0 && (
                <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: '#10b981', color: '#000' }}>
                  L{currentHintLevel}
                </span>
              )}
            </button>
          </div>

          {/* Right Panel Tab 1: Diagnostic & Test Results */}
          {rightTab === 'output' && (
            <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {running || submitting ? (
                <div style={{ color: 'var(--text-muted)', padding: '2rem 1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>⏳</div>
                  {running ? 'Running your code against test cases...' : 'Submitting and evaluating full test suite...'}
                </div>
              ) : !result ? (
                <div style={{ color: 'var(--text-muted)', padding: '3rem 1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
                  <Terminal size={24} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <div>Click <strong>Run</strong> or <strong>Submit</strong> to view results, runtime diagnostics, and test case comparisons.</div>
                </div>
              ) : (
                <>
                  {/* Status Banner */}
                  <div
                    style={{
                      padding: '0.875rem',
                      borderRadius: '8px',
                      background: result.status === 'passed' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                      border: `1px solid ${result.status === 'passed' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                      color: result.status === 'passed' ? '#34d399' : '#f87171',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {result.status === 'passed' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    <span>
                      {result.status === 'passed'
                        ? `All ${result.totalTestCases} Test Cases Passed!`
                        : `${result.passedTestCases}/${result.totalTestCases} Tests Passed (${result.errorType || 'Error'})`}
                    </span>
                    {result.executionTimeMs && (
                      <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        {result.executionTimeMs}ms
                      </span>
                    )}
                  </div>

                  {/* Run Improvement Indicator */}
                  {result.runNumber && (
                    <div
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Run #{result.runNumber}: </span>
                      {result.improvement > 0 ? (
                        <span style={{ color: '#34d399', fontWeight: 600 }}>📈 +{result.improvement} test(s) fixed!</span>
                      ) : result.improvement < 0 ? (
                        <span style={{ color: '#f87171', fontWeight: 600 }}>📉 Regression ({result.improvement} tests)</span>
                      ) : result.codeChanged ? (
                        <span>Best passed tests: {result.bestPassedTests || result.passedTestCases}/{result.totalTestCases}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Code unchanged since previous run</span>
                      )}
                    </div>
                  )}

                  {/* Error Output / Diagnostic Message */}
                  {result.errorMessage && (
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Error Output
                      </div>
                      <pre
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem',
                          color: '#f87171',
                          background: 'rgba(239,68,68,0.05)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: '6px',
                          padding: '0.625rem 0.75rem',
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {result.errorMessage}
                      </pre>
                    </div>
                  )}

                  {/* Test Cases Comparison */}
                  {result.testResults?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Test Case Verification
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {result.testResults.filter((t) => !t.isHidden).map((tc, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.625rem 0.75rem',
                              borderRadius: '6px',
                              background: tc.passed ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)',
                              border: `1px solid ${tc.passed ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)'}`,
                              fontSize: '0.78rem',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 600, color: tc.passed ? '#34d399' : '#f87171' }}>
                                Case {idx + 1} • {tc.passed ? 'Passed' : 'Mismatch'}
                              </span>
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                              <div><span style={{ color: 'var(--text-muted)' }}>In: </span>{tc.input}</div>
                              <div><span style={{ color: 'var(--text-muted)' }}>Expected: </span>{tc.expectedOutput}</div>
                              <div><span style={{ color: tc.passed ? '#34d399' : '#f87171' }}>Actual: </span>{tc.actualOutput || '(none)'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Shortcut to Mentor when error occurs */}
                  {activeError && (
                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                      <button
                        onClick={() => { setRightTab('mentor'); handleExplainRequest(); }}
                        className="btn-secondary"
                        style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}
                      >
                        <BookOpen size={14} /> Explain This Error with AI
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Right Panel Tab 2: BugBuddy AI Mentor (Progressive 3-Level Hints) */}
          {rightTab === 'mentor' && (
            <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Mentor Header Card */}
              <div
                style={{
                  padding: '0.875rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(59,130,246,0.08) 100%)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BugBuddyAiIcon size={24} variant="light" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>BugBuddy AI Mentor</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>
                    Guiding you step-by-step to solve and debug independently.
                  </p>
                </div>
              </div>

              {/* Progressive Hint Level Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {[1, 2, 3].map((lvl) => {
                  const isActive = currentHintLevel >= lvl;
                  return (
                    <div
                      key={lvl}
                      style={{
                        flex: 1,
                        padding: '0.4rem 0.5rem',
                        borderRadius: '6px',
                        background: isActive ? 'rgba(16,185,129,0.15)' : 'var(--bg-tertiary)',
                        border: `1px solid ${isActive ? 'rgba(16,185,129,0.3)' : 'var(--border-subtle)'}`,
                        textAlign: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: isActive ? '#34d399' : 'var(--text-muted)',
                      }}
                    >
                      Level {lvl}
                    </div>
                  );
                })}
              </div>

              {/* Active Hint Content or Error Message */}
              {hintLoading || explainLoading ? (
                <div style={{ color: 'var(--text-muted)', padding: '2rem 1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>✨</div>
                  {hintLoading ? 'Crafting your progressive hint...' : 'Analyzing code and error details...'}
                </div>
              ) : hintError ? (
                <div style={{ color: '#f87171', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.8rem' }}>
                  {hintError}
                </div>
              ) : hintData ? (
                <HintRenderer
                  hintLevel={hintData.hintLevel}
                  hintText={hintData.hintText}
                  isExplanation={hintData.isExplanation}
                />
              ) : (
                <div style={{ color: 'var(--text-secondary)', padding: '2rem 1rem', textAlign: 'center', fontSize: '0.825rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <Lightbulb size={24} style={{ margin: '0 auto 0.75rem', color: '#fbbf24', opacity: 0.8 }} />
                  <p style={{ margin: 0 }}>
                    Stuck or getting an unexpected error? Request a progressive clue or have BugBuddy explain the mistake.
                  </p>
                </div>
              )}

              {/* Action Buttons in Mentor Panel */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  id="get-hint-btn"
                  onClick={handleHintRequest}
                  disabled={hintLoading || explainLoading || currentHintLevel >= 3}
                  className="btn-primary"
                  style={{
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    padding: '0.55rem',
                    opacity: (hintLoading || explainLoading || currentHintLevel >= 3) ? 0.6 : 1,
                    cursor: (hintLoading || explainLoading || currentHintLevel >= 3) ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Lightbulb size={14} />
                  {currentHintLevel === 0
                    ? 'Get Level 1 Clue'
                    : currentHintLevel === 1
                    ? 'Get Level 2: Next Step'
                    : currentHintLevel === 2
                    ? 'Get Level 3: Targeted Correction'
                    : 'All 3 Hints Revealed'}
                </button>

                <button
                  id="explain-error-btn"
                  onClick={handleExplainRequest}
                  disabled={hintLoading || explainLoading || !activeError}
                  className="btn-secondary"
                  style={{
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    padding: '0.55rem',
                    opacity: (hintLoading || explainLoading || !activeError) ? 0.45 : 1,
                    cursor: (hintLoading || explainLoading || !activeError) ? 'not-allowed' : 'pointer',
                  }}
                  title={activeError ? 'Explain what went wrong in your run' : 'Run or submit code to detect errors first'}
                >
                  <BookOpen size={14} />
                  {explainLoading ? 'Explaining...' : 'Explain the Observed Error'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Reset Code */}
      <AnimatePresence>
        {showResetModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                padding: '1.5rem',
                maxWidth: '420px',
                width: '100%',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                Reset Code to Starter?
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                This will revert your {language.toUpperCase()} code back to the problem's initial template. Any unsubmitted code for this language will be lost.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button onClick={() => setShowResetModal(false)} className="btn-ghost" style={{ fontSize: '0.85rem' }}>
                  Cancel
                </button>
                <button onClick={handleConfirmReset} className="btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444', fontSize: '0.85rem' }}>
                  Yes, Reset Code
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recurring Mistake Intervention Modal */}
      <InterventionModal
        data={interventionData}
        onClose={() => setInterventionData(null)}
        onComplete={() => setInterventionData(null)}
      />

      <style>{`
        @media (max-width: 1024px) {
          .workspace-mobile-tabs {
            display: flex !important;
          }
          .mobile-hidden {
            display: none !important;
          }
          .workspace-col-1, .workspace-col-2, .workspace-col-3 {
            width: 100% !important;
            max-width: none !important;
            min-width: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
