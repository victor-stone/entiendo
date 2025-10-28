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

            <AudioPlayer url={exercise.url} />
            <div className="text-right text-xs italic capitalize">{exercise.voice}</div>
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
              <EvalTopic title="Correct Transcription" text={exercise.text} />
          </div>
          <div>           
              <EvalTopic title="Correct English Translation" text={evaluation.englishTranslation} />
          </div>
        <div>
            <EvalTopic text={evaluation.targetWords.join(', ')} title="Target words" block />
          </div>
          <div>
            <EvalTopic text={evaluation.missedWords.join(', ')} title="Misheard" block />
          </div>

        </Grid>

      </Card.Section>

      <NextExercise onNext={onNext} />

        </>
    )
}

export default SandboxResults;
