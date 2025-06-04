import { ProgressModel } from "../../models/index.js";
import { usageToRange } from "../../../shared/constants/usageRanges.js";
import { isNewAllowed } from "./isNewAllowed.js";

export async function dueList(routeContext) {
  const userId   = routeContext.user.userId;
  const model    = new ProgressModel();
  let   progress = await model.findDueItems(userId, {}, 0);

  progress = progress.map(item => {
    item.range      = usageToRange(item.usage);
    item.confidence = _confidence(item);
    return item;
  });  
  return progress;
}

function _confidence(item) {
  const success = item.successRate ?? 0; // fallback if undefined
  const normalizedInterval = Math.min(item.interval, 7) / 7;
  const lapsePenalty = Math.min(item.lapseCount, 3) / 3;

  let confidence = (success * 0.6) + (normalizedInterval * 0.3) - (lapsePenalty * 0.3);
  confidence = Math.max(0, Math.min(confidence, 1)); // clamp
  return confidence;
}

export async function dueStats(routeContext) {
  const { user: { userId } } = routeContext;

  const model    = new ProgressModel();  
  const progress = await model.findDueItems(userId, {}, 0);

  if( progress.length == 0 ) {
    return {
      numSeen: 0
    }
  }

  const numDue   = progress.length;
  const earliest = numDue ? progress[0] : null;
  const now      = Date.now();
  const pastDue  = progress.filter( ({dueDate}) => dueDate < now );
  const next     = progress.reduce((min, item) => 
    (item.dueDate > now && (min === null || item.dueDate < min.dueDate))
        ? item
        : min
  , null);

  const stats = {
    pastDueDate: earliest?.dueDate || 0,
    numPastDue : pastDue.length,
    numSeen    : progress.length,
    score      : __getAccPercentage(progress),
    nextDueDate: next?.dueDate || 0,
    isNewAllowed: await isNewAllowed(userId)
  }

  return stats;

  // Helper to convert accuracy string to numeric value
  function __accuracyToScore(acc) {
    if (acc === "perfect") return 1;
    if (acc === "minor errors") return 0.7;
    return 0; // "major errors" or anything else
  }

  function __getAccPercentage(progress) {
    let total = 0,
      count = 0;
    for (const p of progress) {
      for (const item of p.history) {
        if (item.evaluation) {
          const tScore = __accuracyToScore(
            item.evaluation.transcriptionAccuracy
          );
          const trScore = __accuracyToScore(
            item.evaluation.translationAccuracy
          );
          total += (tScore + trScore) / 2;
          count++;
        }
      }
    }
    const accPercentage = count ? Math.round((total / count) * 100) : null;
    return accPercentage;
  }
}
