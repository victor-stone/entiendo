import { useEffect } from 'react';
import useExerciseStore from '../stores/exerciseStore';
import { Glyph, PageLink } from './ui';
import { Link } from 'react-router-dom';


const UserItem = ({label, value}) => (
  <span><span className="font-semibold">{label}:</span>{' '}
                <span>{value}</span></span>
);
const UserLink = ({label, value, to}) =>
  <Link className="underline" to={to}><UserItem label={label} value={value} /></Link>;


const UserStats = ({ getToken }) => {
  const { dueStats, getDueStats } = useExerciseStore();

  useEffect(() => {
    if (!dueStats) getDueStats(getToken);
  }, [dueStats, getToken, getDueStats]);

  return (
    <div id="UserStats">
      {(!dueStats || dueStats.length === 0) && (
        <span>
          <Glyph name="LanguageIcon" /> Start exercising and your progress will be here
        </span>
      )}

      {(dueStats && dueStats.length > 0) && 
          <div>
            {dueStats.map(({ label, value, icon, link }) => (
              <div key={label} className="text-sm">
                <Glyph name={icon} />
                {
                  link
                    ? <UserLink to={link} label={label} value={value} />
                    : <UserItem label={label} value={value} />
                }
              </div>
            ))}
          </div>
      }
    </div>
  );
};

export default UserStats;