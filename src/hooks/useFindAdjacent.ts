import { Seat } from '../types';

export function useFindAdjacent(seats: Seat[], maxSelect = 8) {
  return function findAdjacent(
    n: number,
    setSelected: React.Dispatch<React.SetStateAction<Record<string, Seat>>>,
    setHover?: (s: Seat | null) => void
  ) {
    if (n <= 0) return;
    let bestBlock: Seat[] | null = null;
    let bestPrice = Infinity;

    const byRow = new Map<string, Seat[]>();
    for (const s of seats) {
      const k = `${s.section}-${s.row}`;
      if (!byRow.has(k)) byRow.set(k, []);
      byRow.get(k)!.push(s);
    }

    for (const [, arr] of byRow.entries()) {
      const sorted = arr.slice().sort((a, b) => a.col - b.col);
      for (let i = 0; i <= sorted.length - n; i++) {
        const block = sorted.slice(i, i + n);
        if (block.every(b => b.status === 'available')) {
          const sum = block.reduce((a, b) => a + b.price, 0);
          if (sum < bestPrice) {
            bestPrice = sum;
            bestBlock = block;
          }
        }
      }
    }

    if (bestBlock) {
      setSelected(prev => {
        const copy = { ...prev };
        for (const s of bestBlock!) {
          if (Object.keys(copy).length < maxSelect) copy[s.id] = s;
        }
        return copy;
      });

      if (setHover) {
        setHover(bestBlock[0]);
        setTimeout(() => setHover(null), 1400);
      }

      alert('Found block of ' + n + ' adjacent seats: ' + bestBlock.map(b => b.id).join(', '));
    } else {
      alert('No block of ' + n + ' adjacent available seats found');
    }
  };
}
