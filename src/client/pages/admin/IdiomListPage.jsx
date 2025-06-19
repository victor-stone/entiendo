import { useEffect, useState } from 'react';
import IdiomTable from '../../components/admin/IdiomTable';
import { useIdiomListStore, useUserStore } from '../../stores';
import { Card } from '../../components/layout/Card';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import IdiomDetail from '../../components/admin/IdiomDetail';
import debug from 'debug';
const debugId = debug('app:idiom');
const debugRndr = debug('react:render');

function IdiomListPage() {  
  debugRndr('IdiomListPage')
  const [selectedIdiomId, setSelectedIdiomId] = useState(null);
  const getToken = useUserStore(s => s.getToken);
  const { data, loading, fetch, error, reset } = useIdiomListStore();
  
  useEffect(() => {
    if (!data && !loading) {
      debugId('IdiomListPage: fetching data')
      fetch(getToken);
    }
  }, [data, getToken, fetch, loading]);

  if( error ) {
    return <p className="text-red-500">{error}</p>;
  }
  
  if( loading || !data ) {
    return <LoadingIndicator />
  }

  function onBack() {
    setSelectedIdiomId(null)
  }

  return (
    <Card title={`Idiom List (${data.length})`}>
      <Card.Body className="pb-0">
        {selectedIdiomId             
            ? <IdiomDetail idiomId={selectedIdiomId} onBack={onBack} onChange={reset} />            
            : <IdiomTable idioms={data} onSelectIdiom={setSelectedIdiomId} />
        }
      </Card.Body>
    </Card>
  );
}

export default IdiomListPage;