import { Link } from "react-router-dom";
import ButtonBar from "./ui/ButtonBar";

const NextExercise = ({ onNext, currentId }) => (
  <ButtonBar>
    <Link to={`/app/bugreport/${currentId}` } className="btn" >Report a bug</Link>
    <Link to="/app/dashboard" className="btn">Dashboard</Link>
    <button onClick={onNext} className="btn btn-primary">Next Exercise</button>
  </ButtonBar>
);

export default NextExercise;
