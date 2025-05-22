import React, { useState, useRef } from 'react';
import { useUserStore, useAdminStore } from '../../stores';

const IdiomImporter = ({ onIdiomsUploaded }) => {
  const [file,         setFile]         = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error,        setError]        = useState(null);

  const fileInputRef = useRef(null);
  
  // Use stores instead of custom hook
  const { getToken }              = useUserStore();
  const { validateIdiomsFromCSV } = useAdminStore();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setError('Only CSV files are supported');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Get auth token
      const token = await getToken();
      
      // Use adminStore's validateIdiomsFromCSV function
      const results = await validateIdiomsFromCSV(file, token);
      
      // Process response
      if (results) {
        const { idioms, errors: parseErrors } = results || {};
        
        if (parseErrors && parseErrors.length > 0) {
          setError(`CSV parsing errors: ${parseErrors.join(', ')}`);
          onIdiomsUploaded([], { status: 'error', message: 'CSV parsing failed' });
        } else if (!idioms || idioms.length === 0) {
          setError('No new or valid idioms found in the CSV file');
          onIdiomsUploaded([], { status: 'error', message: 'No valid data' });
        } else {
          onIdiomsUploaded(idioms, { 
            status: 'success', 
            message: `Successfully parsed ${idioms.length} idioms` 
          });
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setFile(null);
        }
      } else {
        throw new Error('Failed to parse CSV file');
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err.message || 'Error processing file');
      onIdiomsUploaded([], { status: 'error', message: 'Processing failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-primary-900 rounded-lg p-4 shadow-md">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="flex-1">
          <label 
            htmlFor="csv-file" 
            className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1"
          >
            CSV File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            id="csv-file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-primary-900 dark:text-primary-100 
              file:mr-4 file:py-2 file:px-4 
              file:rounded file:border-0 
              file:text-sm file:font-semibold 
              file:bg-primary-50 file:text-primary-700 
              dark:file:bg-primary-800 dark:file:text-primary-300
              hover:file:bg-primary-100 dark:hover:file:bg-primary-700
              border border-primary-300 dark:border-primary-700 rounded-md
              cursor-pointer focus:outline-none"
          />
          <p className="mt-1 text-xs text-primary-500 dark:text-primary-400">
            Upload a CSV file with idiom data. <a href="#csv-guidelines" className="text-primary-600 dark:text-primary-300 underline">Template format</a>
          </p>
        </div>
        <button
          onClick={handleUpload}
          disabled={!file || isProcessing}
          className={`px-4 py-2 rounded-md text-white transition-colors ${
            !file || isProcessing
              ? 'bg-primary-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Upload & Parse'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="mt-4" id="csv-guidelines">
        <h3 className="text-primary-800 dark:text-primary-200 font-medium mb-2">CSV Format Guidelines</h3>
        <p className="text-sm text-primary-600 dark:text-primary-400 mb-2">
          Your CSV should include these columns:
        </p>
        <ul className="list-disc pl-5 text-sm text-primary-600 dark:text-primary-400">
          <li>text - The Spanish idiom text</li>
          <li>translation - English equivalent</li>
          <li>tone - Tone (Neutral, Casual, Official, Vulgar, Esoteric)</li>
          <li>usage - Ranking from 1-10 10 being Super Common, 1 rare and exotic</li>
        </ul>
      </div>
    </div>
  );
};

export default IdiomImporter; 