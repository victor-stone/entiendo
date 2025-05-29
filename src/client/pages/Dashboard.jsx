import { useUserStore, useExerciseStore } from '../stores';
import UserStats from '../components/UserStats';
import FilterInfo from '../components/FilterInfo';
import { PageLink, Grid, LoadingSpinner } from '../components/ui';
import { useEffect } from 'react';
import { Card } from '../components/layout';
import debug from 'debug';

const debugRender = debug('app:render');

const MissedWordsPanel = ({getToken}) => {
  const { missedWords, getMissedWords, loading } = useExerciseStore();

  useEffect(() => {
    if (!missedWords && !loading ) 
      getMissedWords(getToken);
  }, [missedWords, getToken, getMissedWords, loading]);

  if( loading ) {
    return <LoadingSpinner />
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
const Dashboard = () => {
  debugRender('Rendering Dashboard');
  const user = useUserStore(state => state.user);
  const getToken = useUserStore(state => state.getToken);

  return (
    <Card title={`¡Bienvenido ${user?.name || ''}!`} >
      <Card.Body>
        <Grid columns={3}>
            <Card.Section title="Idioms">
                <FilterInfo getToken={getToken} />
                <PageLink page="/app/preferences" text="Select Idioms" />
            </Card.Section>
            <Card.Section title="Progress">
                <UserStats getToken={getToken} />
                <PageLink page="/app/exercise" text="Start Exercise" />
            </Card.Section>
            <Card.Section title="Missed Words">
                <MissedWordsPanel getToken={getToken} />
            </Card.Section>
        </Grid>
      </Card.Body>
    </Card>
  );
};

export default Dashboard;