import React, { useState } from 'react';
import adminService from '../../services/adminService';
import { useUserStore } from '../../stores';
import IdiomSelector from './IdiomSelector';
import ExampleSelector from './ExampleSelector';

const AudioUploader = ({ exampleId, onSuccess, onError, onSkip }) => {
  const [audioFile, setAudioFile]                 = useState(null);
  const [loading, setLoading]                     = useState(false);
  const [error, setError]                         = useState('');
  const [success, setSuccess]                     = useState('');
  const [selectedIdiomId, setSelectedIdiomId]     = useState('');
  const [selectedExampleId, setSelectedExampleId] = useState('');
  
  // Get authentication token function from user store
  const getToken = useUserStore(state => state.getToken);
  
  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0]);
    setError('');
  };

  const handleIdiomChange = (e) => {
    setSelectedIdiomId(e.target.value);
    setSelectedExampleId('');
  };

  const handleExampleChange = (e) => {
    setSelectedExampleId(e.target.value);
  };
  
  const handleUpload = async () => {
    // Use provided exampleId or the selected one from the ExampleSelector
    const targetExampleId = exampleId || selectedExampleId;
    
    if (!targetExampleId) {
      const errorMsg = 'Example ID is required to upload audio';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }
    
    if (!audioFile) {
      const errorMsg = 'Audio file is required';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Get auth token and pass it to the service call
      const token = await getToken();
      const response = await adminService.uploadExampleAudio(targetExampleId, audioFile, token);
      
      if (response && response.success) {
        const successMsg = 'Audio uploaded successfully!';
        setSuccess(successMsg);
        if (onSuccess) onSuccess(response);
      } else {
        throw new Error('Failed to upload audio');
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during audio upload';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSkip = () => {
    if (onSkip) onSkip();
  };
  
  return (
    <div className="space-y-4">
      {!exampleId && (
        <>
          <IdiomSelector 
            value={selectedIdiomId} 
            onChange={handleIdiomChange} 
            required={true} 
          />
          
          <ExampleSelector 
            idiomId={selectedIdiomId} 
            value={selectedExampleId} 
            onChange={handleExampleChange} 
            required={true} 
          />
        </>
      )}
      
      <div>
        <label className="block text-sm font-medium">
          Audio File (MP3) *
          <input
            type="file"
            accept="audio/mpeg,audio/mp3"
            onChange={handleFileChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </label>
      </div>
      
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !audioFile || (!exampleId && !selectedExampleId)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Uploading...' : 'Upload Audio'}
        </button>
        {onSkip && (
          <button
            type="button"
            onClick={handleSkip}
            disabled={loading}
            className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded"
          >
            Skip Audio Upload
          </button>
        )}
      </div>
      
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