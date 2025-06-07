import { useState } from 'react';
import { Grid } from './ui';
import DueItem from './DueItem';

const DueList = ({ dueList }) => {
  const [groupByUsage, setGroupByUsage] = useState(false);

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