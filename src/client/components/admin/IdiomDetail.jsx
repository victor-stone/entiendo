import { useEffect, useState } from 'react';
import { useIdiomStore, useUserStore, useUpdateExampleStore } from '../../stores';
import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '../ui/LoadingIndicator';
import { Card, CardField } from '../layout';
import { AudioPlayer, HighlightedText, Glyph } from '../ui';
import IdiomForm from './IdiomForm';

const IdiomInfo = ({ idiom }) => <>
  <Card.Field text={idiom.text}        title="Text" isFull={false}/>
  <Card.Field text={idiom.translation} title="Translation" isFull={false}/>
  <Card.Field text={idiom.tone}        title="Tone" isFull={false} />
  <Card.Field text={idiom.usage}       title="Usage"  isFull={false}/>
</>;

const ExampleForm = ({ example, onDone }) => {
  const { getToken } = useUserStore();
  const { update, error, loading, result } = useUpdateExampleStore();

  const [text, setText] = useState(example.text || "");
  const [conjugatedSnippet, setConjugatedSnippet] = useState(example.conjugatedSnippet || "");

  useEffect(() => {
    if (result && !error) {
      onDone(result);
    }
  }, [result, error, onDone]);

  function handleSubmit(e) {
    e.preventDefault();
    const postData = {
              text,
              conjugatedSnippet
           };
    update(example.exampleId, postData, getToken);
  }

  return (
    <Card.Section>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card.Field title="Text">
          <input
            className="input w-full"
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={loading}
            required
          />
        </Card.Field>
        <Card.Field title="Conjugated Snippet">
          <input
            className="input w-full"
            value={conjugatedSnippet}
            onChange={e => setConjugatedSnippet(e.target.value)}
            disabled={loading}
            required
          />
        </Card.Field>
        {error && <div className="text-red-500">{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </Card.Section>
  );
}

const Example = ({ example }) => {
  return <div className="space-y-2">
   <HighlightedText text={example.text} highlightedSnippet={example.conjugatedSnippet} />
   {example.audio && example.audio.url && <AudioPlayer url={example.audio.url} />}
  </div>
}

const ExampleList = ({ idiom }) => {
  const [editingId, setEditingId] = useState(null);

  if (!idiom.examples || !idiom.examples.length) {
    return null;
  }

  function handleDone(updatedExample) {
    setEditingId(null);
    // Optionally, you can refresh the idiom data here if needed
  }

  return (
    <Card.Section title="Examples">
      <ul className="list-disc pl-6">
        {idiom.examples.map((ex, i) => (
          <li key={ex.exampleId || i} className="mb-3">
            <div className="flex items-start justify-between">
              {editingId === (ex.exampleId || i) ? (
                <ExampleForm example={ex} onDone={handleDone} />
              ) : (
                <>
                  <Example example={ex} />
                  <button
                    className="btn font-small p-1 m-0 hover:bg-primary-100 self-start"
                    onClick={() => setEditingId(ex.exampleId || i)}
                  >
                    <Glyph name="PencilIcon" />
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card.Section>
  );
}

const IdiomDetail = ({ idiomId: idiomIdProp, onBack, onInvalidate }) => {
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
              <ExampleList idiom={data} />
            </>
          )}
        </Card.Body>
      </Card.Panel>
    </>
  );
}

export default IdiomDetail;
