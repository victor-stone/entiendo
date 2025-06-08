import { useUserStore, useDueStatsStore, useBrandImageStore } from '../stores';
import UserStats from '../components/UserStats';
import FilterInfo from '../components/FilterInfo';
import SandboxPanel from '../components/sandbox/SandboxPanel';
import { PageLink, Grid, LoadingIndicator } from '../components/ui';
import { useEffect } from 'react';
import { Card } from '../components/layout';
import debug from 'debug';
import img1 from "../assets/images/icecream.png";
import img2 from "../assets/images/clock.png";
import img3 from "../assets/images/doll.png";
import DoExerciseTitle from '../components/DoExerciseTitle';

const debugRender = debug('app:render');

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

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  if (loading || !data) {
    return <LoadingIndicator />
  }
  const showCalendar = data && data.numSeen > 0;
  const showSandbox = data && data.numSeen > 0 && data.missed;

  return (
    <Card title={<DoExerciseTitle title="¡Bienvenido!" dueStats={data} getToken={getToken} />}>
      <Card.Body>
        <Grid columns={3} className="place-items-center text-center">

          <div className="place-items-center text-center">
            <img src={img1} alt="Ice Cream" className="w-20 h-20 object-contain mx-auto" />
            <div className='text-left'><FilterInfo /></div>
            <PageLink page="/app/preferences" text="Preferences" />
          </div>

          <div className="place-items-center text-center">
            <img src={img2} alt="Clock" className="w-20 h-20 object-contain mx-auto" />
            {showCalendar
              ? <>
                <div className='text-left'><UserStats dueStats={data} /></div>
                <PageLink page="/app/calendar" text="Calendar" />
              </>
              : <div >Your calendar is empty.</div>
            }
          </div>

          <div className="place-items-center text-center">
            <img src={img3} alt="Doll" className="w-20 h-20 object-contain mx-auto" />
            {showSandbox
              ? <>
                <div className='text-left'><SandboxPanel dueStats={data} /></div>
                <PageLink page="/app/sandbox" text="Practice" />
              </>
              : <div >Your playroom is empty.</div>
            }
          </div>
          
        </Grid>
      </Card.Body>
    </Card>
  );
};

export default Dashboard;