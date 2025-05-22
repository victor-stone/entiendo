import ExerciseCard from '../components/exercise/ExerciseCard';
import { useUserStore } from '../stores';


const Exercise = () => {
    const preferences = useUserStore(state => state.preferences)

    return <ExerciseCard criteria={preferences.filter}/>;
};

export default Exercise;