import React, { useEffect, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import './Shell.css';

export type FocusArea = 'laptop' | 'phone';

interface DualViewShellProps {
  focus: FocusArea;
  setFocus: (focus: FocusArea) => void;
  laptopContent?: React.ReactNode;
  phoneContent?: React.ReactNode;
}

/**
 * Split-view layout for Laptop and Phone interfaces.
 * Focus state determines which view is larger and primary.
 */
export const DualViewShell: React.FC<DualViewShellProps> = ({
  focus,
  setFocus,
  laptopContent,
  phoneContent
}) => {
  const controls = useAnimationControls();
  const threads = useGameStore((state) => state.threads);

  const totalMessages = Object.values(threads).reduce((sum, t) => sum + t.messages.length, 0);
  const prevTotalRef = useRef(totalMessages);

  useEffect(() => {
    if (totalMessages > prevTotalRef.current) {
      controls.start({
        x: [0, -10, 10, -8, 8, -5, 5, -3, 3, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      }).then(() => controls.set({ x: 0 }));
    }
    prevTotalRef.current = totalMessages;
  }, [totalMessages, controls]);

  return (
    <div className={`dualViewShell ${focus === 'laptop' ? 'focusLaptop' : 'focusPhone'}`}>
      <div className="laptopView" onClick={() => setFocus('laptop')}>
        <div className="screenContent">
          {laptopContent || <div>[Laptop Interface]</div>}
        </div>
      </div>

      <motion.div
        className="phoneView"
        onClick={() => setFocus('phone')}
        animate={controls}
      >
        <div className="screenContent">
          {phoneContent || <div>[Phone Interface]</div>}
        </div>
      </motion.div>
    </div>
  );
};
