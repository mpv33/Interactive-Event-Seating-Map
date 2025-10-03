export type SeatStatus = 'available' | 'sold' | 'reserved' | 'held';

export interface Seat {
  id: string;
  x: number;
  y: number;
  price: number;
  priceTier: number;
  section: string;
  row: string | number;
  col: number;
  status: SeatStatus;
}

export interface Venue {
  venueId: string;
  name: string;
  map: { width: number; height: number };
  sections: {
    id: string;
    label: string;
    transform: { x: number; y: number; scale: number };
    rows: {
      index: number;
      seats: Seat[];
    }[];
  }[];
}
