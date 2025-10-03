import { useEffect } from 'react';
import { Seat } from '../types';

export function useWebSocketSimulation(setSeats: React.Dispatch<React.SetStateAction<Seat[]>>) {
  useEffect(() => {
    const choices: Seat['status'][] = ['available', 'sold', 'reserved', 'held'];
    const interval = setInterval(() => {
      setSeats(prev => {
        if (prev.length === 0) return prev;
        const idx = Math.floor(Math.random() * prev.length);
        const copy = prev.slice();
        copy[idx] = { ...copy[idx], status: choices[Math.floor(Math.random() * choices.length)] };
        return copy;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [setSeats]);
}
