import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { useUserStore } from '../../stores';
import IdiomSelector from './IdiomSelector';
import { Card, CardField } from '../layout';

const NewExampleForm = ({ 
  idiomId = '', 
  onSaveSuccess, 
  onError, 
  showIdiomDetails = false,
  idiomDetails = null
}) => {
  // Get authentication token from user store
  const getToken = useUserStore(state => state.getToken);
  
  // Form state
  const [selectedIdiomId, setSelectedIdiomId] = useState(idiomId);
  const [exampleText, setExampleText] = useState('');
  const [exampleSnippet, setExampleSnippet] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Update selectedIdiomId if prop changes
  useEffect(() => {
    setSelectedIdiomId(idiomId);
  }, [idiomId]);
  
  // Handle idiom selection
  const handleIdiomChange = (e) => {
    setSelectedIdiomId(e.target.value);
  };
  
  // Create a new example
  const handleSaveExample = async () => {
    setLoading(true);
    
    try {
      if (!selectedIdiomId) {
        throw new Error('No idiom selected for this example');
      }
      
      if (!exampleText || !exampleSnippet) {
        throw new Error('Example text and conjugated snippet are required');
      }
      
      const exampleData = {
        idiomId: selectedIdiomId,
        text: exampleText,
        conjugatedSnippet: exampleSnippet,
        source: 'manual'
      };
      
      // Get auth token and pass it to the service call
      const token = await getToken();
      const response = await adminService.createExample(exampleData, token);
      
      if (response && response.exampleId) {
        if (onSaveSuccess) {
          onSaveSuccess(response);
        }
        return response;
      } else {
        throw new Error('Failed to create example');
      }
    } catch (err) {
      if (onError) {
        onError(err.message || 'An error occurred during submission');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Reset the form
  const resetForm = () => {
    setExampleText('');
    setExampleSnippet('');
  };
  
  return (
    <Card title="Create New Example">
      <Card.Body>
      {/* Show IdiomSelector if no idiomId is provided */}
      {idiomId === '' && (
        <IdiomSelector
          value={selectedIdiomId}
          onChange={handleIdiomChange}
          required={true}
        />
      )}
      
      {/* Show idiom details if available and requested */}
      {showIdiomDetails && idiomDetails && (
        <CardField>
          <p><strong>Idiom:</strong> {idiomDetails.text}</p>
          <p><strong>Translation:</strong> {idiomDetails.translation}</p>
        </CardField>
      )}
      
      <CardField>
        <label className="block text-sm font-medium">
          Example Text *
          <textarea
            value={exampleText}
            onChange={(e) => setExampleText(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </label>
      </CardField>
      
      <CardField>
        <button
          type="button"
          onClick={handleSaveExample}
          disabled={loading || !selectedIdiomId}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-4"
        >
          {loading ? 'Saving...' : 'Save Example'}
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded"
        >
          Reset
        </button>
      </CardField>
      </Card.Body>
    </Card>
  );
};

export default NewExampleForm; 