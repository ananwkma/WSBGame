import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';

const PopupText: React.FC = () => {
  const popups = useGameStore((state) => state.popups);
  const removePopup = useGameStore((state) => state.removePopup);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AnimatePresence>
        {popups.map((popup) => (
          <SinglePopup
            key={popup.id}
            id={popup.id}
            text={popup.text}
            type={popup.type}
            onComplete={() => removePopup(popup.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface SinglePopupProps {
  id: string;
  text: string;
  type: 'positive' | 'negative' | 'neutral';
  onComplete: () => void;
}

const SinglePopup: React.FC<SinglePopupProps> = ({ text, type, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getColor = () => {
    switch (type) {
      case 'positive': return '#FFFFFF';
      case 'negative': return '#333333';
      default: return '#888888';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1.2, y: -100 }}
      exit={{ opacity: 0, scale: 1.5 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        color: getColor(),
        fontWeight: 'bold',
        fontSize: '32px',
        textShadow: type === 'positive' ? '2px 2px 0px #000' : '2px 2px 0px #fff',
        fontFamily: '"Press Start 2P", cursive', // Assuming pixel font is available
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </motion.div>
  );
};

export default PopupText;
