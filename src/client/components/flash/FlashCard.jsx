import { useEffect } from "react";
import {
    useGetNextFlashStore, useEvaluateFlashStore,
    useUserStore, useFlashStore, PHASES
} from "../../stores";
import { Card } from "../layout";
import ExerciseInput from "../exercise/ExerciseInput";
import ExerciseEval from "../exercise/ExerciseEval";
import { LoadingIndicator } from "../ui";
import FlashResults from "./FlashResults";


const FlashModes = ({ mode, onSelect }) => {
  return <select 
   className="form-select text-dark bg-transparent"
  style={{ fontSize: "10pt" }}
  value={mode} onChange={e => onSelect(e.target.value)}>
        <option>new</option>
        <option>flubbed</option>
        <option>review</option>
      </select>
}

const DoFlashTitle = ({phase, mode, onModeChange}) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="text-left">Flash Cards</div>
      <div className="text-right">
        {phase === PHASES.results && <FlashModes mode={mode} onSelect={onModeChange} />}
        {phase !== PHASES.results && <span>{mode}</span>}
      </div>
    </div>
  );
};

const FlashPrompt = ({ flash }) => {
  if (!flash) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
        <div className="flex justify-between items-center" style={{fontSize: '22px'}}>{flash.translation}</div>
    </div>
  );
};

const _options = {
  transcribe: false,
  verbose: false,
  label: '',
  placeholder: 'Translate (Spanish)'
};

const FlashCard = () => {
    const getToken = useUserStore(s => s.getToken);
    const { evaluate, data: evaluation,
        reset: resetEval } = useEvaluateFlashStore();
    const { fetch, loading, error,
        data: flash, reset: resetNext } = useGetNextFlashStore();
    const { phase, userInput, setPhase,
        setUserInput, setMode, reset } = useFlashStore();

    useEffect(() => {
        if( !flash && !loading && !error) {
            fetch(userInput.mode, getToken);
        }
    }, [flash, loading, fetch, getToken, resetNext]);

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (loading) {
        return <LoadingIndicator />
    }

    const handleInputSubmit = async (dummy, translation) => {
        setUserInput(translation);
        setPhase(PHASES.evaluation);
        const results = await evaluate(flash.flashId, translation, getToken);
        if (results) {
            setPhase(PHASES.results);
        }
    }

    const handleNextExercise = () => {
        reset();
        resetNext();
        resetEval();
    }

    return (
        <Card title={<DoFlashTitle phase={phase} mode={userInput.mode} onModeChange={setMode} />}>
            <Card.Body>
                {(phase === PHASES.prompt || phase === PHASES.input) && (
                    <>
                        <FlashPrompt flash={flash} onContinue={null} />
                        <ExerciseInput exercise={flash} onSubmit={handleInputSubmit} options={_options} />
                    </>
                )}

                {phase === PHASES.evaluation && <ExerciseEval />}

                {phase === PHASES.results && <FlashResults
                    flash={flash}
                    evaluation={evaluation}
                    userInput={userInput}
                    onNext={handleNextExercise}
                />}
            </Card.Body>
        </Card>
    )
}

export default FlashCard;
