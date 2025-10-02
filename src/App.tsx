import React, { useEffect, useState, useRef } from 'react';
import CanvasSeatMap from './components/CanvasSeatMap';
import { Seat, Venue } from './types';
export default function App(){

  const [venue, setVenue] = useState<Venue | null>(null);

  useEffect(()=>{ fetch('/venue.json').then(r=>r.json()).then(setVenue) },[]);

  return (
    <div className='app'>
      <header>
        <h1>{venue?.name || 'Event Seating'}</h1>
        <div className='small'>Interactive seating map — Canvas renderer • simulates WebSocket updates</div>
      </header>
      <div className='container'>
        <div className='left'>
          <div className='map-wrap'>
            {venue && <CanvasSeatMap venue={venue} />}
            {!venue && <div>Loading venue...</div>}
          </div>
        </div>
        <aside className='right'>
          <div className='summary'>
            <h3>Selection</h3>
            <p className='small'>Click seats, use keyboard arrows to navigate. Max 8 seats.</p>
            <div id='selection-panel'></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
