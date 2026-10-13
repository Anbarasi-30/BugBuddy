/**
 * BugBuddyLogo — Reusable brand logo component.
 *
 * Props:
 *   size        — pixel size of the mascot image (default: 32)
 *   showWordmark — whether to show "BugBuddy" text next to the icon (default: true)
 *   tagline     — show tagline below wordmark (default: false)
 *   style       — additional inline styles for the wrapper
 *   className   — additional class names
 */

import { useTheme } from '../context/ThemeContext';

export default function BugBuddyLogo({
  size = 32,
  showWordmark = true,
  tagline = false,
  style = {},
  className = '',
}) {
  const { isDark } = useTheme();

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${Math.round(size * 0.3)}px`,
        textDecoration: 'none',
        ...style,
      }}
    >
      {/* Mascot image — transparent bg naturally visible on both themes */}
      <img
        src="/bugbuddy-mascot.png"
        alt="BugBuddy mascot"
        width={size}
        height={size}
        style={{
          objectFit: 'contain',
          flexShrink: 0,
          /*
           * The original image has a white background.
           * In dark mode we use CSS filter to remove it by using multiply blend
           * approach: drop-shadow keeps it crisp, and we brighten on dark bg.
           */
          filter: isDark
            ? 'drop-shadow(0 0 1px rgba(34,197,94,0.4)) brightness(1.05)'
            : 'none',
          borderRadius: `${Math.round(size * 0.18)}px`,
          background: 'transparent',
          /*
           * Key trick: In dark mode, set mix-blend-mode to 'screen' so the
           * white bg of the PNG blends away on the dark sidebar.
           * In light mode, normal rendering is fine.
           */
          mixBlendMode: isDark ? 'screen' : 'normal',
        }}
        draggable={false}
      />

      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: `${Math.round(size * 0.5625)}px`,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
            }}
          >
            BugBuddy
          </span>
          {tagline && (
            <span
              style={{
                fontSize: `${Math.round(size * 0.3125)}px`,
                color: '#22C55E',
                fontWeight: 600,
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              Find the Bug. Build the Skill.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
