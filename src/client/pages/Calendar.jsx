import { useEffect } from 'react';
import { useUserStore, useDueListStore } from '../stores';
import DueList from '../components/DueList';
import { Card } from '../components/layout';
import { LoadingIndicator } from '../components/ui';

const Calendar = () => {
  const getToken = useUserStore(state => state.getToken);
  const { data, fetch, loading, error } = useDueListStore();

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
    <Card title="Calendar">
      <Card.Body>
        {/* ...other calendar UI... */}
        <DueList dueList={data} loading={loading} error={error} />
      </Card.Body>
    </Card>
  );
};

export default Calendar;