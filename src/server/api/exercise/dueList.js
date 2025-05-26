import { ProgressModel } from "../../models/index.js";
import { format } from 'timeago.js';
import { missedWords } from "./missedWordAPI.js";
import { usageToRange } from "../../../shared/constants/usageRanges.js";

export async function dueList(unified) {
  const {
    user: { userId },
  } = unified;
  const model = new ProgressModel();
  let progress = await model.findDueItems(userId, {}, 0);

  progress = progress.map(item => {
    item.range = usageToRange(item.usage);

    // Confidence Score
    const success = item.successRate ?? 0; // fallback if undefined
    const normalizedInterval = Math.min(item.interval, 7) / 7;
    const lapsePenalty = Math.min(item.lapseCount, 3) / 3;

    let confidence = (success * 0.6) + (normalizedInterval * 0.3) - (lapsePenalty * 0.3);
    confidence = Math.max(0, Math.min(confidence, 1)); // clamp

    item.confidence = confidence;
    console.log("confidence: " + confidence);
    return item;
  });  
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
  const next     = progress.reduce((min, item) => 
    (item.dueDate > now && (min === null || item.dueDate < min.dueDate))
        ? item
        : min
  , null);

  const numMissed = missed.missedWords.length;
  const missedPrompt = numMissed
            ? numMissed + ' / ' + missed.totalCount
            : 0;
  
  // TODO: move this structure out to the client
  const stats = [
    {
      icon: 'ExclamationTriangleIcon',
      label: "Past Due",
      value: pastDue.length + (pastDue.length && " (" + format(earliest.dueDate) + ")")
    },
    {
      icon: 'ChevronUpIcon',
      label: "Total Seen",
      value: progress.length
    },
    {
      icon: 'StarIcon',
      label: "Score",
      value: __getAccPercentage(progress) + '%'
    },
    {
      icon: 'PencilIcon',
      label: "Missed Words",
      value: missedPrompt
    },
    {
      icon: 'CalendarIcon',
      label: "Next Due",
      value: format(next.dueDate),
      link: '/app/calendar' 
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
