import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import './Laptop.css';

const FAKE_USERS = ['ApeLord', 'DiamondHands420', 'StonkMaster', 'TendieKing', 'BagHolder99', 'MoonMission', 'CramerInverse', 'PaperHandsLarry', 'YOLO_God'];
const FAKE_MESSAGES = [
  'LFG!!! 🚀🚀🚀',
  'TO THE MOON!',
  'BUY THE DIP',
  'HODL BROTHERS',
  'Just went all in on $GAME',
  'Gurus are actually right for once?',
  'Imagine selling now lol',
  '💎🙌 DIAMOND HANDS ONLY',
  'GUH.',
  'Show us the loss porn!!',
  'Is this financial advice? (no)',
  'My wife left me for a bear',
  'Bears are cooked 🐻🔥',
  'SHORT SQUEEZE INCOMING',
];

export const GuruTube: React.FC = () => {
  const [frame, setFrame] = useState(0);
  const [chatMessages, setChatMessages] = useState<{user: string, text: string, id: number}[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messages = useGameStore((state) => state.messages);
  
  // Find the most recent guru message (which now contains dynamic predictions)
  const advice = messages.find(m => m.sender === 'Crypto Guru')?.text || "DIAMOND HANDS ONLY! 💎🙌";

  useEffect(() => {
    const interval = setInterval(() => setFrame(f => (f === 0 ? 1 : 0)), 500); // 2fps
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const addMessage = () => {
      const newUser = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
      const newText = FAKE_MESSAGES[Math.floor(Math.random() * FAKE_MESSAGES.length)];
      const newMessage = { user: newUser, text: newText, id: Date.now() };
      
      setChatMessages(prev => [...prev.slice(-20), newMessage]);
    };

    const interval = setInterval(addMessage, 1500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

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
      
      <div className="gurutube-main">
        <div className="video-player">
          <div className={`guru-avatar frame-${frame}`}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              backgroundColor: frame === 0 ? '#e0dbcb' : '#a89f8c',
              border: '4px solid #2b2b26',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              {frame === 0 ? '😮' : '😐'}
            </div>
          </div>
          <div className="video-overlay">
            <div className="live-badge">LIVE</div>
            <div className="viewer-count">420K watching</div>
          </div>
        </div>

        <div className="live-chat">
          <div className="chat-header">LIVE CHAT</div>
          <div className="chat-messages" ref={chatContainerRef}>
            {chatMessages.map(msg => (
              <div key={msg.id} className="chat-msg">
                <span className="chat-user">{msg.user}:</span>
                <span className="chat-text">{msg.text}</span>
              </div>
            ))}
          </div>
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
