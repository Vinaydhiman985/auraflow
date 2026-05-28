# 🍃 AuraFlow: Lumina Student Habit Hub

AuraFlow is a premium, high-fidelity student productivity dashboard and habit tracker built on a modern Bento-Grid aesthetic. Designed to be your quiet digital cheerleader, AuraFlow blends beautiful design (glassmorphism, vibrant gradients, and dynamic micro-animations) with robust offline-friendly database integration.

Developed with the **FreshMind** Bento structure, the UI is crafted to inspire academic clarity, routine growth, and deep focus.

---

## 🌟 Core Feature Canvas

### 1. 🏡 Dynamic Bento Dashboard
* **Intentions Grid**: Quick toggle today's habits with responsive circular completion progress rings.
* **Pomodoro Quick Start**: Launch focus blocks immediately from the central console.
* **Weekly Focus Analytics**: Dynamic vertical bar charts monitoring deep work durations.
* **21-Day Habit Mosaic**: Visual heatmap tracks consistency history over the past 3 weeks.

### 2. 🌱 Habit Garden
* **Micro-Completions**: Toggle habit logs instantly with a click—witnessing your intentions "bloom" with beautiful success badges.
* **Garden Archive (Monthly summary)**:
  * **Most Consistent**: Highlights the habit with the longest current streak.
  * **Biggest Growth**: Calculates month-over-month progress.
  * **Perfect Days**: Automatically ledger-counts days this month where 100% of habits were successfully completed.
* **Garden Accent Themes**: Choose custom harmonized hues (Emerald, Sky, Indigo, Rose, Amber) and Study presets.

### 3. 📅 Task Planner (Drag-and-Drop)
* **Heatmap Dropzones**: Categorize action items using three distinct priority levels:
  * 🔴 **Critical (High)**: Urgent academic deadlines.
  * 🟡 **Important (Medium)**: Core study milestones.
  * 🟢 **Routine (Low)**: Daily study practices.
* **HTML5 Drag & Drop**: Smoothly drag cards between columns to dynamically update task priority levels in the local database.
* **Flexible Input Forms**: Clean responsive modals that stack beautifully on mobile viewports for effortless scheduling.

### 4. 📊 Analytics & Flow Indicators
* **Heatmap Rhythm Grid**: A detailed 7x8 (56-day) matrix visualizing completion density.
* **Orbiting Category Analytics**: Tracks habit categories and visualizes productivity patterns.
* **Performance Metric Ledger**: A full tabular record showing 30-day completion rates, total focus hours, and performance trends.

### 5. ⏱️ Pomodoro Focus Studio
* **Precision Timer**: High-end countdown with chord synthesized completion alerts.
* **Ambient Sound Mixer**: Mix study soundscapes (Rain, Coffee Shop, White Noise, Forest) directly in-app.
* **Strict Focus Timeline**: Visualizes progress through completed Pomodoro rounds.

### 6. 📂 Monthly Report Summaries
* **Accomplishment Badge**: Large plant growth progress vector indicating your success rate.
* **PDF Report Exporter**: Fully styled monthly ledger downloader compiled in one click via `html2pdf.js`.
* **Cheerleader Motivation**: Dynamic quotes based on your most consistent study routines.

---

## 🛠️ Technology Stack

* **Frontend**: React.js, Vite, TailwindCSS (for high-end styling), Lucide React (for premium iconography).
* **Backend**: Node.js, Express, MongoDB (Local instance setup for zero connection lag).
* **PDF Engine**: `html2pdf.js` for clean vector PDF outputs.
* **Styling Tokens**: Customized glassmorphism (`.glass-card`), mesh gradients (`.mesh-gradient`), and spring hover effects (`.habit-grow-animation`).

---

## ⚡ Setup & Installation

### Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB** (Ensure your local MongoDB instance is running on `127.0.0.1:27017`)

### 1. Clone & Set Up the Repository
```bash
git clone https://github.com/Vinaydhiman985/auraflow.git
cd auraflow
```

### 2. Configure Backend Server
Navigate into the `server` directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/habitflow
JWT_SECRET=your_super_secret_jwt_key
```

Start the backend in development mode (using nodemon):
```bash
npm run dev
```
The server will boot on `http://localhost:5000` and connect to the local MongoDB database.

### 3. Configure Frontend Client
Navigate into the `client` directory and install dependencies:
```bash
cd ../client
npm install
```

Start the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to the local URL (usually `http://localhost:5173`).

---

## 🔒 Safety Guardrails & Reliability
AuraFlow is engineered to be highly stable under all conditions:
* **Zero-Crash Loading Fallbacks**: Optional chaining (`logs?.[hId]`) and robust array flattens (`Object.values(logs || {}).filter(Array.isArray).flat()`) guarantee that pages load gracefully even during backend network latency.
* **Offline-Friendly 3D Assets**: High-fidelity 3D clay-style icons and badge assets are hosted and served directly from the local `/public` directory (`3d-icons-sheet.png`, `plant-growth.png`), allowing full offline functionality and instant loading speeds.
* **Fluid Mobile Responsiveness**: Flexible stacked grids (`grid-cols-1 sm:grid-cols-2`) and horizontal swipe container scrollers (`justify-start md:justify-between`) enable seamless operation across smartphones, tablets, and wide monitors alike.
