import React, { useEffect, useRef } from 'react';
import type { Thread } from '../../../store/types';
import { useGameStore } from '../../../store/useGameStore';

const SharkLoanPanel: React.FC = () => {
  const borrowFromShark = useGameStore((state) => state.borrowFromShark);
  const repayShark = useGameStore((state) => state.repayShark);
  const sharkDebt = useGameStore((state) => state.sharkDebt);
  const cash = useGameStore((state) => state.cash);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const getNetWorth = useGameStore((state) => state.getNetWorth);

  const PRESET_AMOUNTS = [1000000, 2500000, 5000000, 10000000]; // $10k, $25k, $50k, $100k in cents
  const PRESET_LABELS = ['$10,000', '$25,000', '$50,000', '$100,000'];

  const netWorth = getNetWorth();
  const isDisabled = gameStatus === 'ended';
  const canRepay = sharkDebt > 0 && cash >= sharkDebt;

  return (
    <div className="shark-loan-panel">
      {sharkDebt > 0 && (
        <div className="shark-debt-display pixel-bold">
          OUTSTANDING: ${(sharkDebt / 100).toLocaleString()}
        </div>
      )}
      {sharkDebt > 0 && (
        <button
          className="shark-repay-btn pixel-bold"
          onClick={repayShark}
          disabled={isDisabled || !canRepay}
          title={!canRepay ? `Need $${(sharkDebt / 100).toLocaleString()} to repay` : undefined}
        >
          {canRepay ? `PAY OFF DEBT — $${(sharkDebt / 100).toLocaleString()}` : `CAN'T AFFORD — $${(sharkDebt / 100).toLocaleString()} OWED`}
        </button>
      )}
      <div className="shark-borrow-label pixel-bold">BORROW:</div>
      <div className="shark-borrow-buttons">
        {PRESET_AMOUNTS.map((amount, i) => (
          <button
            key={amount}
            className="shark-borrow-btn pixel-bold"
            onClick={() => borrowFromShark(amount)}
            disabled={isDisabled || sharkDebt + amount > netWorth + 10000000}
          >
            {PRESET_LABELS[i]}
          </button>
        ))}
      </div>
    </div>
  );
};

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
      {thread.contactName === 'Loan Shark' && <SharkLoanPanel />}
    </div>
  );
};
