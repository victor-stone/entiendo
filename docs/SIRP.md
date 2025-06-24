# SIRP - Strategy for Inconsistent Recall Pattern

## Overview

SIRP (Strategy for Inconsistent Recall Pattern) is a memory scheduling algorithm designed for real-world learners—especially those who do not have perfect recall due to any number of reasons include "executive functioning" issues which manifest as atypical memorization needs and therefore have gaps or inconsistencies in their learning.

Unlike traditional spaced repetition systems (like SM-2/Anki), which assume consistent, typical to high-performing users, SIRP is built for the realities of atypical users.

**Why SIRP?**

- Learning and memorizing is not a linear process where often we struggle even with supposedly familiar material.
- Traditional algorithms can quickly push items to long intervals after a few good reviews, making it easy to "lose" material. They assume once you have performed well with an item you have mastered it.
- SIRP is designed to be forgiving, adaptive, and to keep material in rotation until it is truly stable in memory. It assumes the worst.
- The algorithm is intentionally conservative, ensuring that even after a streak of good performance, items are not scheduled so far in the future that they are forgotten.

SIRP is for learners who want or need to keep seeing material until they are *really* ready to let it go, and who want a system that adapts to their actual recall patterns—not just their best days.

---

**Update June 2025:**
After some field testing, SIRP now enforces even more conservative interval growth, with strong anchoring to performance runs, randomness, and a soft ceiling on intervals. Even after a streak of good or perfect reviews, intervals grow slowly and never escape to weeks/months without many consecutive successes. Lapses or mediocre performance always pull intervals back to frequent review.

---

## Key SIRP Principles

1. **Anchored Interval Growth:**
   Intervals grow slowly, always anchored to all performance. Even after several "good" or "easy" reviews, intervals can only increase by a small factor (e.g. 1.3× per review). This prevents items from escaping to long intervals too quickly.
2. **Soft Ceiling on Intervals:**
   Intervals cannot exceed a soft ceiling (default: 21 days) unless the item has had many consecutive good/easy reviews (default: 10). This ensures that even "mastered" items are still reviewed regularly.
3. **Randomization:**
   Each interval is randomized by ±15% to prevent predictability and simulate real-world memory variability.
4. **Aggressive Demotion and Re-Drill:**
   Any lapse (fail) or "hard" response sharply reduces the interval, often back to 1 day, ensuring immediate re-drill and preventing cards from lingering at long intervals after a mistake.
5. **Adaptive Difficulty (a.k.a. Ease Factor):**
   Difficulty (ease) is adjusted up or down in small increments based on recent success rate and feedback, but is always clamped to a safe range (1.3–3.0).
6. **Nuanced Calibration:**
   The mapping from evaluation to SIRP feedback and interval/ease adjustments is more conservative than SM-2, and further takes into account mistake type.

---

## Example: How SIRP Now Behaves

After a "perfect" score several times in a row:

- **Old SM-2/Anki:**
  1 → 3 → 8 → 20 → 50+ days (intervals explode after a few successes)
- **SIRP:**
  1 → 1.3 → 1.7 → 2.2 → 2.9 → 3.8 → 5.0 → 6.5 → 8.5 → 11 → 14 → 18 → 21 (soft ceiling)
  Only after 10+ consecutive good/easy reviews can the interval exceed 21 days.

If you get a "hard" or "fail" at any point, the interval is sharply reduced (often to 1 day), and you must rebuild with several more successes before intervals grow again.

---

## Updated SIRP Algorithm (Code Snippet)

```javascript
// update.js (core SIRP logic)
const SirpTweaks = {
  SIRP_SOFT_CEILING: 21, // max interval in days unless many consecutive successes
  SIRP_MIN_REVIEWS_FOR_LONG_INTERVALS: 10,
  SIRP_MAX_GROWTH: 1.3, // max interval growth per review
};

export default function updateSirpState(
  state,
  settings = {},
  tweaks = SirpTweaks
) {
  // ...existing code...

  // Process based on feedback
  if (feedback === 0) {
    // Fail: reset interval for re-drilling
    newState.lapseCount += 1;
    newState.difficulty = Math.max(1.3, newState.difficulty - 0.2 * adjustEaseFactor);
    newState.interval = 1; // Always reset to 1 day for a fail
  } else if (feedback === 1) {
    // Hard: clamp interval to max 7 days
    newState.difficulty = Math.max(1.3, newState.difficulty - 0.05 * adjustEaseFactor);
    newState.interval = Math.min(7, Math.max(1, Math.ceil(newState.interval * 0.7 * adjustInterval)));
  } else if (feedback === 2) {
    // Good: slow, anchored growth
    // ...difficulty adjustment...
    newState.interval = Math.ceil(newState.interval * newState.difficulty * adjustInterval);
  } else if (feedback === 3) {
    // Easy: slightly faster, but still capped
    newState.difficulty = Math.min(3.0, newState.difficulty + 0.05 * adjustEaseFactor);
    newState.interval = Math.ceil(newState.interval * newState.difficulty * 1.3 * adjustInterval);
  }

  // Add randomness to interval (±15%)
  const intervalRandomFactor = 0.85 + Math.random() * 0.3;
  newState.interval = Math.round(newState.interval * intervalRandomFactor);

  // Cap interval growth per review
  const prevInterval = state.interval || 1;
  if (newState.interval > Math.ceil(prevInterval * SIRP_MAX_GROWTH)) {
    newState.interval = Math.ceil(prevInterval * SIRP_MAX_GROWTH);
  }

  // Soft ceiling: can't exceed 21 days unless 10+ consecutive good/easy
  if (
    newState.interval > SIRP_SOFT_CEILING &&
    (state.successStreak || 0) < SIRP_MIN_REVIEWS_FOR_LONG_INTERVALS
  ) {
    newState.interval = SIRP_SOFT_CEILING;
  }

  // Track streak of good/easy reviews
  if (feedback >= 2) {
    newState.successStreak = (state.successStreak || 0) + 1;
  } else {
    newState.successStreak = 0;
  }

  // Set next due date
  const now = Date.now();
  newState.dueDate = now + newState.interval * 24 * 60 * 60 * 1000;

  // Flag leeches
  if (newState.lapseCount >= 3) {
    newState.isLeech = true;
  }

  return newState;
}
```

---

## Calibration: Mapping Evaluation to SIRP Feedback

```javascript
// calibrate.js (mapping evaluation to SIRP settings)
export default function calibrateSirpState(evaluation) {
    // ...map transcription/translation to feedback 0-3...
    // ...apply mistake type tweaks...

    // Conservative adjustments:
    if (feedback === 0) { // Fail
        adjustEaseFactor = 0.8;
        adjustInterval = 0.7;
    } else if (feedback === 1) { // Hard
        adjustEaseFactor = 0.9;
        adjustInterval = 0.8;
    } else if (feedback === 2) { // Good
        adjustEaseFactor = 0.95;
        adjustInterval = 0.9;
    } else { // Easy
        adjustEaseFactor = 1.0;
        adjustInterval = 1.0;
    }
    // ...mistake type tweaks...
    // ...clamp to [0.5, 1.2]...
    return { adjustEaseFactor, adjustInterval, feedback };
}
```

---

## Commentary: Why SIRP is Different

- **No more "elbow" to months:** Even after a streak of good scores, intervals grow slowly and are capped.
- **Lapses always pull back:** Any lapse or "hard" resets interval to 1 day or clamps it to a week, forcing re-drill.
- **Randomness and soft ceiling:** Prevents predictability and ensures even "mastered" cards are reviewed regularly.
- **Anchored to recent performance:** You must prove stability over many reviews before intervals get long.

---

## Example Table (Updated)


| Review | Feedback | Interval Calculation  | Next Interval (approx)  |
| -------- | ---------- | ----------------------- | ------------------------- |
| 1      | Easy (3) | 1 * 2.5 * 1.3 * rand  | ~3 days                 |
| 2      | Good (2) | 3 * 2.5 * 0.9 * rand  | ~7 days                 |
| 3      | Good (2) | 7 * 2.5 * 0.9 * rand  | ~16 days                |
| 4      | Easy (3) | 16 * 2.5 * 1.3 * rand | ~21 days (soft ceiling) |
| ...    | ...      | ...                   | ...                     |

If you get a "hard" or "fail" at any point, interval drops to 1–7 days and you must rebuild.

---

## Summary

SIRP is now highly conservative, adaptive, and forgiving—intervals grow slowly, are capped, and always reflect your most recent performance. Even after a streak of good reviews, you will not escape to long intervals until you have proven stability over many sessions. Lapses or mediocre performance always bring cards back to frequent review.
