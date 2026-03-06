import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';

const ScreenFlash: React.FC = () => {
  const lastFlash = useGameStore((state) => state.lastFlash);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (lastFlash) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [lastFlash]);

  const getColor = () => {
    if (!lastFlash) return 'transparent';
    switch (lastFlash.type) {
      case 'positive': return 'rgba(255, 255, 255, 0.8)'; // Bright white
      case 'negative': return 'rgba(0, 0, 0, 0.5)';     // Dark shadow
      default: return 'rgba(128, 128, 128, 0.3)';      // Mid-gray
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: getColor(),
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        />
      )}
    </AnimatePresence>
  );
};

export default ScreenFlash;
