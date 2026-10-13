/**
 * BugMascot.jsx
 * 
 * Expressive vector mascot for BugBuddy Arcade.
 * Renders dynamic SVG character with customizable moods, skins, and cosmetic accessories.
 */

import React from 'react';
import { motion } from 'framer-motion';

// Skin Color Schemes
const SKIN_THEMES = {
  skin_classic: {
    primary: '#10b981',
    secondary: '#059669',
    belly: '#a7f3d0',
    eyeColor: '#0f172a',
    blush: 'rgba(244, 63, 94, 0.4)',
    antennaTip: '#34d399',
    wingTint: 'rgba(255, 255, 255, 0.35)',
  },
  skin_cyber: {
    primary: '#06b6d4',
    secondary: '#0891b2',
    belly: '#a5f3fc',
    eyeColor: '#ec4899',
    blush: 'rgba(236, 72, 153, 0.5)',
    antennaTip: '#f43f5e',
    wingTint: 'rgba(6, 182, 212, 0.45)',
  },
  skin_golden: {
    primary: '#f59e0b',
    secondary: '#d97706',
    belly: '#fde68a',
    eyeColor: '#451a03',
    blush: 'rgba(245, 158, 11, 0.5)',
    antennaTip: '#fbbf24',
    wingTint: 'rgba(254, 240, 138, 0.4)',
  },
  skin_retro: {
    primary: '#22c55e',
    secondary: '#16a34a',
    belly: '#bbf7d0',
    eyeColor: '#022c22',
    blush: 'rgba(34, 197, 94, 0.4)',
    antennaTip: '#86efac',
    wingTint: 'rgba(134, 239, 172, 0.35)',
  },
  skin_beetle: {
    primary: '#8b5cf6',
    secondary: '#6d28d9',
    belly: '#ddd6fe',
    eyeColor: '#2e1065',
    blush: 'rgba(192, 132, 252, 0.5)',
    antennaTip: '#c084fc',
    wingTint: 'rgba(192, 132, 252, 0.4)',
  },
};

export default function BugMascot({
  mood = 'idle',
  skin = 'skin_classic',
  accessory = 'acc_none',
  size = 120,
  animated = true,
  className = '',
  style = {},
}) {
  const theme = SKIN_THEMES[skin] || SKIN_THEMES.skin_classic;

  // Floating idle motion variants
  const floatAnimation = animated
    ? {
        y: mood === 'celebrate' ? [-4, -14, -4] : mood === 'sad' ? [0, 4, 0] : [0, -6, 0],
        rotate: mood === 'celebrate' ? [-2, 3, -2] : mood === 'thinking' ? [0, 4, 0] : [0, 0, 0],
        transition: {
          duration: mood === 'celebrate' ? 1.2 : 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }
    : {};

  return (
    <motion.div
      animate={floatAnimation}
      className={`bug-mascot-container ${className}`}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        position: 'relative',
        ...style,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Main Body Gradient */}
          <linearGradient id={`bodyGrad_${skin}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.primary} />
            <stop offset="100%" stopColor={theme.secondary} />
          </linearGradient>

          {/* Golden Shimmer */}
          {skin === 'skin_golden' && (
            <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          )}

          {/* Drop shadow filter */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.18" floodColor="#000" />
          </filter>
        </defs>

        {/* --- SHADOW --- */}
        <ellipse cx="50" cy="94" rx="28" ry="4.5" fill="rgba(0, 0, 0, 0.25)" />

        {/* --- LEGS --- */}
        <path d="M28 66 Q20 74 16 78" stroke={theme.secondary} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M72 66 Q80 74 84 78" stroke={theme.secondary} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M26 54 Q16 58 12 62" stroke={theme.secondary} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M74 54 Q84 58 88 62" stroke={theme.secondary} strokeWidth="3.5" strokeLinecap="round" />

        {/* --- WINGS (Translucent beetle elytra) --- */}
        <ellipse
          cx="33"
          cy="58"
          rx="12"
          ry="20"
          transform="rotate(-22 33 58)"
          fill={theme.wingTint}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
        />
        <ellipse
          cx="67"
          cy="58"
          rx="12"
          ry="20"
          transform="rotate(22 67 58)"
          fill={theme.wingTint}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
        />

        {/* --- ANTENNAE --- */}
        {/* Left Antenna */}
        <motion.path
          d={mood === 'sad' ? 'M40 32 Q32 24 30 32' : 'M40 32 Q32 15 25 18'}
          stroke={theme.secondary}
          strokeWidth="3.5"
          strokeLinecap="round"
          animate={animated ? { rotate: [0, -3, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle
          cx={mood === 'sad' ? 30 : 25}
          cy={mood === 'sad' ? 32 : 18}
          r="4.5"
          fill={theme.antennaTip}
          filter="url(#softGlow)"
        />

        {/* Right Antenna */}
        <motion.path
          d={mood === 'sad' ? 'M60 32 Q68 24 70 32' : 'M60 32 Q68 15 75 18'}
          stroke={theme.secondary}
          strokeWidth="3.5"
          strokeLinecap="round"
          animate={animated ? { rotate: [0, 3, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle
          cx={mood === 'sad' ? 70 : 75}
          cy={mood === 'sad' ? 32 : 18}
          r="4.5"
          fill={theme.antennaTip}
          filter="url(#softGlow)"
        />

        {/* --- MAIN BODY & SHELL --- */}
        <ellipse
          cx="50"
          cy="60"
          rx="27"
          ry="26"
          fill={`url(#bodyGrad_${skin})`}
          filter="url(#softGlow)"
        />

        {/* Belly plate */}
        <ellipse cx="50" cy="65" rx="18" ry="17" fill={theme.belly} />

        {/* Belly segment grooves */}
        <path d="M37 60 Q50 64 63 60" stroke={theme.secondary} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <path d="M39 67 Q50 71 61 67" stroke={theme.secondary} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />

        {/* --- HEAD --- */}
        <circle cx="50" cy="40" r="22" fill={`url(#bodyGrad_${skin})`} />

        {/* Cute blush cheeks */}
        <circle cx="36" cy="45" r="4" fill={theme.blush} />
        <circle cx="64" cy="45" r="4" fill={theme.blush} />

        {/* --- EYES & MOOD EXPRESSIONS --- */}
        {mood === 'happy' || mood === 'celebrate' ? (
          // Happy crescent curved eyes
          <>
            <path d="M38 40 Q43 35 46 40" stroke={theme.eyeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M54 40 Q57 35 62 40" stroke={theme.eyeColor} strokeWidth="3" strokeLinecap="round" />
          </>
        ) : mood === 'excited' ? (
          // Big excited sparkling eyes
          <>
            <circle cx="42" cy="38" r="6" fill={theme.eyeColor} />
            <circle cx="40" cy="36" r="2.2" fill="#fff" />
            <circle cx="44" cy="40" r="1.2" fill="#fff" />
            <circle cx="58" cy="38" r="6" fill={theme.eyeColor} />
            <circle cx="56" cy="36" r="2.2" fill="#fff" />
            <circle cx="60" cy="40" r="1.2" fill="#fff" />
          </>
        ) : mood === 'thinking' ? (
          // Squinty / looking up eyes
          <>
            <circle cx="43" cy="36" r="5" fill={theme.eyeColor} />
            <circle cx="44" cy="35" r="1.8" fill="#fff" />
            <circle cx="59" cy="36" r="5" fill={theme.eyeColor} />
            <circle cx="60" cy="35" r="1.8" fill="#fff" />
          </>
        ) : mood === 'sad' ? (
          // Droopy sad eyes
          <>
            <circle cx="42" cy="40" r="4.5" fill={theme.eyeColor} />
            <circle cx="41" cy="39" r="1.5" fill="#fff" />
            <circle cx="58" cy="40" r="4.5" fill={theme.eyeColor} />
            <circle cx="57" cy="39" r="1.5" fill="#fff" />
          </>
        ) : (
          // Default friendly round eyes
          <>
            <circle cx="42" cy="38" r="5.2" fill={theme.eyeColor} />
            <circle cx="40.5" cy="36.5" r="2" fill="#fff" />
            <circle cx="58" cy="38" r="5.2" fill={theme.eyeColor} />
            <circle cx="56.5" cy="36.5" r="2" fill="#fff" />
          </>
        )}

        {/* --- MOUTH EXPRESSIONS --- */}
        {mood === 'excited' || mood === 'celebrate' ? (
          // Open cheerful mouth
          <path d="M44 45 Q50 52 56 45 Z" fill="#e11d48" stroke="#881337" strokeWidth="1" />
        ) : mood === 'thinking' ? (
          // Small wondering 'o' mouth
          <ellipse cx="50" cy="46" rx="2.2" ry="2.8" fill={theme.eyeColor} />
        ) : mood === 'sad' ? (
          // Downturned frown
          <path d="M45 48 Q50 45 55 48" stroke={theme.eyeColor} strokeWidth="2.5" strokeLinecap="round" />
        ) : (
          // Gentle warm smile
          <path d="M45 46 Q50 50 55 46" stroke={theme.eyeColor} strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* --- ACCESSORIES --- */}
        {accessory === 'acc_wizard_hat' && (
          <g transform="translate(18, 2)">
            {/* Cone */}
            <path d="M32 0 L16 26 L48 26 Z" fill="#1e1b4b" stroke="#3b82f6" strokeWidth="1.5" />
            {/* Brim */}
            <ellipse cx="32" cy="26" rx="22" ry="6" fill="#312e81" stroke="#60a5fa" strokeWidth="1.5" />
            {/* Glowing stars */}
            <circle cx="32" cy="12" r="2" fill="#fbbf24" />
            <circle cx="26" cy="19" r="1.5" fill="#fbbf24" />
            <circle cx="38" cy="18" r="1.5" fill="#fde047" />
          </g>
        )}

        {accessory === 'acc_crown' && (
          <g transform="translate(28, 9)">
            {/* Crown base & 3 peaks */}
            <path
              d="M6 18 L10 6 L22 13 L34 6 L38 18 Z"
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="1.5"
            />
            {/* Jewels */}
            <circle cx="10" cy="6" r="2.2" fill="#ef4444" />
            <circle cx="22" cy="13" r="2.5" fill="#10b981" />
            <circle cx="34" cy="6" r="2.2" fill="#3b82f6" />
          </g>
        )}

        {accessory === 'acc_neon_shades' && (
          <g transform="translate(26, 32)">
            {/* Pixel glasses bar */}
            <rect x="0" y="0" width="48" height="11" rx="2" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
            {/* Cool reflection slash */}
            <line x1="8" y1="2" x2="16" y2="9" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" />
            <line x1="32" y1="2" x2="40" y2="9" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {accessory === 'acc_headphones' && (
          <g transform="translate(20, 16)">
            {/* Headband arch */}
            <path d="M8 24 Q30 4 52 24" stroke="#334155" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            {/* Left ear cup */}
            <rect x="4" y="20" width="8" height="15" rx="4" fill="#0f172a" stroke="#22c55e" strokeWidth="1.5" />
            {/* Right ear cup */}
            <rect x="48" y="20" width="8" height="15" rx="4" fill="#0f172a" stroke="#22c55e" strokeWidth="1.5" />
          </g>
        )}

        {accessory === 'acc_party_hat' && (
          <g transform="translate(34, 4)">
            {/* Striped party cone */}
            <path d="M16 0 L6 26 L26 26 Z" fill="#ec4899" stroke="#be185d" strokeWidth="1.5" />
            <path d="M11 13 L21 13" stroke="#fbbf24" strokeWidth="2" />
            <path d="M8 20 L24 20" stroke="#38bdf8" strokeWidth="2" />
            {/* Tassel */}
            <circle cx="16" cy="0" r="3" fill="#fde047" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}
