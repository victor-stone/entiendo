import LoadingIndicator from '../ui/LoadingIndicator';

/**
 * ExerciseEval component - Phase 3 "evaluation"
 * Loading state while the server evaluates the user's answer
 */
const ExerciseEval = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
      <LoadingIndicator message="Evaluating your response..." />
    </div>
  );
};

export default ExerciseEval; 