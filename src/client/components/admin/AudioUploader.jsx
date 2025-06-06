import { useState } from 'react';
import { useUserStore, useUploadAudioStore, useIdiomExampleStore } from '../../stores';
import IdiomSelector from './IdiomSelector';
import ExampleSelector from './ExampleSelector';
import { CardField } from '../layout';

const AudioUploader = ({ exampleId, onSuccess, onError }) => {
  const [audioFile, setAudioFile]                 = useState(null);
  const [success, setSuccess]                     = useState('');
  const [selectedIdiomId, setSelectedIdiomId]     = useState('');
  const [selectedExampleId, setSelectedExampleId] = useState('');

  const { loading, error, fetch, data, reset } = useUploadAudioStore();
  const { reset: exampleReset } = useIdiomExampleStore();

  // Get authentication token function from user store
  const getToken = useUserStore(state => state.getToken);
  
  if( data && !error ) {
      const successMsg = 'Audio uploaded successfully!';
      setSuccess(successMsg);
      if (onSuccess) 
        onSuccess(response);
  }

  if( error ) {
      setError(error);
      if (onError) 
        onError(error);
  }

  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0]);
    reset();
  };

  const handleIdiomChange = (e) => {
    setSelectedIdiomId(e.target.value);
    setSelectedExampleId('');
    exampleReset();
  };

  const handleExampleChange = (e) => {
    setSelectedExampleId(e.target.value);
  };
  
  const handleUpload = async () => {
    const targetExampleId = exampleId || selectedExampleId;
    const token = await getToken();
    fetch(targetExampleId, audioFile, token);    
  };
    
  return (
    <div className="space-y-4">
      {!exampleId && (
        <>
        <CardField>
          <IdiomSelector 
            value={selectedIdiomId} 
            onChange={handleIdiomChange} 
            required={true} 
          />
        </CardField>

        <CardField>
          <ExampleSelector 
            idiomId={selectedIdiomId} 
            value={selectedExampleId} 
            onChange={handleExampleChange} 
            required={true} 
          />
        </CardField>                    
        </>
      )}
      
      <CardField title="Audio File (MP3)">
          <input
            type="file"
            accept="audio/mpeg,audio/mp3"
            onChange={handleFileChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
      </CardField>
      
      <CardField>
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !audioFile || !selectedExampleId}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Uploading...' : 'Upload Audio'}
        </button>
      </CardField>
      
      {error && (
        <div className="text-red-500 mt-2">{error}</div>
      )}
      {success && (
        <div className="text-green-500 mt-2">{success}</div>
      )}
    </div>
  );
};

export default AudioUploader; 