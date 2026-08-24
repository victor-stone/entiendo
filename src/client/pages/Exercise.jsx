import ExerciseCard from '../components/exercise/ExerciseCard';
import { LoadingIndicator } from '../components/ui';
import { useUserStore } from '../stores';
import { useScheduleStatsStore, useScheduleStore, useExerciseStore } from '../stores';
import { useEffect, useMemo } from 'react';
import { VOICE_TYPE } from '../../shared/constants/voiceTypes';


const Exercise = () => {
    const { preferences, loading, setPreference } = useUserStore();
    const resetExercise           = useExerciseStore(state => state.resetExercise);
    const { reset:resetStats }    = useScheduleStatsStore();
    const { reset:resetList }     = useScheduleStore();
    const criteria = useMemo(() => ({
        ...(preferences?.filter || {}),
        [VOICE_TYPE]: preferences?.[VOICE_TYPE]
    }), [preferences?.filter, preferences?.[VOICE_TYPE]]);

    useEffect(() => {
        resetExercise();
        return () => resetExercise();
    }, [resetExercise]);

    if( loading ) {
        return <LoadingIndicator />
    }
    
    const reset = () => {
        resetStats();
        resetList();
    }
    
    const persistVoiceType = (voiceType) => setPreference(VOICE_TYPE, voiceType);

    return (
        <ExerciseCard
            criteria={criteria}
            onExerciseDone={reset}
            onVoiceTypeChange={persistVoiceType}
        />
    );
};

export default Exercise;
