import React from 'react';
import { motion } from 'motion/react';
import { cardItemVariants } from '../../motion';

interface AuthCardProps {
  children: React.ReactNode;
  variant?: 'compact' | 'wide';
  className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  children,
  variant = 'compact',
  className = '',
}) => {
  const maxWidthClass = variant === 'wide' ? 'max-w-[740px]' : 'max-w-[440px]';

  return (
    <motion.div
      layout
      variants={cardItemVariants}
      initial="initial"
      animate="animate"
      transition={{ layout: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
      className={`w-full mx-auto ${maxWidthClass} bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 sm:p-7 md:p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
};
