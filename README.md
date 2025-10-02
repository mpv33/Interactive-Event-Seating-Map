# 🎟️ Event Seating — Full Frontend

This project implements the **interactive seating map** task as described in the take-home PDF.  
It uses **React + TypeScript + Vite** with a **canvas-based renderer** for smooth performance.

---

## ✅ Features Implemented

- **Canvas rendering with spatial hashing**
  - Renders thousands of seats smoothly (`requestAnimationFrame` loop).
  - Uses a spatial hash for fast hit-testing (efficient mouse interactions).

- **Seat data from JSON**
  - Loads all seat data from `public/venue.json`.
  - Absolute coordinates (no layout engine required).

- **Seat selection**
  - Select seats with **mouse click** or **keyboard arrows + Enter**.
  - Maximum **8 seats** can be selected at once.
  - Selected seats and subtotal are shown in the **sidebar summary panel**.

- **Dynamic coloring**
  - **Normal mode**: seats are colored by status  
    (`Available`, `Reserved`, `Held`, `Sold`).
  - **Heatmap mode**: seats are colored by **price tier gradient** (green → red).

- **Find adjacent seats helper**
  - Users can search for **N adjacent available seats** in the same row.
  - Greedy search picks the cheapest valid block.

- **Simulated WebSocket updates**
  - Every ~800ms, a random seat’s status changes.
  - Demonstrates how live updates (via real WebSocket) would look.

- **Responsive layout + accessibility**
  - Sidebar and map adjust for desktop and mobile viewports.
  - `aria-label` and `role="application"` applied to the canvas.
  - Tooltips show seat details on hover.

---

## 🚀 How to Run

```bash
pnpm install
pnpm dev
# Interactive-Event-Seating-Map
