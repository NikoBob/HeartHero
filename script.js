// ══ Element References ═══════════════════════════════════════════════════════
// We grab every HTML element we'll need so we can read and update them later.
const form          = document.getElementById("checkinForm");
const stressSlider  = document.getElementById("stressLevel");
const stressDisplay = document.getElementById("stressValue");

const resultCard    = document.getElementById("resultCard");
const scoreNumber   = document.getElementById("scoreNumber");
const scoreBarFill  = document.getElementById("scoreBarFill");
const riskLevelEl   = document.getElementById("riskLevel");
const feedbackEl    = document.getElementById("feedback");
const breakdownList = document.getElementById("breakdownList");
const resetBtn      = document.getElementById("resetBtn");

// ══ Slider – live badge & coloured track update ═══════════════════════════════
// This runs every time the user moves the stress slider.
stressSlider.addEventListener("input", function () {
  // Show the current number inside the red badge next to the label
  stressDisplay.textContent = stressSlider.value;
  // Redraw the slider track so the left side fills red up to the thumb
  updateSliderTrack(stressSlider);
});

// Colour the slider track on first page load so it doesn't start all grey
updateSliderTrack(stressSlider);

// ══ Slider track helper ═══════════════════════════════════════════════════════
// Paints the portion of the range track to the left of the thumb in red.
function updateSliderTrack(slider) {
  // Calculate how far along the slider the thumb is (0% – 100%)
  const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background =
    `linear-gradient(to right, #e8001d 0%, #e8001d ${pct}%, #e0e0e0 ${pct}%, #e0e0e0 100%)`;
}

// ══ Form submit – scoring logic ═══════════════════════════════════════════════
// This runs when the user clicks "Calculate My Heart Score".
form.addEventListener("submit", function (event) {
  // Prevent the browser's default behaviour of refreshing the page on submit
  event.preventDefault();

  // ── Read input values ─────────────────────────────────────────────────────
  // Number() converts the string from the input field into an actual number.
  const heartRate       = Number(document.getElementById("heartRate").value);
  const sleepHours      = Number(document.getElementById("sleepHours").value);
  const stress          = Number(document.getElementById("stressLevel").value);
  const exerciseMinutes = Number(document.getElementById("exerciseMinutes").value);

  // .checked is true if the checkbox is ticked, false if not
  const chestPain       = document.getElementById("chestPain").checked;
  const shortnessBreath = document.getElementById("shortnessBreath").checked;
  const dizziness       = document.getElementById("dizziness").checked;
  const palpitations    = document.getElementById("palpitations").checked;

  // ── Start the score at 100 and deduct penalty points ──────────────────────
  // Think of this as a "perfect day" that we subtract from based on risk factors.
  let score = 100;

  // We also build a breakdown array so we can show the user exactly what
  // affected their score. Each entry has a label and a points value.
  const breakdown = [];

  // ── Factor 1: Heart Rate ──────────────────────────────────────────────────
  // A normal resting heart rate for adults is 60–100 beats per minute (bpm).
  // Above 100 (tachycardia) or below 50 (bradycardia) are potential warning signs.
  if (heartRate > 100) {
    score -= 20;
    breakdown.push({ label: "Heart rate elevated (>100 bpm)", points: -20 });
  } else if (heartRate < 50) {
    score -= 10;
    breakdown.push({ label: "Heart rate very low (<50 bpm)", points: -10 });
  } else {
    breakdown.push({ label: "Heart rate in normal range", points: 0 });
  }

  // ── Factor 2: Sleep ───────────────────────────────────────────────────────
  // Adults need 7–9 hours. Sleeping under 6 hours is linked to higher
  // cardiovascular risk (raises blood pressure and inflammatory markers).
  if (sleepHours < 6) {
    score -= 10;
    breakdown.push({ label: "Sleep under 6 hours", points: -10 });
  } else {
    breakdown.push({ label: "Sleep is adequate", points: 0 });
  }

  // ── Factor 3: Stress ──────────────────────────────────────────────────────
  // Chronic high stress raises cortisol and blood pressure.
  // We penalise in two tiers — very high stress costs more than moderate stress.
  if (stress >= 8) {
    score -= 15;
    breakdown.push({ label: "Stress very high (8–10)", points: -15 });
  } else if (stress >= 6) {
    score -= 7;
    breakdown.push({ label: "Stress moderately high (6–7)", points: -7 });
  } else {
    breakdown.push({ label: "Stress level manageable", points: 0 });
  }

  // ── Factor 4: Exercise ────────────────────────────────────────────────────
  // The WHO recommends at least 30 minutes of moderate activity per day.
  // Getting some exercise (15–29 min) is better than none, so it gets a
  // smaller deduction than no exercise at all.
  if (exerciseMinutes < 15) {
    score -= 10;
    breakdown.push({ label: "Little or no exercise today", points: -10 });
  } else if (exerciseMinutes < 30) {
    score -= 5;
    breakdown.push({ label: "Some exercise, but under 30 min", points: -5 });
  } else {
    breakdown.push({ label: "Exercise goal met (30+ min)", points: 0 });
  }

  // ── Factor 5: Symptoms ────────────────────────────────────────────────────
  // Symptoms are weighted the most heavily because they are direct warning signs
  // of a possible cardiac event. Each checked symptom deducts a significant amount.
  if (chestPain) {
    score -= 30;  // Chest pain is the most serious cardiac warning sign
    breakdown.push({ label: "Chest pain or pressure reported", points: -30 });
  }

  if (shortnessBreath) {
    score -= 25;  // Can indicate the heart isn't pumping efficiently
    breakdown.push({ label: "Shortness of breath reported", points: -25 });
  }

  if (dizziness) {
    score -= 15;  // Can signal low blood pressure or poor circulation
    breakdown.push({ label: "Dizziness reported", points: -15 });
  }

  if (palpitations) {
    score -= 15;  // Racing or irregular heartbeat may indicate arrhythmia
    breakdown.push({ label: "Palpitations reported", points: -15 });
  }

  // ── Clamp the score so it never goes below 0 ──────────────────────────────
  // Multiple deductions can theoretically push the number negative — we cap it.
  if (score < 0) score = 0;

  // ── Determine the risk level based on the final score ─────────────────────
  // Score thresholds:
  //   75–100  →  Low Concern    (healthy habits, no major symptoms)
  //   45–74   →  Medium Concern (some habits need attention)
  //   0–44    →  High Concern   (several concerning signs; see a doctor)
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

  // ── Update the result card text and colours ────────────────────────────────
  riskLevelEl.textContent = level;
  feedbackEl.textContent  = message;

  // Apply the colour class (low / medium / high) to the card
  // This changes the card's background, border, and text colours via CSS
  resultCard.className = "result-card " + levelClass;

  // ── Animate the score number counting up from 0 ────────────────────────────
  animateScore(score);

  // ── Animate the score progress bar filling in ──────────────────────────────
  // A short delay lets the browser paint the card visible first,
  // so the CSS transition actually plays and the bar isn't instantly full.
  setTimeout(function () {
    scoreBarFill.style.width = score + "%";
  }, 60);

  // ── Populate the score breakdown list ─────────────────────────────────────
  buildBreakdown(breakdown);

  // ── Show the result card and scroll to it smoothly ────────────────────────
  resultCard.classList.remove("hidden");
  resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

// ══ animateScore – counts the score number up from 0 to the final value ══════
// requestAnimationFrame creates a smooth animation that matches the screen's
// refresh rate (typically 60 fps) without using slow setInterval timers.
function animateScore(finalScore) {
  const duration = 900;     // Total time for the animation in milliseconds
  const startTime = Date.now();

  function step() {
    const elapsed  = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1); // Value from 0 to 1

    // Ease-out cubic: starts fast, decelerates near the end — feels natural
    const eased   = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * finalScore);

    scoreNumber.textContent = current + "/100";

    // Keep animating until we reach the end of the duration
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// ══ buildBreakdown – renders the score breakdown list ═════════════════════════
// Creates one <li> per factor so the user can see exactly what moved their score.
function buildBreakdown(breakdown) {
  // Clear any results from a previous submission
  breakdownList.innerHTML = "";

  breakdown.forEach(function (item) {
    const li          = document.createElement("li");
    const labelSpan   = document.createElement("span");
    const pointsSpan  = document.createElement("span");

    labelSpan.textContent = item.label;

    if (item.points < 0) {
      // Negative points are shown in red with a minus sign
      pointsSpan.textContent = item.points + " pts";
      pointsSpan.className   = "deduction";
    } else {
      // Zero-point items (good factors) get a green check mark
      pointsSpan.textContent = "✓";
      pointsSpan.className   = "ok";
    }

    li.appendChild(labelSpan);
    li.appendChild(pointsSpan);
    breakdownList.appendChild(li);
  });
}

// ══ Reset button – clear results and scroll back to the form ══════════════════
resetBtn.addEventListener("click", function () {
  // Hide the result card
  resultCard.classList.add("hidden");

  // Reset all form fields to their default/empty state
  form.reset();

  // Manually reset the stress slider display because form.reset() resets the
  // input value but does not fire the "input" event, so we update the badge
  // and track colour manually.
  stressDisplay.textContent = "5";
  stressSlider.value = "5";
  updateSliderTrack(stressSlider);

  // Scroll back to the top of the form so the user can fill it in again
  form.scrollIntoView({ behavior: "smooth", block: "start" });
});
