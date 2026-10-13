/**
 * LogicBlocksGame.jsx
 * 
 * BugBuddy Arcade 2.0: Logic Blocks (Spatial Coding Adventure)
 * 42 validated puzzles across 6 worlds featuring:
 * - Directional vector movement, obstacles, and firewalls
 * - Key collection & security door unlocking
 * - Step-by-step and fast-forward program execution
 * - 3-Star scoring criteria (Clear, All Stars, Optimal Code)
 * - World & Level Browser Drawer
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Play, RotateCcw, Trash2, ArrowUp, ChevronLeft, ChevronRight,
  Repeat, Star, ShieldAlert, Award, Sparkles, Volume2, VolumeX, Lightbulb,
  Key, Lock, FastForward, StepForward, Grid, CheckCircle2, ChevronDown
} from 'lucide-react';

import BugMascot from './BugMascot';
import { useArcade } from '../../context/ArcadeContext';
import {
  playClickSound, playSuccessSound, playErrorSound, playCoinSound
} from '../../utils/arcadeAudio';
import arcadeApi from '../../services/arcadeApi';

const DIRECTIONS = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
const DIR_ROTATION = { NORTH: 0, EAST: 90, SOUTH: 180, WEST: 270 };
const DIR_VECTORS = {
  NORTH: { dx: 0, dy: -1 },
  EAST: { dx: 1, dy: 0 },
  SOUTH: { dx: 0, dy: 1 },
  WEST: { dx: -1, dy: 0 },
};

export default function LogicBlocksGame({ onBackToHub }) {
  const { finalizeSession, soundOn, toggleSound, equippedSkin, equippedAccessory } = useArcade();

  const [worlds, setWorlds] = useState([]);
  const [levels, setLevels] = useState([]);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLevelBrowser, setShowLevelBrowser] = useState(false);
  const [selectedWorldTab, setSelectedWorldTab] = useState(1);

  // Program sequence
  const [program, setProgram] = useState([]);
  const [executing, setExecuting] = useState(false);
  const [executionSpeed, setExecutionSpeed] = useState('normal'); // 'normal' (450ms) | 'fast' (200ms)
  const [activeInstructionIdx, setActiveInstructionIdx] = useState(-1);
  const [statusMessage, setStatusMessage] = useState('');
  const [levelSolved, setLevelSolved] = useState(false);
  const [earnedStarsCount, setEarnedStarsCount] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Live entity state
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0, dir: 'EAST' });
  const [collectedStars, setCollectedStars] = useState(new Set());
  const [heldKeys, setHeldKeys] = useState(new Set());
  const [unlockedDoors, setUnlockedDoors] = useState(new Set());
  const [mascotMood, setMascotMood] = useState('idle');

  // Load levels from backend
  useEffect(() => {
    arcadeApi.getGameQuestions('logic_blocks')
      .then((data) => {
        if (data.worlds) setWorlds(data.worlds);
        if (data.levels) setLevels(data.levels);
      })
      .catch((err) => console.error('[LogicBlocks] Error loading puzzles:', err))
      .finally(() => setLoading(false));
  }, []);

  const currentLevel = levels[currentLevelIdx] || null;

  // Reset grid state whenever level changes
  useEffect(() => {
    if (currentLevel) {
      resetGrid();
    }
  }, [currentLevelIdx, levels]);

  const resetGrid = () => {
    if (!currentLevel) return;
    setPlayerPos({ ...currentLevel.start });
    setCollectedStars(new Set());
    setHeldKeys(new Set());
    setUnlockedDoors(new Set());
    setExecuting(false);
    setActiveInstructionIdx(-1);
    setStatusMessage('');
    setLevelSolved(false);
    setEarnedStarsCount(0);
    setShowHint(false);
    setMascotMood('idle');
  };

  const addInstruction = (type, param = null) => {
    if (executing || levelSolved) return;
    if (program.length >= (currentLevel?.maxBlocks || 16)) return;
    playClickSound();
    setProgram((prev) => [...prev, { id: `${type}_${Date.now()}_${Math.random()}`, type, param }]);
  };

  const removeInstruction = (idx) => {
    if (executing || levelSolved) return;
    playClickSound();
    setProgram((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearProgram = () => {
    if (executing || levelSolved) return;
    playClickSound();
    setProgram([]);
    resetGrid();
  };

  // Run assembled program
  const runProgram = async () => {
    if (executing || program.length === 0 || !currentLevel) return;

    resetGrid();
    setExecuting(true);
    setMascotMood('thinking');
    setStatusMessage('Executing sequence...');

    // Expand repeat blocks into flattened steps
    const flattened = [];
    for (const block of program) {
      if (block.type === 'REPEAT_2') {
        flattened.push({ type: 'FORWARD' }, { type: 'FORWARD' });
      } else if (block.type === 'REPEAT_3') {
        flattened.push({ type: 'FORWARD' }, { type: 'FORWARD' }, { type: 'FORWARD' });
      } else {
        flattened.push(block);
      }
    }

    let current = { ...currentLevel.start };
    let starsGained = new Set();
    let keysGained = new Set();
    let doorsOpened = new Set();
    let crashed = false;

    const stepDelay = executionSpeed === 'fast' ? 200 : 420;

    for (let i = 0; i < flattened.length; i++) {
      setActiveInstructionIdx(i);
      const action = flattened[i];
      playClickSound();

      await new Promise((r) => setTimeout(r, stepDelay));

      if (action.type === 'FORWARD') {
        const vec = DIR_VECTORS[current.dir];
        const nextX = current.x + vec.dx;
        const nextY = current.y + vec.dy;

        // 1. Boundary check
        if (nextX < 0 || nextX >= currentLevel.gridSize || nextY < 0 || nextY >= currentLevel.gridSize) {
          playErrorSound();
          setMascotMood('sad');
          setStatusMessage('Border collision! Grid boundary exceeded.');
          crashed = true;
          break;
        }

        // 2. Obstacle check
        const isHit = currentLevel.obstacles.some((obs) => obs.x === nextX && obs.y === nextY);
        if (isHit) {
          playErrorSound();
          setMascotMood('sad');
          setStatusMessage('Collision! Firewall barrier in the path.');
          crashed = true;
          break;
        }

        // 3. Locked Door check
        if (currentLevel.doors) {
          const door = currentLevel.doors.find((d) => d.x === nextX && d.y === nextY);
          if (door && !doorsOpened.has(door.id)) {
            if (keysGained.has(door.id)) {
              doorsOpened.add(door.id);
              setUnlockedDoors(new Set(doorsOpened));
              playSuccessSound();
            } else {
              playErrorSound();
              setMascotMood('sad');
              setStatusMessage('Access Denied! Security door is locked. Find the key first.');
              crashed = true;
              break;
            }
          }
        }

        current = { ...current, x: nextX, y: nextY };
        setPlayerPos({ ...current });

        // 4. Key Pickup
        if (currentLevel.keys) {
          const keyItem = currentLevel.keys.find((k) => k.x === nextX && k.y === nextY);
          if (keyItem && !keysGained.has(keyItem.id)) {
            keysGained.add(keyItem.id);
            setHeldKeys(new Set(keysGained));
            playCoinSound();
          }
        }

        // 5. Star Pickup
        if (currentLevel.stars) {
          const starHit = currentLevel.stars.find((s) => s.x === nextX && s.y === nextY);
          if (starHit && !starsGained.has(`${nextX},${nextY}`)) {
            starsGained.add(`${nextX},${nextY}`);
            setCollectedStars(new Set(starsGained));
            playCoinSound();
          }
        }
      } else if (action.type === 'TURN_LEFT') {
        const curIdx = DIRECTIONS.indexOf(current.dir);
        current = { ...current, dir: DIRECTIONS[(curIdx + 3) % 4] };
        setPlayerPos({ ...current });
      } else if (action.type === 'TURN_RIGHT') {
        const curIdx = DIRECTIONS.indexOf(current.dir);
        current = { ...current, dir: DIRECTIONS[(curIdx + 1) % 4] };
        setPlayerPos({ ...current });
      }
    }

    setExecuting(false);
    setActiveInstructionIdx(-1);

    if (crashed) return;

    // Check Destination Goal
    if (current.x === currentLevel.goal.x && current.y === currentLevel.goal.y) {
      playSuccessSound();
      setMascotMood('celebrate');
      setLevelSolved(true);

      // Star calculation
      let starsCount = 1; // 1 star for reaching goal
      const allStarsCollected = currentLevel.stars?.length ? starsGained.size === currentLevel.stars.length : true;
      if (allStarsCollected) starsCount += 1;
      const isOptimal = program.length <= (currentLevel.optimalBlocks || 10);
      if (isOptimal) starsCount += 1;

      setEarnedStarsCount(starsCount);

      const points = 100 + (isOptimal ? 60 : 20) + (starsGained.size * 30);
      const coins = 12 + (starsCount * 6);

      setStatusMessage(`Victory! Solved in ${program.length} blocks (${starsCount} ★).`);

      finalizeSession({
        gameId: 'logic_blocks',
        score: points,
        coinsEarned: coins,
        arcadePointsEarned: points,
        metadata: {
          levelCompleted: currentLevel.level,
          world: currentLevel.world,
          blocksUsed: program.length,
          starsEarned: starsCount,
        },
        idempotencyKey: `logic_${currentLevel.level}_${Date.now()}`,
      }).catch((e) => console.warn('[LogicBlocks] Finalize session note:', e.message));
    } else {
      setMascotMood('thinking');
      setStatusMessage('Program ended, but mascot did not reach the green goal. Adjust your steps!');
    }
  };

  const nextLevel = () => {
    if (currentLevelIdx + 1 < levels.length) {
      setCurrentLevelIdx((prev) => prev + 1);
      setProgram([]);
    } else {
      onBackToHub();
    }
  };

  if (loading || !currentLevel) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
        Loading Logic Blocks level catalog...
      </div>
    );
  }

  const gridSize = currentLevel.gridSize || 6;

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', padding: '1rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={22} color="#38bdf8" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                Logic Blocks 2.0
              </h1>
              <button
                onClick={() => setShowLevelBrowser(!showLevelBrowser)}
                className="btn-secondary"
                style={{ padding: '2px 8px', fontSize: '0.75rem', gap: '4px' }}
              >
                Level {currentLevel.level}: {currentLevel.title} <ChevronDown size={14} />
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              World {currentLevel.world}: {currentLevel.worldName || (worlds.find(w => w.id === currentLevel.world)?.name) || 'Movement Fundamentals'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setExecutionSpeed(executionSpeed === 'normal' ? 'fast' : 'normal')}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', gap: '4px' }}
            title="Toggle execution step speed"
          >
            <FastForward size={14} color={executionSpeed === 'fast' ? '#38bdf8' : 'inherit'} />
            {executionSpeed === 'fast' ? 'Fast 2x' : '1x Speed'}
          </button>
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

      {/* LEVEL BROWSER DRAWER */}
      <AnimatePresence>
        {showLevelBrowser && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card"
            style={{ marginBottom: '1rem', padding: '1rem', overflow: 'hidden' }}
          >
            {/* World Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '0.75rem', paddingBottom: '4px' }}>
              {worlds.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWorldTab(w.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: selectedWorldTab === w.id ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-secondary)',
                    border: selectedWorldTab === w.id ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                    color: selectedWorldTab === w.id ? '#38bdf8' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {w.name}
                </button>
              ))}
            </div>

            {/* Level grid for selected world */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.5rem' }}>
              {levels
                .filter((lvl) => lvl.world === selectedWorldTab)
                .map((lvl) => {
                  const isCur = lvl.level === currentLevel.level;
                  return (
                    <button
                      key={lvl.level}
                      onClick={() => {
                        const targetIdx = levels.findIndex((l) => l.level === lvl.level);
                        if (targetIdx !== -1) {
                          setCurrentLevelIdx(targetIdx);
                          setShowLevelBrowser(false);
                          setProgram([]);
                        }
                      }}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        background: isCur ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-secondary)',
                        border: isCur ? '1.5px solid #10b981' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isCur ? '#34d399' : 'var(--text-primary)' }}>
                        Level {lvl.level}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lvl.title}
                      </div>
                    </button>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Play Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1rem', alignItems: 'start' }}>
        {/* Left Side: Grid Stage */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{currentLevel.title}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                {currentLevel.subtitle}
              </span>
            </div>
            <button
              onClick={() => setShowHint(!showHint)}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', gap: '4px' }}
            >
              <Lightbulb size={13} color="#f59e0b" /> Hint
            </button>
          </div>

          {/* Hint callout */}
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#fbbf24', marginBottom: '0.75rem' }}
            >
              {currentLevel.hint}
            </motion.div>
          )}

          {/* Visual Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gap: '4px',
              background: '#040711',
              padding: '8px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              aspectRatio: '1 / 1',
              maxWidth: '440px',
              margin: '0 auto',
            }}
          >
            {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
              const x = idx % gridSize;
              const y = Math.floor(idx / gridSize);

              const isPlayer = playerPos.x === x && playerPos.y === y;
              const isGoal = currentLevel.goal.x === x && currentLevel.goal.y === y;
              const isObstacle = currentLevel.obstacles.some((o) => o.x === x && o.y === y);
              const hasStar = currentLevel.stars?.some((s) => s.x === x && s.y === y && !collectedStars.has(`${x},${y}`));
              const hasKey = currentLevel.keys?.some((k) => k.x === x && k.y === y && !heldKeys.has(k.id));
              const door = currentLevel.doors?.find((d) => d.x === x && d.y === y);
              const isDoorLocked = door && !unlockedDoors.has(door.id);

              return (
                <div
                  key={idx}
                  style={{
                    borderRadius: '6px',
                    background: isObstacle
                      ? 'rgba(239, 68, 68, 0.2)'
                      : isGoal
                      ? 'rgba(16, 185, 129, 0.25)'
                      : isDoorLocked
                      ? 'rgba(245, 158, 11, 0.25)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isObstacle
                      ? '1px solid #ef4444'
                      : isGoal
                      ? '1.5px solid #10b981'
                      : isDoorLocked
                      ? '1.5px solid #f59e0b'
                      : '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Obstacle Icon */}
                  {isObstacle && <ShieldAlert size={18} color="#ef4444" />}

                  {/* Goal Marker */}
                  {isGoal && !isPlayer && (
                    <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      <CheckCircle2 size={20} color="#10b981" />
                    </motion.div>
                  )}

                  {/* Star Collectible */}
                  {hasStar && !isPlayer && (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}>
                      <Star size={18} color="#fbbf24" fill="#fbbf24" />
                    </motion.div>
                  )}

                  {/* Key Collectible */}
                  {hasKey && !isPlayer && (
                    <Key size={16} color="#38bdf8" />
                  )}

                  {/* Security Door */}
                  {isDoorLocked && !isPlayer && (
                    <Lock size={16} color="#f59e0b" />
                  )}

                  {/* Player Mascot */}
                  {isPlayer && (
                    <motion.div
                      style={{
                        transform: `rotate(${DIR_ROTATION[playerPos.dir]}deg)`,
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <BugMascot mood={mascotMood} skin={equippedSkin} accessory={equippedAccessory} size={36} />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Status Message Footer */}
          {statusMessage && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', fontWeight: 600, color: levelSolved ? '#34d399' : '#f87171', textAlign: 'center' }}>
              {statusMessage}
            </div>
          )}
        </div>

        {/* Right Side: Block Toolbox & Program Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Block Toolbox Palette */}
          <div className="card" style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
              Command Blocks
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <button
                onClick={() => addInstruction('FORWARD')}
                disabled={executing || levelSolved}
                className="btn-secondary"
                style={{ padding: '0.6rem', fontSize: '0.78rem', justifyContent: 'center', gap: '4px' }}
              >
                <ArrowUp size={15} color="#38bdf8" /> Forward
              </button>
              <button
                onClick={() => addInstruction('REPEAT_2')}
                disabled={executing || levelSolved}
                className="btn-secondary"
                style={{ padding: '0.6rem', fontSize: '0.78rem', justifyContent: 'center', gap: '4px' }}
              >
                <Repeat size={15} color="#a855f7" /> 2x Stride
              </button>
              <button
                onClick={() => addInstruction('TURN_LEFT')}
                disabled={executing || levelSolved}
                className="btn-secondary"
                style={{ padding: '0.6rem', fontSize: '0.78rem', justifyContent: 'center', gap: '4px' }}
              >
                <ChevronLeft size={15} color="#f59e0b" /> Turn Left
              </button>
              <button
                onClick={() => addInstruction('TURN_RIGHT')}
                disabled={executing || levelSolved}
                className="btn-secondary"
                style={{ padding: '0.6rem', fontSize: '0.78rem', justifyContent: 'center', gap: '4px' }}
              >
                <ChevronRight size={15} color="#10b981" /> Turn Right
              </button>
            </div>
          </div>

          {/* Program Sequence */}
          <div className="card" style={{ padding: '1rem', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Program ({program.length} / {currentLevel.maxBlocks || 16})
              </span>
              <button
                onClick={clearProgram}
                disabled={executing || program.length === 0}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem' }}
              >
                <Trash2 size={13} /> Clear
              </button>
            </div>

            {/* Assembled Blocks List */}
            <div
              style={{
                minHeight: '120px',
                maxHeight: '220px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                background: 'var(--bg-secondary)',
                padding: '6px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1rem',
              }}
            >
              {program.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '2rem 0' }}>
                  Click command blocks above to build your program sequence.
                </div>
              ) : (
                program.map((blk, bIdx) => (
                  <div
                    key={blk.id}
                    onClick={() => removeInstruction(bIdx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: activeInstructionIdx === bIdx ? 'rgba(56, 189, 248, 0.3)' : 'var(--bg-tertiary)',
                      border: activeInstructionIdx === bIdx ? '1px solid #38bdf8' : '1px solid transparent',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <span>{bIdx + 1}. {blk.type}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>×</span>
                  </div>
                ))
              )}
            </div>

            {/* Run / Reset / Next Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {!levelSolved ? (
                <>
                  <button
                    onClick={runProgram}
                    disabled={executing || program.length === 0}
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.65rem', justifyContent: 'center', gap: '6px' }}
                  >
                    <Play size={16} fill="currentColor" /> {executing ? 'Running...' : 'Execute'}
                  </button>
                  <button
                    onClick={resetGrid}
                    disabled={executing}
                    className="btn-secondary"
                    style={{ padding: '0.65rem' }}
                    title="Reset mascot position"
                  >
                    <RotateCcw size={16} />
                  </button>
                </>
              ) : (
                <button
                  onClick={nextLevel}
                  className="btn-primary"
                  style={{ flex: 1, padding: '0.65rem', justifyContent: 'center', gap: '6px' }}
                >
                  Next Level <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
