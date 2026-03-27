import { Link } from "react-router-dom";
import { useState } from 'react';
import { Card } from "../layout/Card";
import { ButtonBar } from '../ui';
import SandboxCard from "./SandboxCard";
import BasedOnSelector from '../BasedOnSelector';
import { useSandboxStore } from "../../stores";

const SandboxSelectCard = ({ mode: _mode = 'input' }) => {
  const [term, setTerm] = useState('');
  const [mode, setMode] = useState(_mode);

  const { reset } = useSandboxStore();


  const onTerm = term => {
    reset();
    setTerm(term);
    setMode('drill')
  }

  return (
    <>
      {mode == 'input' && <SelectTermInput onTerm={onTerm} />}
      {mode == 'drill' && <SandboxCard missedWords={[term]} />}
    </>
  )

}

/*

*/

const SelectTermInput = ({ onTerm }) => {
  const [term, setTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onTerm(term)
  }

  return (
    <Card title={`Submit Drill Term`}>
      <Card.Body>
        <Card.Field title="Choose">
          <BasedOnSelector value={term} onChange={(term) => setTerm(term)} />
        </Card.Field>
        <Card.Field title="Word (esp.)">
          <input
            type="text"
            className="border rounded px-2 py-1 w-full dark:text-primary-900 "
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder="Enter word"
          />
        </Card.Field>
        <ButtonBar>
          <Link to="/app/dashboard" className="btn">Dashboard</Link>
          <button onClick={handleSubmit} className="btn btn-primary">Submit</button>
        </ButtonBar>
      </Card.Body>
    </Card>
  );

}

export default SandboxSelectCard;