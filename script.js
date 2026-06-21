// ══════════════════════════════════════════════════════════════════════════════
// HeartHero — script.js
// Sections:  0. Nav Scroll    1. localStorage  2. Slider  3. Validation
//            4. Form & Scoring  5. Animation & Breakdown  6. Insights
//            7. Dashboard  8. Trend  9. History
//           10. Shared Refresh & Reset  11. Page Load
// ══════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 0 – Smooth Anchor Scroll
// ══════════════════════════════════════════════════════════════════════════════
// The CSS `scroll-behavior: smooth` on <html> handles all anchor link scrolling.
// This block adds a small offset so sections don't hide under the sticky nav bar.
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    const target   = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    // 64px = sticky nav height — scroll stops just below it
    const offset = target.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top: offset, behavior: "smooth" });
  });
});

// ══ localStorage Key ══════════════════════════════════════════════════════════
const STORAGE_KEY = "hearthero_checkins";

// ══ Element References ════════════════════════════════════════════════════════
const form          = document.getElementById("checkinForm");
const stressSlider  = document.getElementById("stressLevel");
const stressDisplay = document.getElementById("stressValue");
const submitBtn     = document.getElementById("submitBtn");

const resultCard    = document.getElementById("resultCard");
const scoreNumber   = document.getElementById("scoreNumber");
const scoreBarFill  = document.getElementById("scoreBarFill");
const riskLevelEl   = document.getElementById("riskLevel");
const feedbackEl    = document.getElementById("feedback");
const breakdownList = document.getElementById("breakdownList");
const insightList   = document.getElementById("insightList");
const resetBtn      = document.getElementById("resetBtn");

const dashboardSection = document.getElementById("dashboardSection");
const dashLatestScore  = document.getElementById("dashLatestScore");
const dashAvgScore     = document.getElementById("dashAvgScore");
const dashTotal        = document.getElementById("dashTotal");
const dashConcern      = document.getElementById("dashConcern");

const trendSection = document.getElementById("trendSection");
const trendBars    = document.getElementById("trendBars");

const historySection  = document.getElementById("historySection");
const historyList     = document.getElementById("historyList");
const historyCount    = document.getElementById("historyCount");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1 – localStorage Helpers
// ══════════════════════════════════════════════════════════════════════════════
// localStorage stores everything as plain text strings.
// JSON.stringify() converts a JS array → string before saving.
// JSON.parse()     converts that string back → JS array when loading.

function loadHistory() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveHistory(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function addCheckinToHistory(entry) {
  const history = loadHistory();
  history.unshift(entry); // prepend so newest is always first
  saveHistory(history);
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2 – Stress Slider
// ══════════════════════════════════════════════════════════════════════════════

stressSlider.addEventListener("input", function () {
  stressDisplay.textContent = stressSlider.value;
  updateSliderTrack(stressSlider);
});

// Colour the slider track immediately on page load
updateSliderTrack(stressSlider);

// Paints the track left of the thumb red, right of it grey
function updateSliderTrack(slider) {
  const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background =
    `linear-gradient(to right, #e8001d 0%, #e8001d ${pct}%, #e0e0e0 ${pct}%, #e0e0e0 100%)`;
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 3 – Input Validation
// ══════════════════════════════════════════════════════════════════════════════
// validateForm() checks every number input before we score.
// Returns true if all values are valid, false (+ shows errors) if not.

function validateForm() {
  clearFieldErrors();
  let valid = true;

  // Heart Rate: required, must be 30–220
  const hrRaw = document.getElementById("heartRate").value.trim();
  const hr    = Number(hrRaw);
  if (hrRaw === "") {
    showFieldError("heartRate", "Please enter your resting heart rate.");
    valid = false;
  } else if (hr < 30 || hr > 220) {
    showFieldError("heartRate", "Heart rate must be between 30 and 220 bpm.");
    valid = false;
  }

  // Sleep Hours: required, must be 0–24
  const sleepRaw = document.getElementById("sleepHours").value.trim();
  const sleep    = Number(sleepRaw);
  if (sleepRaw === "") {
    showFieldError("sleepHours", "Please enter how many hours you slept.");
    valid = false;
  } else if (sleep < 0 || sleep > 24) {
    showFieldError("sleepHours", "Sleep hours must be between 0 and 24.");
    valid = false;
  }

  // Exercise Minutes: required, must be 0–300
  const exRaw = document.getElementById("exerciseMinutes").value.trim();
  const ex    = Number(exRaw);
  if (exRaw === "") {
    showFieldError("exerciseMinutes", "Please enter exercise minutes (use 0 if none).");
    valid = false;
  } else if (ex < 0 || ex > 300) {
    showFieldError("exerciseMinutes", "Exercise minutes must be between 0 and 300.");
    valid = false;
  }

  return valid;
}

// Shows a red error message beneath a specific input field
function showFieldError(fieldId, message) {
  const field   = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + "Error");
  field.classList.add("invalid");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  }
}

// Clears all error states so we start fresh on each submission attempt
function clearFieldErrors() {
  ["heartRate", "sleepHours", "exerciseMinutes"].forEach(function (id) {
    document.getElementById(id).classList.remove("invalid");
    const errorEl = document.getElementById(id + "Error");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.add("hidden");
    }
  });
}

// Clear an individual field's error as soon as the user starts editing it
["heartRate", "sleepHours", "exerciseMinutes"].forEach(function (id) {
  document.getElementById(id).addEventListener("input", function () {
    this.classList.remove("invalid");
    const errorEl = document.getElementById(id + "Error");
    if (errorEl) { errorEl.textContent = ""; errorEl.classList.add("hidden"); }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 4 – Form Submit & Scoring Logic
// ══════════════════════════════════════════════════════════════════════════════

form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Step 1: Validate — stop here if any field is invalid
  if (!validateForm()) return;

  // Step 2: Show a loading state on the button while we "calculate"
  submitBtn.disabled    = true;
  submitBtn.textContent = "Calculating…";

  // Step 3: Read all input values
  const heartRate       = Number(document.getElementById("heartRate").value);
  const sleepHours      = Number(document.getElementById("sleepHours").value);
  const stress          = Number(document.getElementById("stressLevel").value);
  const exerciseMinutes = Number(document.getElementById("exerciseMinutes").value);
  const chestPain       = document.getElementById("chestPain").checked;
  const shortnessBreath = document.getElementById("shortnessBreath").checked;
  const dizziness       = document.getElementById("dizziness").checked;
  const palpitations    = document.getElementById("palpitations").checked;

  // ── Scoring ────────────────────────────────────────────────────────────────
  // We start at 100 (a perfect day) and deduct points for each risk factor.
  // The breakdown array records every factor so the user can see the reasoning.
  let score = 100;
  const breakdown = [];

  // Heart Rate — normal adult resting range: 60–100 bpm
  if (heartRate > 100) {
    score -= 20;
    breakdown.push({ label: "Heart rate elevated (>100 bpm)", points: -20 });
  } else if (heartRate < 50) {
    score -= 10;
    breakdown.push({ label: "Heart rate very low (<50 bpm)", points: -10 });
  } else {
    breakdown.push({ label: "Heart rate in normal range", points: 0 });
  }

  // Sleep — under 6 hours is a known cardiovascular risk factor
  if (sleepHours < 6) {
    score -= 10;
    breakdown.push({ label: "Sleep under 6 hours", points: -10 });
  } else {
    breakdown.push({ label: "Sleep is adequate", points: 0 });
  }

  // Stress — chronic high stress raises cortisol and blood pressure
  if (stress >= 8) {
    score -= 15;
    breakdown.push({ label: "Stress very high (8–10)", points: -15 });
  } else if (stress >= 6) {
    score -= 7;
    breakdown.push({ label: "Stress moderately high (6–7)", points: -7 });
  } else {
    breakdown.push({ label: "Stress level manageable", points: 0 });
  }

  // Exercise — WHO recommends 30+ min of moderate activity per day
  if (exerciseMinutes < 15) {
    score -= 10;
    breakdown.push({ label: "Little or no exercise today", points: -10 });
  } else if (exerciseMinutes < 30) {
    score -= 5;
    breakdown.push({ label: "Some exercise, but under 30 min", points: -5 });
  } else {
    breakdown.push({ label: "Exercise goal met (30+ min)", points: 0 });
  }

  // Symptoms — heaviest penalties; these are direct cardiac warning signs
  if (chestPain) {
    score -= 30;
    breakdown.push({ label: "Chest pain or pressure reported", points: -30 });
  }
  if (shortnessBreath) {
    score -= 25;
    breakdown.push({ label: "Shortness of breath reported", points: -25 });
  }
  if (dizziness) {
    score -= 15;
    breakdown.push({ label: "Dizziness reported", points: -15 });
  }
  if (palpitations) {
    score -= 15;
    breakdown.push({ label: "Palpitations reported", points: -15 });
  }

  // Score is always 0–100; clamp in case multiple deductions exceed 100
  score = Math.max(0, Math.min(100, score));

  // ── Risk Level ─────────────────────────────────────────────────────────────
  // 75–100 → Low Concern | 45–74 → Medium Concern | 0–44 → High Concern
  let level, message, levelClass;

  if (score >= 75) {
    level      = "✅ Low Concern";
    message    = "Your check-in looks mostly stable today. Keep up the healthy habits and continue tracking daily.";
    levelClass = "low";
  } else if (score >= 45) {
    level      = "⚠️ Medium Concern";
    message    = "Some factors may need attention. Try to get more rest, reduce stress, and keep an eye on your symptoms.";
    levelClass = "medium";
  } else {
    level      = "🚨 High Concern";
    message    = "Your check-in shows several concerning signs. Please reach out to a healthcare professional — especially if your symptoms are severe or getting worse.";
    levelClass = "high";
  }

  // ── Update the result card ─────────────────────────────────────────────────
  riskLevelEl.textContent = level;
  feedbackEl.textContent  = message;
  resultCard.className    = "result-card " + levelClass; // sets the colour theme

  // Reset the progress bar to 0 before the new animation starts.
  // Temporarily disable the transition so the reset is instant, not animated.
  scoreBarFill.style.transition = "none";
  scoreBarFill.style.width      = "0%";
  void scoreBarFill.offsetWidth; // Force browser reflow — restarts the transition
  scoreBarFill.style.transition = "";

  animateScore(score);

  setTimeout(function () { scoreBarFill.style.width = score + "%"; }, 60);

  buildBreakdown(breakdown);

  renderInsights({ sleepHours, stress, exerciseMinutes, chestPain, shortnessBreath, dizziness, palpitations });

  // Play the entrance animation by removing then re-adding the class
  resultCard.classList.remove("hidden", "result-animate");
  void resultCard.offsetWidth; // Force reflow so the animation restarts
  resultCard.classList.add("result-animate");

  resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // ── Save to localStorage ────────────────────────────────────────────────────
  const now = new Date();
  const checkinEntry = {
    id:              now.getTime(),
    date:            now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
    shortDate:       now.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    time:            now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    heartRate,
    sleepHours,
    stress,
    exerciseMinutes,
    symptoms: { chestPain, shortnessBreath, dizziness, palpitations },
    score,
    levelClass,
    levelLabel: level,
    message
  };

  addCheckinToHistory(checkinEntry);
  refreshAll();

  // Re-enable the submit button after a short delay matching the animation
  setTimeout(function () {
    submitBtn.disabled    = false;
    submitBtn.textContent = "Calculate My Heart Score";
  }, 900);
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 5 – Score Animation & Breakdown
// ══════════════════════════════════════════════════════════════════════════════

// Counts the score number from 0 up to finalScore over ~900ms using
// requestAnimationFrame for a smooth, 60fps ease-out animation.
function animateScore(finalScore) {
  const duration  = 900;
  const startTime = Date.now();

  function step() {
    const elapsed  = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    scoreNumber.textContent = Math.round(eased * finalScore) + "/100";
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// Populates the score breakdown list inside the result card
function buildBreakdown(breakdown) {
  breakdownList.innerHTML = "";

  breakdown.forEach(function (item) {
    const li         = document.createElement("li");
    const labelSpan  = document.createElement("span");
    const pointsSpan = document.createElement("span");

    labelSpan.textContent = item.label;

    if (item.points < 0) {
      pointsSpan.textContent = item.points + " pts";
      pointsSpan.className   = "deduction";
    } else {
      pointsSpan.textContent = "✓";
      pointsSpan.className   = "ok";
    }

    li.appendChild(labelSpan);
    li.appendChild(pointsSpan);
    breakdownList.appendChild(li);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 6 – Today's Insights (rule-based messages)
// ══════════════════════════════════════════════════════════════════════════════
// Each rule checks one input and produces a typed message.
// Type: "urgent" = red border | "warning" = amber | "tip" = blue | "positive" = green

function buildInsights(inputs) {
  const { sleepHours, stress, exerciseMinutes, chestPain, shortnessBreath, dizziness, palpitations } = inputs;
  const messages = [];

  // Urgent: serious cardiac symptoms — check first, flag prominently
  if (chestPain || shortnessBreath || dizziness) {
    messages.push({
      type: "urgent",
      text: "⚠️ You reported serious symptoms (chest pain, shortness of breath, or dizziness). Please seek medical advice. Call emergency services immediately if symptoms are severe."
    });
  }

  // Palpitations: often harmless but worth noting
  if (palpitations) {
    messages.push({
      type: "warning",
      text: "💓 You noted heart palpitations today. While these are often benign, frequent or intense episodes should be discussed with a doctor."
    });
  }

  // Low sleep: raises blood pressure and cardiovascular risk
  if (sleepHours < 6) {
    messages.push({
      type: "warning",
      text: "🌙 You got under 6 hours of sleep. Sleep deprivation increases blood pressure and cardiovascular risk. Aim for 7–9 hours tonight."
    });
  }

  // High stress: two severity tiers
  if (stress >= 8) {
    messages.push({
      type: "warning",
      text: "🧠 Your stress level is very high today. Chronic stress strains your heart. Try a short walk, deep breathing, or a few minutes of quiet rest."
    });
  } else if (stress >= 6) {
    messages.push({
      type: "tip",
      text: "🧠 Stress is moderately elevated. Small mindfulness breaks throughout the day help keep cortisol in check."
    });
  }

  // Low exercise: two severity tiers
  if (exerciseMinutes < 15) {
    messages.push({
      type: "tip",
      text: "🏃 Little to no exercise today. Even a brisk 15-minute walk improves circulation and heart health — any movement counts!"
    });
  } else if (exerciseMinutes < 30) {
    messages.push({
      type: "tip",
      text: "🏃 Good start on exercise! Try to build toward 30+ minutes for the full cardiovascular benefit."
    });
  }

  // All clear — show a positive message when no issues found
  if (messages.length === 0) {
    messages.push({
      type: "positive",
      text: "✅ Everything looks great today! Solid sleep, low stress, and good activity are exactly what your heart needs. Keep it up!"
    });
  }

  return messages;
}

function renderInsights(inputs) {
  const messages = buildInsights(inputs);
  insightList.innerHTML = messages.map(function (item) {
    return `<li class="insight-item ${item.type}">${item.text}</li>`;
  }).join("");
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 7 – Dashboard Summary Cards
// ══════════════════════════════════════════════════════════════════════════════
// Always visible. Shows "--" / "0" placeholders when no history exists.

function updateDashboard() {
  const history = loadHistory();

  if (history.length === 0) {
    // Placeholder state: all dashes, neutral grey colour
    dashLatestScore.textContent = "--";
    dashLatestScore.className   = "dash-value";
    dashAvgScore.textContent    = "--";
    dashAvgScore.className      = "dash-value";
    dashTotal.textContent       = "0";
    dashTotal.className         = "dash-value filled";
    dashConcern.textContent     = "--";
    dashConcern.className       = "dash-value";
    return;
  }

  const latest   = history[0]; // newest first
  const total    = history.length;
  const avgScore = Math.round(
    history.reduce(function (sum, e) { return sum + e.score; }, 0) / total
  );

  dashLatestScore.textContent = latest.score + "/100";
  dashLatestScore.className   = "dash-value score-" + latest.levelClass;

  dashAvgScore.textContent = avgScore + "/100";
  dashAvgScore.className   = "dash-value score-" + scoreToLevelClass(avgScore);

  dashTotal.textContent = total;
  dashTotal.className   = "dash-value filled";

  const SHORT_CONCERN = { low: "Low ✅", medium: "Medium ⚠️", high: "High 🚨" };
  dashConcern.textContent = SHORT_CONCERN[latest.levelClass] || latest.levelLabel;
  dashConcern.className   = "dash-value concern-" + latest.levelClass;
}

// Converts a 0–100 score to a CSS colour class name
function scoreToLevelClass(score) {
  if (score >= 75) return "low";
  if (score >= 45) return "medium";
  return "high";
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 8 – Score Trend Bars
// ══════════════════════════════════════════════════════════════════════════════
// Always visible. Shows an empty-state message until the first check-in.
// No external chart library — pure HTML/CSS horizontal bars with animation.

function renderTrend() {
  const history = loadHistory();

  if (history.length === 0) {
    trendBars.innerHTML = '<p class="empty-state">Your score trend will appear here after your first check-in. ❤️</p>';
    return;
  }

  // Take the 5 most recent entries (history is newest-first), then reverse
  // so the oldest row appears at the TOP and newest at the BOTTOM — time flows down.
  const recent = history.slice(0, 5).reverse();

  trendBars.innerHTML = recent.map(function (entry) {
    const label = entry.shortDate || entry.date;
    // The CSS @keyframes growBar reads --target-width to animate the bar
    return `
      <div class="trend-row">
        <span class="trend-date">${label}</span>
        <div class="trend-bar-wrap">
          <div class="trend-bar ${entry.levelClass}" style="--target-width: ${entry.score}%"></div>
        </div>
        <span class="trend-score">${entry.score}</span>
      </div>
    `;
  }).join("");
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 9 – Check-In History Cards
// ══════════════════════════════════════════════════════════════════════════════
// Always visible. Shows an empty-state message until the first check-in.

function renderHistory() {
  const history = loadHistory();

  if (history.length === 0) {
    historyCount.textContent = "";
    historyList.innerHTML    = '<p class="empty-state">No check-ins yet.<br>Complete your first check-in above to start tracking your heart health! 💪</p>';
    return;
  }

  historyCount.textContent =
    history.length === 1 ? "1 check-in saved" : history.length + " check-ins saved";

  historyList.innerHTML = history.map(buildHistoryCardHTML).join("");
}

// Builds the HTML string for a single history card
function buildHistoryCardHTML(entry) {
  const symptomLabels = {
    chestPain:       "Chest pain",
    shortnessBreath: "Shortness of breath",
    dizziness:       "Dizziness",
    palpitations:    "Palpitations"
  };

  const checkedSymptoms = Object.keys(symptomLabels).filter(function (key) {
    return entry.symptoms[key] === true;
  });

  const symptomsHTML = checkedSymptoms.length > 0
    ? '<div class="history-symptoms">' +
        checkedSymptoms.map(function (key) {
          return '<span class="symptom-tag">' + symptomLabels[key] + "</span>";
        }).join("") +
      "</div>"
    : '<p class="no-symptoms">No symptoms reported</p>';

  return `
    <div class="history-card ${entry.levelClass}">
      <div class="history-card-top">
        <div class="history-score-block">
          <span class="history-score">${entry.score}</span>
          <span class="history-score-label">/100</span>
        </div>
        <div class="history-meta">
          <span class="history-level-badge">${entry.levelLabel}</span>
          <span class="history-date">${entry.date}</span>
          <span class="history-time">${entry.time}</span>
        </div>
      </div>
      <div class="history-stats">
        <div class="history-stat">💓 <strong>${entry.heartRate}</strong> bpm</div>
        <div class="history-stat">🌙 <strong>${entry.sleepHours}h</strong> sleep</div>
        <div class="history-stat">🧠 Stress <strong>${entry.stress}/10</strong></div>
        <div class="history-stat">🏃 <strong>${entry.exerciseMinutes} min</strong></div>
      </div>
      ${symptomsHTML}
    </div>
  `;
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 10 – Shared Refresh, Reset & Clear
// ══════════════════════════════════════════════════════════════════════════════

// refreshAll() keeps all three data-driven sections in sync with localStorage.
function refreshAll() {
  updateDashboard();
  renderTrend();
  renderHistory();
}

// Reset button: hides the result and scrolls back to the form
resetBtn.addEventListener("click", function () {
  resultCard.classList.add("hidden");
  resultCard.classList.remove("result-animate");
  form.reset();

  // form.reset() clears input values but doesn't fire the "input" event,
  // so we manually restore the slider badge and track colour.
  stressDisplay.textContent = "5";
  stressSlider.value        = "5";
  updateSliderTrack(stressSlider);

  // Reset the score bar so it animates from 0 next time
  scoreBarFill.style.transition = "none";
  scoreBarFill.style.width      = "0%";

  clearFieldErrors();

  form.scrollIntoView({ behavior: "smooth", block: "start" });
});

// Clear History: asks for confirmation, wipes localStorage, re-renders
clearHistoryBtn.addEventListener("click", function () {
  const confirmed = confirm("Clear all check-in history? This cannot be undone.");
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  refreshAll(); // all sections will revert to their empty states
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 11 – Page Load
// ══════════════════════════════════════════════════════════════════════════════

// Display today's date in the form header
(function renderTodayDate() {
  const el = document.getElementById("todayDate");
  if (el) {
    el.textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric"
    });
  }
})();

// Restore dashboard, trend, and history from whatever is in localStorage
refreshAll();
