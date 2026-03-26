import { useEffect, useState } from 'react';
import { Card } from './layout/Card';
import { format } from 'timeago.js';
import { useUserStore } from '../stores';
import exerciseService from '../services/exerciseService';

import { InboxIcon, ExclamationTriangleIcon, EyeIcon,
  ClockIcon, ChatBubbleLeftRightIcon, XMarkIcon, 
  PauseIcon, PlayIcon } from '@heroicons/react/24/solid';

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

const PausedItem = ({item}) => {
  const getToken              = useUserStore(state => state.getToken);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [paused, setPaused]   = useState(!!item.paused);

  useEffect(() => {
    setPaused(!!item.paused);
  }, [item.paused]);

  if (error) {
    return <span className="text-red-500">{error}</span>;
  }

  if (loading) {
    return '...'
  }

  const onToggle = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const updated = await exerciseService.togglePaused(item.progressId, token);
      if (typeof updated?.paused === 'boolean') {
        setPaused(updated.paused);
      } else {
        setPaused(prev => !prev);
      }
    } catch (err) {
      setError(err.message || 'Unable to toggle pause');
    } finally {
      setLoading(false);
    }
  };

  const color = paused ? 'text-red-700' : 'text-green-700';
  const text  = paused ? 'unpause' : 'pause';
  const Icon  = paused ? PlayIcon : PauseIcon;

  return <button className={`${color} text-sm`} onClick={onToggle}><Icon className="inline text-primary-500 w-4 h-4"/>{text}</button>;
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
    { !compact && <Card.Info text={`${format(item.createdAt)}`} icon={EyeIcon} /> }
    { !compact && <Card.Info text={`${item.seenX}x`} icon={XMarkIcon} /> }
    { !compact && <PausedItem item={item} /> }
    { !compact && <ConfidenceMeter value={item.confidence} /> }
  </div>
);

export default DueItem;
