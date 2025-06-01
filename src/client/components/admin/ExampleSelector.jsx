import { useEffect, useState } from 'react';

const ExampleSelector = ({ idiomId, value, onChange, required = false }) => {
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExamples = async () => {
      if (!idiomId) {
        setExamples([]);
        return;
      }
      
      try {
        setLoading(true);
        // TODO: there's 0 way this should be here - only stores should call services
        const response = null // await idiomService.getIdiomExamples(idiomId);
        if (response && response.examples) {
          setExamples(response.examples);
        } else {
          setExamples([]);
        }
      } catch (err) {
        setError('Failed to load examples for the selected idiom');
        console.error(err);
        setExamples([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExamples();
  }, [idiomId]);

  return (
    <div>
      <label className="block text-sm font-medium">
        Select Example {required && '*'}
        <select
          value={value}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required={required}
          disabled={loading || !idiomId || examples.length === 0}
        >
          <option value="">Select an Example</option>
          {examples.map((example) => (
            <option key={example.exampleId} value={example.exampleId}>
              {example.text}
            </option>
          ))}
        </select>
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {examples.length === 0 && idiomId && !loading && !error && (
        <p className="text-amber-500 text-xs mt-1">No examples found for this idiom</p>
      )}
    </div>
  );
};

export default ExampleSelector; 