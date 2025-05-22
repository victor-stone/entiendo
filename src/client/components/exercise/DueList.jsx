import { useEffect, useState } from 'react';
import { useUserStore, useExerciseStore } from '../../stores';
import { LoadingIndicator, DueBadge, Grid } from '../ui';
import { format } from 'timeago.js';
import { CardBlockHeader,CardBlockBody, CardBlock, CardField } from '../../components/layout';
import { usageToRange } from '../../../shared/constants/usageRanges';
import { ClockIcon, ExclamationTriangleIcon, ChatBubbleLeftRightIcon, ChartBarIcon, TagIcon } from '@heroicons/react/24/solid';

const DUE_LIST_PREVIEW = 12;

const Feature = ({ text, icon: Icon, color }) => (
  text && <span
    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${color || 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200'} mr-2`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {text}
  </span>
);

const DueItem = ({ item, isPastDue }) => (
    <div
      key={item.progressId}
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 rounded-xl shadow border-l-4 transition hover:shadow-md
        ${isPastDue
          ? 'border-red-500 bg-red-10 dark:bg-red-900/20'
          : 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
        }`}
    >
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-3 flex-wrap">
          {isPastDue ? (
            <Feature
              text={`Past Due: ${format(item.dueDate)}`}
              icon={ExclamationTriangleIcon}
              color="bg-red-30 text-red-700 dark:bg-red-900 dark:text-red-300"
            />
          ) : (
            <Feature
              text={`Due: ${format(item.dueDate)}`}
              icon={ClockIcon}
              color="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200"
            />
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          <Feature text={item.tone} icon={ChatBubbleLeftRightIcon} />
          <Feature text={usageToRange(item.usage)?.label} icon={ChartBarIcon} />
        </div>
      </div>
    </div>
)
const DueList = () => {
  const getToken = useUserStore(state => state.getToken);
  const { dueList, getDueList, loading, error } = useExerciseStore();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchDueList = async () => {
      await getDueList(getToken);
    };
    fetchDueList();
  }, [getDueList, getToken]);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading due exercises: {error}</div>;
  }

  if (!dueList || dueList.length === 0) {
    return <div className="p-4 text-gray-500">No exercises due at this time.</div>;
  }

  const displayedItems = expanded ? dueList : dueList.slice(0, DUE_LIST_PREVIEW);
  const hasMore = !expanded && dueList.length > DUE_LIST_PREVIEW;

  return (
    <CardBlock>
      <CardBlockHeader>Due Exercises</CardBlockHeader>
      <CardBlockBody>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {displayedItems.map((item) => 
            <DueItem item={item} isPastDue={new Date(item.dueDate) < new Date()} />)}
        </div>
        {hasMore && (
          <div className="p-4 text-center">
            <button onClick={() => setExpanded(true)}
              className="btn btn-outline-primary btn-sm"
            >
              Show More ({dueList.length - DUE_LIST_PREVIEW} more)
            </button>
          </div>
        )}
      </CardBlockBody>
    </CardBlock>
  );
};

export default DueList;
