import React from 'react';
import { Seat } from '../types';

type Props = { selected: Record<string, Seat> };

export default function SelectionPanel({ selected }: Props) {
  const seats = Object.values(selected);
  const subtotal = seats.reduce((a, b) => a + b.price, 0);

  return (
    <div className="summary">
      <h3>Selection</h3>
      <p className="small">Click seats, use keyboard arrows. Max 8 seats.</p>

      <div className="small">Selected ({seats.length})</div>
      <div className="seat-list">
        {seats.map(s => (
          <div key={s.id}>
            Section {s.section}, Row {s.row}, Seat {s.col} • ₹{s.price}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        Subtotal: <strong>₹{subtotal}</strong>
      </div>
    </div>
  );
}
