import React from "react";

export default function SeatLegend() {
  const items = [
    { color: "#0b8a4e", label: "Available" },
    { color: "#7f1d1d", label: "Sold" },
    { color: "#b45309", label: "Reserved" },
    { color: "#334155", label: "Held" },
    { color: "#ffd700", label: "Selected (outline)" },
  ];

  return (
    <div className="legend">
      <h3>Legend</h3>
      <ul>
        {items.map(item => (
          <li key={item.label}>
            <span
              className="legend-box"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
