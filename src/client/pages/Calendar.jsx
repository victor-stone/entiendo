import { useEffect } from 'react';
import { useUserStore, useExerciseStore } from '../stores';
import DueList from '../components/exercise/DueList';
import { Card, CardBody, CardHeader } from '../components/layout';


const Calendar = () => {
  const getToken = useUserStore(state => state.getToken);
  const { dueList, getDueList, loading, error } = useExerciseStore();

  useEffect(() => {
    const fetchDueList = async () => {
      await getDueList(getToken);
    };
    fetchDueList();
  }, [getDueList, getToken]);

  return (
    <Card>
        <CardHeader>Calendar</CardHeader>
        <CardBody>
      {/* ...other calendar UI... */}
      <DueList dueList={dueList} loading={loading} error={error} />
      </CardBody>
    </Card>
  );
};

export default Calendar;