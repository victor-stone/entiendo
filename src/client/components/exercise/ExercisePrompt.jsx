import { Link } from 'react-router-dom';
import AudioPlayer from '../ui/AudioPlayer';

/**
 * ExercisePrompt component - Phase 1 "prompt"
 * Displays the Exercise challenge to the user
 */
const ExercisePrompt = ({ exercise, onContinue }) => {
  if (!exercise) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
      <h2 className="text-xl font-bold mb-4">Exercise</h2>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Listen to the sentence:</h3>
        {exercise.audio && <AudioPlayer url={exercise.audio.url} />}
      </div>
      
      {onContinue && <div className="flex justify-end mt-4">
        <Link to="/app/dashboard" className="btn">Cancel</Link>
        <button onClick={onContinue} className="btn btn-primary">Continue</button>
      </div>}
    </div>
  );
};

export default ExercisePrompt; 