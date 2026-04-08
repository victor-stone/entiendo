import { useState } from 'react';
import { Link } from 'react-router-dom';

const _defaults = {
  transcribe: true,
  verbose: true,
  label: 'Translation (English)',
  placeholder: "Translate what you heard to English...",
};

/**
 * ExerciseInput component - Phase 2 "input"
 * Allows user to enter transcription and translation
 */
const ExerciseInput = ({ exercise, onSubmit, options = {..._defaults} }) => {
  const [transcription, setTranscription] = useState('');
  const [translation,   setTranslation]   = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(transcription, translation);
  };

  if (!exercise) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
      { options.verbose && <h2 className="text-xl font-bold mb-4">Your Response</h2>}
      
      <form onSubmit={handleSubmit}>
        {options.transcribe && 
        <div className="mb-4">
          <label htmlFor="transcription" className="block text-sm font-medium mb-2">
            What did you hear? (Spanish)
          </label>
          <textarea
            id="transcription"
            rows="3"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2"
            placeholder="Write what you heard in Spanish..."
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
          />
        </div>}
        
        <div className="mb-6">
          { options.label && 
            <label htmlFor="translation" className="block text-sm font-medium mb-2">
              {options.label}
            </label>
          }
          <textarea
            id="translation"
            rows="3"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2"
            placeholder={options.placeholder}
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
          />
        </div>
        
        <div className="flex justify-end">
          <Link to="/app/dashboard" className="btn">Cancel</Link>
          <button type="submit" className="btn btn-primary">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default ExerciseInput;