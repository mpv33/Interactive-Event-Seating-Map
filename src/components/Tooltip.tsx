import React from 'react';
import { Seat } from '../types';

type Props = { hover: Seat | null; left?: number; top?: number };

export default function Tooltip({ hover, left = 0, top = 0 }: Props) {
  if (!hover) return null;
  return (
    <div className='tooltip' style={{ position: 'absolute', left, top, pointerEvents: 'none' }}>
      Section {hover.section}, Row {hover.row}, Seat {hover.col}<br />
      ₹{hover.price} • {hover.status}
    </div>
  );
}
