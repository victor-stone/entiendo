import { PageLink } from '../components/ui';
import { format } from 'timeago.js';

const DoExerciseTitle = ({ title, dueStats }) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="text-left">{title}</div>
      <div className="text-right">
        {dueStats && (!dueStats.numSeen || dueStats.isNewAllowed || dueStats.numPastDue)
          ? <PageLink page="/app/exercise" text="Start Exercise" className="btn btn-primary" />
          : dueStats.nextDueDate
            ? `Next exercise due ${format(dueStats.nextDueDate)}`
            : ''
        }
      </div>
    </div>
  );
};

export default DoExerciseTitle;
