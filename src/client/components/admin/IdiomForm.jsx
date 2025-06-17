import { useEffect, useState } from 'react';
import { useUserStore, useCreateIdiomStore, useUpdateIdiomStore } from '../../stores';
import ToneSelector from '../ToneSelector';
import { Card, CardField } from '../layout';
import debug from 'debug';

const debugIF = debug('app:idiom');

const IdiomForm = ({ idiom, onSaveSuccess, onError }) => {
  debugIF('IdiomForm')
  const getToken = useUserStore(state => state.getToken);
  const { 
    update, 
    data: updated,
    loading: updating, 
    error, 
    reset } = useUpdateIdiomStore();
  const { 
    create,
    data: created,
    loading: creating,
    error: createError,
    reset: createReset } = useCreateIdiomStore();
  // Form state
  const [text, setIdiomText] = useState('');
  const [translation, setTranslation] = useState('');
  const [tone, setTone] = useState('Casual');
  const [usage, setUsage] = useState('8');

  const resetForm = () => {
    debugIF('resetting form')
    setIdiomText('');
    setTranslation('');
    setTone('Casual');
    setUsage('8');
  };

  // Populate form if editing
  useEffect(() => {
    if (idiom) {
      debugIF('setting form to idiom')
      setIdiomText(idiom.text);
      setTranslation(idiom.translation);
      setTone(idiom.tone);
      setUsage(idiom.usage?.toString());
    } else {
      resetForm();
    }
    // eslint-disable-next-line
  }, [idiom]);

  // Create or update idiom
  const handleSaveIdiom = async () => {
    const idiomData = {
      text,
      translation,
      tone,
      usage
    };

    const token = await getToken();
    if (idiom) {
      await update(idiom.idiomId, idiomData, token);
      reset();
    } else {
      await create(idiomData, token);
      resetForm();
    }
  };

  if (created) {
    debugIF('found created')
    createReset();
    onSaveSuccess && onSaveSuccess(created);
  }

  if( updated ) {
    debugIF('found updated');
    onSaveSuccess && onSaveSuccess(updated);
  }

  if (error || createError) {
    debugIF('Error: %o', error || createError)
  }

  return (
    <>
      <Card.Body>
        {(error || createError) &&
          <CardField title="Error">
            <p className="text-red-500">{'Error on save ' + (error || createError || '')}</p>
          </CardField>
        }
        <CardField title="Text">
          <input
            type="text"
            value={text}
            onChange={(e) => setIdiomText(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </CardField>

        <CardField title="Translation *">
          <input
            type="text"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </CardField>

        <CardField>
          <ToneSelector
            value={tone}
            onChange={setTone}
            required={true}
            allowSystem={false}
          />
        </CardField>

        <CardField title="Usage">
          <select
            value={usage}
            onChange={e => setUsage(e.target.value)}
            className="block border border-gray-300 rounded-md shadow-sm p-2"
            disabled={updating || creating}
          >
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>7</option>
            <option>8</option>
            <option>9</option>
            <option>10</option>
          </select>
        </CardField>
        <CardField>
          <button type="button" onClick={handleSaveIdiom}
            disabled={updating || creating} className="btn btn-primary">
            {(updating || creating) ? 'Saving...' : 'Save'}
          </button>
         {!idiom && <button type="button" onClick={resetForm} className="btn">Reset</button>}
        </CardField>
      </Card.Body>
    </>
  );
};

export default IdiomForm;