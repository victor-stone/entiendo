import { Card } from "../layout";
import { AudioPlayer, Grid } from "../ui";
import EvalFeedback from "../EvalFeedback";
import EvalTopic from "../EvalTopic";
import NextExercise from "../NextExercise";

/*
{
  "score": 4,
  "reason": "The meaning matches and the only issue is a missing accent.",
  "matchesTarget": false
  "feedback": "❌ Missed a key part (verb, preposition, or structure)"
}
*/

const FlashResults = ({userInput, evaluation, flash, onNext}) => {
    return (
        <>
        <Card.Panel >
        <div className="flex justify-between items-center">
          <h3 className="font-medium mb-2">Original sentence:</h3>
        </div>
        {flash.translation}
         </Card.Panel>
      <Card.Section>
        <Grid columns={2}>
          <div>
            <EvalFeedback title={"Translation"}
              userText={userInput.translation}
              feedback={evaluation.reason} />
          </div>
          <div>
              <EvalTopic title="Correct Translation" text={flash.text} />
          </div>
          <div>
            <EvalFeedback title={"Score"}
              userText={evaluation.score}
              feedback={evaluation.feedback} />
          </div>

        </Grid>

      </Card.Section>

      <NextExercise onNext={onNext} />

        </>
    )
}


export default FlashResults;
