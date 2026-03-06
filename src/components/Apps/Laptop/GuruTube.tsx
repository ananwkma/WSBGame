import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../../store/useGameStore';
import './Laptop.css';

export const GuruTube: React.FC = () => {
  const [frame, setFrame] = useState(0);
  const messages = useGameStore((state) => state.messages);
  // Find the most recent guru message
  const advice = messages.find(m => m.sender === 'Crypto Guru')?.text || "DIAMOND HANDS ONLY! 💎🙌";

  useEffect(() => {
    const interval = setInterval(() => setFrame(f => (f === 0 ? 1 : 0)), 500); // 2fps
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="gurutube-container"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="gurutube-header">
        <span style={{ fontWeight: 'bold', color: '#e0dbcb' }}>GuruTube</span>
        <div className="gurutube-controls">
          <button className="pixel-btn">▶</button>
          <button className="pixel-btn">🔊</button>
        </div>
      </div>
      
      <div className="video-player">
        <div className={`guru-avatar frame-${frame}`}>
          {/* Simple pixel art face using CSS gradients/shadows could go here, 
              but for now we'll use a placeholder block that changes color slightly */}
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: frame === 0 ? '#e0dbcb' : '#a89f8c',
            border: '4px solid #2b2b26',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {frame === 0 ? '😮' : '😐'}
          </div>
        </div>
        <div className="video-overlay">
          <div className="live-badge">LIVE</div>
          <div className="viewer-count">420K watching</div>
        </div>
      </div>

      <div className="advice-marquee">
        <div className="scroll-text">
          BREAKING: {advice}  +++  STONKS ONLY GO UP  +++  BUY THE DIP  +++
        </div>
      </div>
    </motion.div>
  );
};
