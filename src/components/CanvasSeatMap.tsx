import React, { useEffect, useRef, useState } from 'react';
import { Venue, Seat } from '../types';

type Props = { venue: Venue };

// Helper: spatial hash for efficient hit testing
class SpatialHash {
  buckets: Map<string, Seat[]> = new Map();
  cellSize: number;
  constructor(cellSize=40){ this.cellSize = cellSize; }
  _key(x:number,y:number){ return Math.floor(x/this.cellSize)+','+Math.floor(y/this.cellSize); }
  insert(seat:Seat){ const k=this._key(seat.x,seat.y); if(!this.buckets.has(k)) this.buckets.set(k,[]); this.buckets.get(k)!.push(seat); }
  query(x:number,y:number){ const k=this._key(x,y); const out:Seat[]=[]; const [cx,cy]=k.split(',').map(Number); for(let dx=-1;dx<=1;dx++){ for(let dy=-1;dy<=1;dy++){ const kk=(cx+dx)+','+(cy+dy); const arr=this.buckets.get(kk); if(arr) out.push(...arr); }} return out; }
}

export default function CanvasSeatMap({ venue }: Props){
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<Record<string,Seat>>({});
  const [heatmap, setHeatmap] = useState(false);
  const [hover, setHover] = useState<Seat | null>(null);
  const spatialRef = useRef<SpatialHash | null>(null);
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const maxSelect = 8;

  useEffect(()=>{
    // flatten seats
    const list: Seat[] = [];
    for(const sec of venue.sections){ for(const row of sec.rows){ for(const s of row.seats){ list.push(s); } } }
    setSeats(list);
  },[venue]);

  // build spatial hash when seats change
  useEffect(()=>{
    if(seats.length===0) return;
    const sh = new SpatialHash(48);
    for(const s of seats) sh.insert(s);
    spatialRef.current = sh;
  },[seats]);

  // draw function with rAF
  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    let raf=0; let dirty=true;
    const resize = ()=>{
      const w = venue.map.width; const h = venue.map.height;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      dirty = true;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = ()=>{
      if(!dirty){ raf=requestAnimationFrame(draw); return; }
      ctx.clearRect(0,0,canvas.width,canvas.height);
      // background
      ctx.fillStyle = '#021018'; ctx.fillRect(0,0,venue.map.width,venue.map.height);
      // draw seats
      for(const s of seats){
        const isSelected = !!selected[s.id];
        let fill = '#0b8a4e';
        if(s.status==='sold') fill='#7f1d1d';
        else if(s.status==='reserved') fill='#b45309';
        else if(s.status==='held') fill='#334155';
        if(heatmap){ const t = Math.min(1,(s.priceTier-1)/3); const g = Math.floor(200 - t*120); const r = Math.floor(80 + t*160); fill = `rgb(${r},${g},70)`; }
        ctx.beginPath();
        const size = 8;
        ctx.fillStyle = fill;
        ctx.strokeStyle = isSelected ? '#ffd700' : 'rgba(0,0,0,0)';
        ctx.lineWidth = isSelected ? 2 : 0;
        ctx.rect(s.x - size/2, s.y - size/2, size, size);
        ctx.fill();
        if(isSelected){ ctx.stroke(); }
      }
      // hover highlight
      if(hover){ ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.strokeRect(hover.x-6, hover.y-6, 12,12); }
      dirty=false; raf=requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return ()=>{ window.removeEventListener('resize', resize); cancelAnimationFrame(raf); }
  },[seats, selected, heatmap, hover, venue]);

  // pointer handlers: click, move
  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return;
    const rect = ()=>canvas.getBoundingClientRect();
    const toLocal = (e:any)=>{
      const r=rect(); return { x: (e.clientX - r.left), y: (e.clientY - r.top) };
    };
    const hitTest = (x:number,y:number)=>{
      const sh = spatialRef.current; if(!sh) return null;
      const candidates = sh.query(x,y);
      let best=null; let bestd=Infinity;
      for(const c of candidates){ const dx=c.x-x, dy=c.y-y; const d=dx*dx+dy*dy; if(d<bestd && d<400){ best=c; bestd=d; } }
      return best;
    };
    const onClick = (ev:MouseEvent)=>{
      const p=toLocal(ev); const s = hitTest(p.x,p.y);
      if(!s) return;
      if(s.status==='sold' || s.status==='reserved') return;
      setSelected(prev=>{
        const copy = {...prev}; if(copy[s.id]) delete copy[s.id]; else {
          if(Object.keys(copy).length >= maxSelect) { alert('Max '+maxSelect+' seats allowed'); return prev; }
          copy[s.id]=s;
        }
        // update selection panel
        const panel = document.getElementById('selection-panel'); if(panel){
          const rows = Object.values(copy).map((ss:any)=>`<div>${ss.id} • ₹${ss.price}</div>`).join('');
          const subtotal = Object.values(copy).reduce((a:any,b:any)=>a+b.price,0);
          panel.innerHTML = `<div class='small'>Selected (${Object.keys(copy).length})</div><div class='seat-list'>${rows}</div><div style='margin-top:8px'>Subtotal: <strong>₹${subtotal}</strong></div>`;
        }
        return copy;
      });
    };
    const onMove = (ev:MouseEvent)=>{
      const p=toLocal(ev); const s=hitTest(p.x,p.y); setHover(s);
      const tip = document.getElementById('seat-tooltip');
      if(tip){ if(s){ tip.style.left = (ev.clientX+12)+'px'; tip.style.top=(ev.clientY+12)+'px'; tip.innerHTML=`${s.id} • ₹${s.price} • ${s.status}`; tip.style.display='block'; } else tip.style.display='none'; }
    };
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', ()=>{ setHover(null); const tip=document.getElementById('seat-tooltip'); if(tip) tip.style.display='none'; });
    return ()=>{ canvas.removeEventListener('click', onClick); canvas.removeEventListener('mousemove', onMove); };
  },[seats]);

  // simulate WebSocket updates: randomly change a seat status every 800ms
  useEffect(() => {
    const interval = setInterval(() => {
      if (seats.length === 0) return;
      const idx = Math.floor(Math.random() * seats.length);
      const s = seats[idx];
  
      const choices: Seat['status'][] = ['available', 'sold', 'reserved', 'held'];
      const newStatus = choices[Math.floor(Math.random() * choices.length)];
  
      setSeats(prev => {
        const copy = prev.slice();
        const i = copy.findIndex(x => x.id === s.id);
        if (i >= 0) {
          copy[i] = { ...copy[i], status: newStatus };
        }
        return copy;
      });
    }, 800);
  
    return () => clearInterval(interval);
  }, [seats]);
  

  // find N adjacent seats in same row
  const findAdjacent = (n:number)=>{
    if(n<=0) return;
    // look for best (lowest price) contiguous block of n available seats
    let bestBlock: Seat[] | null = null; let bestPrice=Infinity;
    const byRow = new Map<string,Seat[]>();
    for(const s of seats){ const k = s.section+'-'+s.row; if(!byRow.has(k)) byRow.set(k,[]); byRow.get(k)!.push(s); }
    for(const [k, arr] of byRow.entries()){
      const sorted = arr.slice().sort((a,b)=>a.col-b.col);
      for(let i=0;i<=sorted.length - n;i++){
        const block = sorted.slice(i,i+n);
        if(block.every(b=>b.status==='available')){
          const sum = block.reduce((a,b)=>a+b.price,0);
          if(sum < bestPrice){ bestPrice=sum; bestBlock = block; }
        }
      }
    }
    if(bestBlock){
      // select them
      setSelected(prev=>{
        const copy = {...prev}; for(const s of bestBlock!){ if(Object.keys(copy).length < maxSelect) copy[s.id]=s; }
        const panel = document.getElementById('selection-panel'); if(panel){ const rows = Object.values(copy).map((ss:any)=>`<div>${ss.id} • ₹${ss.price}</div>`).join(''); const subtotal = Object.values(copy).reduce((a:any,b:any)=>a+b.price,0); panel.innerHTML = `<div class='small'>Selected (${Object.keys(copy).length})</div><div class='seat-list'>${rows}</div><div style='margin-top:8px'>Subtotal: <strong>₹${subtotal}</strong></div>`; }
        return copy;
      });
      // flash on canvas by temporarily setting hover
      setHover(bestBlock[0]); setTimeout(()=>setHover(null),1400);
      alert('Found block of '+n+' adjacent seats: '+bestBlock.map(b=>b.id).join(', '));
    } else alert('No block of '+n+' adjacent available seats found');
  };

  // keyboard navigation
  useEffect(()=>{
    const onKey = (ev:KeyboardEvent)=>{
      const ids = seats.map(s=>s.id);
      if(ids.length===0) return;
      // if arrow keys, move focused selection among seats (nearest in direction)
      if(ev.key.startsWith('Arrow')){
        ev.preventDefault();
        // determine current focus: last selected or first seat
        const selectedIds = Object.keys(selected);
        let current: Seat | null = null;
        if(selectedIds.length>0) current = seats.find(s=>s.id===selectedIds[selectedIds.length-1]) || null;
        else current = seats[0];
        if(!current) return;
        // compute candidate in direction
        const dir = ev.key === 'ArrowLeft' ? 'left' : ev.key === 'ArrowRight' ? 'right' : ev.key === 'ArrowUp' ? 'up' : 'down';
        let best: Seat | null = null; let bestScore = Infinity;
        for(const s of seats){ if(s.id===current!.id) continue; const dx = s.x - current.x; const dy = s.y - current.y; let valid=false; let score=0;
          if(dir==='left' && dx<0){ valid=true; score = Math.abs(dy) + Math.abs(dx); }
          if(dir==='right' && dx>0){ valid=true; score = Math.abs(dy) + Math.abs(dx); }
          if(dir==='up' && dy<0){ valid=true; score = Math.abs(dx) + Math.abs(dy); }
          if(dir==='down' && dy>0){ valid=true; score = Math.abs(dx) + Math.abs(dy); }
          if(valid && score < bestScore){ bestScore=score; best=s; }
        }
        if(best){
          // toggle selection of best
          setSelected(prev=>{
            const copy = {...prev}; if(copy[best!.id]) delete copy[best!.id]; else { if(Object.keys(copy).length < maxSelect) copy[best!.id]=best!; }
            const panel = document.getElementById('selection-panel'); if(panel){ const rows = Object.values(copy).map((ss:any)=>`<div>${ss.id} • ₹${ss.price}</div>`).join(''); const subtotal = Object.values(copy).reduce((a:any,b:any)=>a+b.price,0); panel.innerHTML = `<div class='small'>Selected (${Object.keys(copy).length})</div><div class='seat-list'>${rows}</div><div style='margin-top:8px'>Subtotal: <strong>₹${subtotal}</strong></div>`; }
            return copy;
          });
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  },[seats, selected]);

  return (
    <div style={{position:'relative'}}>
      <canvas ref={canvasRef} aria-label='Seating map' role='application' style={{width:venue.map.width,height:venue.map.height}}></canvas>
      <div style={{position:'absolute',left:8,top:8}} className='controls'>
        <button onClick={()=>{ setHeatmap(h=>!h); }} aria-pressed={heatmap}>{heatmap ? 'Disable' : 'Enable'} Heatmap</button>
        <button className='primary' onClick={()=>{ const n = parseInt(prompt('Find adjacent seats: how many?', '3') || '0',10); if(!isNaN(n)) findAdjacent(n); }}>Find adjacent</button>
        <button onClick={()=>{ setSelected({}); const panel = document.getElementById('selection-panel'); if(panel) panel.innerHTML=''; }}>Clear selection</button>
      </div>
      <div id='seat-tooltip' className='tooltip' style={{display:'none'}}></div>
    </div>
  );
}
