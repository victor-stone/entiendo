import { useState } from 'react';
import { Grid } from './ui';
import { Card } from '../components/layout';

import DueItem from './DueItem';

const Schedule = ({ schedule, hasNew }) => {
  const [groupByUsage, setGroupByUsage] = useState(false);
  const [viewCompact, setViewCompact] = useState(true);

  if (!schedule || schedule.length === 0) {
    return <div className="p-4 text-gray-500">No exercises due at this time.</div>;
  }

  const now = Date.now();
  const nowish = new Date();
  const midnightTonight = new Date(nowish.getFullYear(), nowish.getMonth(), nowish.getDate() + 1, 0, 0, 0, 0);

  // Group by usage.label if enabled
  let grouped = {};
  let groupCount = 0;
  if (schedule && schedule.length > 0) {
    const labels = new Set(schedule.map(item => item.range.label));
    groupCount = labels.size;
  }
  if (groupByUsage) {
    for (const item of schedule) {
      const label = item.range.label;
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(item);
    }
  }

  return (
    <>
        <div className="flex justify-around mb-2 ">
          {hasNew && <Card.Info className="shadow rounded-[3px]" text="New exercises are avaiable!" iconName="StarIcon" />}
          <label className="flex items-center space-x-2 mr-2">
            <span className="text-xs">Compact</span>
            <button
              type="button"
              role="switch"
              aria-checked={viewCompact}
              onClick={() => setViewCompact(v => !v)}
              className={`w-8 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                viewCompact ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-3 h-3 bg-white rounded-full shadow transform transition-transform ${
                  viewCompact ? 'translate-x-3' : 'translate-x-0'
                }`}
              />
            </button>
          </label>
      {groupCount > 1 && (
          <button
            className="text-xs px-2 py-1 rounded border hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={() => setGroupByUsage(g => !g)}>
            {groupByUsage ? 'Ungroup' : 'Group by Usage'}
          </button>
      )}
        </div>
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
                    compact={viewCompact}
                  />
                ))}
              </Grid>
            </div>
          ))
        ) : (
          <Grid columns={3}>
            {schedule.map((item, i) => (
              <DueItem
                key={item.progressId || i}
                item={item}
                isPastDue={item.dueDate < now}
                isDueToday={item.dueDate < midnightTonight}
                compact={viewCompact}
              />
            ))}
          </Grid>
        )}
    </>
  );
};

export default Schedule;