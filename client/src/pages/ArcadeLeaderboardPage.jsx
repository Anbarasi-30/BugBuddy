/**
 * ArcadeLeaderboardPage.jsx
 * 
 * BugBuddy Arcade Global Leaderboards.
 * Displays Daily, Weekly, and All-Time rankings with a podium for top 3 champions.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, Medal, Crown, ArrowLeft,
  Flame, Calendar, Sparkles, User as UserIcon
} from 'lucide-react';
import { useArcade } from '../context/ArcadeContext';
import { useAuth } from '../context/AuthContext';
import arcadeApi from '../services/arcadeApi';

export default function ArcadeLeaderboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { arcadePoints } = useArcade();

  const [period, setPeriod] = useState('all'); // 'daily' | 'weekly' | 'all'
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    arcadeApi.getLeaderboard(period)
      .then((data) => setRankings(data.rankings || []))
      .catch((err) => console.error('[Leaderboard] Load error:', err))
      .finally(() => setLoading(false));
  }, [period]);

  const topThree = rankings.slice(0, 3);
  const remaining = rankings.slice(3);

  // Current user ranking if present
  const myRank = rankings.findIndex((r) => r.userId?.toString() === user?.id?.toString() || r.userId?.toString() === user?._id?.toString());
  const myRankNum = myRank !== -1 ? myRank + 1 : null;

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '960px', margin: '0 auto' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/arcade')} className="btn-secondary" style={{ padding: '0.45rem' }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Arcade Hall of Fame
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Top debugging performers across BugBuddy Arcade
            </span>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-default)' }}>
          {[
            { id: 'daily', label: 'Today', icon: Flame },
            { id: 'weekly', label: 'This Week', icon: Calendar },
            { id: 'all', label: 'All-Time', icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = period === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '7px',
                  border: 'none',
                  background: active ? 'var(--bg-tertiary)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} color={active ? '#10b981' : undefined} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Player Rank Banner */}
      <div
        className="card"
        style={{
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#041f14', fontWeight: 800, fontSize: '0.9rem' }}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
              {user?.name || 'You'} <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>(You)</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Current Rank: {myRankNum ? `#${myRankNum}` : 'Unranked in this period'}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your Arcade Points</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>⭐ {arcadePoints}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
          Loading rankings...
        </div>
      ) : rankings.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Trophy size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
          <p>No games played yet in this timeframe. Be the first to claim Rank #1!</p>
        </div>
      ) : (
        <>
          {/* Top 3 Champions Podium */}
          {topThree.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem', alignItems: 'end' }}>
              {/* Podium Rank 2 */}
              {topThree[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card"
                  style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid rgba(148, 163, 184, 0.3)', background: 'linear-gradient(180deg, rgba(148, 163, 184, 0.08) 0%, var(--bg-secondary) 100%)' }}
                >
                  <Medal size={28} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>RANK #2</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.25rem 0' }}>{topThree[1].name}</h3>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>⭐ {topThree[1].points}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{topThree[1].gamesPlayed} games</div>
                </motion.div>
              )}

              {/* Podium Rank 1 (Gold Champion) */}
              {topThree[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card"
                  style={{
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    border: '1.5px solid rgba(245, 158, 11, 0.5)',
                    background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.15) 0%, var(--bg-secondary) 100%)',
                    boxShadow: '0 8px 30px rgba(245, 158, 11, 0.15)',
                  }}
                >
                  <Crown size={36} color="#fbbf24" style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24' }}>CHAMPION #1</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.35rem 0' }}>{topThree[0].name}</h3>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24' }}>⭐ {topThree[0].points}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{topThree[0].gamesPlayed} games</div>
                </motion.div>
              )}

              {/* Podium Rank 3 */}
              {topThree[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card"
                  style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid rgba(217, 119, 6, 0.3)', background: 'linear-gradient(180deg, rgba(217, 119, 6, 0.08) 0%, var(--bg-secondary) 100%)' }}
                >
                  <Medal size={28} color="#d97706" style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706' }}>RANK #3</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.25rem 0' }}>{topThree[2].name}</h3>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>⭐ {topThree[2].points}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{topThree[2].gamesPlayed} games</div>
                </motion.div>
              )}
            </div>
          )}

          {/* Full Rankings Table (Ranks 4+) */}
          {remaining.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 1rem', width: '60px' }}>Rank</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Player</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Games</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {remaining.map((player) => {
                    const isMe = player.userId?.toString() === user?.id?.toString() || player.userId?.toString() === user?._id?.toString();

                    return (
                      <tr
                        key={player.rank}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          background: isMe ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          #{player.rank}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: isMe ? 700 : 500 }}>
                          {player.name} {isMe && <span style={{ color: '#10b981', fontSize: '0.75rem' }}>(You)</span>}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          {player.gamesPlayed}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>
                          ⭐ {player.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
