import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { StockMarquee } from './StockMarquee';
import { MiniChart } from './MiniChart';
import './Laptop.css';
import './LaptopBrowser.css';

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
  
  const threads = useGameStore((state) => state.threads);
  const stocks = useGameStore((state) => state.stocks);
  const stockList = useMemo(() => Object.values(stocks), [stocks]);
  
  // Calculate Market Sentiment (Happy if > 50% of stocks are up)
  const marketSentiment = useMemo(() => {
    const upCount = stockList.filter(stock => {
      const prevPrice = stock.history.length > 1 ? stock.history[stock.history.length - 2].price : stock.currentPrice;
      return stock.currentPrice >= prevPrice;
    }).length;
    return upCount >= stockList.length / 2 ? 'HAPPY' : 'SAD';
  }, [stockList]);

  // Find the most recent guru message from the dedicated thread
  const advice = useMemo(() => {
    const guruThread = threads['Crypto Guru'];
    return guruThread?.messages[0]?.text || "DIAMOND HANDS ONLY! 💎🙌";
  }, [threads]);

  // Derive Guru Face
  const getGuruFace = () => {
    if (marketSentiment === 'HAPPY') {
      return frame === 0 ? '😎' : '🤑';
    } else {
      return frame === 0 ? '😨' : '😭';
    }
  };

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

      <StockMarquee stocks={stockList} />
      
      <div className="gurutube-main">
        <div className="video-player">
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.1s steps(2)',
            transform: frame === 1 ? 'scale(1.05)' : 'scale(1)',
            overflow: 'hidden'
          }}>
            <svg 
              viewBox="0 0 100 100" 
              preserveAspectRatio="xMidYMid meet"
              style={{ width: '85%', height: '85%', filter: 'drop-shadow(4px 4px 0px rgba(0,0,0,0.3))' }}
            >
              <text 
                x="50" 
                y="55" 
                fontSize="80" 
                textAnchor="middle" 
                dominantBaseline="middle"
                style={{ imageRendering: 'pixelated' }}
              >
                {getGuruFace()}
              </text>
            </svg>
          </div>
          <div className="video-overlay">
            <div className="live-badge">LIVE</div>
            <div className="viewer-count">420K watching</div>
          </div>
          
          <div className="trending-sidebar">
            <div className="trending-header">TRENDING</div>
            {stockList.map(stock => {
               const prevPrice = stock.history.length > 1 
                 ? stock.history[stock.history.length - 2].price 
                 : stock.currentPrice;
               const isUp = stock.currentPrice >= prevPrice;
               return (
                 <div key={stock.ticker} className="trending-item">
                   <div className="trending-info">
                     <span className="trending-ticker">{stock.ticker}</span>
                     <span className={`trending-price ${isUp ? 'up' : 'down'}`}>
                       ${(stock.currentPrice / 100).toFixed(2)}
                     </span>
                   </div>
                   <MiniChart data={stock.history.slice(-10).map(p => p.price)} width={40} height={15} />
                 </div>
               );
            })}
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
