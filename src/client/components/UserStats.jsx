import { useEffect } from 'react';
import useExerciseStore from '../stores/exerciseStore';
import { Glyph } from './ui';
import {CardBlock, CardBlockHeader, CardBlockBody } from '../components/layout';

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
            {dueStats.map(({ label, value, icon }) => (
              <div key={label} className="text-sm">
                <Glyph name={icon} />
                <span className="font-semibold">{label}:</span>{' '}
                <span>{value}</span>
              </div>
            ))}
          </div>
      }
    </div>
  );
};

export default UserStats;