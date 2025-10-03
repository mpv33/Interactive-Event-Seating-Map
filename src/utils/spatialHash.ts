import { Seat } from '../types';

export class SpatialHash {
  private buckets: Map<string, Seat[]> = new Map();
  constructor(private cellSize = 40) {}

  private key(x: number, y: number) {
    return Math.floor(x / this.cellSize) + ',' + Math.floor(y / this.cellSize);
  }

  insert(seat: Seat) {
    const k = this.key(seat.x, seat.y);
    if (!this.buckets.has(k)) this.buckets.set(k, []);
    this.buckets.get(k)!.push(seat);
  }

  query(x: number, y: number): Seat[] {
    const [cx, cy] = this.key(x, y).split(',').map(Number);
    const out: Seat[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const kk = `${cx + dx},${cy + dy}`;
        const arr = this.buckets.get(kk);
        if (arr) out.push(...arr);
      }
    }
    return out;
  }
}
