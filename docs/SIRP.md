# 📘 SIRP: Strategy for Inconsistent Recall Patterns

*A forgiving and adaptive scheduling algorithm for language learners*

## Overview

SIRP is a memory scheduling algorithm tailored for learners who experience **fluctuating recall**. Unlike rigid systems like SM-2 (used by Anki), SIRP tracks not only success/failure but also the *quality* of recall and the learner’s *recent performance pattern*. The goal is to **keep useful material in rotation without punishing inconsistent performance**, and to space reviews in a way that grows with confidence—but cautiously.

SIRP is especially effective for users who:

- Forget even “easy” cards after a few days
- Need multiple consistent successes before trusting a card is “known”
- Miss review sessions or have irregular study patterns

---

## 🧾 Core State Fields

Each idiom progress record maintains the following key fields:


| Field           | Description                                                   |
| ----------------- | --------------------------------------------------------------- |
| `interval`      | Days until the next review                                    |
| `difficulty`    | Dynamic ease factor (1.3–3.0); controls interval growth rate |
| `successRate`   | Rolling average of performance (0 to 1)                       |
| `lapseCount`    | Number of failures for the card                               |
| `successStreak` | Number of consecutive “Good” or “Easy” responses          |
| `isLeech`       | Flagged true if`lapseCount` ≥ 3                              |
| `dueDate`       | Timestamp when the card is next due                           |

---

## 🔄 Algorithm Flow

### 1. Evaluation → Feedback + Adjustments

The evaluation (from user transcription/translation) is calibrated into:

- `feedback` (0 to 3):
  - 0 = Fail
  - 1 = Hard
  - 2 = Good
  - 3 = Easy
- `adjustEaseFactor` (how strongly to change difficulty)
- `adjustInterval` (how aggressively to scale intervals)

These values are tuned based on:

- Transcription accuracy
- Translation accuracy
- Mistake type (typo, audio misunderstanding, full misunderstanding)

---

### 2. Interval and Difficulty Logic


SIRP replaces the rigid “ease factor” of SM-2 with a more responsive `difficulty` value:

- Increases with consistent success
- Decreases with hesitation or failure
- Anchors future interval growth to actual long-term behavior
- Prevents one “Easy” answer from pushing a card out too far, too fast

#### ❌ Fail (0)

- Difficulty drops: `–0.2 × adjustEaseFactor`
- Interval shrinks: `interval × 0.5 × adjustInterval` (min 1)
- Lapse count increases

#### 😓 Hard (1)

- Difficulty drops slightly: `–0.05 × adjustEaseFactor`
- Interval grows slowly: `interval × 0.7 × adjustInterval`

#### 🙂 Good (2)

- If `successRate < 0.85`: slight difficulty decrease
- If `successRate > 0.95`: slight difficulty increase
- Interval grows: `interval × difficulty × adjustInterval`

#### ✅ Easy (3)

- Difficulty increases: `+0.05 × adjustEaseFactor` (max 3.0)
- Interval boosted: `interval × difficulty × 1.3 × adjustInterval`

Note that `difficulty` is only used in `interval` calculation only for GOOD and EASY feedback:

For FAIL and HARD, `interval` is multiplied by a fixed factor (0.5 or 0.7), and `difficulty` is not used in the interval calculation — only adjusted separately for future use.

This is because when the user fails or finds the item hard, the algorithm wants to reduce the new due date quickly, regardless of the current difficulty/ease. This ensures the item is shown sooner, focusing on immediate review rather than gradual spacing.

When the user succeeds (GOOD or EASY), the interval grows, and the growth is scaled by the current `difficulty`, allowing easier items to be spaced further apart.

**Summary**

On failure/hard: `interval` shrinks quickly, not influenced by `difficulty`.

On success: Interval grows, and the growth is scaled by `difficulty` (ease).

### 3. Safety Caps and Constraints

- **Max interval growth per review**: 1.3× previous interval
- **Soft ceiling**: Max 21 days *unless* success streak ≥ 5
- **Min difficulty**: 1.3; **Max difficulty**: 3.0
- **Randomness**: A ±15% random factor is added to every interval

---

### 4. Leech Handling

If `lapseCount` reaches 3:

- Card is marked as a **leech** (`isLeech = true`)
- Can be paused or flagged for user review or mnemonic editing

---

## 🔍 Real-World Example


| Review | Feedback            | Interval Calculation | Next Interval |
| -------- | --------------------- | ---------------------- | --------------- |
| 1      | Easy (3)            | `1 × 2.5 × 1.3`    | ~3 days       |
| 2      | Good (2)            | `3 × 2.5`           | ~8 days       |
| 2      | Hard (1)            | `3 × 0.7`           | ~2 days       |
| 2      | Fail (0)            | `3 × 0.5`           | ~1 day        |
| 3      | Easy (3) after Fail | `1 × 2.5 × 1.3`    | ~3 days       |

Note: Even after an Easy, SIRP doesn’t allow a runaway jump in interval if the last interval was recently reduced. Growth is **anchored to recent performance**.

## ✅ Summary

SIRP is:

- ✅ **Responsive** to subtle performance patterns
- ✅ **Gentle** on inconsistent learners
- ✅ **Adaptive** based on mistake type
- ✅ **Stable** via growth caps and leech handling
- ✅ **Forgiving** without giving up efficiency

It’s an ideal choice for learners who want meaningful reinforcement **without rigidity**.

---
