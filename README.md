# Paz

A bilingual (English/Spanish) mental health and wellness app designed for working-class Hispanic/Latino families managing everyday stress.

**"Your daily peace / Tu paz diaria"**

![Paz Preview](preview.png)

## ✨ Features

- **Mood Tracking** - Quick 5-second daily check-ins with emoji-based mood selection
- **Breathing Exercises** - Guided 4-4-6 breathing technique (4 cycles, ~3 minutes)
- **Gratitude Journal** - Daily journaling with 3 gratitude prompts
- **Weekly Insights** - Mood trends chart and statistics
- **Fully Bilingual** - Native English/Spanish support (not just translated)
- **Offline Ready** - PWA with offline support for limited data plans
- **Beautiful iOS-style UI** - Glassmorphism design with smooth animations

## 💰 Pricing Model

- **Premium** - $2.99/month or $19.99/year (with ads)
- **Premium Plus** - $4.99/month or $39.99/year (ad-free)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### 1. Clone & Install

```bash
cd paz
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run the contents of `supabase/schema.sql`
4. Go to Settings > API and copy your:
   - Project URL
   - anon/public key

### 3. Configure Environment

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📱 Deploy as PWA

### Build for Production

```bash
npm run build
```

The `dist` folder contains your production-ready PWA.

### Deploy Options

**Vercel (Recommended)**
```bash
npm i -g vercel
vercel
```

**Netlify**
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

**GitHub Pages**
```bash
npm run build
# Push dist folder to gh-pages branch
```

## 📲 Convert to Native App (Optional)

### Using Capacitor

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init "Paz" com.paz.app
npm run build
npx cap add ios
npx cap add android
npx cap sync
```

Then open in Xcode/Android Studio:
```bash
npx cap open ios
npx cap open android
```

## 💵 Monetization Setup

### AdMob Integration

1. Create AdMob account at [admob.google.com](https://admob.google.com)
2. Create an app and ad units
3. Install AdMob package:
   ```bash
   npm install @capacitor-community/admob
   ```
4. Update `AdBanner.jsx` with your ad unit IDs

**Test Ad Unit IDs:**
- iOS Banner: `ca-app-pub-3940256099942544/2934735716`
- Android Banner: `ca-app-pub-3940256099942544/6300978111`

### Payment Integration

For subscriptions, integrate:
- **RevenueCat** - Easiest cross-platform solution
- **Stripe** - Web payments
- **Apple/Google In-App Purchases** - Native payments

## 📂 Project Structure

```
paz/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Layout.jsx   # Main app layout with navigation
│   │   └── AdBanner.jsx # Ad component for Premium tier
│   ├── lib/
│   │   ├── supabase.js  # Supabase client & helpers
│   │   └── translations.js # Bilingual content
│   ├── pages/
│   │   ├── Welcome.jsx  # Onboarding screen
│   │   ├── Auth.jsx     # Sign in/up
│   │   ├── Home.jsx     # Dashboard
│   │   ├── MoodCheckIn.jsx # Mood tracker
│   │   ├── Breathe.jsx  # Breathing exercise
│   │   ├── Journal.jsx  # Gratitude journal
│   │   ├── Insights.jsx # Stats & charts
│   │   ├── Settings.jsx # App settings
│   │   └── Subscription.jsx # Upgrade plans
│   ├── store/
│   │   └── useStore.js  # Zustand state management
│   ├── styles/
│   │   └── global.css   # Global styles & variables
│   ├── App.jsx          # Main app with routing
│   └── main.jsx         # Entry point
├── supabase/
│   └── schema.sql       # Database schema
├── index.html
├── vite.config.js       # Vite + PWA config
└── package.json
```

## 🎨 Design System

### Colors
- Background: `#0a0a0f` (deep dark)
- Glass: `rgba(255, 255, 255, 0.05)`
- Accent Calm: `#7eb8da` (soft blue)
- Accent Peace: `#a8dadc` (mint)

### Fonts
- Display: Playfair Display (elegant headers)
- Body: DM Sans (clean, readable)

### Components
- Glassmorphism cards with blur
- Smooth Framer Motion animations
- iOS-style bottom navigation

## 🌐 Adding More Languages

Edit `src/lib/translations.js`:

```javascript
export const translations = {
  en: { ... },
  es: { ... },
  pt: { // Add Portuguese
    appName: 'Calma Diária',
    // ... more translations
  }
}
```

## 📊 Analytics (Optional)

Add Plausible or PostHog for privacy-friendly analytics:

```bash
npm install plausible-tracker
```

## 🔒 Privacy & Compliance

- All data stored in user's Supabase account
- Row Level Security ensures data isolation
- No third-party data sharing
- GDPR/CCPA compliant architecture

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use for your own projects!

---

Made with 💙 for mental wellness

**Questions?** Open an issue or reach out!
# AI Chatbot added
