import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../../store/useGameStore';
import { ChatApp } from './ChatApp';
import { WsbForum } from './WsbForum';
import './Phone.css';

type PhoneTab = 'CHAT' | 'FORUM';

export const PhoneApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PhoneTab>('CHAT');
  const hype = useGameStore((state) => state.hype);

  return (
    <motion.div 
      className="phone-app-container"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="phone-app-header">
        <span>PHONE v1.0</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>📶</span>
          <div className="battery-container">
            <div className="battery-body">
              <div className="battery-fill" style={{ width: '5%' }}></div>
            </div>
            <div className="battery-tip"></div>
            <span className="battery-text">5%</span>
          </div>
        </div>
      </div>

      <div className="fomo-meter-container">
        <div className="fomo-label">
          <span>HYPE LEVEL</span>
          <span>{hype}%</span>
        </div>
        <div className="fomo-bar-bg">
          <div 
            className="fomo-bar-fill" 
            style={{ width: `${hype}%` }}
          />
        </div>
      </div>

      <div className="phone-app-content-wrapper" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'CHAT' ? <ChatApp /> : <WsbForum />}
      </div>

      <div className="phone-tabs">
        <button 
          className={`phone-tab ${activeTab === 'CHAT' ? 'active' : ''}`}
          onClick={() => setActiveTab('CHAT')}
        >
          CHAT
        </button>
        <button 
          className={`phone-tab ${activeTab === 'FORUM' ? 'active' : ''}`}
          onClick={() => setActiveTab('FORUM')}
        >
          FORUM
        </button>
      </div>
    </motion.div>
  );
};
