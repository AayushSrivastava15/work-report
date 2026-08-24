import React, { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number; // duration in ms
  formatter?: (val: number) => string;
  className?: string;
}

/**
 * AnimatedNumber Component.
 * Smoothly interpolates numeric KPI counters from current value to next value.
 * Uses requestAnimationFrame with cubic-out easing curve for fluid, responsive count-up.
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 600,
  formatter = (val) => Math.round(val).toLocaleString(),
  className,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || duration <= 0) {
      setDisplayValue(value);
      return;
    }

    const startValue = displayValue;
    const endValue = value;
    const startTime = performance.now();

    let rafId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease Out Cubic: 1 - Math.pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [value, duration]);

  return <span className={className}>{formatter(displayValue)}</span>;
};
