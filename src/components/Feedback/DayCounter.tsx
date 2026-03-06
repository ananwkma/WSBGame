import React from 'react';
import { useGameStore } from '../../store/useGameStore';

export const DayCounter: React.FC = () => {
  const day = useGameStore((state) => state.day);

  return (
    <div className="day-counter">
      DAY {day}
    </div>
  );
};
