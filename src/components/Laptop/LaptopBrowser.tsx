import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Robbinghood } from '../Trade/Robbinghood';
import { GuruTube } from './GuruTube';
import { ReaditTab } from './ReaditTab';
import './LaptopBrowser.css';

type LaptopTab = 'ROBBINGHOOD' | 'GURUTUBE' | 'READIT';

export const LaptopBrowser: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LaptopTab>('ROBBINGHOOD');

  const addressUrl =
    activeTab === 'ROBBINGHOOD'
      ? 'https://robbinghood.com/portfolio'
      : activeTab === 'GURUTUBE'
      ? 'https://gurutube.com/live/stonks'
      : 'https://readit.com/r/wallstreetbets';

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
        <button
          className={`browser-tab ${activeTab === 'READIT' ? 'active' : ''}`}
          onClick={() => setActiveTab('READIT')}
        >
          <span className="tab-icon">🗣</span>
          <span className="tab-label">readit</span>
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
        <div className="address-input">{addressUrl}</div>
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
          ) : activeTab === 'GURUTUBE' ? (
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
          ) : (
            <motion.div
              key="readit"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              style={{ height: '100%' }}
            >
              <ReaditTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
