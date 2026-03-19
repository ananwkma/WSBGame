import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';

const PopupText: React.FC = () => {
  const popups = useGameStore((state) => state.popups);
  const removePopup = useGameStore((state) => state.removePopup);

  // Neutral popups (NEXT DAY) on top, status popups below
  const sorted = [...popups].sort((a, b) => {
    if (a.type === 'neutral' && b.type !== 'neutral') return -1;
    if (a.type !== 'neutral' && b.type === 'neutral') return 1;
    return 0;
  });

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
        {sorted.map((popup, index) => (
          <SinglePopup
            key={popup.id}
            id={popup.id}
            text={popup.text}
            type={popup.type}
            index={index}
            total={sorted.length}
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
  index: number;
  total: number;
  onComplete: () => void;
}

const SinglePopup: React.FC<SinglePopupProps> = ({ text, type, index, total, onComplete }) => {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  useEffect(() => {
    const timer = setTimeout(() => onCompleteRef.current(), 1000);
    return () => clearTimeout(timer);
  }, []);

  const isNeutral = type === 'neutral';

  const getColor = () => {
    switch (type) {
      case 'positive': return '#94ba8b';
      case 'negative': return '#ba8b8b';
      default: return '#666655';
    }
  };

  // Stack popups vertically: neutral sits above status popup
  // With 2 items: index 0 (neutral) at -120, index 1 (status) at -60
  // With 1 item: centered at -90
  const spacing = 60;
  const centerOffset = ((total - 1) / 2) * spacing;
  const yTarget = -90 - centerOffset + index * spacing;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: yTarget + 30 }}
      animate={{ opacity: 1, scale: isNeutral ? 1.0 : 1.2, y: yTarget }}
      exit={{ opacity: 0, scale: isNeutral ? 0.8 : 1.5 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        color: getColor(),
        fontWeight: 'bold',
        fontSize: isNeutral ? '14px' : '32px',
        textShadow: isNeutral ? 'none' : '2px 2px 0px #000',
        fontFamily: '"Press Start 2P", cursive',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        letterSpacing: isNeutral ? '2px' : undefined,
      }}
    >
      {text}
    </motion.div>
  );
};

export default PopupText;
