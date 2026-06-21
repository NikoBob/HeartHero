# ❤️ HeartHero — Preventative Heart-Health Tracker

**Live Demo:** [hearthero on GitHub Pages](https://your-username.github.io/hearthero/)
&nbsp;·&nbsp;
**Built with:** HTML · CSS · JavaScript · localStorage · GitHub Pages

---

## About the Project

HeartHero is a preventative heart-health tracker built with plain HTML, CSS, and JavaScript. It gives users a way to check in with their everyday health signals — resting heart rate, sleep, stress, activity, and symptoms — and converts those inputs into a personalised **HeartHero Score** on a 0–100 scale.

The app stores all check-in data **locally in the browser** using `localStorage`. No server, no database, no account required. It works entirely offline and deploys for free on GitHub Pages.

### Why I Built This

HeartHero was inspired by my dad's experience with a heart attack, which made me think more seriously about how people track everyday health signals before they become larger concerns. I became interested in how simple factors like stress, sleep, activity, heart rate, and symptoms could be organised in one place to help users better understand their own patterns.

I built HeartHero to explore how technology can make those everyday signals easier to understand. The goal is not to diagnose anyone or replace a doctor. Instead, HeartHero is meant to help people slow down, check in with themselves, and notice patterns that might otherwise be ignored.

For me, this project is not just about building a web app. It is about using code to respond to a real problem I saw in my own life. HeartHero reflects my interest in preventative health, human-centered design, and building tools that make complicated information easier for people to act on.

---

## Features

| Feature | Description |
|---|---|
| **Daily Check-In Form** | Collects resting heart rate, sleep hours, stress level (slider), exercise minutes, and 4 symptom checkboxes |
| **Heart Score (0–100)** | Rule-based scoring that starts at 100 and deducts points for risk factors |
| **Concern Level** | Low ✅ / Medium ⚠️ / High 🚨 based on the final score |
| **Score Breakdown** | Shows exactly which factors affected the score and by how many points |
| **Today's Insight** | Rule-based health messages colour-coded by severity (urgent / warning / tip / positive) |
| **Dashboard Cards** | Latest score, average score, total check-ins, latest concern — always visible |
| **Score Trend** | CSS horizontal bars showing the 5 most recent scores |
| **Check-In History** | All saved check-ins displayed as cards, newest first |
| **localStorage Persistence** | History survives page refreshes; no server needed |
| **Input Validation** | Heart rate 30–220, sleep 0–24, exercise 0–300; inline error messages |
| **Clear History** | One-click wipe with confirmation prompt |
| **Responsive Design** | Fully functional on mobile and desktop |
| **Medical Disclaimer** | Always visible; emergency guidance included |

---

## How It Works

```
Step 1  →  User fills in the daily check-in form
Step 2  →  App validates inputs (range checks, required fields)
Step 3  →  Rule-based algorithm calculates the HeartHero Score
Step 4  →  Result is saved to localStorage and shown as history, trend, and insight
```

### Scoring Logic

The score starts at **100** and deducts points for:

| Factor | Condition | Deduction |
|---|---|---|
| Heart Rate | > 100 bpm (tachycardia) | −20 pts |
| Heart Rate | < 50 bpm (bradycardia) | −10 pts |
| Sleep | < 6 hours | −10 pts |
| Stress | 8–10 | −15 pts |
| Stress | 6–7 | −7 pts |
| Exercise | < 15 min | −10 pts |
| Exercise | 15–29 min | −5 pts |
| Chest Pain | Reported | −30 pts |
| Shortness of Breath | Reported | −25 pts |
| Dizziness | Reported | −15 pts |
| Palpitations | Reported | −15 pts |

**Risk thresholds:**
- 75–100 → ✅ Low Concern
- 45–74 → ⚠️ Medium Concern
- 0–44 → 🚨 High Concern

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic page structure and accessibility |
| **CSS3** | Custom styling, animations, responsive grid layout |
| **JavaScript (ES6)** | Scoring logic, DOM manipulation, form validation |
| **localStorage** | Client-side data persistence — no server required |
| **GitHub Pages** | Free static site hosting with automatic deployment |
| **Responsive Design** | Flexbox and CSS Grid — works on all screen sizes |
| **Google Fonts (Inter)** | Clean, modern typography |

**No frameworks. No build tools. No backend. No dependencies.**

---

## Privacy & Safety

- ✅ All check-in data is stored **locally** in your browser's `localStorage`
- ✅ No data is ever sent to a server, cloud database, or third party
- ✅ No account or login is required
- ✅ Clearing your browser data or clicking "Clear All" removes all HeartHero data permanently

> ⚕️ **Medical Disclaimer:** HeartHero is not a medical diagnosis tool. It cannot replace a doctor's evaluation. If you are experiencing severe chest pain, trouble breathing, fainting, or a medical emergency, **call emergency services immediately**.

---

## Running Locally

No build tools or dependencies needed. Just clone and open.

```bash
git clone https://github.com/your-username/hearthero.git
cd hearthero
```

Then open `index.html` in any browser. That's it.

Alternatively, use VS Code's Live Server extension for auto-reload during development.

---

## Project Structure

```
hearthero/
├── index.html     # Full page structure: nav, landing, app, info sections, footer
├── style.css      # All styles: layout, components, animations, responsive
├── script.js      # All logic: scoring, localStorage, validation, rendering
└── README.md      # This file
```

---

## Future Improvements

- [ ] Export check-in history as CSV or PDF
- [ ] Weekly summary digest (opt-in, email-free — just a downloadable report)
- [ ] Streak tracking — how many days in a row checked in
- [ ] Goal-setting (e.g. target 30 min exercise per day)
- [ ] Dark mode toggle
- [ ] Progressive Web App (PWA) — install to home screen, full offline support
- [ ] Multiple user profiles stored locally
- [ ] Optional doctor-shared PDF summary

---

## License

This project is open source under the [MIT License](LICENSE).

---

*HeartHero was built as a personal project exploring preventative health, human-centered design, and the idea that simple, everyday data — tracked consistently — can make invisible health patterns visible.*
