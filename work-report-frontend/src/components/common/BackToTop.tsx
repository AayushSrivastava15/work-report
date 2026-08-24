import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp } from 'lucide-react';
import { useSmoothScroll } from '../../motion';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    scrollTo(0, { duration: 0.7 });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleClick}
          aria-label="Scroll back to top"
          className="fixed bottom-6 right-6 z-40 p-2.5 bg-slate-900/90 text-white rounded-xl shadow-lg hover:bg-slate-800 hover:shadow-xl transition-colors cursor-pointer border border-slate-700/50 backdrop-blur-xs flex items-center justify-center group"
        >
          <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
