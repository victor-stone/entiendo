import { useUserStore, useDueStatsStore, useBrandImageStore } from '../stores';
import ScheduleStats from '../components/ScheduleStats';
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

const HeaderImage = ({img,alt}) => <img src={img} alt={alt} className="w-20 h-20 object-contain mx-auto mb-4" />

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
  const showCalendar = data.numSeen > 0;
  const showSandbox = !data.enableGetNext && data.missed;

  return (
    <Card title={<DoExerciseTitle title="¡Bienvenido!" scheduleStats={data} getToken={getToken} />}>
      <Card.Body>
        <Grid columns={3} className="text-center">

          <div className="place-items-center text-center">
            <HeaderImage img={img1} alt="Ice Cream" />
            <div className='text-left'><FilterInfo /></div>
            <PageLink page="/app/preferences" text="Preferences" />
          </div>

          <div className="place-items-center text-center">
            <HeaderImage img={img2} alt="Clock" />
            {showCalendar
              ? <>
                <div className='text-left'><ScheduleStats scheduleStats={data} /></div>
                <PageLink page="/app/calendar" text="Calendar" />
              </>
              : <div >Your calendar is empty.</div>
            }
          </div>

          <div className="place-items-center text-center">
            <HeaderImage img={img3} alt="Doll" />
            {showSandbox
              ? <>
                <div className='text-left'><SandboxPanel scheduleStats={data} /></div>
                <PageLink page="/app/sandbox" text="Practice" />
              </>
              : data.enableGetNext 
                  ? <div>🔒 Unlock the Playroom by clearing your calendar</div>
                  : <div>Your playroom is empty.</div>
            }
          </div>
          
        </Grid>
      </Card.Body>
    </Card>
  );
};

export default Dashboard;