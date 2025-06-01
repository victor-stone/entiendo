import { useUserStore, useExerciseStore } from '../stores';
import UserStats from '../components/UserStats';
import FilterInfo from '../components/FilterInfo';
import { PageLink, Grid, LoadingSpinner, LoadingIndicator } from '../components/ui';
import { useEffect } from 'react';
import { Card } from '../components/layout';
import { format } from 'timeago.js'
import debug from 'debug';

const debugRender = debug('app:render');

const MissedWordsPanel = ({getToken}) => {
  const { dueStats, getDueStats, missedWords, getMissedWords, loading } = useExerciseStore();

  useEffect(() => {
    if (!missedWords && !loading ) 
      getMissedWords(getToken);
  }, [missedWords, getToken, getMissedWords, loading]);

  if( loading ) {
    return <LoadingSpinner />
  }

  if( dueStats && !dueStats.numSeen ) {
    return <p></p>
  }
  if( !missedWords || (missedWords && !missedWords.totalCount) ) {
    return <p>Your record is perfect!</p>
  }

  return (
    <>
      <p>You missed {missedWords.missedWords.length} words {missedWords.totalCount} times. </p>
      <PageLink page="/app/exercise/review" text="Review" />
    </>
  )
}
const CardTitle = ({dueStats}) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="text-left">¡Bienvenido!</div>
      <div className="text-right">
        {dueStats && (dueStats.isNewAllowed || dueStats.numPastDue)
          ? <PageLink page="/app/exercise" text="Start Exercise" className="btn btn-primary" />
          : dueStats.nextDueDate
            ? `Next exercise due ${format(dueStats.nextDueDate)}`
            : ''
        }
      </div>
    </div>
  )
}

const Dashboard = () => {
  debugRender('Rendering Dashboard');
  const getToken = useUserStore(state => state.getToken);

  const { dueStats, getDueStats, loading } = useExerciseStore();

  debugRender('Due Stats %o', dueStats)
  useEffect(() => {
    if (!dueStats) {
      getDueStats(getToken);
    }
  }, [dueStats, getToken, getDueStats]);

  if( !dueStats || loading ) {
    return <LoadingIndicator />
  }

  return (
    <Card title={<CardTitle dueStats={dueStats} getToken={getToken} />}>
      <Card.Body>
        <Grid columns={3}>
            <Card.Section title="Idioms">
                <FilterInfo getToken={getToken} />
                <PageLink page="/app/preferences" text="Select Idioms" />
            </Card.Section>
            {dueStats && dueStats.numSeen > 0 && <Card.Section title="Progress">
                <UserStats getToken={getToken} />
                <PageLink page="/app/calendar" text="Calendar" />
            </Card.Section>}
            {dueStats && dueStats.numSeen > 0 && <Card.Section title="Missed Words">
                <MissedWordsPanel getToken={getToken} />
            </Card.Section>}
        </Grid>
      </Card.Body>
    </Card>
  );
};

export default Dashboard;