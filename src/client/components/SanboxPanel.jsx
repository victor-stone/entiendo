import { useProgressQuery } from '../stores';
import { useEffect } from 'react';
import { PageLink, LoadingIndicator } from './ui';

const SandboxPanel = ({getToken, dueStats}) => {
  if( !dueStats || !dueStats.numSeen ) {
    return <p></p>
  }

  const { query, loading, fetch, error } = useProgressQuery();

  useEffect(() => {
    if (!query && !loading) {
      fetch(getToken);
    }
  }, [query, getToken, fetch, loading]);

  if( error ) {
    return <p className="text-red-500">{error}</p>;
  }

  if( loading ) {
    return <LoadingIndicator />
  }

  if( !query ) {
    return null;
  }
  
  const missedWords = query.missedWords(false);
  if( !missedWords?.length) {
    return <p>Your record is perfect!</p>
  }

  const uniqueCount = query.missedWords(true)?.length;

  return (
    <>
      <p>You missed {uniqueCount} words {missedWords.length} times. </p>
      <PageLink page="/app/sandbox" text="Practice" />
    </>
  )
}

export default SandboxPanel;
