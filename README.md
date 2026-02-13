# 🍬 GlycoFlow
### *Real-Time, Context-Aware Nudges for Healthier Choices*
## 🌟 Overview

**GlycoFlow** is a gamified health-tech prototype designed to help young adults (16-32) build awareness of their sugar consumption habits. Unlike traditional calorie trackers, this app focuses on **immediate metabolic feedback** and **habit formation** through psychological hooks, all while maintaining a frictionless, privacy-first user experience.

---

## 🚀 Key Features

### 1. Fast, Frictionless Logging (< 10 Seconds)
*   **One-Tap Presets**: Instant logging for common items like Chai, Sweets, and Cold Drinks.
*   **AI Media Capture (Bonus)**: 
    *   📸 **Photo Logging**: Take a snap of your food; Gemini vision analyzes the sugar intensity automatically.
    *   🎙️ **Voice Logging**: Speak your entry; NLP extracts item names and metabolic impact in real-time.

### 2. Signup-Free, Gamified Onboarding
*   **Anonymous Entry**: Start immediately with an anonymous Device ID.
*   **Silent BMI Calculation**: Collects age/height/weight through a slider-based "game" interface and calculates health metrics silently to avoid user friction.

### 3. AI Context-Aware Insights (ML-Based)
*   Integrates **Gemini 1.5 Flash** to analyze user context (Age, BMI, Sleep, Steps) and generate:
    *   **Scientific "Cause -> Effect" Insights**: (e.g., *"Since your sleep was low, this Chai triggers a higher cortisol spike."*)
    *   **Metabolic Protocols**: Personalized corrective actions like a 10-minute walk or a fiber swap.

### 4. Psychological & Gamification Framework
*   **Daily Streaks**: Habit-forming ritual loop (1, 3, 7, 30 days) utilizing **Loss Aversion**.
*   **Variable Rewards**: Every log rewards users with XP, badges, or "Surprise Bonuses" to maintain engagement.
*   **Metabolic Rewards Hub**: A real-world reward system where users redeem earned XP for **coupons, BMI consultations, and gym passes**.
*   **Full Sensory Feedback**: High-quality micro-animations (Confetti) and auditory success cues.

### 5. Privacy & Data Ethics
*   **No Raw Biometrics**: Passive data (Steps, HR, Sleep) is used *only* as context for AI insights and is never displayed as raw numbers to reduce health anxiety.
*   **Edge-First Logic**: Core logic and user data are handled locally for maximum speed and privacy.

---

## 🛠️ Tech Stack

-   **Frontend**: React.js + Vite
-   **AI Engine**: Google Gemini 1.5 Flash
-   **Styling**: Tailwind CSS + Framer Motion (for high-end animations)
-   **Icons/Sound**: Lucide React + custom auditory feedback system
-   **Storage**: MongoDB

---

## 🧠 Psychological Principles Applied

| Principle | Implementation in "Beat the Sugar Spike" |
| :--- | :--- |
| **Instant Gratification** | Immediate confetti, sound, and XP rewards after every log. |
| **Variable Rewards** | Randomized bonus points and "Surprise Badge" triggers. |
| **Loss Aversion** | Visual progress indicators showing the risk of losing a 30-day "Habit Loop". |
| **Value-First Commitment** | Advanced features (History Journal) only unlock via optional signup *after* users see value. |

---

## 🏆 Hackathon Achievement
-   ✅ **Mandatory**: Signup-free flow, BMI calculation, Streak system, AI Insights, Gamified Scoring.
-   🌟 **Bonus**: Photo/Voice logging, Variable Rewards, High-quality animations, Real-world coupons hub.

---
*Created for the Hackathon Submission - Focused on transforming daily choices through metabolic awareness.*
