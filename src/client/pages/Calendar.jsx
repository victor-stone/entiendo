import { useEffect } from 'react';
import { useUserStore, useScheduleStore, useScheduleStatsStore, useBrandImageStore } from '../stores';
import Schedule from '../components/Schedule';
import { Card } from '../components/layout';
import { LoadingIndicator } from '../components/ui';
import DoExerciseTitle from '../components/DoExerciseTitle';

const Calendar = () => {
  const getToken = useUserStore(state => state.getToken);
  const { data, fetch, loading, error } = useScheduleStore();  
  const { data: stats, fetch: statsGet, loading: statsLoading, 
          error: statsError
   } = useScheduleStatsStore();
  
  const { setImage } = useBrandImageStore();

  useEffect(() => {
    setImage('clock');
  }, [setImage])

  useEffect(() => {
    if (!data && !loading) {
      fetch(getToken);
    }
  }, [data, getToken, fetch, loading]);

  useEffect(() => {
    if (!stats && !statsLoading) {
      statsGet(getToken);
    }
  }, [stats, getToken, statsGet, statsLoading]);

  if (error || statsError) {
    return <p className="text-red-500">{error}</p>;
  }

  if (loading || !data || !stats || statsLoading) {
    return <LoadingIndicator />
  }

  const hasNew = stats && stats.isNewAllowed;

  return (
    <Card title={<DoExerciseTitle title="Calendar" scheduleStats={stats} />}>
      <Card.Body>
        <Schedule schedule={data} loading={loading} error={error} hasNew />
      </Card.Body>
    </Card>
  );
};

export default Calendar;