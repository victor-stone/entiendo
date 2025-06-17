import { PageLink } from '../components/ui';
import { format } from 'timeago.js';

const DoExerciseTitle = ({ title, scheduleStats }) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="text-left">{title}</div>
      <div className="text-right">
        {scheduleStats?.enableGetNext
          ? <PageLink page="/app/exercise" text="Start Exercise" className="btn btn-primary" />
          : scheduleStats?.nextDueDate
            ? `Next exercise due ${format(scheduleStats.nextDueDate)}`
            : ''
        }
      </div>
    </div>
  );
};

export default DoExerciseTitle;
