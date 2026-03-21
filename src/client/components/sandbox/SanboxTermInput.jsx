import { Link } from "react-router-dom";
import { useState } from 'react';
import { Card } from "../layout/Card";
import { ButtonBar } from '../ui';


const SelectTermInput = ({setMode, setTerm}) => {

  const [word, setWord] = useState('');

  const handleSubmit    = (e) => {
    e.preventDefault();
    setTerm(word);
    setMode('drill');
  }

    return (
        <Card title = {`Submit Drill Term`}>
            <Card.Body>
              <Card.Field title="Word (esp.)">
                    <input
                        type="text"
                        className="border rounded px-2 py-1 w-full dark:text-primary-900 "
                        value={word}
                        onChange={e => setWord(e.target.value)}
                        placeholder="Enter word"
                    />
              </Card.Field>
              <ButtonBar>
                <Link to="/app/sandbox" className="btn">Cancel</Link>
                <button onClick={handleSubmit} className="btn btn-primary">Submit</button>
              </ButtonBar>
            </Card.Body>
        </Card>
    );

}

export default SelectTermInput;