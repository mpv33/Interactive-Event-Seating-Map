import React from 'react';

type Props = {
  heatmap: boolean;
  setHeatmap: React.Dispatch<React.SetStateAction<boolean>>;
  onFindAdjacent: () => void;
  onClearSelection: () => void;
};

export default function Controls({ heatmap, setHeatmap, onFindAdjacent, onClearSelection }: Props) {
  return (
    <div style={{ position: 'absolute', left: 80, top: 20 }} className='controls'>
      <button onClick={() => setHeatmap(h => !h)} aria-pressed={heatmap}>
        {heatmap ? 'Disable' : 'Enable'} Heatmap
      </button>
      <button className='primary' onClick={onFindAdjacent}>Find adjacent</button>
      <button onClick={onClearSelection}>Clear selection</button>
    </div>
  );
}
