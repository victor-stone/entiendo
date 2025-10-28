import { useEffect, useState } from 'react';
import { useIdiomStore, useUserStore } from '../../stores';
import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '../ui/LoadingIndicator';
import { Card } from '../layout';
import IdiomForm from './IdiomForm';
import ExampleList from './ExampleList';
import debug from 'debug';
import { Glyph } from '../ui';
import CopyToClipboardButton from '../ui/CopyToClipboardButton';
const debugId = debug('app:idiom');
const debugRndr = debug('react:render');

export const IdiomInfo = ({ idiom, tight = false }) => {
  return (
    <div className=" justify-center items-center flex">
      <Card.Grid className={` ${tight ? 'w-full' : 'w-2/3 p-4'}`} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 8 }}>
        {idiom.homework?.sync && (<><Card.GridLabel title="Num" /> <Card.GridField>{idiom.homework.sync}</Card.GridField></>) }
        <Card.GridLabel title="Text" /> <Card.GridField>{idiom.text}</Card.GridField> 
        <Card.GridLabel title="Translation" /> <Card.GridField>{idiom.translation}</Card.GridField> 
        <Card.GridLabel title="Tone" /> <Card.GridField>{idiom.tone}</Card.GridField> 
        <Card.GridLabel title="Usage" /> <Card.GridField>{idiom.usage}</Card.GridField> 
        {idiom.homework?.source && (<><Card.GridLabel title="Assigned" /> <Card.GridField>{idiom.homework.source}</Card.GridField></>) }
        {idiom.homework?.transcription && (<><Card.GridLabel title="Transcription" /> <Card.GridField>{idiom.homework.transcription}</Card.GridField></>) }
        <Card.GridLabel title="Id" /> 
        <Card.GridField>
          {'...' + idiom.idiomId?.slice(-10)}
          <CopyToClipboardButton value={idiom.idiomId} title="" />
        </Card.GridField> 
      </Card.Grid>
    </div>
  );
};

const IdiomDetail = ({ idiomId: idiomIdProp, onBack, onChange }) => {
  debugRndr('IdiomDetail')
  const params   = useParams();
  const idiomId  = idiomIdProp || params.idiomId;
  const getToken = useUserStore(s => s.getToken);

  const { data: idiom, loading, fetch, error, reset } = useIdiomStore();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!idiom && !loading) {
      debugId('Idiom Detail: fetching idiom')
      fetch(idiomId, getToken);
    }
  }, [idiom, getToken, fetch, loading]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (loading || !idiom) {
    return <LoadingSpinner />
  }

  function _onBack() {
      debugId('IdiomDetail._onBack reset idiom');
      reset();
      onBack && onBack();
  }

  function _onChange() {
    debugId('IdiomDetail._onChange resetting idiom %s', idiomId)
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
            <IdiomForm idiom={idiom} onChange={_onChange} />
          ) : (
            <>
              <IdiomInfo idiom={idiom} />
              <ExampleList idiom={idiom} onChange={_onChange} />
            </>
          )}
        </Card.Body>
      </Card.Panel>
    </>
  );
}

export default IdiomDetail;
