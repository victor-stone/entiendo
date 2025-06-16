import { useEffect, useState } from 'react';
import { useIdiomStore, useUserStore } from '../../stores';
import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '../ui/LoadingIndicator';
import { Card } from '../layout';
import IdiomForm from './IdiomForm';

const IdiomInfo = ({ idiom }) => <>
  <Card.Info text={idiom.translation} label="Translation" />
  <Card.Info text={idiom.tone} label="Tone" />
  <Card.Info text={idiom.usage} label="Usage" />
</>;

const IdiomExamples = ({ idiom }) => {
  if (!idiom.examples || !idiom.examples.length) {
    return null;
  }
  return <Card.Section title="Examples">
    <ul className="list-disc pl-6">
      {idiom.examples.map((ex, i) => (
        <li key={ex.exampleId || i} className="mb-3">
          <div>{ex.text}</div>
          {ex.audio && ex.audio.url && (
            <audio controls src={ex.audio.url} className="mt-1">
              Your browser does not support the audio element.
            </audio>
          )}
        </li>
      ))}
    </ul>
  </Card.Section>
}

const IdiomDetail = ({ idiomId: idiomIdProp, onBack, onInvalidate }) => {
  const params = useParams();
  const idiomId = idiomIdProp || params.idiomId;
  const getToken = useUserStore(s => s.getToken);

  const { data, loading, fetch, error, reset } = useIdiomStore();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!data && !loading) {
      fetch(idiomId, getToken);
    }
  }, [data, getToken, fetch, loading]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (loading || !data) {
    return <LoadingSpinner />
  }

  function onReturn() {
      reset();
      onBack && onBack();
  }

  function handleEditSuccess() {
    setEditing(false);
    fetch(idiomId, getToken);
    onInvalidate && onInvalidate();
  }

  return (
    <>
      <button className="btn btn-primary" onClick={onReturn}>← Back to List</button>
      <button className="btn ml-2" onClick={() => setEditing(e => !e)}>
        {editing ? 'Cancel' : 'Edit'}
      </button>
      <Card.Panel>
        <Card.Body>
          {editing ? (
            <IdiomForm idiom={data} onSaveSuccess={handleEditSuccess} />
          ) : (
            <>
              <IdiomInfo idiom={data} />
              <IdiomExamples idiom={data} />
            </>
          )}
        </Card.Body>
      </Card.Panel>
    </>
  );
}

export default IdiomDetail;
