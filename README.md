# ⚡ ApexPlay | Personal Gaming Platform

A complete personal gaming platform inspired by the information architecture of **Steam**, **Backloggd**, **Grouvee**, **Xbox**, and **HowLongToBeat**—crafted with ApexPlay's own calm, modern, gaming-focused visual identity.

ApexPlay is designed around the core vision:
> **"Personal Gaming Library + Gaming Journal + Analytics + Discovery"**

---

## 🌟 Key Features

### 1. Unified Library Management
- **5 Primary Statuses**: `Playing`, `Completed`, `Backlog`, `Wishlist`, and `Dropped`.
- **Top Status Navigation**: Interactive counter buttons for each status (`Playing 2`, `Completed 3`, `Backlog 2`, `Wishlist 3`, `Dropped 2`).
- **Comprehensive Toolbar**:
  - Live Search filtering by game title, genre, and developer.
  - Multi-factor filters: Status, Genre, and Platform.
  - 6 Sort Options: Recently Played, Recently Added, Most Played, Highest Completion, Highest Rated, Alphabetical.
  - View Switcher: **Grid View** (artwork-focused) and **List View** (data-focused table layout with hours, progress, status, and last played).

### 2. "Continue Playing" Dashboard Hero
- Prominently showcases the user's most active game.
- Displays game artwork, title, hours played, achievement progress (`41 / 48`), completion percentage (`85%`), and last played timestamp.
- Direct `▶ Continue` and `View Details` action buttons.

### 3. Detailed Game Experience
- **Header**: Artwork, title, developer/publisher, genres, platform, release information.
- **Actions**: Launch Session, Add to Wishlist toggle, Status selector (`Playing`, `Completed`, `Backlog`, `Wishlist`, `Dropped`).
- **Your Progress**: Playtime, completion rate, achievements unlocked ratio, last played.
- **HowLongToBeat Estimates**: Realistic completion benchmarks (Main Story, Main + Extras, Completionist) and calculated estimated hours remaining.
- **5-Star Rating System**: Interactive 1–5 star ratings supporting half-star increments (`4.5 / 5`), plus community rating comparison when available.
- **Personal Review & Diary Note**: Persistent, editable personal reflections for every game.
- **Session History**: Chronological log of past gaming sessions with timestamps and durations.

### 4. Personal Gaming Journal / Activity
- Chronological diary of gaming activity grouped by day (Today, Yesterday, Date).
- Tracks session durations, milestones, and personal reflection notes.
- In-place editing and deletion of diary notes.
- "+ Log Session Note" manual entry shortcut.

### 5. Custom Shelves & Custom Lists
- **My Shelves**: Create, edit, and manage custom collections (e.g. *Favorites*, *100% Completed*, *Weekend Games*, *Games I Want To Finish*).
- **My Lists**: Create ranked (1., 2., 3.) or unranked curated lists (e.g. *Best RPGs I've Played*).

### 6. Signature Feature: "What Should I Play?"
- Transparent, rule-based recommendation wizard.
- Questions:
  1. *What are you in the mood for?* (Something short, Story-driven, Challenging, Relaxing, Multiplayer, Haven't played recently)
  2. *Available time?* (Under 1 hour, 1–2 hours, 2–4 hours, No limit)
- Evaluates the user's library and backlog, returning a single recommended title with an honest checklist of "Why this game?" reasons.

### 7. Playtime Analytics & Telemetry
- Meaningful insights: Total Playtime, Daily Average, Longest Session Marathon, Most Played Game, and Most Active Day.
- High-DPI interactive canvas charts:
  - Weekly Activity bar chart (using actual session telemetry).
  - Genre distribution donut chart.
  - Playtime leaderboard with animated progress indicators.

### 8. Discover
- Clean, curated catalog (Trending, Recommended, Popular, New Releases).
- Direct category filtering.
- **🎲 Random Pick**: Instantly rolls a random discovery from the catalog.

### 9. Platform Settings
- **Appearance**: Dark Mode & Light Mode live toggle, Accent color picker (Apex Blue, Violet, Emerald, Amber, Rose), Reduce Motion switch.
- **Profile**: Gamertag, bio, and avatar selection.
- **Preferences**: Web Audio synthesizer sound effects toggle, Default library view switcher (Grid / List).
- **Data Management**: Full JSON data export backup and factory reset options.

---

## 🎨 Design Identity & Production Palette

ApexPlay strictly follows a calm, modern, gaming-focused palette avoiding excessive neon glow or distracting futuristic widgets:

- **Background**: `#0B0D10`
- **Secondary background**: `#11151A`
- **Card**: `#161B22`
- **Elevated Card**: `#1B222B`
- **Border**: `#2A323D`
- **Primary Accent**: `#4F8CFF` (`#6BA0FF` hover)
- **Text (Primary)**: `#F5F7FA`
- **Text (Secondary)**: `#9AA4B2`
- **Text (Muted)**: `#687384`
- **Success / Completed**: `#39C98A`
- **Warning / Backlog**: `#E8B84A`
- **Danger / Dropped**: `#EF6262`

---

## 🛠️ Architecture & Interview Explanation Guide

For a student developer explaining this project:

1. **State Management (`js/state.js`)**:
   - Centralized, reactive state store (`GameState`) persisting to browser `localStorage` under `apexplay_gaming_state_v1`.
   - Incorporates backward-compatible migration on load so legacy data seamlessly gains support for shelves, lists, journal history, and ratings.
   - Dispatches changes to subscribed listeners with a clean publish-subscribe pattern.

2. **UI & Event Coordination (`js/app.js`)**:
   - Single-page application controller with tab-based navigation across 10 sections.
   - Event delegation on `document.body` for scalable, high-performance interactions without memory leaks.
   - Synchronizes filtering, sorting, modals, session timing, and recommendation calculations.

3. **Public Games API (`js/api.js`)**:
   - Integrates the FreeToGame public catalog with local cache and fallback resilience.

4. **Web Audio Synthesizer (`js/audio.js`)**:
   - Zero-dependency audio synthesizer using standard Web Audio API oscillators for click, tab, launch, and milestone chimes (toggleable and respectful of user preferences).

5. **Canvas Telemetry Engine (`js/charts.js`)**:
   - High-DPI canvas charts calibrated for crisp rendering across Retina and 4K displays.

---

## 🚀 Running the Project

Open `index.html` directly in any modern browser, or launch a static server:

```bash
# Node.js
npx serve .

# Or using Python
python -m http.server 8080
```

## 🌐 Live Production Deployment
- **Live URL**: [https://yaaahhharsh.github.io/ApexPlay-Gaming-Dashboard/](https://yaaahhharsh.github.io/ApexPlay-Gaming-Dashboard/)
- **Repository**: [https://github.com/YaaahhHarsh/ApexPlay-Gaming-Dashboard](https://github.com/YaaahhHarsh/ApexPlay-Gaming-Dashboard)
- **Automated CI/CD**: Powered by GitHub Actions & GitHub Pages
