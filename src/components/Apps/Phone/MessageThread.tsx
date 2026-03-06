import React, { useEffect, useRef } from 'react';
import { Thread } from '../../../store/types';

interface MessageThreadProps {
  thread: Thread;
  initialLastReadDay: number;
  onBack: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ thread, initialLastReadDay, onBack }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread.messages]);

  // Reverse messages to show newest at bottom
  const displayMessages = [...thread.messages].reverse();

  return (
    <div className="message-thread-container">
      <div className="thread-header">
        <button className="back-button pixel-bold" onClick={onBack}>&lt; BACK</button>
        <div className="thread-contact-info">
          <span className="thread-avatar">{thread.avatar}</span>
          <span className="pixel-bold">{thread.contactName}</span>
        </div>
      </div>
      
      <div className="thread-messages phone-app-content" ref={scrollRef}>
        {displayMessages.map((msg, index) => {
          const isNew = msg.day > initialLastReadDay;
          const showNewSeparator = isNew && (index === 0 || displayMessages[index - 1].day <= initialLastReadDay);

          return (
            <React.Fragment key={msg.id}>
              {showNewSeparator && (
                <div className="new-messages-separator">
                  <span className="pixel-bold">NEW MESSAGES</span>
                </div>
              )}
              <div className={`chat-bubble ${msg.sender === 'YOU' ? 'me' : 'sender'}`}>
                <div className="chat-text pixel-bold">{msg.text}</div>
                <div className="chat-day">DAY {msg.day}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
