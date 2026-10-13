/**
 * CoinDashGame.jsx
 * 
 * BugBuddy Arcade 2.0: Coin Dash
 * Full-featured 2D endless runner & challenge mode with 5 parallax biomes,
 * responsive HTML5 canvas, character animation states, power-ups, and audio.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins, Play, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Award,
  Pause, Shield, Zap, ArrowDown, ChevronRight, Compass, CheckCircle2
} from 'lucide-react';

import BugMascot from './BugMascot';
import { useArcade } from '../../context/ArcadeContext';
import {
  playJumpSound, playCoinSound, playErrorSound, playSuccessSound
} from '../../utils/arcadeAudio';
import arcadeApi from '../../services/arcadeApi';
import {
  drawParallaxBackground,
  drawMascotPlayer,
  drawObstacles,
  drawCollectibles,
  drawParticles,
} from './coinDashRenderer';

const DEFAULT_ENVIRONMENTS = [
  { id: 'cyber_grid', name: 'Cyber Grid', unlockDistance: 0, skyGradient: ['#050811', '#0b1329'], groundColor: '#0f172a', neonColor: '#10b981', particleColor: '#38bdf8' },
  { id: 'bug_forest', name: 'Bug Forest', unlockDistance: 250, skyGradient: ['#041a12', '#083321'], groundColor: '#062817', neonColor: '#22c55e', particleColor: '#4ade80' },
  { id: 'neon_city', name: 'Neon City', unlockDistance: 500, skyGradient: ['#180527', '#2e0854'], groundColor: '#1a0c2e', neonColor: '#f43f5e', particleColor: '#ec4899' },
  { id: 'sky_islands', name: 'Sky Islands', unlockDistance: 800, skyGradient: ['#08203e', '#1e40af'], groundColor: '#172554', neonColor: '#38bdf8', particleColor: '#60a5fa' },
  { id: 'crystal_caverns', name: 'Crystal Caverns', unlockDistance: 1200, skyGradient: ['#0d041c', '#240a45'], groundColor: '#190a33', neonColor: '#a855f7', particleColor: '#c084fc' },
];

export default function CoinDashGame({ onBackToHub }) {
  const { finalizeSession, soundOn, toggleSound, equippedSkin, equippedAccessory } = useArcade();

  const canvasRef = useRef(null);
  const animFrameId = useRef(null);

  // High-level React State
  const [gameState, setGameState] = useState('intro'); // 'intro' | 'playing' | 'paused' | 'game_over'
  const [gameMode, setGameMode] = useState('endless'); // 'endless' | 'challenge'
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [environments, setEnvironments] = useState(DEFAULT_ENVIRONMENTS);
  const [currentEnvIdx, setCurrentEnvIdx] = useState(0);

  // HUD stats for React displays
  const [hudStats, setHudStats] = useState({ distance: 0, coins: 0, gems: 0, score: 0 });
  const [highScore, setHighScore] = useState(0);
  const [activeShieldTime, setActiveShieldTime] = useState(0);
  const [activeMagnetTime, setActiveMagnetTime] = useState(0);

  // Core 60fps Engine Ref
  const engineRef = useRef({
    running: false,
    previewMode: true,
    frame: 0,
    distance: 0,
    coins: 0,
    gems: 0,
    speed: 5.5,
    baseSpeed: 5.5,
    gravity: 0.65,
    groundY: 260,
    bgOffset: 0,
    player: {
      x: 90,
      y: 210,
      w: 42,
      h: 42,
      vy: 0,
      isGrounded: true,
      isDucking: false,
      jumpCount: 0,
      maxJumps: 2,
    },
    shieldRemaining: 0,
    magnetRemaining: 0,
    boostRemaining: 0,
    obstacles: [],
    coinsList: [],
    gemsList: [],
    powerupsList: [],
    particles: [],
    spawnTimer: 0,
    collectibleTimer: 0,
  });

  // Load environments and challenge objectives from backend
  useEffect(() => {
    arcadeApi.getGameQuestions('coin_dash')
      .then((data) => {
        if (data.environments?.length) setEnvironments(data.environments);
        if (data.challenges?.length) {
          setChallenges(data.challenges);
          setSelectedChallenge(data.challenges[0]);
        }
      })
      .catch((err) => console.warn('[CoinDash] Backend load fallback:', err.message));
  }, []);

  // Continuous Game Loop & Preview Animation
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const eng = engineRef.current;
      const canvas = canvasRef.current;

      if (canvas) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        eng.frame += 1;
        const curEnv = environments[currentEnvIdx] || DEFAULT_ENVIRONMENTS[0];

        // Background scroll
        const scrollSpeed = eng.running ? eng.speed : 1.5;
        eng.bgOffset += scrollSpeed;

        // Render Parallax Environment
        drawParallaxBackground(ctx, w, h, eng.groundY, curEnv, eng.bgOffset, eng.frame);

        if (eng.running) {
          // Physics Update
          eng.distance += scrollSpeed * 0.05;

          // Power-up count-downs
          if (eng.shieldRemaining > 0) eng.shieldRemaining -= 1;
          if (eng.magnetRemaining > 0) eng.magnetRemaining -= 1;
          if (eng.boostRemaining > 0) {
            eng.boostRemaining -= 1;
            eng.speed = eng.baseSpeed * 1.5;
          } else {
            eng.speed = eng.baseSpeed + Math.min(4.5, eng.distance * 0.003);
          }

          // Player Physics
          const p = eng.player;
          p.vy += eng.gravity;
          p.y += p.vy;

          const targetGround = eng.groundY - p.h;
          if (p.y >= targetGround) {
            p.y = targetGround;
            p.vy = 0;
            p.isGrounded = true;
            p.jumpCount = 0;
          }

          // Running footstep dust particles
          if (p.isGrounded && eng.frame % 6 === 0) {
            eng.particles.push({
              x: p.x - 4,
              y: p.y + p.h - 2,
              vx: -(scrollSpeed * 0.4 + Math.random() * 2),
              vy: -(Math.random() * 1.5),
              size: 2.5 + Math.random() * 2,
              life: 1.0,
              color: curEnv.neonColor || '#10b981',
            });
          }

          // Magnet coin pull
          if (eng.magnetRemaining > 0) {
            eng.coinsList.forEach((c) => {
              const dx = (p.x + p.w / 2) - c.x;
              const dy = (p.y + p.h / 2) - c.y;
              const dist = Math.hypot(dx, dy);
              if (dist < 180) {
                c.x += (dx / dist) * 7.5;
                c.y += (dy / dist) * 7.5;
              }
            });
          }

          // Spawn Obstacles
          eng.spawnTimer += 1;
          const spawnInterval = Math.max(55, 110 - Math.floor(eng.distance * 0.05));
          if (eng.spawnTimer > spawnInterval) {
            eng.spawnTimer = 0;
            const rand = Math.random();
            if (rand < 0.35) {
              // Drone (aerial obstacle, duck under)
              eng.obstacles.push({
                x: w + 20,
                y: eng.groundY - 60,
                w: 32,
                h: 24,
                type: 'drone',
              });
            } else if (rand < 0.6) {
              // Tall laser barrier
              eng.obstacles.push({
                x: w + 20,
                y: eng.groundY - 55,
                w: 16,
                h: 55,
                type: 'laser',
              });
            } else {
              // Ground spikes
              eng.obstacles.push({
                x: w + 20,
                y: eng.groundY - 32,
                w: 26,
                h: 32,
                type: 'spike',
              });
            }
          }

          // Spawn Collectibles
          eng.collectibleTimer += 1;
          if (eng.collectibleTimer > 60) {
            eng.collectibleTimer = 0;
            const cRand = Math.random();
            const spawnY = eng.groundY - (30 + Math.random() * 65);

            if (cRand < 0.12) {
              // Power-up
              const kinds = ['shield', 'magnet', 'boost'];
              eng.powerupsList.push({
                x: w + 20,
                y: spawnY,
                kind: kinds[Math.floor(Math.random() * kinds.length)],
              });
            } else if (cRand < 0.25) {
              // Rare Emerald Gem
              eng.gemsList.push({ x: w + 20, y: spawnY });
            } else {
              // Coin arc (3 in a row)
              for (let i = 0; i < 3; i++) {
                eng.coinsList.push({ x: w + 20 + i * 28, y: spawnY - Math.sin((i / 2) * Math.PI) * 15 });
              }
            }
          }

          // Move & Filter Obstacles
          for (let i = eng.obstacles.length - 1; i >= 0; i--) {
            const obs = eng.obstacles[i];
            obs.x -= eng.speed;

            // Collision Check with Player
            const px = p.x;
            const py = p.y;
            const pw = p.w;
            const ph = p.h;

            const hitX = px < obs.x + obs.w && px + pw > obs.x;
            const hitY = py < obs.y + obs.h && py + ph > obs.y;

            if (hitX && hitY) {
              if (eng.boostRemaining > 0) {
                // Smashed obstacle during boost
                spawnExplosion(eng, obs.x, obs.y, '#f59e0b', 12);
                eng.obstacles.splice(i, 1);
                continue;
              } else if (eng.shieldRemaining > 0) {
                // Shield absorbs impact
                eng.shieldRemaining = 0;
                spawnExplosion(eng, obs.x, obs.y, '#38bdf8', 15);
                eng.obstacles.splice(i, 1);
                playSuccessSound();
                continue;
              } else {
                // Fatal Collision
                triggerGameOver();
                break;
              }
            }

            if (obs.x < -60) eng.obstacles.splice(i, 1);
          }

          // Move & Collect Coins
          for (let i = eng.coinsList.length - 1; i >= 0; i--) {
            const c = eng.coinsList[i];
            c.x -= eng.speed;
            if (Math.hypot((p.x + p.w / 2) - c.x, (p.y + p.h / 2) - c.y) < 26) {
              eng.coins += 1;
              playCoinSound();
              spawnExplosion(eng, c.x, c.y, '#fbbf24', 6);
              eng.coinsList.splice(i, 1);
              continue;
            }
            if (c.x < -30) eng.coinsList.splice(i, 1);
          }

          // Move & Collect Gems
          for (let i = eng.gemsList.length - 1; i >= 0; i--) {
            const g = eng.gemsList[i];
            g.x -= eng.speed;
            if (Math.hypot((p.x + p.w / 2) - g.x, (p.y + p.h / 2) - g.y) < 28) {
              eng.gems += 1;
              playSuccessSound();
              spawnExplosion(eng, g.x, g.y, '#10b981', 12);
              eng.gemsList.splice(i, 1);
              continue;
            }
            if (g.x < -30) eng.gemsList.splice(i, 1);
          }

          // Move & Collect Power-ups
          for (let i = eng.powerupsList.length - 1; i >= 0; i--) {
            const pu = eng.powerupsList[i];
            pu.x -= eng.speed;
            if (Math.hypot((p.x + p.w / 2) - pu.x, (p.y + p.h / 2) - pu.y) < 30) {
              playSuccessSound();
              if (pu.kind === 'shield') eng.shieldRemaining = 600; // 10 seconds
              if (pu.kind === 'magnet') eng.magnetRemaining = 480; // 8 seconds
              if (pu.kind === 'boost') eng.boostRemaining = 240;  // 4 seconds
              spawnExplosion(eng, pu.x, pu.y, '#a855f7', 15);
              eng.powerupsList.splice(i, 1);
              continue;
            }
            if (pu.x < -30) eng.powerupsList.splice(i, 1);
          }

          // Biome auto-progression by distance
          if (eng.distance >= 1200 && currentEnvIdx < 4) setCurrentEnvIdx(4);
          else if (eng.distance >= 800 && currentEnvIdx < 3) setCurrentEnvIdx(3);
          else if (eng.distance >= 500 && currentEnvIdx < 2) setCurrentEnvIdx(2);
          else if (eng.distance >= 250 && currentEnvIdx < 1) setCurrentEnvIdx(1);

          // Update HUD periodic state
          if (eng.frame % 5 === 0) {
            setHudStats({
              distance: Math.floor(eng.distance),
              coins: eng.coins,
              gems: eng.gems,
              score: Math.floor(eng.distance * 1.5 + eng.coins * 10 + eng.gems * 25),
            });
            setActiveShieldTime(Math.ceil(eng.shieldRemaining / 60));
            setActiveMagnetTime(Math.ceil(eng.magnetRemaining / 60));
          }
        } else {
          // Preview Idle Pose when in Intro or Paused
          const p = eng.player;
          p.y = eng.groundY - p.h;
        }

        // Particle System Update
        for (let i = eng.particles.length - 1; i >= 0; i--) {
          const pt = eng.particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life -= 0.03;
          if (pt.life <= 0) eng.particles.splice(i, 1);
        }

        // Render Entities
        drawCollectibles(ctx, eng.coinsList, eng.gemsList, eng.powerupsList, eng.frame);
        drawObstacles(ctx, eng.obstacles, curEnv);
        drawParticles(ctx, eng.particles);
        drawMascotPlayer(
          ctx,
          eng.player,
          equippedSkin,
          eng.shieldRemaining > 0,
          eng.magnetRemaining > 0,
          eng.frame
        );
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameId.current);
  }, [environments, currentEnvIdx, equippedSkin]);

  function spawnExplosion(eng, x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      eng.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        life: 1.0,
        color,
      });
    }
  }

  // Keyboard input bindings
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(e.code)) {
        e.preventDefault();
      }

      if (gameState === 'intro' || gameState === 'game_over') {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          startGame();
        }
        return;
      }

      const eng = engineRef.current;
      const p = eng.player;

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (p.jumpCount < p.maxJumps) {
          p.vy = -12.5;
          p.isGrounded = false;
          p.jumpCount += 1;
          playJumpSound();
          spawnExplosion(eng, p.x + p.w / 2, p.y + p.h, '#38bdf8', 5);
        }
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        p.isDucking = true;
        p.h = 24;
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        togglePause();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        const p = engineRef.current.player;
        p.isDucking = false;
        p.h = 42;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const startGame = () => {
    const eng = engineRef.current;
    eng.running = true;
    eng.previewMode = false;
    eng.distance = 0;
    eng.coins = 0;
    eng.gems = 0;
    eng.speed = eng.baseSpeed;
    eng.obstacles = [];
    eng.coinsList = [];
    eng.gemsList = [];
    eng.powerupsList = [];
    eng.particles = [];
    eng.spawnTimer = 40;
    eng.collectibleTimer = 20;
    eng.shieldRemaining = 0;
    eng.magnetRemaining = 0;
    eng.boostRemaining = 0;

    const p = eng.player;
    p.y = eng.groundY - p.h;
    p.vy = 0;
    p.isGrounded = true;
    p.isDucking = false;
    p.jumpCount = 0;

    setGameState('playing');
  };

  const togglePause = () => {
    if (gameState === 'playing') {
      engineRef.current.running = false;
      setGameState('paused');
    } else if (gameState === 'paused') {
      engineRef.current.running = true;
      setGameState('playing');
    }
  };

  const triggerGameOver = () => {
    const eng = engineRef.current;
    eng.running = false;
    playErrorSound();

    const finalDist = Math.floor(eng.distance);
    const finalCoins = eng.coins;
    const finalGems = eng.gems;

    setHudStats({
      distance: finalDist,
      coins: finalCoins,
      gems: finalGems,
      score: Math.floor(finalDist * 1.5 + finalCoins * 10 + finalGems * 25),
    });

    if (finalDist > highScore) setHighScore(finalDist);
    setGameState('game_over');

    // Server session reward finalization
    const coinsEarned = Math.min(60, Math.floor(finalCoins + finalGems * 3) + (finalDist > 300 ? 10 : 0));
    const arcadePoints = Math.round(finalDist + finalCoins * 6 + finalGems * 20);

    finalizeSession({
      gameId: 'coin_dash',
      score: finalDist,
      coinsEarned,
      arcadePointsEarned: arcadePoints,
      metadata: {
        distanceMeters: finalDist,
        coinsCollected: finalCoins,
        gemsCollected: finalGems,
        mode: gameMode,
        environment: environments[currentEnvIdx]?.id || 'cyber_grid',
      },
      idempotencyKey: `coindash_${Date.now()}_${Math.random()}`,
    }).catch((e) => console.warn('[CoinDash] Finalize note:', e.message));
  };

  const handleJumpPress = () => {
    if (gameState !== 'playing') {
      startGame();
      return;
    }
    const eng = engineRef.current;
    const p = eng.player;
    if (p.jumpCount < p.maxJumps) {
      p.vy = -12.5;
      p.isGrounded = false;
      p.jumpCount += 1;
      playJumpSound();
    }
  };

  const curEnv = environments[currentEnvIdx] || DEFAULT_ENVIRONMENTS[0];

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '1rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Coins size={22} color="#fbbf24" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Coin Dash 2.0</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Biome: <strong style={{ color: curEnv.neonColor }}>{curEnv.name}</strong> • 2D Parallax Runner
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {gameState === 'playing' && (
            <button
              onClick={togglePause}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', gap: '0.3rem' }}
            >
              <Pause size={15} /> Pause
            </button>
          )}
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

      {/* Main Canvas Stage */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: 'hidden',
          position: 'relative',
          borderRadius: '16px',
          border: `1.5px solid ${curEnv.neonColor ? `${curEnv.neonColor}44` : 'var(--border-subtle)'}`,
          boxShadow: `0 10px 30px -10px ${curEnv.neonColor ? `${curEnv.neonColor}22` : 'rgba(0,0,0,0.5)'}`,
          background: '#040711',
        }}
      >
        <canvas
          ref={canvasRef}
          width={840}
          height={320}
          onClick={handleJumpPress}
          style={{ width: '100%', height: 'auto', display: 'block', cursor: 'pointer' }}
        />

        {/* Live HUD Floating Indicators during active play */}
        {gameState === 'playing' && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '16px',
              right: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', background: 'rgba(5, 8, 17, 0.75)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Distance</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>{hudStats.distance}m</div>
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Coins</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24' }}>{hudStats.coins}</div>
              </div>
              {hudStats.gems > 0 && (
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Gems</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981' }}>{hudStats.gems}</div>
                </div>
              )}
            </div>

            {/* Active Power-up Badges */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {activeShieldTime > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(56, 189, 248, 0.25)', border: '1px solid #38bdf8', padding: '4px 8px', borderRadius: '8px', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700 }}>
                  <Shield size={14} /> {activeShieldTime}s
                </div>
              )}
              {activeMagnetTime > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(234, 179, 8, 0.25)', border: '1px solid #fbbf24', padding: '4px 8px', borderRadius: '8px', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700 }}>
                  <Zap size={14} /> Magnet {activeMagnetTime}s
                </div>
              )}
            </div>
          </div>
        )}

        {/* INTRO SCREEN OVERLAY */}
        {gameState === 'intro' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(4, 7, 17, 0.82)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ maxWidth: '480px' }}>
              <BugMascot mood="happy" skin={equippedSkin} accessory={equippedAccessory} size={90} style={{ margin: '0 auto 0.75rem' }} />
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>Sprint, Dodge & Collect!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                Double jump over firewalls, duck under aerial drones, and unlock all 5 dynamic biomes with real physics.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                  onClick={startGame}
                  className="btn-primary"
                  style={{ fontSize: '1rem', padding: '0.7rem 1.8rem', gap: '0.5rem' }}
                >
                  <Play size={18} fill="currentColor" /> Sprint Now (Space)
                </button>
              </div>

              {/* Controls tip */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Jump: <strong>Space / ↑</strong></span>
                <span>Double Jump: <strong>Tap Space Twice</strong></span>
                <span>Slide: <strong>↓ / S</strong></span>
              </div>
            </motion.div>
          </div>
        )}

        {/* PAUSE OVERLAY */}
        {gameState === 'paused' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(4, 7, 17, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Game Paused</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={togglePause} className="btn-primary" style={{ gap: '0.5rem' }}>
                <Play size={16} fill="currentColor" /> Resume
              </button>
              <button onClick={startGame} className="btn-secondary" style={{ gap: '0.5rem' }}>
                <RotateCcw size={16} /> Restart
              </button>
            </div>
          </div>
        )}

        {/* GAME OVER OVERLAY */}
        {gameState === 'game_over' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(4, 7, 17, 0.88)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#f87171' }}>Firewall Collision!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Great run! Practice timing your double jumps to clear staggered spike traps.
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Distance</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>{hudStats.distance}m</div>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Coins</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fbbf24' }}>+{hudStats.coins}</div>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Best</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>{highScore}m</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={startGame} className="btn-primary" style={{ gap: '0.5rem' }}>
                  <RotateCcw size={16} /> Play Again
                </button>
                <button onClick={onBackToHub} className="btn-secondary">
                  Back to Hub
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Touch Action Controls for Handheld / Tablet Screen */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', gap: '1rem' }}>
        <button
          onClick={handleJumpPress}
          className="btn-secondary"
          style={{ flex: 1, padding: '0.85rem', justifyContent: 'center', gap: '0.5rem', fontWeight: 700 }}
        >
          <Zap size={18} color="#38bdf8" /> Tap / Click to Jump
        </button>
        <button
          onMouseDown={() => { engineRef.current.player.isDucking = true; engineRef.current.player.h = 24; }}
          onMouseUp={() => { engineRef.current.player.isDucking = false; engineRef.current.player.h = 42; }}
          onTouchStart={() => { engineRef.current.player.isDucking = true; engineRef.current.player.h = 24; }}
          onTouchEnd={() => { engineRef.current.player.isDucking = false; engineRef.current.player.h = 42; }}
          className="btn-secondary"
          style={{ flex: 1, padding: '0.85rem', justifyContent: 'center', gap: '0.5rem', fontWeight: 700 }}
        >
          <ArrowDown size={18} color="#fbbf24" /> Hold to Slide
        </button>
      </div>

      {/* Mode / Challenge Objectives Drawer */}
      <div className="card" style={{ marginTop: '1.25rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={18} color="#fbbf24" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Coin Dash Objectives & Biomes</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{challenges.length || 21} Missions Available</span>
        </div>

        {/* Biomes preview bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
          {environments.map((env, idx) => {
            const isUnlocked = hudStats.distance >= env.unlockDistance || idx === 0;
            const isCurrent = currentEnvIdx === idx;
            return (
              <div
                key={env.id}
                onClick={() => setCurrentEnvIdx(idx)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '8px',
                  background: isCurrent ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
                  border: isCurrent ? '1.5px solid #10b981' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: env.neonColor }}>{env.name}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{env.unlockDistance}m+</div>
              </div>
            );
          })}
        </div>

        {/* Challenge mission preview */}
        {selectedChallenge && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
                Mission #{selectedChallenge.number}: {selectedChallenge.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {selectedChallenge.description}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
              <span style={{ color: '#cd7f32' }}>B: {selectedChallenge.targets?.bronze}</span>
              <span style={{ color: '#94a3b8' }}>S: {selectedChallenge.targets?.silver}</span>
              <span style={{ color: '#fbbf24' }}>G: {selectedChallenge.targets?.gold}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
