import React, { useEffect, useRef, useState } from 'react';
import { Venue, Seat } from '../types';
import { useSeats } from '../hooks/useSeats';
import { useWebSocketSimulation } from '../hooks/useWebSocketSimulation';
import { SpatialHash } from '../utils/spatialHash';
import SeatCanvasRenderer from './SeatCanvasRenderer';
import Controls from './Controls';
import Tooltip from './Tooltip';
import { useFindAdjacent } from '../hooks/useFindAdjacent';
import { useKeyboardNav } from '../hooks/useKeyboardNav';

type Props = {
  venue: Venue;
  selected: Record<string, Seat>;
  setSelected: React.Dispatch<React.SetStateAction<Record<string, Seat>>>;
};

const maxSelect = 8;

export default function CanvasSeatMap({ venue, selected, setSelected }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [seats, setSeats] = useSeats(venue);
  const [heatmap, setHeatmap] = useState(false);
  const [hover, setHover] = useState<Seat | null>(null);
  const [tipPos, setTipPos] = useState<{ left: number; top: number } | null>(null);
  const spatialRef = useRef<SpatialHash | null>(null);

  // Build spatial hash for fast hit-testing
  useEffect(() => {
    if (seats.length === 0) return;
    const sh = new SpatialHash(48);
    for (const s of seats) sh.insert(s);
    spatialRef.current = sh;
  }, [seats]);

  // Simulate websocket seat updates
  useWebSocketSimulation(setSeats);

  // Helpers
  const findAdjacent = useFindAdjacent(seats, maxSelect);
  useKeyboardNav(seats, selected, setSelected, maxSelect);

  const hitTest = (x: number, y: number) => {
    const sh = spatialRef.current; if (!sh) return null;
    const candidates = sh.query(x, y);
    let best: Seat | null = null; let bestd = Infinity;
    for (const c of candidates) {
      const dx = c.x - x, dy = c.y - y; const d = dx * dx + dy * dy;
      if (d < bestd && d < 400) { best = c; bestd = d; }
    }
    return best;
  };

  // Mouse interactions
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = () => canvas.getBoundingClientRect();
    const toLocal = (e: MouseEvent) => {
      const r = rect();
      return { x: (e.clientX - r.left), y: (e.clientY - r.top), clientX: e.clientX, clientY: e.clientY };
    };

    const onClick = (ev: MouseEvent) => {
      const p = toLocal(ev);
      const s = hitTest(p.x, p.y);
      if (!s) return;
     // if (s.status === 'sold' || s.status === 'reserved') return;
      if (s.status === 'sold' || s.status === 'reserved' || s.status === 'held') return;

      setSelected(prev => {
        const copy = { ...prev };
        if (copy[s.id]) delete copy[s.id];
        else {
          if (Object.keys(copy).length >= maxSelect) {
            alert('Max ' + maxSelect + ' seats allowed');
            return prev;
          }
          copy[s.id] = s;
        }
        return copy;
      });
    };

    const onMove = (ev: MouseEvent) => {
      const p = toLocal(ev);
      const s = hitTest(p.x, p.y);
      setHover(s);
      if (s) setTipPos({ left: ev.clientX + 12, top: ev.clientY + 12 });
      else setTipPos(null);
    };

    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', () => { setHover(null); setTipPos(null); });

    return () => {
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('mousemove', onMove);
    };
  }, [seats, setSelected]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        aria-label="Seating map"
        role="application"
        tabIndex={0}
        style={{ width: venue.map.width, height: venue.map.height }}
      />

      <SeatCanvasRenderer
        canvasRef={canvasRef}
        seats={seats}
        selected={selected}
        heatmap={heatmap}
        hover={hover}
        venue={venue}
      />

      <Controls
        heatmap={heatmap}
        setHeatmap={setHeatmap}
        onFindAdjacent={() => {
          const n = parseInt(prompt('Find adjacent seats: how many?', '3') || '0', 10);
          if (!isNaN(n)) findAdjacent(n, setSelected, setHover);
        }}
        onClearSelection={() => setSelected({})}
      />

      <Tooltip hover={hover} left={tipPos?.left ?? 0} top={tipPos?.top ?? 0} />
    </div>
  );
}
