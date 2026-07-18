# Pull Request: Habit Radar & Growth Replay System

## Description

This PR introduces a comprehensive student engagement experience layer for the Spurti dashboard. It adds four major feature modules that visualize participation patterns, reward consistency, and provide motivational feedback — all running on top of the existing data model without backend schema changes.

---

## Features Included

### 1. Habit Radar (`client/src/components/habit-radar/`)
- Radar chart visualization of student participation across attendance, polls, chat, consistency, and momentum dimensions
- Scores normalize to the cohort average so students see relative strengths
- Interactive hover labels with score breakdowns
- Responsive SVG canvas with framer-motion entrance animation

### 2. Momentum Meter (`client/src/components/momentum/`)
- Momentum score derived from streak days, attendance rate, and poll participation
- Animated gauge with tier labels (Building → Flowing → Peak)
- Information modal explaining momentum mechanics
- Tracks streak-driven SP bonus eligibility

### 3. Persona System (`client/src/components/persona/`)
- Classifies each student into a learning persona (e.g., The Achiever, The Explorer, The Consistent) based on engagement signals
- Persona card with mission progress, signal breakdown, and suggestions
- Sparkle badge on the header linking to the persona modal
- Persona history tab with classification timeline (stub ready for real data)
- Suggestion engine that generates contextual next-action recommendations

### 4. Premium UI Components (`client/src/components/premium/`)
- **DailyAttendanceCard:** Split-panel "You showed up today" with SVG checkmark draw animation, confetti burst, rotating microcopy, collect reward button with count-up
- **PollParticipationCard:** Interactive "Your Voice Matters" card with SVG speech bubble network, conversation node tracker, vote button
- **WeeklyStreakTracker:** GitHub/Linear-style contribution heatmap with emerald crystal cells, pulsing today node, hover tooltips
- **DailyStreakCard:** Streak milestone tracker with tier progression
- **SynapticSyncCard:** Premium neural network visualization replacing the "Getting to Know You" empty state
- **AICompanionHeader:** Glassmorphism greeting header with rotating quotes and stats pill
- **StandingCard:** Premium learning navigation card with curved journey path, milestones, orange navigation pin, suggested path pills, and status chips
- **RecentActivityCard:** Activity feed with event-driven updates
- **MilestoneCelebration, SPCard, FloatingEmojis, Leagues:** Supplementary gamification widgets

### 5. Replay System (`client/src/components/replay/`)
- **WeeklyReplayModal:** Slide-show recap of weekly attendance, polls, SP earned, streaks, and key moments
- **FinalJourneyModal:** End-of-program summary showing full journey history
- **ShareCard:** Social-media-style shareable achievement card with SP total, rank, streak, and attendance stats
- **EntryPill:** Floating entry point that opens the replay system from the header
- **ReplayEngine:** Builds replay data from existing profile (transactions, attendance, polls) — no new backend required

### 6. Animations Library (`client/src/components/animations/`)
- **ConfettiCanvas:** Particle-based celebration screen overlay
- **RewardPopup:** Glassmorphic reward collection card with claim animation
- **AchievementPopup:** Achievement unlock notification
- **ChestOpening:** Tiered loot-box style animation for streak milestones
- **LegendMoment:** Full-screen legend badge unlock celebration
- **DailyLoginBonus:** Daily login SP bonus popup
- **StreakMilestone:** Streak milestone indicator bar
- **ActivityFeedToasts:** Toast notifications for activity events
- **Demo playback system:** Scripted celebration sequence for testing

### 7. Gamification State (`client/src/features/gamification/`)
- LocalStorage-backed poll completion tracking
- State management for rewards, achievements, chests, toasts, confetti
- Activity event queue with expiry
- Floating emoji reaction layer
- Demo playback mode with canned sequences

### 8. Supporting Changes
- **`client/src/components/dashboard.css`:** Compact responsive grid layouts, hover physics, card system
- **`client/src/main.jsx`:** Wiring all new components into the student dashboard with proper prop threading
- **`client/src/styles.css`:** Additional premium component styles, no-texture overlay overrides
- **`client/package.json` & `package.json`:** Added `framer-motion` (animation engine), `html2canvas` (ShareCard export)
- **`server/server.js`:** MomentumSnapshot model for optional persistence

---

## Architecture Notes

- **No backend schema migrations required** — all features derive from existing `students`, `sptransactions`, `attendancerecords`, `pollrecords` collections
- `useDashboardExperience` hook is stubbed inline in `main.jsx` — the animation/reward system renders inert when the hook is absent
- All new components use CSS Modules-style class naming (BEM-lite) and are hand-crafted CSS (no Tailwind)
- Framer-motion is the primary animation engine (`AnimatePresence`, `motion`, spring physics)
- `prefers-reduced-motion` respected throughout

---

## How to Test

1. `cd client && npm install` (installs framer-motion, html2canvas)
2. `npm run build` — should compile cleanly (448 modules)
3. Open the dashboard — verify all cards render in `pulse-grid` and `premium-row` sections
4. Check the replay system via the floating pill in the header
5. Test demo mode via the "▶ Demo" FAB button

---

## Screenshots

<!-- Add screenshots here -->

---

## Checklist

- [x] Build passes (`npm run build` — 448 modules, clean)
- [x] No backend changes required
- [x] All text labels preserved from original
- [x] Framer-motion animations respect `prefers-reduced-motion`
- [x] Responsive layout (desktop / tablet / mobile)
