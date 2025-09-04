import { useUserStore, useUpdateExampleStore } from '../../stores';
import { useState } from 'react';
import { Card } from '../layout';
import AudioUploader from './AudioUploader';

import debug from 'debug';
const debugId = debug('app:idiom');
const debugRndr = debug('react:render');

const ecss = " border dark:text-primary-900 border-gray-300 rounded-md shadow-sm p-2 ml-2 ";

const ExampleForm = ({ example, onChange, onCancel }) => {
    debugRndr('ExampleForm')

  const { getToken }               = useUserStore();
  const { update, error, loading } = useUpdateExampleStore();

  const [text, setText]                           = useState(example.text || "");
  const [voice, setVoice]                         = useState(example?.audio?.voice || example.source || "");
  const [conjugatedSnippet, setConjugatedSnippet] = useState(example.conjugatedSnippet || "");
  const [selectedFile, setSelectedFile]           = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    const postData = {
              text,
              conjugatedSnippet,
              voice
           };
    const rec = await update(example.exampleId, postData, selectedFile, getToken);
    if (rec && !error) {
      debugId('ExampleForm: result %o', rec)
      onChange(rec);
    }
  }

  return (
    <Card.Section>
      <form onSubmit={onSubmit} className={`space-y-4 w-full bg-secondary-100 dark:bg-primary-900 p-4`} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 8 }}>
        <Card.Field title="Text">
          <input
            className= {"input w-full" + ecss }
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={loading}
            required
          />
        </Card.Field>
        <Card.Field title="Conjugated Snippet">
          <input
            className={"input w-full" + ecss }
            value={conjugatedSnippet}
            onChange={e => setConjugatedSnippet(e.target.value)}
            disabled={loading}
            required
          />
        </Card.Field>
        <Card.Field title="Voice">
          <input
            className={"input" + ecss }
            value={voice}
            onChange={e => setVoice(e.target.value)}
            disabled={loading}
            required
          />
        </Card.Field>
        <AudioUploader
          selectedFile={selectedFile}
          onChange={setSelectedFile}
          existingUrl={example?.audio?.url}
          isAdmin={true}
          loading={loading}
        />

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