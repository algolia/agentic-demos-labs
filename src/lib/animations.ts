/**
 * Shared animation constants for consistent motion across the app.
 * Use these with Framer Motion or CSS transitions.
 */

// Durations (in seconds for Framer Motion)
export const DURATION_FAST = 0.15
export const DURATION_NORMAL = 0.2
export const DURATION_SLOW = 0.3

// Easing curves
export const EASE_DEFAULT = [0.25, 0.1, 0.25, 1] as const
export const EASE_SMOOTH = [0.4, 0, 0.2, 1] as const
export const EASE_BOUNCE = [0.34, 1.56, 0.64, 1] as const

// Clip paths for reveal animations
export const CLIP_PATH_VISIBLE = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
export const CLIP_PATH_HIDDEN_RIGHT =
  'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)'
export const CLIP_PATH_HIDDEN_BOTTOM =
  'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)'

// Common transition presets
export const transitionFast = {
  duration: DURATION_FAST,
  ease: EASE_DEFAULT,
} as const

export const transitionNormal = {
  duration: DURATION_NORMAL,
  ease: EASE_DEFAULT,
} as const

export const transitionSmooth = {
  duration: DURATION_NORMAL,
  ease: EASE_SMOOTH,
} as const
