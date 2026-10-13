/**
 * ArcadePage.jsx
 * 
 * Central Arcade Hub for BugBuddy.
 * Displays player wallet, daily challenges, game library cards,
 * achievements showcase, and shortcuts to Shop & Leaderboards.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Gamepad2, Coins, Trophy, ShoppingBag, Sparkles,
  Bug, Compass, Zap, ArrowRight, CheckCircle2,
  Volume2, VolumeX, Flame, Award, Clock
} from 'lucide-react';
import BugMascot from '../components/arcade/BugMascot';
import { useArcade } from '../context/ArcadeContext';
import arcadeApi from '../services/arcadeApi';

export default function ArcadePage() {
  const navigate = useNavigate();
  const {
    coins,
    arcadePoints,
    equippedSkin,
    equippedAccessory,
    bestScores,
    gamesPlayed,
    soundOn,
    toggleSound,
    claimDailyChallenge,
    claimAchievement,
  } = useArcade();

  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      arcadeApi.getDailyChallenges().catch(() => ({ challenges: [] })),
      arcadeApi.getAchievements().catch(() => ({ achievements: [] })),
    ])
      .then(([chalRes, achRes]) => {
        setDailyChallenges(chalRes.challenges || []);
        setAchievements(achRes.achievements || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleClaimChallenge = async (chId) => {
    try {
      await claimDailyChallenge(chId);
      setDailyChallenges((prev) =>
        prev.map((c) => (c.challengeId === chId ? { ...c, claimed: true } : c))
      );
    } catch (err) {
      console.warn('Claim error:', err.message);
    }
  };

  const handleClaimAchievement = async (achId) => {
    try {
      await claimAchievement(achId);
      setAchievements((prev) =>
        prev.map((a) => (a.id === achId ? { ...a, isClaimed: true } : a))
      );
    } catch (err) {
      console.warn('Achievement claim error:', err.message);
    }
  };

  const GAME_CARDS = [
    {
      id: 'bug-hunt',
      title: 'Bug Hunt',
      subtitle: 'Code Inspection Sprint',
      desc: 'Inspect Python & Java code snippets, identify faulty lines, and build knowledge streaks.',
      icon: Bug,
      color: '#10b981',
      bgGrad: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%)',
      badge: 'EDUCATIONAL DEBUGGING',
      bestScore: bestScores?.bugHunt || 0,
      playedCount: gamesPlayed?.bugHunt || 0,
      route: '/arcade/bug-hunt',
    },
    {
      id: 'logic-blocks',
      title: 'Logic Blocks',
      subtitle: 'Algorithmic Maze Puzzle',
      desc: 'Assemble execution blocks (Forward, Turn, Loops) to guide BugBuddy through firewall mazes.',
      icon: Compass,
      color: '#38bdf8',
      bgGrad: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(2, 132, 199, 0.05) 100%)',
      badge: 'ALGORITHM SEQUENCING',
      bestScore: bestScores?.logicBlocks || 0,
      playedCount: gamesPlayed?.logicBlocks || 0,
      route: '/arcade/logic-blocks',
    },
    {
      id: 'output-rush',
      title: 'Output Rush',
      subtitle: 'Mental Code Tracing',
      desc: 'Race against the clock to predict stdout terminal output across tricky Python and Java snippets.',
      icon: Zap,
      color: '#ec4899',
      bgGrad: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(190, 24, 93, 0.05) 100%)',
      badge: 'SPEED TRACING',
      bestScore: bestScores?.outputRush || 0,
      playedCount: gamesPlayed?.outputRush || 0,
      route: '/arcade/output-rush',
    },
    {
      id: 'coin-dash',
      title: 'Coin Dash',
      subtitle: 'Reflex Endless Runner',
      desc: 'Jump over firewalls, duck under glitch drones, and collect gold coins across a retro cyber grid.',
      icon: Coins,
      color: '#fbbf24',
      bgGrad: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%)',
      badge: 'ARCADE RUNNER',
      bestScore: bestScores?.coinDash || 0,
      playedCount: gamesPlayed?.coinDash || 0,
      route: '/arcade/coin-dash',
    },
  ];

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* --- HERO BANNER --- */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, color: '#34d399', marginBottom: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <Sparkles size={13} /> BUGBUDDY ARCADE
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            Take a break. Play a little. Learn a lot.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0 0 1.5rem', maxWidth: '520px', lineHeight: 1.6 }}>
            Master debugging concepts through playful mini-games. Earn virtual coins to customize your BugBuddy mascot in the cosmetic shop!
          </p>

          {/* Quick Action Navigation Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/arcade/coin-dash')}
              className="btn-primary"
              style={{ gap: '0.5rem', fontSize: '0.88rem', padding: '0.55rem 1.1rem', background: '#f59e0b', borderColor: '#f59e0b', color: '#090d16' }}
            >
              <Coins size={16} /> Play Featured: Coin Dash 2.0
            </button>
            <button
              onClick={() => navigate('/arcade/shop')}
              className="btn-secondary"
              style={{ gap: '0.5rem', fontSize: '0.88rem', padding: '0.55rem 1.1rem' }}
            >
              <ShoppingBag size={16} /> Cosmetic Shop
            </button>
            <button
              onClick={() => navigate('/arcade/leaderboard')}
              className="btn-secondary"
              style={{ gap: '0.5rem', fontSize: '0.88rem', padding: '0.55rem 1.1rem' }}
            >
              <Trophy size={16} /> Leaderboards
            </button>
            <button
              onClick={toggleSound}
              className="btn-secondary"
              style={{ padding: '0.55rem', display: 'flex', alignItems: 'center' }}
              title={soundOn ? 'Arcade Audio: Enabled' : 'Arcade Audio: Muted'}
            >
              {soundOn ? <Volume2 size={16} color="#10b981" /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        {/* Mascot & Live Wallet Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <BugMascot mood="happy" skin={equippedSkin} accessory={equippedAccessory} size={130} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Your Equipped BugBuddy
            </span>
          </div>

          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              minWidth: '180px',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Coin Wallet
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🪙 {coins}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Arcade Points
              </span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
                ⭐ {arcadePoints}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- DAILY CHALLENGES STRIP --- */}
      {dailyChallenges.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={20} color="#f59e0b" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Daily Objectives</h2>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Resets daily at 00:00 UTC</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {dailyChallenges.map((ch) => {
              const isReady = ch.completed && !ch.claimed;

              return (
                <div
                  key={ch.challengeId}
                  className="card"
                  style={{
                    padding: '1.15rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: isReady ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                    background: isReady ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{ch.title}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24' }}>
                        🪙 +{ch.rewardCoins}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.85rem', lineHeight: 1.5 }}>
                      {ch.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: 'var(--text-muted)' }}>
                      <span>Progress</span>
                      <span>{Math.min(ch.progress, ch.target)} / {ch.target}</span>
                    </div>

                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, (ch.progress / ch.target) * 100)}%`,
                          background: ch.completed ? '#10b981' : '#38bdf8',
                        }}
                      />
                    </div>

                    {ch.claimed ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} color="#10b981" /> Claimed today
                      </div>
                    ) : isReady ? (
                      <button
                        onClick={() => handleClaimChallenge(ch.challengeId)}
                        className="btn-primary"
                        style={{ width: '100%', fontSize: '0.75rem', padding: '0.35rem' }}
                      >
                        Claim +{ch.rewardCoins} Coins
                      </button>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        In progress...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- 4 MINI-GAMES LIBRARY --- */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
          <Gamepad2 size={20} color="#10b981" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Arcade Games</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {GAME_CARDS.map((game) => {
            const Icon = game.icon;

            return (
              <motion.div
                key={game.id}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: game.bgGrad,
                  border: `1px solid ${game.color}25`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${game.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} color={game.color} />
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: game.color, letterSpacing: '0.04em', background: `${game.color}15`, padding: '3px 8px', borderRadius: '6px' }}>
                      {game.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                    {game.title}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: game.color, fontWeight: 600, marginBottom: '0.5rem' }}>
                    {game.subtitle}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                    {game.desc}
                  </p>
                </div>

                <div>
                  {/* Game Stats pill */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Best Score: <strong style={{ color: 'var(--text-primary)' }}>{game.bestScore}</strong></span>
                    <span style={{ color: 'var(--text-muted)' }}>Played: <strong style={{ color: 'var(--text-primary)' }}>{game.playedCount}</strong></span>
                  </div>

                  <button
                    onClick={() => navigate(game.route)}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      background: game.color,
                      borderColor: game.color,
                      color: game.id === 'coin-dash' ? '#0f172a' : '#ffffff',
                    }}
                  >
                    Play {game.title} <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* --- UNLOCKED ACHIEVEMENTS SHOWCASE --- */}
      {achievements.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="#a855f7" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Achievements Showcase</h2>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {achievements.filter((a) => a.isUnlocked).length} of {achievements.length} Unlocked
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {achievements.slice(0, 6).map((ach) => {
              const isUnlocked = ach.isUnlocked;
              const isClaimed = ach.isClaimed;

              return (
                <div
                  key={ach.id}
                  className="card"
                  style={{
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    opacity: isUnlocked ? 1 : 0.55,
                    border: isUnlocked && !isClaimed ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isUnlocked ? 'rgba(168, 85, 247, 0.2)' : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Award size={18} color={isUnlocked ? '#c084fc' : '#64748b'} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ach.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ach.description}
                    </div>
                  </div>

                  {isUnlocked && !isClaimed && (
                    <button
                      onClick={() => handleClaimAchievement(ach.id)}
                      className="btn-primary"
                      style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', flexShrink: 0 }}
                    >
                      +{ach.rewardCoins} 🪙
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
