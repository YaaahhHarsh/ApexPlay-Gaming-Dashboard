# ⚡ ApexPlay | Ultimate Gaming Profile & Dashboard

An immersive, next-generation gaming dashboard featuring live library tracking, FreeToGame public API integration, achievement progress, interactive playtime analytics, dynamic audio soundscapes, and responsive ambient visuals.

![ApexPlay Banner](https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features

- 🎮 **Live Game Library Tracking**: Filter and explore games by genre, platform, status, and favorites.
- 🌐 **FreeToGame Public API Integration**: Seamless real-time data fetching with fallback demo modes and genre filtering.
- ⏱️ **Active In-Game Session Tracking**: Live timer, real-time logging, and interactive playtime records.
- 📊 **Playtime Analytics & Charts**: Interactive canvas-rendered charts showing playtime distribution and genre breakdown.
- 🏆 **Achievement System**: Track milestone unlock progress, gaming ranks, and earned badges.
- 🔊 **Web Audio Sound Effects**: Ambient synthesized sounds for UI interactions, button clicks, and notifications (toggleable).
- 🌌 **Ambient Canvas Particles**: Dynamic animated background particles reflecting modern cyber-gaming aesthetics.
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile displays with glassmorphism UI.

---

## 🛠️ Built With

- **HTML5**: Semantic modern structure and accessibility.
- **Vanilla CSS3**: Custom design tokens, glassmorphism, fluid typography, and dynamic animations.
- **Modern JavaScript (ES6+)**: Modular architecture (`app.js`, `api.js`, `charts.js`, `audio.js`, `state.js`).
- **FreeToGame API**: Live data feed for gaming titles and metadata.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YaaahhHarsh/ApexPlay-Gaming-Dashboard.git
cd ApexPlay-Gaming-Dashboard
```

### 2. Launch
Open `index.html` directly in your favorite modern web browser or run a simple local HTTP server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .
```

Navigate to `http://localhost:8000` to experience the dashboard!

---

## 📂 Project Structure

```text
ApexPlay-Gaming-Dashboard/
├── css/
│   ├── animations.css    # Keyframes and ambient motion
│   ├── components.css    # UI component styles & glass cards
│   └── style.css         # Core design tokens, layout & reset
├── js/
│   ├── api.js            # FreeToGame public API connector
│   ├── app.js            # Main dashboard controller & event handlers
│   ├── audio.js          # Web Audio API sound synthesis
│   ├── charts.js         # Canvas charting engine
│   └── state.js          # Reactive state management & persistence
├── .gitignore            # Git ignore definitions
├── index.html            # Core entry point
└── README.md             # Project documentation
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more details.
