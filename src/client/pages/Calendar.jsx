import { useEffect } from 'react';
import { useUserStore, useDueListStore, useDueStatsStore, useBrandImageStore } from '../stores';
import DueList from '../components/DueList';
import { Card } from '../components/layout';
import { LoadingIndicator } from '../components/ui';
import DoExerciseTitle from '../components/DoExerciseTitle';


const Calendar = () => {
  const getToken = useUserStore(state => state.getToken);
  const { data, fetch, loading, error } = useDueListStore();  
  const { data: stats, fetch: statsGet, loading: statsLoading, 
          error: statsError
   } = useDueStatsStore();
  
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
    <Card title={<DoExerciseTitle title="Calendar" dueStats={stats} />}>
      <Card.Body>
        {hasNew ? <Card.Info className="mb-2 w-fit border border-gray-200 rounded-[3px]" text="New exercises are avaiable" iconName="StarIcon" /> : ''}
        <DueList dueList={data} loading={loading} error={error} />
      </Card.Body>
    </Card>
  );
};

export default Calendar;