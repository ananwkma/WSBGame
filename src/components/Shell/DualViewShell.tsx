import React from 'react';
import { motion } from 'framer-motion';
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
        animate={{ x: 0, y: 0 }}
      >
        <div className="screenContent">
          {phoneContent || <div>[Phone Interface]</div>}
        </div>
      </motion.div>
    </div>
  );
};
