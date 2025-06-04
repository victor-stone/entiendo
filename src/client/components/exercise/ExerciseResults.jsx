import AudioPlayer from '../ui/AudioPlayer';
import { usageToRange } from '../../../shared/constants/usageRanges';
import { HighlightedText, Grid } from '../ui';
import { Card } from '../layout';
import { format } from 'timeago.js';
import { Link } from 'react-router-dom';

const ResultField = ({ title, text }) => (
  <div>
    <h4 className="text-gray-500 text-[70%] mb-1">{title}:</h4>
    <p className="text-gray-700 dark:text-gray-300">{text}</p>
  </div>
);

const EvalTopic = ({ title, text }) => (
  <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
    <h4 className="text-sm text-gray-500 text-[70%] mb-1">{title}:</h4>
    <p className="text-gray-700 dark:text-gray-300">{text}</p>
  </div>
);

const EvalFeedback = ({
  title,
  userText,
  classes,
  accuracy,
  feedback
}) => (
  <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-md">
    <h4 className="text-gray-500 text-[70%] mb-1">Your {title}:</h4>
    <p className="text-gray-700 dark:text-gray-300 mb-2">{userText}</p>

    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500 text-[70%]">Accuracy:</span>
      <span className={`text-sm font-bold ${classes}`}>
        {accuracy}
      </span>
    </div>
    {feedback && (<p className="text-sm mt-2">{feedback}</p>)}
  </div>
);


const ExtraInfo = ({ label, text }) => (
  <div className="mb-1">
    <span className="text-sm font-800">{label}: </span>
    <span className="text-sm">{text}</span>
  </div>
);

const EvalFeatured = ({ children }) => (
  <p className="text-gray-700 dark:text-gray-300 mb-4">{children}</p>
);

/**
 * ExerciseResults component - Phase 4 "results"
 * Displays feedback and evaluation results
 */
const ExerciseResults = ({ exercise, evaluation, progress, userInput, onNext }) => {
  if (!exercise || !evaluation) return null;

  const getAccuracyColor = (accuracy) => {
    switch (accuracy) {
      case 'perfect':
        return 'text-green-600 dark:text-green-400';
      case 'minor errors':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'major errors':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const tpCss = getAccuracyColor(evaluation.transcriptionAccuracy);
  const trCss = getAccuracyColor(evaluation.translationAccuracy);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
      <h2 className="text-xl font-bold mb-4">Exercise Results</h2>

      <Card.Panel title="Original Sentence">
        {exercise.audio && <AudioPlayer url={exercise.audio.url} />}

        <Grid columns={2}>
          <ResultField title="Idiom" text={exercise.idiom?.text || 'Unknown'} />
          <ResultField title="Translation" text={exercise.idiom?.translation || 'Unknown'} />
        </Grid>

      </Card.Panel>

      <Card.Section>
        <Grid columns={2}>
          <div>
            <EvalFeedback title="Transcription"
              userText={userInput.transcription}
              classes={tpCss}
              accuracy={evaluation.transcriptionAccuracy}
              feedback={evaluation.transcriptionFeedback} />                        
          </div>
          <div>
            <EvalFeedback title={"Translation"}
              userText={userInput.translation}
              classes={trCss}
              accuracy={evaluation.translationAccuracy}
              feedback={evaluation.translationFeedback} />
          </div>

          <div>
            {evaluation.transcriptionAccuracy !== 'perfect' &&
              <EvalTopic title="Correct Transcription" 
                      text={<HighlightedText text={exercise.text} highlightedSnippet={exercise.conjugatedSnippet} />} />}
          </div>
          <div>
            {evaluation.translationAccuracy !== 'perfect' &&
              <EvalTopic title="Correct English Translation" text={evaluation.englishTranslation} />}
          </div>
          <div>
            {evaluation.mistakeType && <ExtraInfo text={evaluation.mistakeType} label="Mistake type" block />}
            {evaluation.missedWords?.length && <ExtraInfo text={evaluation.missedWords.join(', ')} label="Missed words" block />}
            <ExtraInfo text={exercise.idiom.tone} label="Context" block />
          </div>
          <div>
            <ExtraInfo text={usageToRange(exercise.idiom.usage)?.label} label="Usage" block />
            {progress?.dueDate && <ExtraInfo text={format(progress.dueDate)} label="Next review" block />}
          </div>
        </Grid>

      </Card.Section>

      <div className="flex justify-end mt-4">
        <Link to="/app/dashboard" className="btn">Dashboard</Link>
        <button onClick={onNext} className="btn btn-primary">Next Exercise</button>
      </div>
    </div>
  );
};

export default ExerciseResults;