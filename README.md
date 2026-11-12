# Nexus Speak — Speak Naturally. Write Effortlessly.

An AI-powered voice-to-text, multilingual speech translation, and intelligent writing assistant application built with React, TypeScript, Vite, Web Audio API, and modern Web Speech APIs.

---

## 🌟 Features Implemented

1. **Multilingual Voice-to-Text Transcription**:
   - Live microphone capture with real-time dynamic audio frequency waveform visualizer (`AudioContext` + `AnalyserNode`).
   - Browser Speech Recognition integration (`webkitSpeechRecognition` / `SpeechRecognition`) with fallback synthetic multi-lingual models.
   - Punctuation restoration, paragraph formatting, and interim transcript stream.

2. **5 Initial Regional Languages**:
   - **Tamil** (`ta-IN`, தமிழ்)
   - **English** (`en-IN`, English India)
   - **Hindi** (`hi-IN`, हिन्दी)
   - **Telugu** (`te-IN`, తెలుగు)
   - **Malayalam** (`ml-IN`, മലയാളം)
   - Language swapper and independent source/target language selection.

3. **Intelligent AI Writing Assistant & 6 Tones**:
   - **Fix Grammar**: Syntax, capitalization, and punctuation correction with minimal edits.
   - **Professional**: Polished corporate register tailored for client emails, memos, and executive updates.
   - **Friendly**: Conversational, warm tone with appropriate emojis.
   - **Concise**: Executive summary bullet distilling speech into core takeaways.
   - **Formal**: Official and structured correspondence.
   - **Custom Tone**: User-specified custom prompts (e.g. "poetic", "investor pitch", "casual WhatsApp").

4. **All 8 Product Screens & User Journeys**:
   - **Screen 1 — Welcome & Onboarding**: Value proposition, guest session, sign-in, and privacy policy.
   - **Screen 2 — Home / Voice Studio**: Big glowing microphone button, mode selector pills (`Transcribe`, `Translate`, `Rewrite`), language dropdowns, usage quota meters, and 1-tap test speech samples.
   - **Screen 3 — Recording Overlay**: Animated frequency waveform, elapsed MM:SS timer, pause/resume, cancel, and stop controls.
   - **Screen 4 — Processing Overlay**: Glowing AI neural orb with step progress indicators.
   - **Screen 5 — Result Editor**: In-place text editor, original vs translated transcript toggle drawer, tone chips, copy to clipboard, share sheet, and save button.
   - **Screen 6 — History & Library**: Local search, star/favourites, delete single/all, and export as JSON or formatted TXT.
   - **Screen 7 — Subscription & Freemium**: 3 Tiers: Free Starter (50 credits/day), Nexus Speak Pro (₹199/mo or ₹1,799/yr, 500 units/day), and Nexus Speak Premium (₹399/mo or ₹3,499/yr, Unlimited), interactive checkout simulation with confetti celebrations, and restore purchases.
   - **Screen 8 — Settings**: Default languages, default tone, theme mode, ephemeral audio toggle, and permanent account deletion.

5. **Bonus Keyboard Integration Simulator (Section 12)**:
   - Interactive WhatsApp / Chat sandbox demonstrating how Nexus Speak operates as an iOS Custom Keyboard Extension (Swift) or Android Input Method Editor (Kotlin IME) with direct in-app text insertion.

6. **Design & Aesthetics**:
   - Obsidian Dark theme (default) and Pearl Light theme.
   - Responsive mobile chassis frame with a one-click toggle to wide desktop dashboard mode.
   - Dynamic Island notch showing active status, recording state, and subscription tier.

---

## 🚀 Running Locally

The app is currently running on the local dev server:

```bash
npm run dev
```

Visit [http://localhost:5173/](http://localhost:5173/) in your web browser.

To create a production build:

```bash
npm run build
```

---

## 📁 Project Architecture

```
nknl,nld/
├── index.html                  # HTML entry point, SEO tags, Google Fonts
├── src/
│   ├── types/
│   │   └── index.ts            # Data models, contracts, languages, tones
│   ├── services/
│   │   ├── aiLanguageService.ts # Multilingual translation & tone rewrite engines
│   │   ├── speechService.ts    # Web Audio API & Speech Recognition engine
│   │   └── storageService.ts   # Local persistence, privacy rules & history controls
│   ├── components/
│   │   ├── HeaderIsland.tsx    # Phone status bar, notch & theme toggle
│   │   ├── BottomNav.tsx       # Bottom navigation tab bar
│   │   ├── OnboardingModal.tsx # Screen 1: Welcome & Onboarding
│   │   ├── HomeVoiceStudio.tsx # Screen 2: Voice Studio & Quick Samples
│   │   ├── RecordingOverlay.tsx# Screen 3: Audio waveform & live recorder
│   │   ├── ProcessingOverlay.tsx# Screen 4: Neural AI processing screen
│   │   ├── ResultEditor.tsx    # Screen 5: Result editor & tone chips
│   │   ├── HistoryScreen.tsx   # Screen 6: History list, search & export
│   │   ├── SubscriptionScreen.tsx# Screen 7: Freemium & upgrade flow
│   │   ├── SettingsScreen.tsx  # Screen 8: Settings & privacy controls
│   │   ├── KeyboardCompanionModal.tsx # Keyboard IME & iOS extension demo
│   │   └── ShareModal.tsx      # WhatsApp, Email & system share modal
│   ├── App.tsx                 # Root application controller & state machine
│   ├── index.css               # Design system tokens, glassmorphism & animations
│   └── main.tsx                # React root mount
└── package.json
```
