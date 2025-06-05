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

    {accuracy && <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500 text-[70%]">Accuracy:</span>
      <span className={`text-sm font-bold ${classes}`}>
        {accuracy}
      </span>
    </div>}
    {feedback && (<p className="text-sm mt-2">{feedback}</p>)}
  </div>
);

export default EvalFeedback;
