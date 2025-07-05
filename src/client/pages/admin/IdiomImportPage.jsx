import { useState } from 'react';
import IdiomImporter from '../../components/admin/IdiomImporter'
import ImportManager from '../../components/admin/ImportManager';
import { Card } from '../../components/layout';
import Listing from '../../components/listing/Listing';

function IdiomImportPage() {
  const [parsedIdioms,     setParsedIdioms]     = useState([]);
  const [processingStatus, setProcessingStatus] = useState({ status: 'idle', message: '' });
  const [showUploader,     setShowUploader]     = useState(true);

  const handleIdiomsUploaded = (idioms, status) => {
    setParsedIdioms(idioms);
    setProcessingStatus(status);
    
    if (idioms.length > 0) {
      setShowUploader(false);
    }
  };

  const handleReset = () => {
    setParsedIdioms([]);
    setProcessingStatus({ status: 'idle', message: '' });
    setShowUploader(true);
  };

  return (
    <ImportManager
      idioms={parsedIdioms}
      setIdioms={setParsedIdioms}
      onReset={handleReset}
    >
      {showUploader ? (
        <Card title="Batch Import Idioms">
          <IdiomImporter onIdiomsUploaded={handleIdiomsUploaded} />
        </Card>
      ) : null}

      {processingStatus.status === 'success' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
          <p className="text-sm font-medium">{processingStatus.message}</p>
        </div>
      )}

      {parsedIdioms.length > 0 && (
        <Card title="Results">
          <Card.Body>
            <Listing data={parsedIdioms} />
          </Card.Body>
        </Card>
      )}
    </ImportManager>
  );
}

export default IdiomImportPage; 