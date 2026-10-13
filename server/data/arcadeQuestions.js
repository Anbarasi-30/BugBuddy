/**
 * arcadeQuestions.js
 * 
 * Central aggregator and re-exporter for BugBuddy Arcade 2.0.
 * Backed by 52+ Bug Hunt cases, 42 Logic Blocks puzzles, 102 Output Rush challenges,
 * and 21 Coin Dash challenge objectives.
 */

const { BUG_HUNT_CASES } = require('./bugHuntData');
const { LOGIC_WORLDS, LOGIC_BLOCKS_LEVELS } = require('./logicBlocksData');
const { OUTPUT_RUSH_QUESTIONS, PYTHON_OUTPUT_QUESTIONS, JAVA_OUTPUT_QUESTIONS } = require('./outputRushData');
const { COIN_DASH_ENVIRONMENTS, COIN_DASH_CHALLENGES } = require('./coinDashChallenges');

module.exports = {
  BUG_HUNT_QUESTIONS: BUG_HUNT_CASES,
  BUG_HUNT_CASES,
  LOGIC_WORLDS,
  LOGIC_BLOCKS_LEVELS,
  OUTPUT_RUSH_QUESTIONS,
  PYTHON_OUTPUT_QUESTIONS,
  JAVA_OUTPUT_QUESTIONS,
  COIN_DASH_ENVIRONMENTS,
  COIN_DASH_CHALLENGES,
};
