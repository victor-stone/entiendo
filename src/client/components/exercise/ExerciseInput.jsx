import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * ExerciseInput component - Phase 2 "input"
 * Allows user to enter transcription and translation
 */
const ExerciseInput = ({ exercise, initialInput, onSubmit }) => {
  const [transcription, setTranscription] = useState(initialInput?.transcription || '');
  const [translation, setTranslation] = useState(initialInput?.translation || '');

  // Update local state when initialInput changes
  useEffect(() => {
    if (initialInput) {
      setTranscription(initialInput.transcription || '');
      setTranslation(initialInput.translation || '');
    }
  }, [initialInput]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(transcription, translation);
  };

  if (!exercise) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
      <h2 className="text-xl font-bold mb-4">Your Response</h2>
      
      <form onSubmit={handleSubmit}>
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
        </div>
        
        <div className="mb-6">
          <label htmlFor="translation" className="block text-sm font-medium mb-2">
            Translation (English)
          </label>
          <textarea
            id="translation"
            rows="3"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2"
            placeholder="Translate what you heard to English..."
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