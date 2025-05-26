import { useState } from 'react';
import { LoadingIndicator, Grid } from '../ui';
import { format } from 'timeago.js';
import { InboxIcon, ExclamationTriangleIcon, ClockIcon, ChatBubbleLeftRightIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import { Card } from '../layout/Card';

const ConfidenceMeter = ({ value }) => {
  const dots = [0, 1, 2].map((i) => (
    <span
      key={i}
      className={`inline-block w-2 h-2 rounded-full mx-0.5 
          ${value >= (i + 1) * 0.21  // 0.21, 0.42, 0.63
              ? 'bg-green-500 dark:bg-green-300'
              : 'bg-gray-300 dark:bg-gray-600' }`}
    ></span>
  )); return (
    <div className="flex items-center mt-2 ml-1" title="Confidence level">
      {dots}
    </div>
  );
};

const DueItem = ({ item, isPastDue, isDueToday }) => (
  <div
    key={item.progressId}
    className={`sm:items-center p-4 rounded-xl shadow border-l-4 transition hover:shadow-md
      ${isPastDue
        ? 'border-red-500 bg-red-10 dark:bg-red-900/20'
        : isDueToday
          ? 'border-green-500 bg-green-10 dark:bg-green-900/20'
          : 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
      }`}
  >
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
        <Card.Info text={item.tone} icon={ChatBubbleLeftRightIcon} />
        <Card.Info text={item.range.label} iconName={item.range.icon} />
      <ConfidenceMeter value={item.confidence} />
  </div>
);

const DueList = ({ dueList, loading, error }) => {
  const [groupByUsage, setGroupByUsage] = useState(false);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading due exercises: {error}</div>;
  }

  if (!dueList || dueList.length === 0) {
    return <div className="p-4 text-gray-500">No exercises due at this time.</div>;
  }

  const now = Date.now();
  const nowish = new Date();
  const midnightTonight = new Date(nowish.getFullYear(), nowish.getMonth(), nowish.getDate() + 1, 0, 0, 0, 0);

  // Group by usage.label if enabled
  let grouped = {};
  let groupCount = 0;
  if (dueList && dueList.length > 0) {
    const labels = new Set(dueList.map(item => item.range.label));
    groupCount = labels.size;
  }
  if (groupByUsage) {
    for (const item of dueList) {
      const label = item.range.label;
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(item);
    }
  }

  return (
    <>
      {groupCount > 1 && (
        <div id="groupByButton" className="flex justify-end p-2">
          <button
            className="text-xs px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={() => setGroupByUsage(g => !g)}>
            {groupByUsage ? 'Ungroup' : 'Group by Usage'}
          </button>
        </div>
      )}
        {groupByUsage ? (
          Object.entries(grouped).map(([label, items]) => (
            <div key={label} className="mb-6">
              <div className="font-semibold text-sm mb-2">{label}</div>
              <Grid columns={3}>
                {items.map((item, i) => (
                  <DueItem
                    key={item.progressId || i}
                    item={item}
                    isPastDue={item.dueDate < now}
                    isDueToday={item.dueDate < midnightTonight}
                  />
                ))}
              </Grid>
            </div>
          ))
        ) : (
          <Grid columns={3}>
            {dueList.map((item, i) => (
              <DueItem
                key={item.progressId || i}
                item={item}
                isPastDue={item.dueDate < now}
                isDueToday={item.dueDate < midnightTonight}
              />
            ))}
          </Grid>
        )}
    </>
  );
};

export default DueList;