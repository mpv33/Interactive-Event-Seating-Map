import React, { useEffect, useState } from 'react';
import CanvasSeatMap from './components/CanvasSeatMap';
import SelectionPanel from './components/SelectionPanel';
import { Seat, Venue } from './types';
import SeatLegend from './components/SeatLegend';

export default function App() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [selected, setSelected] = useState<Record<string, Seat>>({});

  // load venue.json
  useEffect(() => {
    fetch('/venue_500.json')
      .then(r => r.json())
      .then((v: Venue) => setVenue(v));
  }, []);

  // restore saved selection from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('selectedSeats');
      if (raw) setSelected(JSON.parse(raw));
    } catch (err) {
      console.warn('Failed to restore seats', err);
    }
  }, []);

  // persist selection in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('selectedSeats', JSON.stringify(selected));
    } catch (err) {
      console.warn('Failed to save seats', err);
    }
  }, [selected]);

  return (
    <div className="app">
      <header>
        <h1>{venue?.name || 'Event Seating'}</h1>
        <div className="small">
          Interactive seating map — Canvas renderer • simulates WebSocket updates
        </div>
      </header>

      <div className="container">
        <div className="left">
          <div className="map-wrap">
            {venue ? (
              <CanvasSeatMap
                venue={venue}
                selected={selected}
                setSelected={setSelected}
              />
            ) : (
              <div>Loading venue...</div>
            )}
          </div>
        </div>

        <aside className="right">
          <SelectionPanel selected={selected} />
          <SeatLegend />
        </aside>
      </div>
    </div>
  );
}
