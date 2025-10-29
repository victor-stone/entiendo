import { Link } from "react-router-dom";
import ButtonBar from "./ui/ButtonBar";
import Glyph from "./ui/Glyph";
//    
 
const NextExercise = ({ onNext, currentId, showInfoButton, onInfo }) => (
  <ButtonBar>
    {showInfoButton && 
        <button data-toggle="collapse" data-target="#collapseButton" onClick={onInfo} class="btn btn-sm"><Glyph className="w-6 h-6 opacity-80 text-blue-500" name="InformationCircleIcon" /></button> 
    }
    <Link to={`/app/bugreport/${currentId}` } className="btn" >Report a bug</Link>
    <Link to="/app/dashboard" className="btn">Dashboard</Link>
    <button onClick={onNext} className="btn btn-primary">Next Exercise</button>
  </ButtonBar>
);

export default NextExercise;
