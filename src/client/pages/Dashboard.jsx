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
  const { dueStats, getDueStats, missedWords, getMissedWords, loadingMissedWords, errorMissedWords } = useExerciseStore();

  useEffect(() => {
    if (!missedWords && !loadingMissedWords ) 
      getMissedWords(getToken);
  }, [missedWords, getToken, getMissedWords, loadingMissedWords]);

  if( loadingMissedWords ) {
    return <LoadingSpinner />
  }
  if( errorMissedWords ) {
    return <p className="text-red-500">{errorMissedWords}</p>;
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
        {dueStats && (!dueStats.numSeen || dueStats.isNewAllowed || dueStats.numPastDue)
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

  const { dueStats, getDueStats, loadingDueStats, errorDueStats } = useExerciseStore();

  debugRender('Due Stats %o', dueStats)
  useEffect(() => {
    if (!dueStats && !loadingDueStats) {
      getDueStats(getToken);
    }
  }, [dueStats, getToken, getDueStats, loadingDueStats]);

  if( loadingDueStats ) {
    return <LoadingIndicator />
  }
  if( errorDueStats ) {
    return <p className="text-red-500">{errorDueStats}</p>;
  }
  if( !dueStats ) {
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