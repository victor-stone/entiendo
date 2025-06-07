import { Glyph } from './ui';
import { Card } from './layout';
import { format } from 'timeago.js';

const makeStatsArray = ({
  pastDueDate,
  numPastDue,
  numSeen,
  score,
  nextDueDate,
  isNewAllowed
}) => 
  [
    {
      icon: 'ExclamationTriangleIcon',
      label: numPastDue
          ? 'Past Due'
          : 'All caught up!',
      value: numPastDue
          ? numPastDue + ' (' + format(pastDueDate) + ')'
          : ''
    },
    {
      icon: 'EyeIcon',
      label: "Total Seen",
      value: numSeen
    },
    {
      icon: 'StarIcon',
      label: "Score",
      value: score + '%'
    },
    {
      icon: 'CalendarIcon',
      label: "Next Due",
      value: nextDueDate ? format(nextDueDate) : 'none'
    },
    {
      icon: 'SparklesIcon',
      label: isNewAllowed ? 'New available' : '',
      value: isNewAllowed ? '(!)' : ''
    }
  ];

const UserStats = ({ dueStats }) => {

  if( !dueStats || dueStats.numSeen === 0 ) {
    return (
      <>
          <Glyph name="LanguageIcon" />
          <span>Start exercising and your progress will be here</span>
      </>
    )
  }
  return (
    <>
      {makeStatsArray(dueStats).map(({ label, value, icon }) => (
        <Card.Info key={label} text={value} label={label} 
            iconName={icon} color={'white'} />
      ))}
    </>
  );
};

export default UserStats;