import { Link } from "react-router-dom";

const NextExercise = ({ onNext }) => (
  <div className="flex justify-end mt-4">
    <Link to="/app/dashboard" className="btn">Dashboard</Link>
    <button onClick={onNext} className="btn btn-primary">Next Exercise</button>
  </div>
);

export default NextExercise;
