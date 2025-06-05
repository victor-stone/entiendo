import ExerciseCard from '../components/exercise/ExerciseCard';
import { useUserStore } from '../stores';
import { useDueStatsStore, useExerciseStore } from '../stores';
import { useEffect } from 'react';


const Exercise = () => {
    const preferences   = useUserStore    (state => state.preferences);
    const resetExercise = useExerciseStore(state => state.resetExercise);
    const { reset }     = useDueStatsStore();

    useEffect(() => {
        resetExercise();
    }, [resetExercise]);

    return <ExerciseCard criteria={preferences.filter} onExerciseDone={reset}/>;
};

export default Exercise;