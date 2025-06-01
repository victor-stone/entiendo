import { useEffect, useState } from 'react';
import IdiomTable from '../../components/admin/IdiomTable';
import useIdiomStore from '../../stores/idiomStore';
import { Card } from '../../components/layout/Card';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import IdiomDetail from '../../components/admin/IdiomDetail';

function IdiomListPage() {
  const { idioms, loading, error, getIdioms } = useIdiomStore();
  const [selectedIdiomId, setSelectedIdiomId] = useState(null);

  useEffect(() => {
    getIdioms(true);
    // eslint-disable-next-line
  }, []);

  console.log('IdiomListPage selectedIdiomId:', selectedIdiomId);

  if( error )
    return <div className="p-8 text-center text-red-600">{error}</div>

  if( (!idioms && !error) || loading ) 
    return <LoadingIndicator message="Loading idioms..." />

  return (
    <Card title={`Idiom List (${idioms.length})`}>
      <Card.Body className="pb-0">
        {selectedIdiomId             
            ? <IdiomDetail idiomId={selectedIdiomId} onBack={() => setSelectedIdiomId(null)} />            
            : <IdiomTable 
                idioms={idioms} 
                onSelectIdiom={setSelectedIdiomId}
              />
        }
      </Card.Body>
    </Card>
  );
}

export default IdiomListPage;