const EvalTopic = ({ title, text }) => (
  <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
    <h4 className="text-sm text-gray-500 text-[70%] mb-1">{title}:</h4>
    <p className="text-gray-700 dark:text-gray-300">{text}</p>
  </div>
);

export default EvalTopic;
