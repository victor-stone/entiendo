import { useState } from 'react';
import { AudioPlayer, HighlightedText, Glyph } from '../ui';
import ExampleForm from './ExampleForm';
import { Card } from '../layout';
import debug from 'debug';
const debugId = debug('app:idiom');
const debugRndr = debug('app:render');

const Example = ({ example }) => {
  debugRndr('Example');
  return <div className="space-y-2">
    <HighlightedText text={example.text} highlightedSnippet={example.conjugatedSnippet} />
    {example.audio && example.audio.url && <AudioPlayer url={example.audio.url} />}
  </div>
}

const ExampleList = ({ idiom, onChange }) => {
  debugRndr('ExampleList');

  const [editing, setEditing] = useState(null);

  if (!idiom.examples || !idiom.examples.length) {
    return null;
  }

  function _onChange(updatedExample) {
    debugId('ExampleList: turning off editing')
    setEditing(null);
    onChange && onChange();
  }

  function onCancel() {
    debugId('ExampleList: cancelled editing')
    setEditing(null);
  }

  return (
    <Card.Section title="Examples" className="w-full">
      {editing ? (
        <ExampleForm example={editing} onChange={_onChange} onCancel={onCancel} />
      ) : (
        <ul className="list-disc pl-6">
          {idiom.examples.map(example => (
            <li key={example.exampleId} className="mb-3 w-full">
              <div className="flex items-start justify-between">
                <Example example={example} />
                <button
                  className="btn font-small p-1 m-0 hover:bg-primary-100 self-start"
                  onClick={() => setEditing(example)}
                ><Glyph name="PencilSquareIcon" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card.Section>
  )
}

export default ExampleList;