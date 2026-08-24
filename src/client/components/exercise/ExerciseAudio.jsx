import { useUserStore, useExerciseStore } from '../../stores';
import {
  VOICE_CONVERSATION,
  VOICE_EDUCATION,
} from '../../../shared/constants/voiceTypes';
import AudioPlayer from '../ui/AudioPlayer';

const voiceTypeOptions = [
  { value: VOICE_CONVERSATION, label: 'Conversational' },
  { value: VOICE_EDUCATION, label: 'Clear' },
];

const displayVoiceType = (voiceType) => (
  voiceType === VOICE_EDUCATION ? 'clear' : 'conversation'
);

/**
 * Exercise audio controls shared by the prompt, input, and results phases.
 * The optional callback lets the page persist a selection as the user's next
 * exercise preference without coupling this component to preference storage.
 */
const ExerciseAudio = ({ title, onVoiceTypeChange }) => {
  const getToken = useUserStore((state) => state.getToken);
  const activeVoiceType = useExerciseStore((state) => state.activeVoiceType);
  const playbackByType = useExerciseStore((state) => state.playbackByType);
  const audioLoading = useExerciseStore((state) => state.audioLoading);
  const audioError = useExerciseStore((state) => state.audioError);
  const switchVoiceType = useExerciseStore((state) => state.switchVoiceType);

  const selectedPlayback = playbackByType[activeVoiceType];
  const availablePlayback = selectedPlayback || Object.values(playbackByType)[0];

  const handleVoiceTypeChange = (voiceType) => {
    if (voiceType === activeVoiceType && (selectedPlayback || audioLoading)) return;

    void switchVoiceType(voiceType, getToken);
    if (onVoiceTypeChange) {
      void Promise.resolve()
        .then(() => onVoiceTypeChange(voiceType))
        .catch((error) => {
          console.error('Failed to persist exercise voice preference:', error);
        });
    }
  };

  return (
    <div className="mb-6" aria-busy={audioLoading}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-medium">{title}</h3>
        <div
          className="inline-flex rounded-lg border border-gray-300 bg-gray-50 p-0.5 dark:border-gray-600 dark:bg-gray-900"
          role="group"
          aria-label="Audio style"
        >
          {voiceTypeOptions.map((option) => {
            const selected = activeVoiceType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => handleVoiceTypeChange(option.value)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  selected
                    ? 'bg-white text-accent-700 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {availablePlayback?.voiceName && (
        <div className="mb-2 text-xs italic text-gray-500 dark:text-gray-400">
          Voice: <span className="capitalize">{availablePlayback.voiceName}</span>
        </div>
      )}

      {audioLoading && (
        <p className="mb-2 text-sm text-accent-700 dark:text-accent-300" role="status">
          Preparing {displayVoiceType(activeVoiceType)} audio… You can keep listening to the current version.
        </p>
      )}

      {audioError && (
        <p
          className={`mb-2 text-sm ${
            availablePlayback?.fallback
              ? 'text-amber-700 dark:text-amber-300'
              : 'text-red-600 dark:text-red-400'
          }`}
          role={availablePlayback?.fallback ? 'status' : 'alert'}
        >
          {audioError}
        </p>
      )}

      {availablePlayback?.url
        ? <AudioPlayer url={availablePlayback.url} />
        : !audioLoading && (
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Audio is not available for this exercise.
          </p>
        )}
    </div>
  );
};

export default ExerciseAudio;
