import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

export function useMarketClock() {
  useEffect(() => {
    const intervalId = setInterval(() => {
      const state = useGameStore.getState();
      if (state.gameStatus !== 'playing') return;
      state.tickMarket();
    }, 2000);

    return () => clearInterval(intervalId);
  }, []); // Empty deps — one interval per game session mount
}
