import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Robbinghood } from '../Trade/Robbinghood';
import { GuruTube } from './GuruTube';
import './LaptopBrowser.css';

type LaptopTab = 'ROBBINGHOOD' | 'GURUTUBE';

export const LaptopBrowser: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LaptopTab>('ROBBINGHOOD');

  return (
    <div className="laptop-browser-container">
      {/* Browser Tab Bar */}
      <div className="browser-tabs">
        <button 
          className={`browser-tab ${activeTab === 'ROBBINGHOOD' ? 'active' : ''}`}
          onClick={() => setActiveTab('ROBBINGHOOD')}
        >
          <span className="tab-icon">📈</span>
          <span className="tab-label">Robbinghood</span>
        </button>
        <button 
          className={`browser-tab ${activeTab === 'GURUTUBE' ? 'active' : ''}`}
          onClick={() => setActiveTab('GURUTUBE')}
        >
          <span className="tab-icon">📺</span>
          <span className="tab-label">GuruTube</span>
        </button>
        <div className="browser-new-tab">+</div>
      </div>

      {/* Address Bar */}
      <div className="browser-address-bar">
        <div className="browser-nav-btns">
          <span>←</span>
          <span>→</span>
          <span>↻</span>
        </div>
        <div className="address-input">
          {activeTab === 'ROBBINGHOOD' ? 'https://robbinghood.com/portfolio' : 'https://gurutube.com/live/stonks'}
        </div>
      </div>

      {/* Browser Content Area */}
      <div className="browser-content">
        <AnimatePresence mode="wait">
          {activeTab === 'ROBBINGHOOD' ? (
            <motion.div
              key="rh"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              style={{ height: '100%' }}
            >
              <Robbinghood />
            </motion.div>
          ) : (
            <motion.div
              key="gt"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              style={{ height: '100%' }}
            >
              <GuruTube />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
