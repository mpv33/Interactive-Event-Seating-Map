import { useEffect, useState } from 'react';
import { Seat, Venue } from '../types';

export function useSeats(venue: Venue | null) {
  const [seats, setSeats] = useState<Seat[]>([]);

  useEffect(() => {
    if (!venue) return;

    const list: Seat[] = [];

    for (const sec of venue.sections) {
      for (const row of sec.rows) {
        for (let i = 0; i < row.seats.length; i++) {
          const s = row.seats[i];

          // Rebuild with explicit fields
          const seat: Seat = {
            ...s,
            section: sec.label ?? sec.id,
            row: row.index,
            col: i + 1,
            status: s.status ?? 'available'
          };

          list.push(seat);
        }
      }
    }

    setSeats(list);
  }, [venue]);

  return [seats, setSeats] as const;
}
