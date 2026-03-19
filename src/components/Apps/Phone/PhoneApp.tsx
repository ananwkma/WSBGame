import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatApp } from './ChatApp';
import { WsbForum } from './WsbForum';
import { useGameStore } from '../../../store/useGameStore';
import type { FocusArea } from '../../Shell/DualViewShell';
import './Phone.css';

type PhoneTab = 'UMESSAGE' | 'READIT';

interface PhoneAppProps {
  focus: FocusArea;
  setFocus: (f: FocusArea) => void;
}

interface LockNotif {
  id: string;
  contactName: string;
  preview: string;
  arrivedAt: number;
}

export const PhoneApp: React.FC<PhoneAppProps> = ({ focus, setFocus }) => {
  const [activeTab, setActiveTab] = useState<PhoneTab>('UMESSAGE');
  const threads = useGameStore((state) => state.threads);

  const prevFocusRef = useRef<FocusArea>(focus);
  // Initialize snapshot from current counts so pre-existing messages don't trigger stale notifications
  const lockSnapshotRef = useRef<Record<string, number>>(
    Object.fromEntries(Object.values(threads).map(t => [t.contactName, t.messages.length]))
  );
  const [lockNotifs, setLockNotifs] = useState<LockNotif[]>([]);

  // When phone becomes locked, snapshot current message counts and clear old notifs
  useEffect(() => {
    if (prevFocusRef.current === 'phone' && focus !== 'phone') {
      const snapshot: Record<string, number> = {};
      Object.values(threads).forEach(t => {
        snapshot[t.contactName] = t.messages.length;
      });
      lockSnapshotRef.current = snapshot;
      setLockNotifs([]);
    }
    prevFocusRef.current = focus;
  }, [focus, threads]);

  // Detect new messages while locked and add timestamped notifications
  useEffect(() => {
    if (focus === 'phone') return;

    const now = Date.now();
    const newNotifs: LockNotif[] = Object.values(threads)
      .filter(t => t.messages.length > (lockSnapshotRef.current[t.contactName] ?? 0))
      .map(t => ({
        id: `${t.contactName}-${t.messages.length}`,
        contactName: t.contactName,
        preview: t.messages[0]?.text ?? '',
        arrivedAt: now,
      }));

    if (newNotifs.length === 0) return;

    setLockNotifs(prev => {
      const merged = [...prev, ...newNotifs.filter(n => !prev.some(p => p.id === n.id))];
      return merged.slice(-3);
    });

    // Update snapshot so same messages don't re-trigger
    newNotifs.forEach(n => {
      const thread = Object.values(threads).find(t => t.contactName === n.contactName);
      if (thread) {
        lockSnapshotRef.current = {
          ...lockSnapshotRef.current,
          [n.contactName]: thread.messages.length,
        };
      }
    });
  }, [focus, threads]);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (lockNotifs.length === 0) return;

    const timer = setTimeout(() => {
      const cutoff = Date.now() - 5000;
      setLockNotifs(prev => prev.filter(n => n.arrivedAt > cutoff));
    }, 5100);

    return () => clearTimeout(timer);
  }, [lockNotifs]);

  return (
    <motion.div
      className="phone-app-container"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{ position: 'relative' }}
    >
      <AnimatePresence>
        {focus !== 'phone' && (
          <motion.div
            key="lock-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: '#000000',
              zIndex: 100,
              cursor: 'pointer',
              pointerEvents: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 8px 16px',
              fontFamily: 'monospace',
            }}
            onClick={() => setFocus('phone')}
          >
            {/* Top: branding */}
            <div style={{ color: '#a89f8c', fontSize: '11px', letterSpacing: '2px' }}>uPhone</div>

            {/* Middle: notification previews */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
              <AnimatePresence>
                {lockNotifs.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: '#1c1c17',
                      border: '1px solid #706b66',
                      padding: '5px 8px',
                      width: '90%',
                      fontSize: '10px',
                      fontFamily: 'monospace',
                    }}
                  >
                    <span style={{ color: '#706b66' }}>{n.contactName}</span>
                    <span style={{ color: '#a89f8c', marginLeft: '6px' }}>
                      {n.preview.length > 38 ? n.preview.slice(0, 38) + '...' : n.preview}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Bottom: unlock hint */}
            <div style={{ color: '#706b66', fontSize: '9px', letterSpacing: '2px' }}>TAP TO UNLOCK</div>
          </motion.div>
        )}
      </AnimatePresence>

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
