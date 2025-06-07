import ExerciseCard from '../components/exercise/ExerciseCard';
import { LoadingIndicator } from '../components/ui';
import { useUserStore } from '../stores';
import { useDueStatsStore, useExerciseStore } from '../stores';
import { useEffect } from 'react';


const Exercise = () => {
    const {preferences, loading }   = useUserStore    ();
    const resetExercise = useExerciseStore(state => state.resetExercise);
    const { reset }     = useDueStatsStore();

    useEffect(() => {
        resetExercise();
        return () => resetExercise();
    }, [resetExercise]);

    if( loading ) {
        return <LoadingIndicator />
    }
    
    return <ExerciseCard criteria={preferences.filter} onExerciseDone={reset}/>;
};

export default Exercise;