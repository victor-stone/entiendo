import { Progress, Sandbox, History } from "../../models/index.js";
import { usageToRange } from "../../../shared/constants/usageRanges.js";
import { isNewAllowed } from "./isNewAllowed.js";
import { getReportState } from '../reportingAPI.js';

export async function schedule(routeContext) {
  const userId   = routeContext.user.userId;
  const query    = new Progress();
  const progress = query.schedule(userId).map(item => {
    item.range      = usageToRange(item.usage);
    item.confidence = _confidence(item);
    return item;
  });  

  return progress;
}

function _confidence(item) {
  const success            = item.successRate ?? 0;             // fallback if undefined
  const normalizedInterval = Math.min(item.interval, 7) / 7;
  const lapsePenalty       = Math.min(item.lapseCount, 3) / 3;

  let confidence = (success * 0.6) + (normalizedInterval * 0.3) - (lapsePenalty * 0.3);
      confidence = Math.max(0, Math.min(confidence, 1)); // clamp

  return confidence;
}

export async function scheduleStats(routeContext) {
  const { user } = routeContext;
  const { userId } = user;

  const _progress = new Progress();
  const _sandbox  = new Sandbox();
  const _history  = new History();

  const progress  = _progress.schedule(userId);

  if( progress.length == 0 ) {
    return {
      numSeen: 0,
      enableGetNext: true
    }
  }

  const earliest  = progress[0];
  const pastDue   = _progress.due(userId);
  const next      = _progress.nextDue(userId);
  const upcoming  = _progress.upcoming(userId);
  const missed    = _history.missedWords(userId, false);
  const unique    = [...new Set(missed)];
  const canNew    = isNewAllowed(userId);
  const sandboxes = _sandbox.history(userId);

  const stats = {
    pastDueDate : earliest?.dueDate || 0,
    numPastDue  : pastDue.length,
    numSeen     : progress.length,
    score       : __getAccPercentage(progress),
    nextDueDate : upcoming?.dueDate || 0,
    isNewAllowed: canNew,
    numSandboxes: sandboxes?.length || 0,
    missed      : missed.length,
    unique      : unique.length,
    reportState : getReportState(user)
  }

  stats.enableGetNext = (stats.numSeen == 0) || stats.isNewAllowed || stats.numPastDue;
  stats.upToDate      = (stats.numSeen > 0) && !stats.numPastDue;

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
    const _history = new History();
    for (const p of progress) {
      const history = _history.forProgress(p.progressId)
      for (const item of history) {
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
