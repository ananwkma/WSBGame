import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import './Phone.css';

export const ChatApp: React.FC = () => {
  const messages = useGameStore((state) => state.messages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0; // Newest messages at top in store, but usually chat scrolls to bottom
      // Actually, store unshifts messages, so newest are at index 0.
      // If we want newest at bottom, we should reverse or append.
      // Let's check processEvents in store. 
      // It uses unshift, so index 0 is newest.
    }
  }, [messages]);

  return (
    <div className="phone-app-content" ref={scrollRef}>
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`chat-bubble ${msg.sender === 'YOU' ? 'me' : 'sender'}`}
        >
          {msg.sender !== 'YOU' && (
            <div className="chat-sender-name">{msg.sender}</div>
          )}
          <div className="chat-text pixel-bold">{msg.text}</div>
        </div>
      ))}
    </div>
  );
};
