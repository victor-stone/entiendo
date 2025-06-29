const ONE_DAY = 24 * 60 * 60 * 1000;

const SirpTweaks = {
  // Don't allow for any interval over 21 days unless
  // the has been 5 successes in a row 
  SIRP_SOFT_CEILING: 21,
  SIRP_SUCCESS_FOR_LONG_INTERVALS: 5,

  // Interval growth cap (previous 1.7 too sharp an elbow)
  SIRP_MAX_GROWTH: 1.3,
};

const FEEDBACK = {
  FAIL: 0,
  HARD: 1,
  GOOD: 2,
  EASY: 3
}

const max   = (a,b) => Math.max(a,b);
const min   = (a,b) => Math.min(a,b);
const ceil  = n => Math.ceil(n);
const floor = n => Math.floor(n);
const round = n => Math.round(n);


/**
 * Updates idiom state using SIRP algorithm
 * @param {Object} idiomState - Current idiom state
 * @param {Number} feedback - User feedback (0-3)
 * @param {Object} settings - algorithm settings tweaked by user's performance
 * @returns {Object} Updated idiom state
 */
export default function updateSirpState(
  state,
  settings,
  tweaks = SirpTweaks
) {

  const {
    feedback,
    adjustEaseFactor,
    adjustInterval
  } = settings;

  const {
    SIRP_SOFT_CEILING,
    SIRP_SUCCESS_FOR_LONG_INTERVALS,
    SIRP_MAX_GROWTH,
  } = tweaks;

  // Clone state to avoid mutation
  const newState = {
    interval     : 1,
    difficulty   : 2.5,
    dueDate      : Date.now(),
    successRate  : 0.9,
    lapseCount   : 0,
    isLeech      : false,
    successStreak: 0,
    ...state,
  };

  /**********************************************
   ** Update success rate                      **
   **********************************************/
  // Scale feedback from 0-3 to 0-1 for success rate calculation
  const normalizedFeedback = min(feedback / 3, 1);
  newState.successRate = 0.9 * newState.successRate + 0.1 * normalizedFeedback;

  /*******************************************************
   ** Update interval based on feedback/difficulty      **
   *******************************************************/
  if (feedback === FEEDBACK.FAIL) {
    newState.lapseCount += 1;

    newState.difficulty = max(1.3, newState.difficulty - 0.2 * adjustEaseFactor);
    newState.interval   = max(1, floor(newState.interval * 0.5 * adjustInterval));

  } else if (feedback === FEEDBACK.HARD) {

    newState.difficulty = max(1.3, newState.difficulty - 0.05 * adjustEaseFactor);
    newState.interval   = max(1, ceil(newState.interval * 0.7 * adjustInterval) );

  } else if (feedback === FEEDBACK.GOOD) {

    if (newState.successRate < 0.85) {
      newState.difficulty = max(1.3, newState.difficulty - 0.02 * adjustEaseFactor);
    } else if (newState.successRate > 0.95) {
      newState.difficulty = min(3.0, newState.difficulty + 0.02 * adjustEaseFactor);
    }

    newState.interval = ceil(newState.interval * newState.difficulty * adjustInterval);

  } else if (feedback === FEEDBACK.EASY) {

    newState.difficulty = min(3.0, newState.difficulty + 0.05 * adjustEaseFactor);
    newState.interval = ceil(newState.interval * newState.difficulty * 1.3 * adjustInterval);
  }

  /**********************************************
   ** Add random factor to interval            **
   **********************************************/
  // For example, random factor between 0.85 and 1.15 (±15%)
  const intervalRandomFactor = 0.85 + Math.random() * 0.3;
  newState.interval = round(newState.interval * intervalRandomFactor);

  /**********************************************
   ** Cap interval to prevent sharp elbows.    **
   **********************************************/
  const prevInterval = state.interval || 1;

  const maxGrowth = ceil(prevInterval * SIRP_MAX_GROWTH);
  if (newState.interval > maxGrowth) {
    newState.interval = maxGrowth;
  }

  if (
    newState.interval > SIRP_SOFT_CEILING &&
    newState.successStreak < SIRP_SUCCESS_FOR_LONG_INTERVALS
  ) {
    newState.interval = SIRP_SOFT_CEILING;
  }

  /**********************************************
   ** Note successes/failures                  **
   **********************************************/
  if (feedback >= 2) {
    newState.successStreak += 1;
  } else {
    newState.successStreak = 0;
  }
  if (newState.lapseCount >= 3) {
    newState.isLeech = true;
  }

  /**********************************************
   ** Apply interval to dueDate                **
   **********************************************/
  const now = Date.now();
  newState.dueDate = now + newState.interval * ONE_DAY;

  return newState;
}
