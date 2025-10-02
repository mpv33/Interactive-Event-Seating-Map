    export type Seat = {
      id: string;
      section: string;
      row: number;
      col: number;
      x: number;
      y: number;
      price: number;
      priceTier: number;
      status: 'available'|'sold'|'reserved'|'held';
    };

export type Venue = {
  venueId: string;
  name: string;
  map: { width:number; height:number };
  sections: Array<{ id:string; label:string; transform:any; rows: Array<{ index:number; seats: Seat[] }> }>;
};
