import { Card } from "../layout";
import { AudioPlayer, Grid } from "../ui";
import EvalFeedback from "../EvalFeedback";
import EvalTopic from "../EvalTopic";
import NextExercise from "../NextExercise";

/*
  {
   "transcriptionFeedback": "short feedback here",
   "translationFeedback"  : "short feedback here",
   "englishTranslation"   : "English translation of the correct sentence",
   “targetWords”          : [ "word", "word"...]  “The words originally targeted by the exercise”,
   "missedWords"          : [ "word", "word"...]  array of words misheard or missing
  }
*/

const SandboxResults = ({userInput, evaluation, exercise, onNext}) => {
    return (
        <>
        <Card.Panel title="Original Sentence">
            {exercise?.audio && <AudioPlayer url={exercise.audio.url} />}
            {/* WHILE DEBUGGING */
                !exercise && <p> AUDIO PLAYER GOES HERE</p>
            }
         </Card.Panel>
      <Card.Section>
        <Grid columns={2}>
          <div>
            <EvalFeedback title="Transcription"
              userText={userInput.transcription}
              feedback={evaluation.transcriptionFeedback} />                        
          </div>
          <div>
            <EvalFeedback title={"Translation"}
              userText={userInput.translation}
              feedback={evaluation.translationFeedback} />
          </div>

          <div>
              <EvalTopic title="Correct Transcription" text={exercise?.text || 'DEBUGGING NOW'} />
          </div>
          <div>           
              <EvalTopic title="Correct English Translation" text={evaluation.englishTranslation} />
          </div>
        <div>
            <EvalTopic text={evaluation.targetWords.join(', ')} title="Target words" block />
          </div>
          <div>
            <EvalTopic text={evaluation.missedWords.join(', ')} title="Misheard (again ;))" block />
          </div>

        </Grid>

      </Card.Section>

      <NextExercise onNext={onNext} />

        </>
    )
}

export default SandboxResults;
