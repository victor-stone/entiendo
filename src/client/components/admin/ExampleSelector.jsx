import { useEffect } from 'react';
import { useExamplesStore } from '../../stores';
import { LoadingSpinner } from '../ui';

const ExampleSelector = ({ idiomId, value, onChange, required = false }) => {
  if( !idiomId ) {
    return null;
  }

  const { data, loading, error, fetch } = useExamplesStore();
  
  useEffect(() => {
    if( !loading && !data ) {
      fetch(idiomId)
    }
  }, [loading, data, fetch]);

  if( error ) {
    return <p className="text-red-500 text-xs mt-1">{error}</p>;
  }

  if( loading ) {
    return <LoadingSpinner />;
  }

  if( !data ) {
    return <span>...</span>
  }

  const { examples } = data;

  if( examples.length === 0 ) {
    return  <p className="text-amber-500 text-xs mt-1">No examples found for this idiom</p>;
  }

  return (
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
  );
};

export default ExampleSelector; 