/**
 * ArcadeGamePage.jsx
 * 
 * Host page for individual arcade games:
 * Routes between Bug Hunt, Logic Blocks, Output Rush, and Coin Dash.
 */

import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import BugHuntGame from '../components/arcade/BugHuntGame';
import LogicBlocksGame from '../components/arcade/LogicBlocksGame';
import OutputRushGame from '../components/arcade/OutputRushGame';
import CoinDashGame from '../components/arcade/CoinDashGame';

export default function ArcadeGamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const handleBackToHub = () => {
    navigate('/arcade');
  };

  if (gameId === 'bug-hunt') {
    return <BugHuntGame onBackToHub={handleBackToHub} />;
  }

  if (gameId === 'logic-blocks') {
    return <LogicBlocksGame onBackToHub={handleBackToHub} />;
  }

  if (gameId === 'output-rush') {
    return <OutputRushGame onBackToHub={handleBackToHub} />;
  }

  if (gameId === 'coin-dash') {
    return <CoinDashGame onBackToHub={handleBackToHub} />;
  }

  return <Navigate to="/arcade" replace />;
}
