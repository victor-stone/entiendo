import { useUserStore, useExerciseStore } from '../stores';
import UserStats from '../components/UserStats';
import FilterInfo from '../components/FilterInfo';
import { PageLink, Grid } from '../components/ui';
import { useEffect } from 'react';

import { 
  CardBody, 
  Card, 
  CardHeader, 
  CardBlock, 
  CardBlockBody
} from '../components/layout';

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

const LogoBackground = ({ children }) => (
  <div style={{ position: 'relative', overflow: 'hidden' }}>
    {/* Background image with 50% opacity */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: "url('../assets/images/entiendoLogo-trans.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'contain',
        opacity: 0.2,
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
    {/* Content above background */}
    <div style={{ position: 'relative', zIndex: 1 }}>
      {children}
    </div>
  </div>
);

const Dashboard = () => {
  const user = useUserStore(state => state.user);
  const getToken = useUserStore(state => state.getToken);

  return (
    <Card>
      <CardHeader>
        <span>Welcome, {user?.name || 'User'}!</span>
      </CardHeader>
      <CardBody>
        <LogoBackground>
          <Grid columns={2}>
            <CardBlock title="Idioms">
              <CardBlockBody>
                <FilterInfo getToken={getToken} />
                <PageLink page="/app/select" text="Select Idioms" />
              </CardBlockBody>
            </CardBlock>
            <CardBlock title="Progress">
              <CardBlockBody>
                <UserStats getToken={getToken} />
                <PageLink page="/app/exercise" text="Start Exercise" />
              </CardBlockBody>
            </CardBlock>
            <CardBlock title="Missed Words">
              <CardBlockBody>
                <MissedWordsPanel getToken={getToken} />
                <PageLink page="/app/exercise/review" text="Review" />
              </CardBlockBody>
            </CardBlock>
          </Grid>
        </LogoBackground>
      </CardBody>
    </Card>
  );
};

export default Dashboard;