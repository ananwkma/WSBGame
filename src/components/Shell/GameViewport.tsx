import React from 'react';
import './Shell.css';

interface GameViewportProps {
  children: React.ReactNode;
}

/**
 * Main container that enforces the 16:10 aspect ratio and handles global scaling.
 */
export const GameViewport: React.FC<GameViewportProps> = ({ children }) => {
  return (
    <div className="viewport">
      {children}
      <div className="crt-overlay">
        <div className="crt-scanlines" />
        <div className="crt-vignette" />
        <div className="crt-flicker" />
      </div>
    </div>
  );
};
