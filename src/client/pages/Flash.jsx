import { useState } from 'react';
import { Card } from "../components/layout";
import flash from "../components/flash/FlashCard";
import { useFlashStore } from "../stores";
import NextExercise from "../components/NextExercise";

const { FlashCard, FlashModes } = flash;

const Flash = () => {

  const { setMode } = useFlashStore();
  const [started, setStarted] = useState(false);

  return (
        started
          ? <FlashCard />
          : 
          <Card title={"Flash Cards"} >
            <Card.Body>
              <FlashModes mode={'new'} onSelect={setMode} />
                <NextExercise onNext={ () => setStarted(true) }/>
            </Card.Body>
         </Card>
  )
}

export default Flash;