import { useUserStore, useExerciseStore } from '../stores';
import UserStats from '../components/UserStats';
import FilterInfo from '../components/FilterInfo';
import { PageLink, Grid } from '../components/ui';
import { useEffect } from 'react';
import { Card } from '../components/layout';

const MissedWordsPanel = ({getToken}) => {
  const { missedWords, getMissedWords } = useExerciseStore();

  useEffect(() => {
    if (!missedWords) getMissedWords(getToken);
  }, [missedWords, getToken, getMissedWords]);

  if( !missedWords || (missedWords && !missedWords.totalCount) ) {
    return <p>Your record is perfect!</p>
  }

  return (
    <p>You missed {missedWords.missedWords.length} words {missedWords.totalCount} times. </p>
  )
}
const Dashboard = () => {
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
                <PageLink page="/app/exercise/review" text="Review" />
            </Card.Section>
        </Grid>
      </Card.Body>
    </Card>
  );
};

export default Dashboard;