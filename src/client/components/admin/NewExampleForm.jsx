import { useState } from 'react';
import { useUserStore, useCreateExampleStore } from '../../stores';
import IdiomSelector from './IdiomSelector';
import { Card, CardField } from '../layout';
import IdiomDetail from './IdiomDetail';
import { LoadingSpinner } from '../ui/LoadingIndicator';

const NewExampleForm = () => {
  // Get authentication token from user store
  const getToken = useUserStore(state => state.getToken);
  
  // Form state
  const [selectedIdiomId, setSelectedIdiomId] = useState(null);
  const [exampleText, setExampleText]         = useState('');
  const [exampleSnippet, setExampleSnippet]   = useState('');
  
  const { loading, error, data, fetch, reset } = useCreateExampleStore();

  const resetForm = () => {
    setExampleText('');
    setExampleSnippet('');
    reset();
  };
  
  if( error ) {
    return <p className="text-red-500">{error}</p>;
  }

  if( loading ) {
    return <LoadingSpinner />
  }

  if( data ) {
    return <IdiomDetail idiomId={selectedIdiomId} onBack={resetForm} />
  }
  // Handle idiom selection
  const handleIdiomChange = (e) => {
    setSelectedIdiomId(e.target.value);
  };
    
  const handleSaveExample = async () => {
    const exampleData = {
      idiomId          : selectedIdiomId,
      text             : exampleText,
      conjugatedSnippet: exampleSnippet,
      source           : 'admin'
    };
    fetch( exampleData, getToken );
  };
  // todo: move Card out to page component
  return (
    <Card title="Create New Example">
      <Card.Body>
        <CardField>
          <IdiomSelector
            value={selectedIdiomId}
            onChange={handleIdiomChange}
            required={true}
          />
      </CardField>            
      <CardField>
        <label className="block text-sm font-medium">
          Example Text *
          <textarea
            value={exampleText}
            onChange={(e) => setExampleText(e.target.value)}
            className="mt-1 block w-full dark:text-primary-900 border border-gray-300 rounded-md shadow-sm p-2"
            rows={3}
            required
          />
        </label>
      </CardField>
      
      <CardField>
        <label className="block text-sm font-medium">
          Conjugated Snippet *
          <input
            type="text"
            value={exampleSnippet}
            onChange={(e) => setExampleSnippet(e.target.value)}
            className="mt-1 block w-full dark:text-primary-900 border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </label>
      </CardField>
      
      <CardField>
        <button
          type="button"
          onClick={handleSaveExample}
          disabled={loading || !selectedIdiomId}
          className="btn btn-primary"
        >
          {loading ? 'Saving...' : 'Save Example'}
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="ml-3 border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded"
        >
          Reset
        </button>
      </CardField>
      </Card.Body>
    </Card>
  );
};

export default NewExampleForm; 