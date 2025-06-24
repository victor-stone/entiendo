const SirpTweaks = {
  // Soft ceiling for interval length (e.g., 21 days unless 10+ consecutive good/easy)
  SIRP_SOFT_CEILING: 21,
  SIRP_MIN_REVIEWS_FOR_LONG_INTERVALS: 10,
  // Interval growth cap (previous 1.7 too sharp an elbow)
  SIRP_MAX_GROWTH: 1.3,
};

/**
 * Updates idiom state using SIRP algorithm
 * @param {Object} idiomState - Current idiom state
 * @param {Number} feedback - User feedback (0-3)
 * @param {Object} settings - algorithm settings tweaked by user's performance
 * @returns {Object} Updated idiom state
 */
export default function updateSirpState(
  state,
  settings = {},
  tweaks = SirpTweaks
) {
  const {
    feedback         = 0,
    adjustEaseFactor = 1.0,
    adjustInterval   = 1.0,
  } = settings;
  const {
    SIRP_SOFT_CEILING,
    SIRP_MIN_REVIEWS_FOR_LONG_INTERVALS,
    SIRP_MAX_GROWTH,
  } = tweaks;

  // Clone state to avoid mutation
  const newState = {
    interval   : 1,
    difficulty : 2.5,
    dueDate    : Date.now(),
    successRate: 0.9,
    lapseCount : 0,
    isLeech    : false,
    ...state,
  };

  // Update success rate based on feedback
  // Scale feedback from 0-3 to 0-1 for success rate calculation
  const normalizedFeedback = Math.min(feedback / 3, 1);
  newState.successRate = 0.9 * newState.successRate + 0.1 * normalizedFeedback;

  // Process based on feedback
  if (feedback === 0) {
    // Fail
    // Increment lapse count for tracking problem items
    newState.lapseCount += 1;

    // Decrease difficulty (ease factor) more significantly
    newState.difficulty = Math.max(
      1.3,
      newState.difficulty - 0.2 * adjustEaseFactor
    );

    // Reset interval for re-drilling
    newState.interval = Math.max(
      1,
      Math.floor(newState.interval * 0.5 * adjustInterval)
    );
  } else if (feedback === 1) {
    // Hard
    // Slightly decrease difficulty for items that were challenging
    newState.difficulty = Math.max(
      1.3,
      newState.difficulty - 0.05 * adjustEaseFactor
    );

    // Shorter interval than normal but not as short as a fail
    newState.interval = Math.max(1, Math.ceil(newState.interval * 0.7 * adjustInterval) );

  } else if (feedback === 2) {
    // Good
    // Slight adjustment based on success rate trend
    if (newState.successRate < 0.85) {
      newState.difficulty = Math.max(1.3, newState.difficulty - 0.02 * adjustEaseFactor);
    } else if (newState.successRate > 0.95) {
      newState.difficulty = Math.min(3.0, newState.difficulty + 0.02 * adjustEaseFactor);
    }

    // Normal interval growth
    newState.interval = Math.ceil(
      newState.interval * newState.difficulty * adjustInterval
    );
  } else if (feedback === 3) {
    // Easy
    // Increase difficulty for easier growth
    newState.difficulty = Math.min(3.0, newState.difficulty + 0.05 * adjustEaseFactor);

    // Longer interval with a boost
    newState.interval = Math.ceil(newState.interval * newState.difficulty * 1.3 * adjustInterval);
  }

  // --- Add randomness to interval ---
  // For example, random factor between 0.85 and 1.15 (±15%)
  const intervalRandomFactor = 0.85 + Math.random() * 0.3;
  newState.interval = Math.round(newState.interval * intervalRandomFactor);

  // Cap interval growth to keep it forgiving
  const prevInterval = state.interval || 1;

  if (newState.interval > Math.ceil(prevInterval * SIRP_MAX_GROWTH)) {
    newState.interval = Math.ceil(prevInterval * SIRP_MAX_GROWTH);
  }

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

  // --- the actual next date happens here ---
  const now = Date.now();
  newState.dueDate = now + newState.interval * 24 * 60 * 60 * 1000;

  // Flag cards with repeated lapses (3 or more) for special attention (TBD)
  if (newState.lapseCount >= 3) {
    newState.isLeech = true;
  }

  return newState;
}
