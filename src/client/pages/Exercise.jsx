import ExerciseCard from '../components/exercise/ExerciseCard';
import { useUserStore } from '../stores';
import { useExerciseStore } from '../stores';
import { useEffect } from 'react';

const Exercise = () => {
    const preferences = useUserStore(state => state.preferences);
    const setExercise = useExerciseStore(state => state.setExercise);

    useEffect(() => {
        setExercise(null);
    }, [setExercise]);

    return <ExerciseCard criteria={preferences.filter}/>;
};

export default Exercise;