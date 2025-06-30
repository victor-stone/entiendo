import { useUserStore, useUpdateExampleStore } from '../../stores';
import { useState } from 'react';
import { Card } from '../layout';

import debug from 'debug';
const debugId = debug('app:idiom');
const debugRndr = debug('react:render');

const ExampleForm = ({ example, onChange, onCancel }) => {
    debugRndr('ExampleForm')
  const { getToken } = useUserStore();
  const { update, error, loading } = useUpdateExampleStore();

  const [text, setText] = useState(example.text || "");
  const [conjugatedSnippet, setConjugatedSnippet] = useState(example.conjugatedSnippet || "");

  async function onSubmit(e) {
    e.preventDefault();
    const postData = {
              text,
              conjugatedSnippet
           };
    const rec = await update(example.exampleId, postData, getToken);
    if (rec && !error) {
      debugId('ExampleForm: result %o', rec)
      onChange(rec);
    }
  }

  return (
    <Card.Section>
      <form onSubmit={onSubmit} className="space-y-4 w-full">
        <Card.Field title="Text">
          <input
            className="input w-full dark:text-primary-900"
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={loading}
            required
          />
        </Card.Field>
        <Card.Field title="Conjugated Snippet">
          <input
            className="input w-full  dark:text-primary-900"
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
        <button className="btn" onClick={onCancel}>Cancel</button>
      </form>
    </Card.Section>
  );
}

export default ExampleForm;