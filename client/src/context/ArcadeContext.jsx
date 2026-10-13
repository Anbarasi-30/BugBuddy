/**
 * ArcadeContext.jsx
 * 
 * Provides global state for BugBuddy Arcade:
 * - Authoritative coin wallet
 * - Arcade points & rank
 * - Equipped skin & accessories
 * - Sound toggle
 * - Reusable methods to finalize sessions and purchase items
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import arcadeApi from '../services/arcadeApi';
import { isSoundEnabled, setSoundEnabled, playCoinSound } from '../utils/arcadeAudio';
import { useAuth } from './AuthContext';

const ArcadeContext = createContext(null);

export function ArcadeProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const data = await arcadeApi.getProfile();
      setProfile(data.profile);
    } catch (err) {
      console.warn('[ArcadeContext] Profile fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const finalizeSession = async (payload) => {
    try {
      const res = await arcadeApi.finalizeSession(payload);
      if (res.profile) {
        setProfile(res.profile);
      }
      if (res.coinsAwarded > 0) {
        playCoinSound();
      }
      return res;
    } catch (err) {
      console.error('[ArcadeContext] finalizeSession error:', err);
      throw err;
    }
  };

  const buyItem = async (itemId) => {
    try {
      const res = await arcadeApi.buyShopItem(itemId);
      if (res.balance !== undefined) {
        setProfile((prev) => (prev ? { ...prev, coins: res.balance } : prev));
      }
      return res;
    } catch (err) {
      console.error('[ArcadeContext] buyItem error:', err);
      throw err;
    }
  };

  const equipItem = async (itemId, itemType) => {
    try {
      const res = await arcadeApi.equipItem(itemId, itemType);
      setProfile((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        if (itemType === 'skin') next.equippedSkin = itemId;
        if (itemType === 'accessory') next.equippedAccessory = itemId;
        if (itemType === 'theme') next.equippedTheme = itemId;
        return next;
      });
      return res;
    } catch (err) {
      console.error('[ArcadeContext] equipItem error:', err);
      throw err;
    }
  };

  const claimDailyChallenge = async (challengeId) => {
    try {
      const res = await arcadeApi.claimDailyChallenge(challengeId);
      if (res.balance !== undefined) {
        setProfile((prev) => (prev ? { ...prev, coins: res.balance } : prev));
        playCoinSound();
      }
      return res;
    } catch (err) {
      console.error('[ArcadeContext] claimDailyChallenge error:', err);
      throw err;
    }
  };

  const claimAchievement = async (achievementId) => {
    try {
      const res = await arcadeApi.claimAchievement(achievementId);
      if (res.balance !== undefined) {
        setProfile((prev) => (prev ? { ...prev, coins: res.balance } : prev));
        playCoinSound();
      }
      return res;
    } catch (err) {
      console.error('[ArcadeContext] claimAchievement error:', err);
      throw err;
    }
  };

  const value = {
    profile,
    coins: profile?.coins || 0,
    arcadePoints: profile?.arcadePoints || 0,
    equippedSkin: profile?.equippedSkin || 'skin_classic',
    equippedAccessory: profile?.equippedAccessory || 'acc_none',
    equippedTheme: profile?.equippedTheme || 'theme_emerald',
    bestScores: profile?.bestScores || {},
    gamesPlayed: profile?.gamesPlayed || {},
    loading,
    soundOn,
    toggleSound,
    refreshProfile: fetchProfile,
    finalizeSession,
    buyItem,
    equipItem,
    claimDailyChallenge,
    claimAchievement,
  };

  return <ArcadeContext.Provider value={value}>{children}</ArcadeContext.Provider>;
}

export function useArcade() {
  const context = useContext(ArcadeContext);
  if (!context) {
    throw new Error('useArcade must be used within an ArcadeProvider');
  }
  return context;
}
