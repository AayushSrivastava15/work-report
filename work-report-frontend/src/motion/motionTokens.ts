/**
 * Centralized Motion Tokens for the Work Report Platform.
 * Follows enterprise guidelines: subtle, responsive, intentional, and high-performance.
 */

export const duration = {
  instant: 0.05,
  fast: 0.15,      // Micro-interactions, button clicks, badge toggles
  normal: 0.24,    // Tabs, dropdowns, card entrances, accordions
  slow: 0.35,      // Modals, drawers, major section transitions
  page: 0.28,      // Page route transitions
} as const;

export const ease = {
  // Deceleration curve for elements entering the screen
  standard: [0.22, 1, 0.36, 1] as const,
  // Snappy deceleration
  out: [0.16, 1, 0.3, 1] as const,
  // Smooth symmetrical curve
  inOut: [0.4, 0, 0.2, 1] as const,
  // Gentle acceleration for exits
  in: [0.32, 0, 0.67, 0] as const,
} as const;

export const spring = {
  snappy: { type: 'spring', stiffness: 450, damping: 35 } as const,
  gentle: { type: 'spring', stiffness: 300, damping: 28 } as const,
  subtle: { type: 'spring', stiffness: 200, damping: 24 } as const,
} as const;

export const stagger = {
  fast: 0.025,
  normal: 0.04,
  cardList: 0.03,
} as const;
