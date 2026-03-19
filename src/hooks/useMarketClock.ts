import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

const BASE_INTERVAL_MS = 2000;

export function useMarketClock(speed: 1 | 2 | 5 | 10 | 100 = 1) {
  useEffect(() => {
    const intervalId = setInterval(() => {
      const state = useGameStore.getState();
      if (state.gameStatus !== 'playing') return;
      state.tickMarket();
    }, BASE_INTERVAL_MS / speed);

    return () => clearInterval(intervalId);
  }, [speed]);
}
