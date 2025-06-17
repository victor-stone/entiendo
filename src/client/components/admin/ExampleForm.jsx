import { useUserStore, useUpdateExampleStore } from '../../stores';
import { useEffect, useState } from 'react';
import { Card } from '../layout';

import debug from 'debug';
const debugId = debug('app:idiom');

const ExampleForm = ({ example, onChange }) => {
  const { getToken } = useUserStore();
  const { update, error, loading, data: result } = useUpdateExampleStore();

  const [text, setText] = useState(example.text || "");
  const [conjugatedSnippet, setConjugatedSnippet] = useState(example.conjugatedSnippet || "");

  useEffect(() => {
    if (result && !error) {
      debugId('ExampleForm: result %o', result)
      onChange(result);
    }
  }, [result, error, onChange]);


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
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
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

export default ExampleForm;