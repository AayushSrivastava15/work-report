import React from 'react';
import { MotionConfig } from 'motion/react';

interface MotionProviderProps {
  children: React.ReactNode;
}

/**
 * Enterprise Motion Config Provider.
 * Automatically respects user's OS-level accessibility preference (prefers-reduced-motion: reduce).
 */
export const MotionProvider: React.FC<MotionProviderProps> = ({ children }) => {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
};
