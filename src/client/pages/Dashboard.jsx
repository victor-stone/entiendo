import { useUserStore, useDueStatsStore } from '../stores';
import UserStats from '../components/UserStats';
import FilterInfo from '../components/FilterInfo';
import SandboxPanel from '../components/SandboxPanel';
import { PageLink, Grid, LoadingIndicator } from '../components/ui';
import { useEffect } from 'react';
import { Card } from '../components/layout';
import { format } from 'timeago.js'
import debug from 'debug';

const debugRender = debug('app:render');

const DashboardTitle = ({dueStats}) => {
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
  const { data, fetch, loading, error } = useDueStatsStore();

  useEffect(() => {
    if (!data && !loading) {
      fetch(getToken);
    }
  }, [data, getToken, fetch, loading]);

  if( error ) {
    return <p className="text-red-500">{error}</p>;
  }
  if( loading || !data ) {
    return <LoadingIndicator />
  }

  return (
    <Card title={<DashboardTitle dueStats={data} getToken={getToken} />}>
      <Card.Body>
        <Grid columns={3}>
            <Card.Section title="Idioms">
                <FilterInfo  />
                <PageLink page="/app/preferences" text="Select Idioms" />
            </Card.Section>
            {data && data.numSeen > 0 && <Card.Section title="Progress">
                <UserStats dueStats={data}/>
                <PageLink page="/app/calendar" text="Calendar" />
            </Card.Section>}
            {data && data.numSeen > 0 && <Card.Section title="Missed Words">
                <SandboxPanel getToken={getToken} dueStats={data} />
            </Card.Section>}
        </Grid>
      </Card.Body>
    </Card>
  );
};

export default Dashboard;