/**
 * BugBuddyAiIcon — Premium SVG Icon component for the BugBuddy AI Assistant.
 *
 * Features:
 * - Cute minimal green bug mascot with antennae, expressive eyes, and vibrant shell.
 * - AI Sparkles (4-pointed magic stars) floating around the mascot.
 * - Fully vector based: zero pixelation, 100% transparent background (no white box).
 * - Theme-compatible: works seamlessly in dark and light modes.
 *
 * Props:
 * - size: number (default 28)
 * - variant: 'color' | 'light' | 'monochrome' (default 'color')
 *   - 'color': Green (#22C55E) body, dark green (#15803D) accents, white eyes & sparkles.
 *   - 'light': Light green / white for dark green backgrounds.
 * - sparkles: boolean (default true)
 * - className & style: standard React props
 */

export default function BugBuddyAiIcon({
  size = 28,
  variant = 'color',
  sparkles = true,
  className = '',
  style = {},
}) {
  const isLight = variant === 'light';

  // Colors based on variant
  const shellColor = isLight ? '#FFFFFF' : '#22C55E';
  const headColor = isLight ? '#DCFCE7' : '#15803D';
  const spotColor = isLight ? '#22C55E' : '#15803D';
  const sparkleColor = isLight ? '#FFFFFF' : '#4ADE80';
  const eyeWhite = '#FFFFFF';
  const eyePupil = isLight ? '#15803D' : '#0F172A';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
      aria-label="BugBuddy AI Assistant"
    >
      {/* --- Antennae --- */}
      {/* Left Antenna */}
      <path
        d="M14 13C12.5 9.5 9 8 7.5 8.5"
        stroke={headColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="7" cy="8" r="2" fill={shellColor} />

      {/* Right Antenna */}
      <path
        d="M22 13C23.5 9.5 27 8 28.5 8.5"
        stroke={headColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="29" cy="8" r="2" fill={shellColor} />

      {/* --- Bug Legs (Subtle & Minimal) --- */}
      <path
        d="M8 22C6 23 5 25 5.5 26"
        stroke={headColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M28 22C30 23 31 25 30.5 26"
        stroke={headColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 27C7 28.5 6.5 30.5 7 31.5"
        stroke={headColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M27 27C29 28.5 29.5 30.5 29 31.5"
        stroke={headColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* --- Bug Shell / Body --- */}
      {/* Main Oval Body */}
      <ellipse cx="18" cy="24" rx="11" ry="9" fill={shellColor} />

      {/* Shell Wing Split Line */}
      <path
        d="M18 17V33"
        stroke={spotColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Shell Spots */}
      <circle cx="13" cy="23" r="2" fill={spotColor} />
      <circle cx="23" cy="23" r="2" fill={spotColor} />
      <circle cx="14" cy="28" r="1.5" fill={spotColor} />
      <circle cx="22" cy="28" r="1.5" fill={spotColor} />

      {/* --- Bug Head --- */}
      <circle cx="18" cy="15" r="7" fill={headColor} />

      {/* --- Expressive Eyes --- */}
      {/* Left Eye */}
      <circle cx="15" cy="14" r="2.6" fill={eyeWhite} />
      <circle cx="15.3" cy="14.2" r="1.3" fill={eyePupil} />
      <circle cx="16" cy="13.5" r="0.5" fill={eyeWhite} />

      {/* Right Eye */}
      <circle cx="21" cy="14" r="2.6" fill={eyeWhite} />
      <circle cx="20.7" cy="14.2" r="1.3" fill={eyePupil} />
      <circle cx="21.4" cy="13.5" r="0.5" fill={eyeWhite} />

      {/* Smile */}
      <path
        d="M16.5 17.2Q18 18.3 19.5 17.2"
        stroke={eyeWhite}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />

      {/* --- AI Sparkles --- */}
      {sparkles && (
        <g>
          {/* Main Top-Right Sparkle */}
          <path
            d="M31 3C31 5.2 32.8 7 35 7C32.8 7 31 8.8 31 11C31 8.8 29.2 7 27 7C29.2 7 31 5.2 31 3Z"
            fill={sparkleColor}
          />

          {/* Secondary Top-Left Sparkle */}
          <path
            d="M4 4C4 5.5 5.2 6.7 6.7 6.7C5.2 6.7 4 7.9 4 9.4C4 7.9 2.8 6.7 1.3 6.7C2.8 6.7 4 5.5 4 4Z"
            fill={sparkleColor}
          />

          {/* Small Accent Sparkle (Bottom-Right) */}
          <path
            d="M33 27C33 27.8 33.7 28.5 34.5 28.5C33.7 28.5 33 29.2 33 30C33 29.2 32.3 28.5 31.5 28.5C32.3 28.5 33 27.8 33 27Z"
            fill={sparkleColor}
            opacity="0.9"
          />
        </g>
      )}
    </svg>
  );
}
