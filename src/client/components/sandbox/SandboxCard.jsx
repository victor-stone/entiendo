import { useEffect } from "react";
import { useGetNextSandboxStore, useEvaluateSandboxStore,
    useUserStore, useSandboxStore, PHASES } from "../../stores";
import { Card } from "../layout";
import ExercisePrompt from "../exercise/ExercisePrompt";
import ExerciseInput from "../exercise/ExerciseInput";
import ExerciseEval from "../exercise/ExerciseEval";
import EvalFeedback from "../EvalFeedback";
import EvalTopic from "../EvalTopic";
import { LoadingIndicator, AudioPlayer, Grid } from "../ui";
import NextExercise from "../NextExercise";
import SandboxResults from "./SandboxResults";

const SandboxCard = ({query, handleNextExercise}) => {
    const getToken = useUserStore(s => s.getToken);
    const { fetch, loading, error, data: exercise } = useGetNextSandboxStore();
    const { phase, userInput, setPhase, setUserInput } = useSandboxStore();
    const { evaluate, data: evaluation } = useEvaluateSandboxStore();

    useEffect(() => {
        if( !exercise && !loading ) {
            const missedWords = query.missedWords();
            fetch(missedWords, getToken);
        }
    });

    if( error  ) {
        return <p className="text-red-500">{error}</p>;
    }
    
    if( loading ) {
        return <LoadingIndicator />
    }

    const handleInputSubmit = async (transcription, translation) => {
        setUserInput(transcription, translation);
        setPhase(PHASES.evaluation);
        const results = await evaluate(exercise.exampleId,transcription,translation, getToken);
        if (results) {
          setPhase(PHASES.results);
        }
    }

    return (
        <Card title="Sandbox Example">
            <Card.Body>
                {phase === PHASES.prompt && (
                    <ExercisePrompt exercise={exercise} onContinue={() => setPhase(PHASES.input)}/>
                )}
                
                {phase === PHASES.input && (
                    <>
                    <ExercisePrompt exercise={exercise} onContinue={null} />
                    <ExerciseInput exercise={exercise} initialInput={userInput} onSubmit={handleInputSubmit}/>
                    </>
                )}

                {phase === PHASES.evaluation && <ExerciseEval />}

                {phase === PHASES.results && <SandboxResults 
                    exercise={exercise} 
                    evaluation={evaluation}
                    userInput={userInput}
                    onNext={handleNextExercise}                    
                    />}
            </Card.Body>
        </Card>
    )
}

export default SandboxCard;