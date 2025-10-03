import { useEffect } from 'react';
import { Seat } from '../types';

export function useKeyboardNav(
  seats: Seat[],
  selected: Record<string, Seat>,
  setSelected: React.Dispatch<React.SetStateAction<Record<string, Seat>>>,
  maxSelect = 8
) {
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (!ev.key.startsWith('Arrow')) return;
      ev.preventDefault();
      if (seats.length === 0) return;

      const selectedIds = Object.keys(selected);
      let current: Seat | null = null;
      if (selectedIds.length > 0) current = seats.find(s => s.id === selectedIds[selectedIds.length - 1]) || null;
      else current = seats[0];

      if (!current) return;

      const dir = ev.key === 'ArrowLeft' ? 'left' : ev.key === 'ArrowRight' ? 'right' : ev.key === 'ArrowUp' ? 'up' : 'down';
      let best: Seat | null = null;
      let bestScore = Infinity;

      for (const s of seats) {
        if (s.id === current!.id) continue;
        const dx = s.x - current.x;
        const dy = s.y - current.y;
        let valid = false;
        let score = 0;

        if (dir === 'left' && dx < 0) { valid = true; score = Math.abs(dy) + Math.abs(dx); }
        if (dir === 'right' && dx > 0) { valid = true; score = Math.abs(dy) + Math.abs(dx); }
        if (dir === 'up' && dy < 0) { valid = true; score = Math.abs(dx) + Math.abs(dy); }
        if (dir === 'down' && dy > 0) { valid = true; score = Math.abs(dx) + Math.abs(dy); }

        if (valid && score < bestScore) { bestScore = score; best = s; }
      }

      if (best) {
        setSelected(prev => {
          const copy = { ...prev };
          if (copy[best!.id]) delete copy[best!.id];
          else if (Object.keys(copy).length < maxSelect) copy[best!.id] = best!;
          return copy;
        });
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [seats, selected, setSelected, maxSelect]);
}
