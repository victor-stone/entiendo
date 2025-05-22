import { useEffect } from 'react';
import { useUserStore, useExerciseStore } from '../../stores';
import LoadingIndicator from '../ui/LoadingIndicator';
import ExercisePrompt from './ExercisePrompt';
import ExerciseInput from './ExerciseInput';
import ExerciseEval from './ExerciseEval';
import ExerciseResults from './ExerciseResults';

/** 
exercise example:
{
    "conjugatedSnippet": "quedó triste", // <- hightlighted in the sentence
    "createdAt": 1746659869309,
    "exampleId": "965f2d4a-8d5d-4fc6-9b63-0b1d9bfa4bdd",
    "idiomId": "0b8060c5-b1d4-437d-81b2-28a4d00e5c77",
    "source": "openai",
    "text": "Después de la película, Juan quedó triste porque le recordó a su perro.",
    "idiom": {
        "tone": "Neutral",
        "idiomId": "0b8060c5-b1d4-437d-81b2-28a4d00e5c77",
        "text": "quedar triste",
        "tempId": "temp-1746547531500-300",
        "translation": "to be sad",
        "usage": 8
    }
}
**/
const ExerciseCard = ({ criteria = {}, onExerciseDone }) => {
  const getToken = useUserStore(state => state.getToken);
  const { 
    exercise, 
    loading, 
    error, 
    phase,
    userInput,
    evaluation,
    progress,
    getNext,
    setPhase,
    setUserInput,
    evaluateResponse,
    resetExercise
  } = useExerciseStore();

  useEffect(() => {
    const fetchExercise = async () => {
      if (criteria && getToken && !exercise && !loading && !error) {
        await getNext(criteria, getToken);
      }
    };
    
    fetchExercise();
  }, [criteria, getToken, getNext, exercise, loading, error]);

  // Handlers for phase transitions
  const handlePromptContinue = () => {
    setPhase('input');
  };

  const handleInputSubmit = async (transcription, translation) => {
    if (!exercise) return;
    
    // Save user input
    setUserInput(transcription, translation);
    
    // Transition to evaluation phase
    setPhase('evaluation');
    
    // Call the API to evaluate the response
    const results = await evaluateResponse(
      transcription, 
      translation, 
      getToken
    );
    
    // If evaluation successful, move to results phase
    if (results) {
      setPhase('results');
      onExerciseDone(results.progress);
    }
  };

  const handleNextExercise = async () => {
    // Reset exercise state
    resetExercise();
    
    // Fetch the next exercise
    await getNext(criteria, getToken);
  };

  // Render conditions
  if (loading && !exercise) return <LoadingIndicator message="Loading exercise..." />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!exercise) return <div className="p-4">No exercise available.</div>;

  // Render the appropriate component based on the current phase
  return (
    <div>
      {phase === 'prompt' && (
        <ExercisePrompt 
          exercise={exercise} 
          onContinue={handlePromptContinue} 
        />
      )}
      
      {phase === 'input' && (
        <>
          <ExercisePrompt exercise={exercise} onContinue={null} />
          <ExerciseInput 
            exercise={exercise}
            initialInput={userInput}
            onSubmit={handleInputSubmit}
          />
        </>
      )}
      
      {phase === 'evaluation' && <ExerciseEval />}
      
      {phase === 'results' && (
        <ExerciseResults 
          exercise={exercise}
          evaluation={evaluation}
          progress={progress}
          userInput={userInput}
          onNext={handleNextExercise}
          onExerciseDone={onExerciseDone}
        />
      )}
    </div>
  );
};

export default ExerciseCard;
