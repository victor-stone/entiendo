import { useEffect } from 'react';
import { useIdiomTonesStore } from '../stores';
import { LoadingSpinner} from './ui';
import { CardField } from './layout';
import toneDescriptions from '../../shared/constants/toneDescriptions';
import debug from 'debug';

const debugRender = debug('app:idiom');

const hint = 'Prioritize which idioms you see based on the context they are likely to be used in.';

const ToneSelector = ({ getToken, value, onChange, required = false, allowSystem = false }) => {
  const { data, fetch, loading, error } = useIdiomTonesStore();

  debugRender('Tone selector value: %s', value);

  useEffect(() => {
    if (!data && !loading) {
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
        Context {required && '*'}
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="mt-1 block border border-gray-300 rounded-md shadow-sm p-2"
          required={required}
          disabled={loading}
        >
          {!required && <option value="">All</option>}
          {allowSystem && <option value="[]">System decides</option>}
          {data.map((tone) => (
            <option key={tone} value={tone}>
              {tone}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export const ToneSelectorField = ({getToken, onChange, value}) => {
  return <>
      <CardField hint={hint}>
          <ToneSelector getToken={getToken} value={value || ""} onChange={onChange} />
      </CardField>
      {    toneDescriptions[value] &&
          <CardField>
              <ul className="list-disc pl-5">
              {toneDescriptions[value].map((t,i) => 
                  <li key={i} className="mb-1">{t}</li>)}
              </ul>
          </CardField>
      }   
  </>
}

export default ToneSelector;