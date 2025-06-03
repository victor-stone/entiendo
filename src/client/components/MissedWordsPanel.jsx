import { useMissedWordsStore } from '../stores';
import { useEffect } from 'react';
import { PageLink, LoadingIndicator } from './ui';

const MissedWordsPanel = ({getToken, dueStats}) => {
  if( !dueStats || !dueStats.numSeen ) {
    return <p></p>
  }

  const { data, loading, fetch, error } = useMissedWordsStore();

  useEffect(() => {
    if (!data && !loading) {
      fetch(getToken);
    }
  }, [data, getToken, fetch, loading]);

  if( error ) {
    return <p className="text-red-500">{error}</p>;
  }

  if( loading ) {
    return <LoadingIndicator />
  }

  if( !data || (data && !data.totalCount) ) {
    return <p>Your record is perfect!</p>
  }

  return (
    <>
      <p>You missed {data.missedWords.length} words {data.totalCount} times. </p>
      <PageLink page="/app/exercise/review" text="Review" />
    </>
  )
}

export default MissedWordsPanel;
