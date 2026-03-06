import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { MessageList } from './MessageList';
import { MessageThread } from './MessageThread';
import './Phone.css';

export const ChatApp: React.FC = () => {
  const threads = useGameStore((state) => state.threads);
  const setThreadRead = useGameStore((state) => state.setThreadRead);
  
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [initialLastReadDay, setInitialLastReadDay] = useState<number>(0);

  const sortedThreads = useMemo(() => {
    return Object.values(threads).sort((a, b) => {
      const aLastMsg = a.messages[0];
      const bLastMsg = b.messages[0];
      
      if (!aLastMsg && !bLastMsg) return 0;
      if (!aLastMsg) return 1;
      if (!bLastMsg) return -1;
      
      return bLastMsg.day - aLastMsg.day;
    });
  }, [threads]);

  const handleSelectThread = (contactId: string) => {
    const thread = threads[contactId];
    if (thread) {
      // Capture the lastReadDay BEFORE we mark it as read for the "New Messages" separator
      setInitialLastReadDay(thread.lastReadDay);
      setThreadRead(contactId);
      setSelectedContactId(contactId);
    }
  };

  const handleBack = () => {
    setSelectedContactId(null);
  };

  if (selectedContactId && threads[selectedContactId]) {
    return (
      <MessageThread 
        thread={threads[selectedContactId]} 
        initialLastReadDay={initialLastReadDay}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="phone-app-content" style={{ padding: 0 }}>
      <MessageList 
        threads={sortedThreads} 
        onSelectThread={handleSelectThread} 
      />
    </div>
  );
};
