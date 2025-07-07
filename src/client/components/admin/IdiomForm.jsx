import { useEffect, useState } from 'react';
import { useUserStore, useCreateIdiomStore, useUpdateIdiomStore } from '../../stores';
import ToneSelector from '../ToneSelector';
import { Card, CardField } from '../layout';
import debug from 'debug';

const debugIF = debug('app:idiom');

const IdiomForm = ({ idiom, onChange, wide, onError, text: textProp, onSave }) => {
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
  const [text, setIdiomText] = useState(textProp);
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
      setIdiomText(textProp);
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
    let record;
    if (idiom) {
      record = await update(idiom.idiomId, idiomData, token);
      reset();
    } else {
      record = await create(idiomData, token);
      resetForm();
    }
    onSave && onSave(record);
  };

  if (created) {
    debugIF('found created')
    createReset();
    onChange && onChange(created);
  }

  if (updated) {
    debugIF('found updated');
    onChange && onChange(updated);
  }

  if (error || createError) {
    debugIF('Error: %o', error || createError)
  }

  const w = wide ? 'w-full' : 'w-2/3';

  return (
    <>
      <div className=" justify-center items-center flex">
        <Card.Grid className={`bg-secondary-100 dark:bg-primary-900 p-4 ${w}`} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 8 }}>
          {(error || createError) &&
            <><Card.GridLabel title="Error" /> <Card.GridField><p className="text-red-500">{'Error on save ' + (error || createError || '')}</p></Card.GridField></>
          }

          <Card.GridLabel title="Text" /> <Card.GridField>
            <input
              type="text"
              value={text}
              onChange={(e) => setIdiomText(e.target.value)}
              className="block w-full border dark:text-primary-900 border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </Card.GridField>
          <Card.GridLabel title="Translation" /> <Card.GridField>
            <input
              type="text"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="block w-full border dark:text-primary-900 border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </Card.GridField>
          <Card.GridLabel title="Tone" /> <Card.GridField>
            <ToneSelector
              value={tone}
              onChange={setTone}
              required={true}
              allowSystem={false}
            />
          </Card.GridField>
          <Card.GridLabel title="Usage" /> <Card.GridField>
            <select
              value={usage}
              onChange={e => setUsage(e.target.value)}
              className="block border border-gray-300 dark:text-primary-900  rounded-md shadow-sm p-2"
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
          </Card.GridField>
        </Card.Grid>
      </div>

      <Card.Body>
        <CardField>
          <button type="button" onClick={handleSaveIdiom}
            disabled={updating || creating} className="btn btn-primary">
            {(updating || creating) ? 'Saving...' : 'Save'}
          </button>
          {!idiom && <button type="button" onClick={resetForm} className="ml-3 btn">Reset</button>}
        </CardField>
      </Card.Body>
    </>
  );
};

export default IdiomForm;