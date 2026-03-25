import { useEffect } from "react";
import {
    useGetNextSandboxStore, useEvaluateSandboxStore,
    useUserStore, useSandboxStore, PHASES
} from "../../stores";
import { Card } from "../layout";
import ExercisePrompt from "../exercise/ExercisePrompt";
import ExerciseInput from "../exercise/ExerciseInput";
import ExerciseEval from "../exercise/ExerciseEval";
import { LoadingIndicator } from "../ui";
import SandboxResults from "./SandboxResults";

const titles = [
    "Missing Words Drills",
    "Drill a word"
];

const DRILL_TITLE = 0;
const SELECT_TITLE = 1;

var currentTitle = titles[DRILL_TITLE];

const hasAnyOverlap = (requested = [], actual = []) =>
    requested.some((word) => actual.includes(word));

const SandboxCard = ({ missedWords = [] }) => {
    const getToken = useUserStore(s => s.getToken);
    const { evaluate, data: evaluation,
        reset: resetEval } = useEvaluateSandboxStore();
    const { fetch, loading, error,
        data: exercise, reset: resetNext } = useGetNextSandboxStore();
    const { phase, userInput, setPhase,
        setUserInput, reset } = useSandboxStore();

    useEffect(() => {
        // In select mode, accept any shovel that matches at least one requested word.
        if (exercise && missedWords?.length && !hasAnyOverlap(missedWords, exercise.basedOn || [])) {
            resetNext();
            return;
        }
        if (!exercise && !loading) {
            // empty list means get all missed words
            fetch(missedWords, getToken);
        }
    }, [missedWords, exercise, loading, fetch, getToken, resetNext]);

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (loading) {
        return <LoadingIndicator />
    }

    const handleInputSubmit = async (transcription, translation) => {
        setUserInput(transcription, translation);
        setPhase(PHASES.evaluation);
        const results = await evaluate(exercise.shovelId, transcription, translation, getToken);
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
        <Card title={currentTitle}>
            <Card.Body>
                {phase === PHASES.prompt && (
                    <ExercisePrompt exercise={exercise} onContinue={() => setPhase(PHASES.input)} />
                )}

                {phase === PHASES.input && (
                    <>
                        <ExercisePrompt exercise={exercise} onContinue={null} />
                        <ExerciseInput exercise={exercise} initialInput={userInput} onSubmit={handleInputSubmit} />
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
