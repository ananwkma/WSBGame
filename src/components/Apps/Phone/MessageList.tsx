import React from 'react';
import type { Thread } from '../../../store/types';

interface MessageListProps {
  threads: Thread[];
  onSelectThread: (contactId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ threads, onSelectThread }) => {
  return (
    <div className="message-list">
      {threads.map((thread) => {
        const lastMessage = thread.messages[0];
        const hasUnread = (thread.unreadCount ?? 0) > 0;

        return (
          <div 
            key={thread.contactName} 
            className="message-list-item"
            onClick={() => onSelectThread(thread.contactName)}
          >
            <div className="contact-avatar">{thread.avatar}</div>
            <div className="contact-info">
              <div className="contact-name-row">
                <span className="contact-name pixel-bold">{thread.contactName}</span>
                {hasUnread && <div className="unread-dot" />}
              </div>
              <div className="last-message-snippet">
                {lastMessage ? lastMessage.text : 'No messages'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
