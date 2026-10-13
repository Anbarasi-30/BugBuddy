/**
 * OutputRushGame.jsx
 * 
 * BugBuddy Arcade 2.0: Output Rush (High-Speed Mental Compiler)
 * 102 verified code-tracing challenges across Python and Java tracks.
 * Features:
 * - Language tracks: Python, Java, or Blitz (Mixed)
 * - Animated retro terminal simulator with stdout reveal
 * - Rapid streak combo multipliers (up to 5x) with clutch time bonus (+2s)
 * - Mental compile speed analytics (seconds/problem)
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal, CheckCircle2, XCircle, ArrowRight, RotateCcw,
  Volume2, VolumeX, Sparkles, Award, Zap, HelpCircle, Clock,
  Cpu, Activity
} from 'lucide-react';

import BugMascot from './BugMascot';
import { useArcade } from '../../context/ArcadeContext';
import {
  playClickSound, playSuccessSound, playErrorSound, playCoinSound
} from '../../utils/arcadeAudio';
import arcadeApi from '../../services/arcadeApi';

export default function OutputRushGame({ onBackToHub }) {
  const { finalizeSession, soundOn, toggleSound, equippedSkin, equippedAccessory } = useArcade();

  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('all'); // 'all' | 'python' | 'java'
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Game state
  const [gameState, setGameState] = useState('intro'); // 'intro' | 'playing' | 'revealed' | 'game_over'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState('');
  const [mascotMood, setMascotMood] = useState('idle');

  // Performance metrics
  const [responseTimes, setResponseTimes] = useState([]);
  const roundStartTimeRef = useRef(Date.now());

  const timerRef = useRef(null);

  // Load question library from backend
  useEffect(() => {
    arcadeApi.getGameQuestions('output_rush')
      .then((data) => {
        const qs = data.questions || [];
        setAllQuestions(qs);
        filterPool(qs, selectedLanguage);
      })
      .catch((err) => console.error('[OutputRush] Load error:', err))
      .finally(() => setLoading(false));
  }, []);

  const filterPool = (pool, lang) => {
    let filtered = pool;
    if (lang === 'python') filtered = pool.filter((q) => q.language === 'python');
    else if (lang === 'java') filtered = pool.filter((q) => q.language === 'java');

    // Shuffle pool
    const copy = [...filtered];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setActiveQuestions(copy);
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    filterPool(allQuestions, lang);
  };

  // Timer countdown
  useEffect(() => {
    if (gameState === 'playing') {
      roundStartTimeRef.current = Date.now();
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
    filterPool(allQuestions, selectedLanguage);
    setGameState('playing');
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setEarnedCoins(0);
    setSelectedAnswer(null);
    setTimeLeft(20);
    setTerminalOutput('');
    setResponseTimes([]);
    setMascotMood('idle');
  };

  const handleTimeUp = () => {
    setIsCorrect(false);
    setSelectedAnswer('__TIMEOUT__');
    setMascotMood('sad');
    playErrorSound();
    setStreak(0);
    revealTerminal(currentQ?.correctAnswer || 'None', false);
  };

  const handleSelectOption = (opt) => {
    if (gameState !== 'playing') return;
    playClickSound();
    clearInterval(timerRef.current);

    const elapsed = (Date.now() - roundStartTimeRef.current) / 1000;
    setResponseTimes((prev) => [...prev, elapsed]);

    setSelectedAnswer(opt);
    const correct = opt === currentQ.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      playSuccessSound();
      const speedMultiplier = Math.max(1, Math.min(3, Math.floor(timeLeft / 5)));
      const streakMultiplier = Math.min(5, 1 + streak);
      const roundPts = 100 * streakMultiplier + timeLeft * 10;
      const roundCoins = 6 + (streak >= 3 ? 6 : streak >= 1 ? 2 : 0);

      setScore((s) => s + roundPts);
      setEarnedCoins((c) => c + roundCoins);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > maxStreak) setMaxStreak(nextStreak);
      setMascotMood('happy');
    } else {
      playErrorSound();
      setStreak(0);
      setMascotMood('thinking');
    }

    revealTerminal(currentQ.correctAnswer, correct);
  };

  const revealTerminal = (realOutput, correct) => {
    const prompt = currentQ.language === 'python' ? '$ python3 script.py' : '$ javac Main.java && java Main';
    setTerminalOutput(`${prompt}\n${realOutput}`);
    setGameState('revealed');
  };

  const handleNextRound = () => {
    playClickSound();
    if (currentIndex + 1 < activeQuestions.length && currentIndex < 5) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(20);
      setTerminalOutput('');
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
      const finalCoins = Math.min(60, earnedCoins + (score > 600 ? 15 : 0));
      const arcadePoints = Math.round(score * 1.2);

      await finalizeSession({
        gameId: 'output_rush',
        score,
        coinsEarned: finalCoins,
        arcadePointsEarned: arcadePoints,
        metadata: {
          track: selectedLanguage,
          roundsPlayed: Math.min(6, currentIndex + 1),
          maxStreak,
        },
        idempotencyKey: `outputrush_${Date.now()}_${Math.random()}`,
      });
    } catch (err) {
      console.warn('[OutputRush] Session finalize note:', err.message);
    }
  };

  const avgCompileSpeed = responseTimes.length
    ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
    : '2.5';

  if (loading || !currentQ) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
        Compiling Output Rush challenges...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '1rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} color="#ec4899" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Output Rush 2.0</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Mental Compiler Sprint • {allQuestions.length} Questions
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

      {/* INTRO SCREEN WITH TRACK SELECTOR */}
      {gameState === 'intro' && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <BugMascot mood="excited" skin={equippedSkin} accessory={equippedAccessory} size={120} style={{ margin: '0 auto 1.25rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Mental Execution Sprint</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.5, fontSize: '0.88rem' }}>
            Predict stdout values for tricky snippets before time runs out. Stack consecutive correct answers to trigger up to 5x Streak surges!
          </p>

          {/* Track Selection */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            {[
              { id: 'all', label: 'Mixed Blitz' },
              { id: 'python', label: 'Python Track' },
              { id: 'java', label: 'Java Track' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => handleLanguageChange(t.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: selectedLanguage === t.id ? 'rgba(236, 72, 153, 0.2)' : 'var(--bg-secondary)',
                  border: selectedLanguage === t.id ? '1.5px solid #ec4899' : '1px solid var(--border-subtle)',
                  color: selectedLanguage === t.id ? '#f472b6' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button onClick={startGame} className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2.25rem', gap: '0.5rem' }}>
            <Sparkles size={18} /> Launch 6-Round Blitz
          </button>
        </motion.div>
      )}

      {/* PLAYING / REVEALED SCREEN */}
      {(gameState === 'playing' || gameState === 'revealed') && currentQ && (
        <div>
          {/* Status HUD */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Round</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{currentIndex + 1} / 6</div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</span>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ec4899' }}>{score}</div>
              </div>
              {streak > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(236, 72, 153, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
                  <span>⚡</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ec4899' }}>
                    {streak + 1}x Multiplier
                  </span>
                </div>
              )}
            </div>

            {/* Timer countdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '90px', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(timeLeft / 20) * 100}%`,
                    background: timeLeft > 10 ? '#ec4899' : timeLeft > 5 ? '#f59e0b' : '#ef4444',
                    transition: 'width 1s linear',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: timeLeft <= 5 ? '#ef4444' : 'var(--text-primary)' }}>
                {timeLeft}s
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 180px', gap: '1rem', alignItems: 'start' }}>
            {/* Snippet Card */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ec4899', textTransform: 'uppercase' }}>
                  {currentQ.language} Runtime
                </span>
                <span className={`badge badge-${currentQ.difficulty || 'medium'}`}>
                  {currentQ.difficulty || 'medium'}
                </span>
              </div>

              {/* Code Snippet Box */}
              <div
                style={{
                  background: '#070b12',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.88rem',
                  lineHeight: '1.6',
                  color: '#e2e8f0',
                  marginBottom: '1rem',
                  whiteSpace: 'pre',
                  overflowX: 'auto',
                }}
              >
                {currentQ.snippet.join('\n')}
              </div>

              {/* Prompt */}
              <div style={{ marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.88rem' }}>
                What will be printed to stdout?
              </div>

              {/* Prediction Options */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {currentQ.options.map((opt, oIdx) => {
                  const isChosen = selectedAnswer === opt;
                  const isAnswer = opt === currentQ.correctAnswer;

                  let border = 'var(--border-subtle)';
                  let bg = 'var(--bg-secondary)';
                  let color = 'var(--text-primary)';

                  if (gameState === 'revealed') {
                    if (isAnswer) {
                      border = '#10b981';
                      bg = 'rgba(16, 185, 129, 0.15)';
                      color = '#34d399';
                    } else if (isChosen && !isCorrect) {
                      border = '#ef4444';
                      bg = 'rgba(239, 68, 68, 0.15)';
                      color = '#f87171';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(opt)}
                      disabled={gameState !== 'playing'}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: `1px solid ${border}`,
                        background: bg,
                        color,
                        textAlign: 'center',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: gameState === 'playing' ? 'pointer' : 'default',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mascot Panel */}
            <div className="card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <BugMascot mood={mascotMood} skin={equippedSkin} accessory={equippedAccessory} size={110} />
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {mascotMood === 'happy'
                  ? 'Accurate trace!'
                  : mascotMood === 'thinking'
                  ? 'Double check types...'
                  : mascotMood === 'sad'
                  ? 'Clock expired!'
                  : 'Calculate mentally!'}
              </div>
            </div>
          </div>

          {/* SIMULATED TERMINAL STDOUT CARD */}
          <AnimatePresence>
            {gameState === 'revealed' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card"
                style={{
                  marginTop: '1rem',
                  padding: '1.25rem',
                  border: isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  background: '#040711',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Terminal size={18} color="#10b981" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                      Terminal Console
                    </span>
                  </div>
                  <button onClick={handleNextRound} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', gap: '0.4rem' }}>
                    {currentIndex + 1 < 6 ? 'Next Round' : 'See Results'} <ArrowRight size={14} />
                  </button>
                </div>

                {/* Console Output */}
                <div
                  style={{
                    background: '#02040a',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.82rem',
                    color: '#4ade80',
                    lineHeight: 1.5,
                    marginBottom: '0.75rem',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {terminalOutput}
                </div>

                {/* Pedagogical Explanation */}
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {currentQ.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* GAME OVER SUMMARY SCREEN */}
      {gameState === 'game_over' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <BugMascot mood="celebrate" skin={equippedSkin} accessory={equippedAccessory} size={130} style={{ marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>Sprint Complete!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            High-speed compiler run evaluated! Here are your mental execution metrics:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', maxWidth: '580px', margin: '0 auto 2rem' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ec4899' }}>{score}</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Coins</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>+{earnedCoins}</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Max Streak</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fbbf24' }}>{maxStreak}x</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Avg Speed</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>{avgCompileSpeed}s</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button onClick={startGame} className="btn-primary" style={{ gap: '0.5rem' }}>
              <RotateCcw size={16} /> Play Again
            </button>
            <button onClick={onBackToHub} className="btn-secondary">
              Arcade Hub
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
