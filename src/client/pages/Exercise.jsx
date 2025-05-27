import ExerciseCard from '../components/exercise/ExerciseCard';
import { useUserStore } from '../stores';
import { useExerciseStore } from '../stores';
import { useEffect, useCallback } from 'react';

const Exercise = () => {
    const preferences = useUserStore    (state => state.preferences);
    const setExercise = useExerciseStore(state => state.setExercise);
    const getToken    = useUserStore    (state => state.getToken);
    const getDueStats = useExerciseStore(state => state.getDueStats);

    // Callback to refresh dueStats after exercise is done
    const handleExerciseDone = useCallback(() => {
        if (getDueStats && getToken) {
            getDueStats(getToken);
        }
    }, [getDueStats, getToken]);

    useEffect(() => {
        setExercise(null);
    }, [setExercise]);

    return <ExerciseCard criteria={preferences.filter} onExerciseDone={handleExerciseDone}/>;
};

export default Exercise;