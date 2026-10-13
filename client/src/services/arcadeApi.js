/**
 * arcadeApi.js
 * 
 * Frontend API client for BugBuddy Arcade endpoints.
 */

import api from './api';

export const arcadeApi = {
  getProfile: () => api.get('/arcade/profile').then((r) => r.data),
  getGameQuestions: (game, params = {}) => {
    const query = new URLSearchParams({ game, ...params }).toString();
    return api.get(`/arcade/questions?${query}`).then((r) => r.data);
  },
  finalizeSession: (payload) => api.post('/arcade/session/finalize', payload).then((r) => r.data),
  getShopItems: () => api.get('/arcade/shop/items').then((r) => r.data),
  buyShopItem: (itemId) => api.post('/arcade/shop/buy', { itemId }).then((r) => r.data),
  equipItem: (itemId, itemType) => api.post('/arcade/shop/equip', { itemId, itemType }).then((r) => r.data),
  getDailyChallenges: () => api.get('/arcade/daily-challenges').then((r) => r.data),
  claimDailyChallenge: (challengeId) => api.post('/arcade/daily-challenges/claim', { challengeId }).then((r) => r.data),
  getAchievements: () => api.get('/arcade/achievements').then((r) => r.data),
  claimAchievement: (achievementId) => api.post('/arcade/achievements/claim', { achievementId }).then((r) => r.data),
  getLeaderboard: (period = 'all') => api.get(`/arcade/leaderboard?period=${period}`).then((r) => r.data),
  getActivityHistory: () => api.get('/arcade/history').then((r) => r.data),
};

export default arcadeApi;
