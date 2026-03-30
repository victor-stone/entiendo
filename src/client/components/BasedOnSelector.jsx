import { useEffect } from 'react';
import { useSandboxBasedOnStore, useUserStore } from '../stores';
import { LoadingSpinner} from './ui';
import debug from 'debug';

const debugRender = debug('app:sandbox');

const BasedOnSelector = ({ value = '', onChange }) => {
  const { data, fetch, loading, error } = useSandboxBasedOnStore();
  const { getToken } = useUserStore();

  debugRender('BasedOn selector value: %s', value);

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
      <label name="sandboxselect" className="block text-sm font-medium">
        <select
          name="sanboxselect"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="mt-1 block border border-gray-300 dark:text-primary-900 rounded-md shadow-sm p-2"
          disabled={loading}
        >
          {data.map(word => (
            <option key={word.word} value={word.word}>
              {`${word.word} (${word.count})`}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default BasedOnSelector;