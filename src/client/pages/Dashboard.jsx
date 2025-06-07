import { useUserStore, useDueStatsStore, useBrandImageStore } from '../stores';
import UserStats from '../components/UserStats';
import FilterInfo from '../components/FilterInfo';
import SandboxPanel from '../components/sandbox/SandboxPanel';
import { PageLink, Grid, LoadingIndicator } from '../components/ui';
import { useEffect } from 'react';
import { Card } from '../components/layout';
import { format } from 'timeago.js'
import debug from 'debug';
import img1 from "../assets/images/icecream.png";
import img2 from "../assets/images/clock.png";
import img3 from "../assets/images/doll.png";

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
  const { setImage } = useBrandImageStore();

  useEffect(() => {
    setImage('candle');
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
        <Grid columns={3} className="place-items-center text-center">
            <div><img src={img1} alt="Ice Cream" className="w-20 h-20 object-contain mx-auto" /></div>
            <div><img src={img2} alt="Clock" className="w-20 h-20 object-contain mx-auto" /></div>
            <div><img src={img3} alt="Doll" className="w-20 h-20 object-contain mx-auto" /></div>
            <div className="place-items-center text-center">
              <div className='text-left'><FilterInfo  /></div>
              <PageLink page="/app/preferences" text="Preferences" />
            </div>
                
            {data && data.numSeen > 0 && <div className="place-items-center text-center">
                <div className='text-left'><UserStats dueStats={data}/></div>
                <PageLink page="/app/calendar" text="Calendar" />
              </div>
            }
            {data && data.numSeen > 0 && <div className="place-items-center text-center">
                <div className='text-left'><SandboxPanel getToken={getToken} dueStats={data} /></div>
            </div>}
        </Grid>
      </Card.Body>
    </Card>
  );
};

export default Dashboard;