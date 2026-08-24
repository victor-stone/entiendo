import { Link } from 'react-router-dom';
import { AudioPlayer, Glyph } from '../ui';
import ExerciseAudio from './ExerciseAudio';

const FixedExerciseAudio = ({ playback }) => (
  <div className="mb-6">
    <h3 className="mb-2 font-medium">Listen to the sentence:</h3>
    {playback?.voiceName && (
      <div className="mb-2 text-xs italic text-gray-500 dark:text-gray-400">
        Voice: <span className="capitalize">{playback.voiceName}</span>
      </div>
    )}
    {playback?.url
      ? <AudioPlayer url={playback.url} />
      : <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Audio is not available for this exercise.</p>}
  </div>
);

/**
 * ExercisePrompt component - Phase 1 "prompt"
 * Displays the Exercise challenge to the user
 */
const ExercisePrompt = ({
  exercise,
  onContinue,
  onVoiceTypeChange,
  fixedAudio = false,
  fixedPlayback = null,
}) => {
  if (!exercise) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
      <h2 className="text-xl font-bold mb-4 inline-flex items-center">Exercise 
        {exercise.isNew && <span className="inline-flex items-center bg-secondary-100 text-accent-600 rounded-full ml-2 text-sm p-1"><Glyph name="StarIcon" />New </span>}</h2>

      {fixedAudio
        ? <FixedExerciseAudio playback={fixedPlayback} />
        : (
          <ExerciseAudio
            title="Listen to the sentence:"
            onVoiceTypeChange={onVoiceTypeChange}
          />
        )}

      {onContinue && <div className="flex justify-end mt-4">
        <Link to="/app/dashboard" className="btn">Cancel</Link>
        <button onClick={onContinue} className="btn btn-primary">Continue</button>
      </div>}
    </div>
  );
};

export default ExercisePrompt;
