import { useEffect, useState } from 'react';
import { useIdiomStore, useUserStore } from '../../stores';
import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '../ui/LoadingIndicator';
import { Card } from '../layout';
import IdiomForm from './IdiomForm';
import ExampleList from './ExampleList';
import debug from 'debug';
const debugId = debug('app:idiom');

const IdiomInfo = ({ idiom }) => <>
  <Card.Field text={idiom.text}        title="Text"  isFull={false}/>
  <Card.Field text={idiom.translation} title="Translation" isFull={false}/>
  <Card.Field text={idiom.tone}        title="Tone" isFull={false} />
  <Card.Field text={idiom.usage}       title="Usage"  isFull={false}/>
</>;



const IdiomDetail = ({ idiomId: idiomIdProp, onBack, onChange }) => {
  const params   = useParams();
  const idiomId  = idiomIdProp || params.idiomId;
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

  function _onBack() {
      reset();
      onBack && onBack();
  }

  function _onChange() {
    debugId('IdiomDetail: resetting idiom %s', idiomId)
    setEditing(false);
    reset();
    // fetch(idiomId, getToken);
    onChange && onChange();
  }

  return (
    <>
      <button className="btn btn-primary" onClick={_onBack}>← Back to List</button>
      <button className="btn ml-2" onClick={() => setEditing(e => !e)}>
        {editing ? 'Cancel' : 'Edit'}
      </button>
      <Card.Panel>
        <Card.Body>
          {editing ? (
            <IdiomForm idiom={data} onChange={_onChange} />
          ) : (
            <>
              <IdiomInfo idiom={data} />
              <ExampleList idiom={data} onChange={_onChange} />
            </>
          )}
        </Card.Body>
      </Card.Panel>
    </>
  );
}

export default IdiomDetail;
