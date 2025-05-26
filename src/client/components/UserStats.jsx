import { useEffect } from 'react';
import useExerciseStore from '../stores/exerciseStore';
import { Glyph } from './ui';
import { Link } from 'react-router-dom';
import { Card } from './layout';


const UserLink = ({ to, children }) => (
  <Link className="underline" to={to}>
    {children}
  </Link>
);

const UserStats = ({ getToken }) => {
  const { dueStats, getDueStats } = useExerciseStore();

  useEffect(() => {
    if (!dueStats) getDueStats(getToken);
  }, [dueStats, getToken, getDueStats]);

  if( !dueStats || dueStats.length === 0 ) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded shadow">
          <Glyph name="LanguageIcon" />
          <span>Start exercising and your progress will be here</span>
        </div>
    )
  }
  return (
    <div className="bg-white rounded shadow divide-y divide-gray-200">
      {dueStats.map(({ label, value, icon, link }) => (
        <Card.Info key={label} text={value} label={label} 
            iconName={icon} color={'white'} link={link} />
      ))}
    </div>
  );
};

export default UserStats;