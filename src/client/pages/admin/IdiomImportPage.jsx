import { useState } from 'react';
import { Link } from 'react-router-dom';
import IdiomImporter from '../../components/admin/IdiomImporter'
import ImportManager from '../../components/admin/ImportManager';
import { Card, CardBody, CardHeader } from '../../components/layout';

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
        <Card>
          <CardHeader>Batch Import Idioms</CardHeader>
          <IdiomImporter onIdiomsUploaded={handleIdiomsUploaded} />
        </Card>
      ) : null}

      {processingStatus.status === 'success' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
          <p className="text-sm font-medium">{processingStatus.message}</p>
        </div>
      )}

      {parsedIdioms.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-3">
              <Link 
                to="/admin/idioms" 
                state={{ idioms: parsedIdioms }}
                className="px-4 py-2 rounded-md text-white bg-secondary-500 hover:bg-secondary-600 transition-colors"
              >
                View Full List
              </Link>
            </div>
          </div>
        </div>
      )}
    </ImportManager>
  );
}

export default IdiomImportPage; 