import { useEffect, useState } from 'react';
import { AudioPlayer, HighlightedText, Glyph } from '../ui';
import ExampleForm from './ExampleForm';
import { Card } from '../layout';
import { useExamplesStore, useUserStore } from '../../stores';
import { resolveAdminExampleList } from './exampleListState';
import {
  VOICE_CONVERSATION,
  VOICE_EDUCATION
} from '../../../shared/constants/voiceTypes';
import debug from 'debug';
const debugId = debug('app:idiom');
const debugRndr = debug('app:render');

const variantOptions = [
  { value: VOICE_CONVERSATION, label: 'Conversational' },
  { value: VOICE_EDUCATION, label: 'Clear / educational' }
];

function variantsForExample(example) {
  if (
    !example.audioVariants ||
    typeof example.audioVariants !== 'object' ||
    Array.isArray(example.audioVariants)
  ) {
    throw new TypeError('Example audioVariants must be an object');
  }

  for (const variant of Object.values(example.audioVariants)) {
    if (!variant || typeof variant !== 'object' || Array.isArray(variant)) {
      throw new TypeError('Each example audio variant must be an object');
    }
  }

  return { ...example.audioVariants };
}

function playableUrl(variant) {
  return variant?.url || null;
}

const Example = ({ example }) => {
  debugRndr('Example');
  const source = example.source;
  const variants = variantsForExample(example);

  return <div className="space-y-2">
    <HighlightedText text={example.text} highlightedSnippet={example.conjugatedSnippet} />
    {source && <div><b>Source: </b> <span>{source}</span></div>}
    {variantOptions.map(option => {
      const variant = variants[option.value];
      const url = playableUrl(variant);

      return (
        <div key={option.value} className="border-l-2 border-gray-200 pl-3 py-1">
          <div>
            <b>{option.label}: </b>
            <span>{variant ? (variant.voiceName || 'audio available') : 'not available'}</span>
            {variant?.speed && <span className="text-xs text-gray-500"> · speed {variant.speed}</span>}
          </div>
          {url && <AudioPlayer isAdmin url={url} />}
        </div>
      );
    })}
  </div>
}

const ExampleList = ({ idiom, onChange }) => {
  debugRndr('ExampleList');
  const [editing, setEditing] = useState(null);
  const getToken = useUserStore(state => state.getToken);
  const {
    data,
    idiomId: examplesIdiomId,
    loading,
    error,
    fetch,
    reset
  } = useExamplesStore();

  useEffect(() => {
    if (idiom.idiomId && getToken) {
      fetch(idiom.idiomId, getToken);
    }
    return reset;
  }, [idiom.idiomId, getToken, fetch, reset]);

  const listState = resolveAdminExampleList({
    data,
    error,
    expectedIdiomId: idiom.idiomId,
    loading,
    responseIdiomId: examplesIdiomId,
  });

  if (listState.status === 'loading') {
    return <div className="p-3 text-sm text-gray-500">Loading example audio…</div>;
  }

  if (listState.status === 'error') {
    return (
      <Card.Section title="Examples" className="w-full">
        <div className="text-red-500 text-sm">
          Could not load example audio: {listState.error}
        </div>
      </Card.Section>
    );
  }

  if (listState.status === 'empty') return null;

  const examples = listState.examples;

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
          {examples.map(example => (
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
