import { useUserStore, useUpdateExampleStore } from '../../stores';
import { useState } from 'react';
import { Card } from '../layout';
import AudioUploader from './AudioUploader';
import {
  VOICE_CONVERSATION,
  VOICE_EDUCATION
} from '../../../shared/constants/voiceTypes';

import debug from 'debug';
const debugId = debug('app:idiom');
const debugRndr = debug('react:render');

const ecss = " border dark:text-primary-900 border-gray-300 rounded-md shadow-sm p-2 ml-2 ";

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

const ExampleForm = ({ example, onChange, onCancel }) => {
    debugRndr('ExampleForm')

  const { getToken }               = useUserStore();
  const { update, error, loading } = useUpdateExampleStore();
  const variants = variantsForExample(example);

  const [text, setText]                           = useState(example.text || "");
  const [conjugatedSnippet, setConjugatedSnippet] = useState(example.conjugatedSnippet || "");
  const [activeVoiceType, setActiveVoiceType]     = useState(VOICE_CONVERSATION);
  const [voiceNames, setVoiceNames]               = useState({
    [VOICE_CONVERSATION]: variants[VOICE_CONVERSATION]?.voiceName || '',
    [VOICE_EDUCATION]: variants[VOICE_EDUCATION]?.voiceName || 'Zeta'
  });
  const [selectedFiles, setSelectedFiles] = useState({});

  const activeVariant = variants[activeVoiceType];
  const selectedFile = selectedFiles[activeVoiceType] || null;

  async function onSubmit(e) {
    e.preventDefault();
    const postData = {
              text,
              conjugatedSnippet,
              voiceType: activeVoiceType,
              voiceName: voiceNames[activeVoiceType]
           };
    const rec = await update(example.exampleId, postData, selectedFile, getToken);
    if (rec) {
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
        <Card.Field title="Audio style">
          <div className="flex flex-wrap gap-2">
            {variantOptions.map(option => (
              <button
                key={option.value}
                type="button"
                className={`btn border border-gray-500 ${activeVoiceType === option.value ? 'btn-primary' : ''}`}
                onClick={() => setActiveVoiceType(option.value)}
                disabled={loading}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Card.Field>
        <Card.Field title={`${variantOptions.find(option => option.value === activeVoiceType)?.label} voice`}>
          <input
            className={"input" + ecss }
            value={voiceNames[activeVoiceType]}
            onChange={e => setVoiceNames(current => ({
              ...current,
              [activeVoiceType]: e.target.value
            }))}
            disabled={loading}
            required
          />
          {activeVariant?.voiceId && (
            <div className="text-xs text-gray-500 mt-1">Voice ID: {activeVariant.voiceId}</div>
          )}
          {activeVariant?.speed && (
            <div className="text-xs text-gray-500 mt-1">Generated speed: {activeVariant.speed}</div>
          )}
        </Card.Field>
        <AudioUploader
          key={activeVoiceType}
          selectedFile={selectedFile}
          onChange={file => setSelectedFiles(current => ({
            ...current,
            [activeVoiceType]: file
          }))}
          existingUrl={playableUrl(activeVariant)}
          isAdmin={true}
          loading={loading}
        />

        <div className="text-xs text-gray-500">
          Saving uploads only the selected audio style. Existing audio for the other style is retained.
        </div>

        {error && <div className="text-red-500">{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button className="btn" type="button" onClick={onCancel}>Cancel</button>
      </form>
    </Card.Section>
  );
}

export default ExampleForm;
