import { useEffect } from 'react';
import useExerciseStore from '../stores/exerciseStore';
import { Glyph, LoadingIndicator } from './ui';
import { Card } from './layout';


const UserStats = ({ getToken }) => {
  const { dueStats, getDueStats, loading } = useExerciseStore();

  useEffect(() => {
    if (!dueStats) 
      getDueStats(getToken);
  }, [dueStats, getToken, getDueStats]);

  if( loading ) {
    return <LoadingIndicator />
  }
  
  if( !dueStats || dueStats.length === 0 ) {
    return (
      <>
          <Glyph name="LanguageIcon" />
          <span>Start exercising and your progress will be here</span>
      </>
    )
  }
  return (
    <>
      {dueStats.map(({ label, value, icon, link }) => (
        <Card.Info key={label} text={value} label={label} 
            iconName={icon} color={'white'} link={link} />
      ))}
    </>
  );
};

export default UserStats;