import { useEffect } from 'react';
import { useIdiomNormalsStore, useUserStore } from '../stores';
import { LoadingSpinner} from './ui';
import debug from 'debug';

const debugRender = debug('app:idiom');

const NormalSelector = ({ value = '', onChange }) => {
  const { data, fetch, loading, error } = useIdiomNormalsStore();
  const { getToken } = useUserStore();

  debugRender('Normal selector value: %s', value);

  useEffect(() => {
    if (!data && !loading && !error ) {
      fetch(getToken);
    }
  }, [data, getToken, fetch, loading]);

  if( error ) {
    return <p className="text-red-500">{error}</p>;
  }
  
  if( loading || !data ) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <label className="block text-sm font-medium">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="mt-1 block border border-gray-300 dark:text-primary-900 rounded-md shadow-sm p-2"
          disabled={loading}
        >
          <option value="">None</option>
          {data.map(({normal, normalId}) => (
            <option key={normalId} value={normalId}>
              {normal}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default NormalSelector;