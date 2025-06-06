import { Link } from "react-router-dom";
import ButtonBar from "./ui/ButtonBar";

const NextExercise = ({ onNext }) => (
  <ButtonBar>
    <Link to="/app/dashboard" className="btn">Dashboard</Link>
    <button onClick={onNext} className="btn btn-primary">Next Exercise</button>
  </ButtonBar>
);

export default NextExercise;
