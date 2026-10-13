/**
 * BugHuntGame.jsx
 * 
 * BugBuddy Arcade 2.0: Bug Hunt (Detective Experience)
 * Inspect 50+ real-world code cases across Python and Java.
 * Features:
 * - Category dossiers (Loops, Arrays, Syntax, Strings, Functions, Types, Recursion)
 * - Progressive detective clue system (Category hint -> Line clue)
 * - Side-by-side buggy code vs recommended fix
 * - Post-session Case Review dossier
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bug, CheckCircle2, XCircle, ArrowRight, RotateCcw,
  Volume2, VolumeX, Sparkles, Award, HelpCircle, Lightbulb,
  Search, Filter, BookOpen, ChevronRight, Check
} from 'lucide-react';
import BugMascot from './BugMascot';
import { useArcade } from '../../context/ArcadeContext';
import {
  playClickSound, playSuccessSound, playErrorSound, playCoinSound
} from '../../utils/arcadeAudio';
import arcadeApi from '../../services/arcadeApi';

const CATEGORIES = [
  { id: 'all', label: 'All Cases' },
  { id: 'arrays', label: 'Arrays & Slicing' },
  { id: 'loops', label: 'Loops & Ranges' },
  { id: 'syntax', label: 'Syntax & Indent' },
  { id: 'strings', label: 'Strings & Formats' },
  { id: 'functions', label: 'Functions & Scope' },
  { id: 'types', label: 'Data Types & Floats' },
  { id: 'logic', label: 'Logic & Operators' },
  { id: 'recursion', label: 'Recursion & Edge' },
];

export default function BugHuntGame({ onBackToHub }) {
  const { finalizeSession, soundOn, toggleSound, equippedSkin, equippedAccessory } = useArcade();

  const [allQuestions, setAllQuestions] = useState([]);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  // Game cycle
  const [gameState, setGameState] = useState('intro'); // 'intro' | 'playing' | 'round_feedback' | 'game_over' | 'review'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [mascotMood, setMascotMood] = useState('idle');
  const [revealedClues, setRevealedClues] = useState(0); // 0 = none, 1 = category hint, 2 = line hint

  // History tracking for Case Review dossier
  const [caseHistory, setCaseHistory] = useState([]);

  const timerRef = useRef(null);

  // Fetch question library from backend
  useEffect(() => {
    arcadeApi.getGameQuestions('bug_hunt')
      .then((data) => {
        const qs = data.questions || [];
        setAllQuestions(qs);
        setActiveQuestions(qs);
      })
      .catch(() => setError('Could not load Bug Hunt cases.'))
      .finally(() => setLoading(false));
  }, []);

  // Filter questions on category or language selection
  useEffect(() => {
    let filtered = [...allQuestions];
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((q) => q.category === selectedCategory);
    }
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter((q) => q.language === selectedLanguage);
    }
    // Shuffle filtered pool
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    setActiveQuestions(filtered);
  }, [selectedCategory, selectedLanguage, allQuestions]);

  // Round Timer countdown
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, currentIndex]);

  const currentQ = activeQuestions[currentIndex] || allQuestions[0] || null;

  const startGame = () => {
    // Pick 5 questions for this investigation session
    let pool = [...activeQuestions];
    if (pool.length < 5) pool = [...allQuestions];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setActiveQuestions(pool.slice(0, 5));

    setGameState('playing');
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setEarnedCoins(0);
    setSelectedOption(null);
    setSelectedLine(null);
    setTimeLeft(30);
    setRevealedClues(0);
    setMascotMood('idle');
    setCaseHistory([]);
  };

  const handleTimeUp = () => {
    setIsCorrect(false);
    setSelectedOption(-1);
    setMascotMood('sad');
    playErrorSound();
    setStreak(0);

    setCaseHistory((prev) => [
      ...prev,
      {
        question: currentQ,
        userOption: -1,
        isCorrect: false,
        timeTaken: 30,
      },
    ]);

    setGameState('round_feedback');
  };

  const handleSelectOption = (idx) => {
    if (gameState !== 'playing') return;
    playClickSound();
    setSelectedOption(idx);
    clearInterval(timerRef.current);

    const correct = idx === currentQ.correctOptionIndex;
    setIsCorrect(correct);

    if (correct) {
      playSuccessSound();
      const timeBonus = Math.max(5, timeLeft * 2);
      const streakBonus = streak * 20;
      const cluePenalty = revealedClues * 25;
      const pointsWon = Math.max(40, 100 + timeBonus + streakBonus - cluePenalty);
      const coinsWon = 6 + (streak >= 2 ? 4 : 0);

      setScore((prev) => prev + pointsWon);
      setEarnedCoins((prev) => prev + coinsWon);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > maxStreak) setMaxStreak(nextStreak);
      setMascotMood('happy');
    } else {
      playErrorSound();
      setStreak(0);
      setMascotMood('thinking');
    }

    setCaseHistory((prev) => [
      ...prev,
      {
        question: currentQ,
        userOption: idx,
        isCorrect: correct,
        timeTaken: 30 - timeLeft,
      },
    ]);

    setGameState('round_feedback');
  };

  const requestDetectiveClue = () => {
    if (revealedClues >= 2 || gameState !== 'playing') return;
    playClickSound();
    setRevealedClues((prev) => prev + 1);
    setTimeLeft((prev) => Math.max(5, prev - 3)); // -3s deduction for requesting forensic clue
  };

  const handleNextRound = () => {
    playClickSound();
    if (currentIndex + 1 < activeQuestions.length && currentIndex < 4) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setSelectedLine(null);
      setTimeLeft(30);
      setRevealedClues(0);
      setMascotMood('idle');
      setGameState('playing');
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameState('game_over');
    setMascotMood('celebrate');
    playCoinSound();

    try {
      const finalCoins = Math.min(60, earnedCoins + (score > 350 ? 12 : 0));
      const arcadePoints = Math.round(score * 1.25);

      await finalizeSession({
        gameId: 'bug_hunt',
        score,
        coinsEarned: finalCoins,
        arcadePointsEarned: arcadePoints,
        metadata: {
          category: selectedCategory,
          language: selectedLanguage,
          roundsPlayed: Math.min(5, currentIndex + 1),
          maxStreak,
        },
        idempotencyKey: `bughunt_${Date.now()}_${Math.random()}`,
      });
    } catch (err) {
      console.warn('[BugHunt] Session finalize note:', err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
        Loading Bug Hunt case archive...
      </div>
    );
  }

  if (error || !allQuestions.length) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: '#f87171', marginBottom: '1rem' }}>{error || 'No case files found.'}</p>
        <button onClick={onBackToHub} className="btn-secondary">Return to Arcade Hub</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '1rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bug size={22} color="#10b981" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Bug Hunt 2.0</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Detective Code Inspection • {allQuestions.length} Verified Cases
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={toggleSound}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '0.45rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
            title={soundOn ? 'Sound On' : 'Sound Muted'}
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={onBackToHub} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
            Exit
          </button>
        </div>
      </div>

      {/* INTRO SCREEN WITH CASE DOSSIER PICKER */}
      {gameState === 'intro' && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <BugMascot mood="excited" skin={equippedSkin} accessory={equippedAccessory} size={110} style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Code Crime Scene Investigation</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto', fontSize: '0.88rem', lineHeight: 1.5 }}>
              A faulty script has halted production! Examine the syntax and logic, request forensic clues, and diagnose the offending bug before time runs out.
            </p>
          </div>

          {/* Dossier Filter Controls */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Select Investigation Focus:
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['all', 'python', 'java'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: selectedLanguage === lang ? '#10b981' : 'var(--bg-tertiary)',
                      color: selectedLanguage === lang ? '#020617' : 'var(--text-secondary)',
                      border: 'none',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {lang === 'all' ? 'All Languages' : lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: selectedCategory === cat.id ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-tertiary)',
                    border: selectedCategory === cat.id ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                    color: selectedCategory === cat.id ? '#34d399' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={startGame} className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2.25rem', gap: '0.5rem' }}>
              <Sparkles size={18} /> Launch Investigation (5 Rounds)
            </button>
          </div>
        </motion.div>
      )}

      {/* PLAYING / FEEDBACK SCREEN */}
      {(gameState === 'playing' || gameState === 'round_feedback') && currentQ && (
        <div>
          {/* Status HUD */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Case</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{currentIndex + 1} / 5</div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</span>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#10b981' }}>{score}</div>
              </div>
              {streak > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
                  <span>🔥</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b' }}>{streak}x Combo</span>
                </div>
              )}
            </div>

            {/* Timer and Clue Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {gameState === 'playing' && (
                <button
                  onClick={requestDetectiveClue}
                  disabled={revealedClues >= 2}
                  className="btn-secondary"
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    gap: '0.3rem',
                    color: revealedClues >= 2 ? 'var(--text-muted)' : '#f59e0b',
                    borderColor: revealedClues >= 2 ? 'transparent' : 'rgba(245, 158, 11, 0.4)',
                  }}
                  title="Reveal forensic hint (-3s)"
                >
                  <Lightbulb size={13} /> {revealedClues === 0 ? 'Clue (1/2)' : revealedClues === 1 ? 'Clue (2/2)' : 'Max Clues'}
                </button>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '80px', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(timeLeft / 30) * 100}%`,
                      background: timeLeft > 10 ? '#10b981' : timeLeft > 5 ? '#f59e0b' : '#ef4444',
                      transition: 'width 1s linear',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: timeLeft <= 5 ? '#ef4444' : 'var(--text-primary)' }}>
                  {timeLeft}s
                </span>
              </div>
            </div>
          </div>

          {/* Clue Banner (If requested) */}
          {revealedClues > 0 && gameState === 'playing' && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#fbbf24',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Lightbulb size={16} />
              <span>
                {revealedClues === 1 && `Forensic Lead: Check the "${currentQ.category}" rules carefully.`}
                {revealedClues === 2 && `Major Clue: The defect is concentrated near Line ${currentQ.bugLine}!`}
              </span>
            </motion.div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 180px', gap: '1rem', alignItems: 'start' }}>
            {/* Code Snippet Card */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                  {currentQ.language} • {currentQ.title}
                </span>
                <span className={`badge badge-${currentQ.difficulty}`}>
                  {currentQ.difficulty}
                </span>
              </div>

              {/* Code viewer with line click inspection */}
              <div
                style={{
                  background: '#070b12',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  overflowX: 'auto',
                }}
              >
                {currentQ.code.map((line, lIdx) => {
                  const lineNum = lIdx + 1;
                  const isBuggy = lineNum === currentQ.bugLine;
                  const isHighlighted = selectedLine === lineNum || (gameState === 'round_feedback' && isBuggy);

                  return (
                    <div
                      key={lIdx}
                      onClick={() => gameState === 'playing' && setSelectedLine(lineNum)}
                      style={{
                        display: 'flex',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        cursor: gameState === 'playing' ? 'pointer' : 'default',
                        background: isHighlighted
                          ? gameState === 'round_feedback'
                            ? isCorrect
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(56, 189, 248, 0.15)'
                          : 'transparent',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <span style={{ width: '28px', color: '#64748b', userSelect: 'none', textAlign: 'right', paddingRight: '12px' }}>
                        {lineNum}
                      </span>
                      <span style={{ color: isHighlighted && gameState === 'round_feedback' && isBuggy ? '#f87171' : '#e2e8f0' }}>
                        {line}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Prompt */}
              <div style={{ marginTop: '1.25rem', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Which diagnosis accurately describes the bug?
              </div>

              {/* Diagnosis Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {currentQ.options.map((opt, oIdx) => {
                  const isChosen = selectedOption === oIdx;
                  const isAnswer = oIdx === currentQ.correctOptionIndex;

                  let border = 'var(--border-subtle)';
                  let bg = 'var(--bg-secondary)';
                  let color = 'var(--text-primary)';

                  if (gameState === 'round_feedback') {
                    if (isAnswer) {
                      border = '#10b981';
                      bg = 'rgba(16, 185, 129, 0.12)';
                      color = '#34d399';
                    } else if (isChosen && !isCorrect) {
                      border = '#ef4444';
                      bg = 'rgba(239, 68, 68, 0.12)';
                      color = '#f87171';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      disabled={gameState !== 'playing'}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: `1px solid ${border}`,
                        background: bg,
                        color,
                        textAlign: 'left',
                        fontSize: '0.85rem',
                        cursor: gameState === 'playing' ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{opt}</span>
                      {gameState === 'round_feedback' && (
                        <span>
                          {isAnswer ? <CheckCircle2 size={16} color="#10b981" /> : isChosen && !isCorrect ? <XCircle size={16} color="#ef4444" /> : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mascot Side Panel */}
            <div className="card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <BugMascot mood={mascotMood} skin={equippedSkin} accessory={equippedAccessory} size={110} />
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {mascotMood === 'happy'
                  ? 'Elementary, detective!'
                  : mascotMood === 'thinking'
                  ? 'Study the clue...'
                  : mascotMood === 'sad'
                  ? 'Time expired!'
                  : 'Look for edge cases!'}
              </div>
            </div>
          </div>

          {/* Post-Round Pedagogical Explanation Card with Fix Diff */}
          <AnimatePresence>
            {gameState === 'round_feedback' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card"
                style={{
                  marginTop: '1rem',
                  padding: '1.25rem',
                  border: isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isCorrect ? <CheckCircle2 size={18} color="#10b981" /> : <HelpCircle size={18} color="#f59e0b" />}
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: isCorrect ? '#34d399' : '#fbbf24' }}>
                      {isCorrect ? 'Case Solved Successfully!' : 'Debugging Diagnosis'}
                    </h3>
                  </div>
                  <button onClick={handleNextRound} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', gap: '0.4rem' }}>
                    {currentIndex + 1 < 5 ? 'Next Case' : 'Final Results'} <ArrowRight size={14} />
                  </button>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
                  {currentQ.explanation}
                </p>

                {currentQ.fix && (
                  <div style={{ background: '#0b1120', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    <div style={{ color: '#64748b', marginBottom: '3px' }}>Recommended Correction:</div>
                    <div style={{ color: '#4ade80' }}>{currentQ.fix}</div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* GAME OVER SUMMARY SCREEN */}
      {gameState === 'game_over' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <BugMascot mood="celebrate" skin={equippedSkin} accessory={equippedAccessory} size={130} style={{ marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>Case File Closed!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Investigation complete! Review your forensic results and hone your debugging intuition.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>{score}</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Coins Won</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>+{earnedCoins}</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Streak</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{maxStreak}x</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button onClick={() => setGameState('review')} className="btn-secondary" style={{ gap: '0.5rem' }}>
              <BookOpen size={16} /> Review Case Files
            </button>
            <button onClick={startGame} className="btn-primary" style={{ gap: '0.5rem' }}>
              <RotateCcw size={16} /> New Investigation
            </button>
            <button onClick={onBackToHub} className="btn-secondary">
              Arcade Hub
            </button>
          </div>
        </motion.div>
      )}

      {/* CASE REVIEW DOSSIER SCREEN */}
      {gameState === 'review' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="#38bdf8" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Investigation Case Review</h2>
            </div>
            <button onClick={() => setGameState('game_over')} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              Back to Summary
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {caseHistory.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-secondary)',
                  border: `1px solid ${item.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  borderRadius: '10px',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {item.isCorrect ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      Case {idx + 1}: {item.question.title}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.question.language} • {item.question.category}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem' }}>
                  {item.question.explanation}
                </p>
                {item.question.fix && (
                  <div style={{ background: '#070b12', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: '#4ade80' }}>
                    Fix: {item.question.fix}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
