// ══════════════════════════════════════════════════════════════════════════════
// HeartHero – script.js
// This file handles: form scoring, localStorage, dashboard, insights, and trend.
// ══════════════════════════════════════════════════════════════════════════════

// ══ localStorage Key ══════════════════════════════════════════════════════════
// Every check-in entry is stored in localStorage under this key as a JSON string.
const STORAGE_KEY = "hearthero_checkins";

// ══ Element References ════════════════════════════════════════════════════════
// Grab every element we need once on page load to avoid repeated DOM lookups.

// Form and inputs
const form          = document.getElementById("checkinForm");
const stressSlider  = document.getElementById("stressLevel");
const stressDisplay = document.getElementById("stressValue");

// Result card elements
const resultCard    = document.getElementById("resultCard");
const scoreNumber   = document.getElementById("scoreNumber");
const scoreBarFill  = document.getElementById("scoreBarFill");
const riskLevelEl   = document.getElementById("riskLevel");
const feedbackEl    = document.getElementById("feedback");
const breakdownList = document.getElementById("breakdownList");
const resetBtn      = document.getElementById("resetBtn");

// Insight card (inside the result card)
const insightList   = document.getElementById("insightList");

// Dashboard cards
const dashboardSection = document.getElementById("dashboardSection");
const dashLatestScore  = document.getElementById("dashLatestScore");
const dashAvgScore     = document.getElementById("dashAvgScore");
const dashTotal        = document.getElementById("dashTotal");
const dashConcern      = document.getElementById("dashConcern");

// Score trend section
const trendSection = document.getElementById("trendSection");
const trendBars    = document.getElementById("trendBars");

// History section
const historySection  = document.getElementById("historySection");
const historyList     = document.getElementById("historyList");
const historyCount    = document.getElementById("historyCount");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1 – localStorage Helpers
// ══════════════════════════════════════════════════════════════════════════════
// localStorage can only hold plain text strings, so we convert our JavaScript
// arrays/objects using JSON.stringify() before saving and JSON.parse() when loading.

// Returns the saved history array, or [] if nothing is stored yet.
function loadHistory() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Overwrites the full history array in localStorage.
function saveHistory(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// Adds a new entry to the beginning of the array (newest first) then saves.
function addCheckinToHistory(entry) {
  const history = loadHistory();
  history.unshift(entry); // unshift() prepends to the array
  saveHistory(history);
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2 – Stress Slider
// ══════════════════════════════════════════════════════════════════════════════

// Update the red badge number and the track fill whenever the slider moves.
stressSlider.addEventListener("input", function () {
  stressDisplay.textContent = stressSlider.value;
  updateSliderTrack(stressSlider);
});

// Paint the slider track immediately on page load so it starts coloured.
updateSliderTrack(stressSlider);

// Paints the portion of the range track to the left of the thumb in red.
function updateSliderTrack(slider) {
  const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background =
    `linear-gradient(to right, #e8001d 0%, #e8001d ${pct}%, #e0e0e0 ${pct}%, #e0e0e0 100%)`;
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 3 – Form Submit & Scoring Logic
// ══════════════════════════════════════════════════════════════════════════════

form.addEventListener("submit", function (event) {
  event.preventDefault(); // Stop the browser from reloading the page

  // ── 3a. Read all input values ──────────────────────────────────────────────
  const heartRate       = Number(document.getElementById("heartRate").value);
  const sleepHours      = Number(document.getElementById("sleepHours").value);
  const stress          = Number(document.getElementById("stressLevel").value);
  const exerciseMinutes = Number(document.getElementById("exerciseMinutes").value);
  const chestPain       = document.getElementById("chestPain").checked;
  const shortnessBreath = document.getElementById("shortnessBreath").checked;
  const dizziness       = document.getElementById("dizziness").checked;
  const palpitations    = document.getElementById("palpitations").checked;

  // ── 3b. Calculate the heart score ─────────────────────────────────────────
  // Start at 100 (a perfect day) and deduct points for each risk factor.
  // The breakdown array records each factor so we can explain the result.
  let score = 100;
  const breakdown = [];

  // Heart Rate — normal adult range is 60–100 bpm
  if (heartRate > 100) {
    score -= 20;
    breakdown.push({ label: "Heart rate elevated (>100 bpm)", points: -20 });
  } else if (heartRate < 50) {
    score -= 10;
    breakdown.push({ label: "Heart rate very low (<50 bpm)", points: -10 });
  } else {
    breakdown.push({ label: "Heart rate in normal range", points: 0 });
  }

  // Sleep — adults need 7–9 hours; under 6 is a cardiovascular risk factor
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

  // Exercise — WHO recommends 30+ minutes of moderate activity per day
  if (exerciseMinutes < 15) {
    score -= 10;
    breakdown.push({ label: "Little or no exercise today", points: -10 });
  } else if (exerciseMinutes < 30) {
    score -= 5;
    breakdown.push({ label: "Some exercise, but under 30 min", points: -5 });
  } else {
    breakdown.push({ label: "Exercise goal met (30+ min)", points: 0 });
  }

  // Symptoms — the heaviest penalties; direct cardiac warning signs
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

  // Clamp: score can never go below 0 regardless of deductions
  if (score < 0) score = 0;

  // ── 3c. Determine risk level ───────────────────────────────────────────────
  // 75–100 = Low Concern  |  45–74 = Medium Concern  |  0–44 = High Concern
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

  // ── 3d. Update the result card UI ─────────────────────────────────────────
  riskLevelEl.textContent  = level;
  feedbackEl.textContent   = message;
  resultCard.className     = "result-card " + levelClass; // applies colour theme

  animateScore(score);

  // Delay the bar fill slightly so the CSS transition actually plays
  setTimeout(function () { scoreBarFill.style.width = score + "%"; }, 60);

  buildBreakdown(breakdown);

  // Show today's personalised insight messages
  renderInsights({ sleepHours, stress, exerciseMinutes, chestPain, shortnessBreath, dizziness, palpitations });

  // Show the result card and scroll to it
  resultCard.classList.remove("hidden");
  resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // ── 3e. Save the check-in to localStorage ─────────────────────────────────
  // Build a plain object containing everything about this check-in.
  // Dates are formatted into a readable string using the browser's locale.
  const now       = new Date();
  const date      = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const shortDate = now.toLocaleDateString("en-US", { month: "short", day: "numeric" }); // "Jun 19" — used in trend bars
  const time      = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const checkinEntry = {
    id:              now.getTime(),   // unique timestamp-based ID
    date:            date,
    shortDate:       shortDate,
    time:            time,
    heartRate:       heartRate,
    sleepHours:      sleepHours,
    stress:          stress,
    exerciseMinutes: exerciseMinutes,
    symptoms: {
      chestPain:       chestPain,
      shortnessBreath: shortnessBreath,
      dizziness:       dizziness,
      palpitations:    palpitations
    },
    score:       score,
    levelClass:  levelClass,
    levelLabel:  level,
    message:     message
  };

  addCheckinToHistory(checkinEntry);

  // Refresh all data-driven sections (dashboard, trend, history)
  refreshAll();
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 4 – Score Animation & Breakdown
// ══════════════════════════════════════════════════════════════════════════════

// Counts the displayed score up from 0 to finalScore over ~900ms.
// Uses requestAnimationFrame for smooth 60fps animation — no setInterval needed.
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

// Builds the score breakdown <li> items in the result card.
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
// SECTION 5 – Today's Insights (rule-based messages)
// ══════════════════════════════════════════════════════════════════════════════
// Each rule checks one aspect of the user's input and returns a typed message.
// Type can be: "urgent" | "warning" | "tip" | "positive"
// The CSS uses these types to colour the message with a left border.

function buildInsights(inputs) {
  const { sleepHours, stress, exerciseMinutes, chestPain, shortnessBreath, dizziness, palpitations } = inputs;
  const messages = [];

  // Severe cardiac symptoms — always checked first and flagged as urgent
  if (chestPain || shortnessBreath || dizziness) {
    messages.push({
      type: "urgent",
      text: "⚠️ You reported serious symptoms (chest pain, shortness of breath, or dizziness). Please seek medical advice. Call emergency services immediately if symptoms are severe."
    });
  }

  // Palpitations — notable but not always dangerous; worth mentioning
  if (palpitations) {
    messages.push({
      type: "warning",
      text: "💓 You noted heart palpitations today. While these are often harmless, frequent or intense palpitations should be discussed with a doctor."
    });
  }

  // Low sleep — raises blood pressure and cardiovascular risk
  if (sleepHours < 6) {
    messages.push({
      type: "warning",
      text: "🌙 You got under 6 hours of sleep last night. Sleep deprivation increases blood pressure and cardiovascular risk. Aim for 7–9 hours tonight."
    });
  }

  // High stress — two tiers (very high vs moderately high)
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

  // Low exercise — two tiers (none vs some but under 30 min)
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

  // If no issues were found, show a positive message
  if (messages.length === 0) {
    messages.push({
      type: "positive",
      text: "✅ Everything looks great today! Solid sleep, low stress, and good activity are exactly what your heart needs. Keep it up!"
    });
  }

  return messages;
}

// Populates the insight card inside the result card.
function renderInsights(inputs) {
  const messages = buildInsights(inputs);

  // Build one <li> per insight message using its type as the CSS class
  insightList.innerHTML = messages.map(function (item) {
    return `<li class="insight-item ${item.type}">${item.text}</li>`;
  }).join("");
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 6 – Dashboard Summary Cards
// ══════════════════════════════════════════════════════════════════════════════
// Reads saved history and fills in the four stat cards at the top of the page.

function updateDashboard() {
  const history = loadHistory();

  // Hide the dashboard when there is no data
  if (history.length === 0) {
    dashboardSection.classList.add("hidden");
    return;
  }

  dashboardSection.classList.remove("hidden");

  const latest = history[0]; // history is newest-first, so [0] is the latest
  const total  = history.length;

  // Average score: sum all scores and divide by the count
  const avgScore = Math.round(
    history.reduce(function (sum, entry) { return sum + entry.score; }, 0) / total
  );

  // Update the Latest Score card (coloured by its concern level)
  dashLatestScore.textContent = latest.score + "/100";
  dashLatestScore.className   = "dash-value score-" + latest.levelClass;

  // Update the Average Score card (coloured by whether the average is good or not)
  dashAvgScore.textContent = avgScore + "/100";
  dashAvgScore.className   = "dash-value score-" + scoreToLevelClass(avgScore);

  // Update Total Check-Ins (plain number, no colour needed)
  dashTotal.textContent = total;
  dashTotal.className   = "dash-value";

  // Update Latest Concern (short label, coloured by level)
  const SHORT_CONCERN = { low: "Low ✅", medium: "Medium ⚠️", high: "High 🚨" };
  dashConcern.textContent = SHORT_CONCERN[latest.levelClass] || latest.levelLabel;
  dashConcern.className   = "dash-value concern-" + latest.levelClass;
}

// Helper: converts a numeric score (0–100) to a CSS class name ("low"/"medium"/"high").
// Used to colour score values in the dashboard.
function scoreToLevelClass(score) {
  if (score >= 75) return "low";
  if (score >= 45) return "medium";
  return "high";
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 7 – Score Trend Bars
// ══════════════════════════════════════════════════════════════════════════════
// Reads the most recent 5 check-ins and draws each as a CSS horizontal bar.
// No external chart library — just plain HTML divs styled with CSS.

function renderTrend() {
  const history = loadHistory();

  // Hide the trend section when there is no data
  if (history.length === 0) {
    trendSection.classList.add("hidden");
    return;
  }

  trendSection.classList.remove("hidden");

  // history is newest-first; we take the first 5 and reverse them so the oldest
  // appears at the TOP of the chart and the newest at the BOTTOM — reads like time
  // flowing downward, which is the natural direction for a trend table.
  const recent = history.slice(0, 5).reverse();

  // Build one HTML row per entry using a template literal
  trendBars.innerHTML = recent.map(function (entry) {
    // Use the compact "Jun 19" format if available, otherwise fall back to full date
    const label = entry.shortDate || entry.date;

    // The CSS animation reads the score from the --target-width custom property
    // and grows the bar from 0% to that value over 0.8 seconds.
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
// SECTION 8 – Check-In History Cards
// ══════════════════════════════════════════════════════════════════════════════

function renderHistory() {
  const history = loadHistory();

  if (history.length === 0) {
    historySection.classList.add("hidden");
    return;
  }

  historySection.classList.remove("hidden");
  historyCount.textContent =
    history.length === 1 ? "1 check-in saved" : history.length + " check-ins saved";

  // Build the HTML for every history card and inject it all at once
  historyList.innerHTML = history.map(buildHistoryCardHTML).join("");
}

// Returns the full HTML string for a single history card entry.
function buildHistoryCardHTML(entry) {
  const symptomLabels = {
    chestPain:       "Chest pain",
    shortnessBreath: "Shortness of breath",
    dizziness:       "Dizziness",
    palpitations:    "Palpitations"
  };

  // Filter to only the symptoms that were checked (value === true)
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
// SECTION 9 – Shared Refresh & Reset
// ══════════════════════════════════════════════════════════════════════════════

// Calls all three data-driven rendering functions together so they always stay
// in sync with whatever is currently in localStorage.
function refreshAll() {
  updateDashboard();
  renderTrend();
  renderHistory();
}

// Reset button: hides the result card and scrolls back to the form.
resetBtn.addEventListener("click", function () {
  resultCard.classList.add("hidden");
  form.reset();

  // form.reset() clears inputs but doesn't fire the "input" event,
  // so we update the slider badge and track colour manually.
  stressDisplay.textContent = "5";
  stressSlider.value        = "5";
  updateSliderTrack(stressSlider);

  form.scrollIntoView({ behavior: "smooth", block: "start" });
});

// Clear History button: asks for confirmation, wipes localStorage, re-renders.
clearHistoryBtn.addEventListener("click", function () {
  const confirmed = confirm("Clear all check-in history? This cannot be undone.");
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  refreshAll(); // all sections will hide themselves when history is empty
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 10 – Page Load
// ══════════════════════════════════════════════════════════════════════════════
// This runs once when the page first loads (or after a refresh).
// It restores the dashboard, trend, and history from whatever is in localStorage.

refreshAll();
