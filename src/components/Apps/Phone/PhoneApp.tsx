import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChatApp } from './ChatApp';
import { WsbForum } from './WsbForum';
import './Phone.css';

type PhoneTab = 'UMESSAGE' | 'READIT';

export const PhoneApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PhoneTab>('UMESSAGE');

  return (
    <motion.div
      className="phone-app-container"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="phone-app-header">
        <span>uPhone</span>
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

      <div className="phone-app-content-wrapper" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'UMESSAGE' ? <ChatApp /> : <WsbForum />}
      </div>

      <div className="phone-tabs">
        <button
          className={`phone-tab ${activeTab === 'UMESSAGE' ? 'active' : ''}`}
          onClick={() => setActiveTab('UMESSAGE')}
        >
          uMessage
        </button>
        <button
          className={`phone-tab ${activeTab === 'READIT' ? 'active' : ''}`}
          onClick={() => setActiveTab('READIT')}
        >
          readit
        </button>
      </div>
    </motion.div>
  );
};
