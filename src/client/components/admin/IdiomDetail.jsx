import { useEffect } from 'react';
import useIdiomStore from '../../stores/idiomStore';
import { useParams } from 'react-router-dom';
import { Card } from '../layout';

const IdiomDetail = ({ idiomId: idiomIdProp, onBack }) => {
  const params = useParams();
  const idiomId = idiomIdProp || params.idiomId;
  const { idiom, loadingIdiom, error, getIdiom, resetIdiom } = useIdiomStore();

  useEffect(() => {
    if (idiomId) 
        getIdiom(idiomId);
  }, [idiomId]);

  console.log( "Loading: %s, idiom: %s, error: %s, idiomId: %s", loadingIdiom, idiom?.text, error?.message, idiomId);
  if (loadingIdiom) return <div>Loading idiom...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!idiom && !error) return <div>No idiom found.</div>;

  return (
    <>
      {onBack && (
        <button
          className="mb-4 px-4 py-2 bg-primary-200 dark:bg-primary-700 rounded text-primary-800 dark:text-primary-100 hover:bg-primary-300 dark:hover:bg-primary-600"
          onClick={() => {
            resetIdiom();
            onBack();
          }}
        >
          ← Back to List
        </button>
      )}
      <Card.Panel title="Idiom Detail">
        <Card.Body>
          <h2 className="text-2xl font-bold mb-2">{idiom.text}</h2>
          <Card.Info text={idiom.translation} label="Translation" />
          <Card.Info text={idiom.tone} label="Tone" />
          <Card.Info text={idiom.usage} label="Usage" />
          {idiom.examples && idiom.examples.length > 0 && (
            <Card.Section title="Examples">
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
          )}
        </Card.Body>
      </Card.Panel>
    </>
  );
}

export default IdiomDetail;
