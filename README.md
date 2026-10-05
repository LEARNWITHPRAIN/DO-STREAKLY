# DO STREAKLY — Better habits. Together.

> Production-ready, mobile-first Progressive Web App (PWA) combining personal habit tracking with high-stakes social challenges against friends.

---

## 🚀 Key Features

* **Personal Habit Tracking**:
  * **YES / NO Habits**: One-tap daily completions (e.g. Wake up by 6 AM, Cold shower, Meditate) with duplicate XP claim prevention.
  * **MEASURABLE Habits**: Numerical target tracking with progress bars (e.g. 5 km run, 20 pages read, 50 push-ups).
* **Friend Challenges (Main USP)**:
  * Create custom 7, 14, 21, or 30-day challenges with friends.
  * Real-time challenge leaderboards, podium rankings, and prize XP bonuses.
* **XP & Level Progression System**:
  * Auditable XP transactions awarded on completions.
  * Level curve with dynamic progress bar (`Level 4 — 1,240 / 1,500 XP`).
* **Streak System**:
  * Current & best streak tracking with flame glow micro-animations.
  * Weekly consistency heatmap.
* **Social Leaderboards**:
  * **Friends Circle**: Friendly rankings among your accountability partners.
  * **Global Arena**: Global rankings across all users.
* **Authentication & Onboarding**:
  * Supabase Auth (`/login`, `/signup`, `/forgot-password`, `/reset-password`).
  * Frictionless onboarding (`/onboarding`) with starter habit selection.
  * Instant Demo Preview mode for testing without friction.
* **Mobile-First PWA**:
  * Installable on iOS and Android.
  * Bottom navigation on mobile, sleek sidebar on desktop.
  * Service worker (`public/sw.js`) with offline caching and Web Push notifications.

---

## 🎨 Brand Design System

* **Lime Green (`#B6F34A`)**: Primary accent for active states, XP, streak highlights, CTAs, and progress bars.
* **Bright Green (`#84CC16`)**: Secondary accent for hover states, success states, and gradients.
* **Deep Black/Green (`#0B0F0D`)**: Primary dark background.
* **Surfaces**: `#121814` (cards), `#17211B` (elevated), `#1F2E25` (highlight).
* **Typography**:
  * Primary: **Inter** (body, navigation, forms, cards)
  * Display: **Space Grotesk** (hero headings, stats, XP, levels, challenge titles)

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui patterns, Lucide Icons, Framer Motion, Canvas Confetti
* **Backend**: Supabase (PostgreSQL, Auth, RLS, Realtime)
* **Application**: PWA (Manifest, Service Worker, Web Push ready)

---

## 🗄️ Supabase Database Setup

To deploy the database schema to your Supabase project:

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** -> **New Query**.
3. Copy the contents of [`supabase/schema.sql`](file:///d:/DO%20STREAKLY/supabase/schema.sql) and paste it into the editor.
4. Click **Run**.

This will automatically create:
* `profiles` (with automatic signup trigger `handle_new_user`)
* `habits`
* `habit_completions` (with unique `(habit_id, completed_date)` constraint)
* `xp_transactions`
* `friendships`
* `challenges`
* `challenge_participants`
* `achievements` & `user_achievements`
* Comprehensive Row Level Security (RLS) policies and performance indexes.

---

## 🏃 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
