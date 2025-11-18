import { Card } from './layout/Card';
import { format } from 'timeago.js';
import { InboxIcon, ExclamationTriangleIcon, ClockIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

const ConfidenceMeter = ({ value }) => {
  const thresholds = [0.5, 0.6, 0.7];
  const dots = thresholds.map((threshold, i) => (
    <span
      key={i}
      className={`inline-block w-2 h-2 rounded-full mx-0.5 
          ${value >= threshold
              ? 'bg-green-500 dark:bg-green-300'
              : 'bg-gray-300 dark:bg-gray-600' }`}
    ></span>
  ));
  return (
    <div className="flex items-center mt-2 ml-1" title="Confidence level">
      {dots}
    </div>
  );
};

const DueItem = ({ item, isPastDue, isDueToday, compact }) => (
  <div
    key={item.progressId}
    data-progress={item.progressId}

    className={`sm:items-center p-4 rounded-xl shadow border-l-4 transition hover:shadow-md
      ${isPastDue
        ? 'border-red-500 bg-red-10 dark:bg-red-900/20'
        : isDueToday
          ? 'border-green-500 bg-green-10 dark:bg-green-900/20'
          : 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
      }`}>
        
      {isPastDue
        ? (<Card.Info
          text={`Past Due: ${format(item.dueDate)}`}
          icon={ExclamationTriangleIcon}
          color="bg-red-30 text-red-700 dark:bg-red-900 dark:text-red-300" />)
        : isDueToday
          ? (<Card.Info
            text={`Due: ${format(item.dueDate)}`}
            icon={ClockIcon}
            color="bg-green-95 text-green-700 dark:bg-green-900 dark:text-green-300" />)
          : (<Card.Info
            text={`Due: ${format(item.dueDate)}`}
            icon={InboxIcon}
            color="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200" />)
      }
    { !compact && <Card.Info text={item.tone} icon={ChatBubbleLeftRightIcon} /> }
    { !compact && <Card.Info text={item.range.label} iconName={item.range.icon} /> }
    { !compact && <ConfidenceMeter value={item.confidence} /> }
  </div>
);

export default DueItem;
