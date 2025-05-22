import { ProgressModel } from "../../models/index.js";
import { format } from 'timeago.js';
import { missedWords } from "./missedWordAPI.js";

export async function dueList(unified) {
  const {
    user: { userId },
  } = unified;
  const model = new ProgressModel();
  const progress = await model.findDueItems(userId, {}, 0);
  return progress;
}

export async function dueStats(unified) {
  const { user: { userId } } = unified;

  const model    = new ProgressModel();  
  const progress = await model.findDueItems(userId, {}, 0);

  if( progress.length == 0 ) {
    return [];
  }

  const numDue   = progress.length;
  const earliest = numDue ? progress[0] : null;
  const now      = Date.now();
  const pastDue  = progress.filter( ({dueDate}) => dueDate < now );
  const missed   = await missedWords(unified);

  const numMissed = missed.missedWords.length;
  const missedPrompt = numMissed
            ? numMissed + ' / ' + missed.totalCount
            : 0;
  
  const stats = [
    {
      icon: 'ExclamationTriangleIcon',
      label: "Past Due",
      value: pastDue.length
    },
    {
      icon: 'ChevronUpIcon',
      label: "Total Due",
      value: progress.length + " (!)"
    },
    {
      icon: 'PercentBadgeIcon',
      label: "Score (past due)",
      value: __getAccPercentage(pastDue) + '%'
    },
    {
      icon: 'StarIcon',
      label: "Score (total)",
      value: __getAccPercentage(progress) + '%'
    },
    {
      icon: 'StarIcon',
      label: "Missed Words",
      value: missedPrompt
    },
    {
      icon: 'PencilIcon',
      label: "Next Due",
      value: format(earliest.dueDate)
    }
  ];

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
