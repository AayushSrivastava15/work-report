import type { Variants } from 'motion/react';
import { duration, ease } from './motionTokens';

/**
 * Route & Page Transitions
 * Subtle, intentional upward reveal (6px) with soft fade
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 6,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.page,
      ease: ease.standard,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.15,
      ease: ease.in,
    },
  },
};

/**
 * Tab Content Transitions
 * Prevents abrupt visual cuts when switching between sub-tabs or views
 */
export const tabContentVariants: Variants = {
  initial: {
    opacity: 0,
    y: 4,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: ease.standard,
    },
  },
  exit: {
    opacity: 0,
    y: -3,
    transition: {
      duration: 0.12,
      ease: ease.in,
    },
  },
};

/**
 * Modal Dialog & Backdrop Transitions
 */
export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: duration.normal, ease: ease.out },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: ease.in },
  },
};

export const modalDialogVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.97,
    y: 6,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: ease.standard,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 4,
    transition: {
      duration: 0.15,
      ease: ease.in,
    },
  },
};

/**
 * Side Drawer Transitions (Slide in from right)
 */
export const drawerVariants: Variants = {
  initial: {
    x: '100%',
    boxShadow: 'none',
  },
  animate: {
    x: '0%',
    boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
    transition: {
      duration: duration.slow,
      ease: ease.standard,
    },
  },
  exit: {
    x: '100%',
    boxShadow: 'none',
    transition: {
      duration: 0.22,
      ease: ease.in,
    },
  },
};

/**
 * Stagger Container for Dashboard KPI Cards / List items
 */
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.02,
    },
  },
};

/**
 * Single Card Entrance & Micro-hover
 */
export const cardItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: ease.standard,
    },
  },
};

/**
 * Table Row / List Item Entrance
 */
export const tableRowVariants: Variants = {
  initial: {
    opacity: 0,
    y: 3,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.fast,
      ease: ease.out,
    },
  },
};

/**
 * Expandable Accordion / Panel
 */
export const accordionVariants: Variants = {
  initial: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
  },
  animate: {
    height: 'auto',
    opacity: 1,
    overflow: 'visible',
    transition: {
      height: { duration: duration.normal, ease: ease.standard },
      opacity: { duration: duration.normal, ease: ease.out },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    transition: {
      height: { duration: 0.18, ease: ease.in },
      opacity: { duration: 0.12, ease: ease.in },
    },
  },
};

/**
 * Dropdown Menu Variants
 */
export const dropdownVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: -4,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: duration.fast,
      ease: ease.out,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -3,
    transition: {
      duration: 0.1,
      ease: ease.in,
    },
  },
};

/**
 * Inline Form Validation Message (Smooth reveal without layout jump)
 */
export const validationMessageVariants: Variants = {
  initial: {
    opacity: 0,
    height: 0,
    y: -2,
  },
  animate: {
    opacity: 1,
    height: 'auto',
    y: 0,
    transition: {
      duration: duration.fast,
      ease: ease.out,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -2,
    transition: {
      duration: 0.1,
      ease: ease.in,
    },
  },
};

/**
 * Toast Notification Variants
 */
export const toastNotificationVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.96,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: duration.normal,
      ease: ease.standard,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.96,
    transition: {
      duration: 0.16,
      ease: ease.in,
    },
  },
};
