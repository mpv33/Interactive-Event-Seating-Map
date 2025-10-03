import React, { useEffect } from 'react';
import { Seat, Venue } from '../types';

type Props = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  seats: Seat[];
  selected: Record<string, Seat>;
  heatmap: boolean;
  hover: Seat | null;
  venue: Venue;
};

export default function SeatCanvasRenderer({ canvasRef, seats, selected, heatmap, hover, venue }: Props) {
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let raf = 0; let dirty = true;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    const resize = () => {
      const w = venue.map.width; const h = venue.map.height;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dirty = true;
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      if (!dirty) { raf = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#021018';
      ctx.fillRect(0, 0, venue.map.width, venue.map.height);

      for (const s of seats) {
        const isSelected = !!selected[s.id];
        let fill = '#0b8a4e';
        if (s.status === 'sold') fill = '#7f1d1d';
        else if (s.status === 'reserved') fill = '#b45309';
        else if (s.status === 'held') fill = '#334155';

        if (heatmap) {
          const t = Math.min(1, (s.priceTier - 1) / 3);
          const g = Math.floor(200 - t * 120);
          const r = Math.floor(80 + t * 160);
          fill = `rgb(${r},${g},70)`;
        }

        ctx.beginPath();
        const size = 8;
        ctx.fillStyle = fill;
        ctx.strokeStyle = isSelected ? '#ffd700' : 'rgba(0,0,0,0)';
        ctx.lineWidth = isSelected ? 2 : 0;
        ctx.rect(s.x - size / 2, s.y - size / 2, size, size);
        ctx.fill();
        if (isSelected) ctx.stroke();
      }

      if (hover) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(hover.x - 6, hover.y - 6, 12, 12);
      }

      dirty = false; raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, [canvasRef, seats, selected, heatmap, hover, venue]);

  return null;
}
