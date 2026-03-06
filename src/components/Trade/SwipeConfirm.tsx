import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface SwipeConfirmProps {
  onConfirm: () => void;
  label: string;
  width?: number;
}

export const SwipeConfirm: React.FC<SwipeConfirmProps> = ({ 
  onConfirm, 
  label, 
  width = 240 
}) => {
  const x = useMotionValue(0);
  const background = useTransform(x, [0, width - 40], ['#706b66', '#e0dbcb']);
  const textColor = useTransform(x, [0, width - 40], ['#e0dbcb', '#2b2b26']);

  const handleDragEnd = () => {
    if (x.get() > width - 60) {
      onConfirm();
    }
  };

  return (
    <div 
      className="swipe-track"
      style={{
        width,
        height: 48,
        backgroundColor: '#2b2b26', // darkest
        border: '2px solid #706b66', // gray-dark
        position: 'relative',
        borderRadius: '0',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <motion.div 
        style={{ 
          position: 'absolute', 
          left: 0, 
          top: 0, 
          bottom: 0, 
          width: x, 
          background,
          zIndex: 1
        }} 
      />
      
      <motion.span 
        style={{ 
          color: textColor, 
          fontSize: '12px', 
          fontWeight: 'bold', 
          zIndex: 2,
          pointerEvents: 'none'
        }}
      >
        {label}
      </motion.span>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: width - 40 }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{
          x,
          width: 40,
          height: 40,
          backgroundColor: '#e0dbcb', // lightest
          border: '2px solid #706b66',
          position: 'absolute',
          left: 2,
          cursor: 'grab',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        whileTap={{ cursor: 'grabbing' }}
      >
        <div style={{ width: 10, height: 10, borderRight: '2px solid #2b2b26', borderBottom: '2px solid #2b2b26', transform: 'rotate(-45deg)' }} />
      </motion.div>
    </div>
  );
};
