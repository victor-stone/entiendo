import { HighlightedText } from '../ui';

export function Assign({ obj, voices, onAssign }) {
  async function onChange(value) {
    onAssign(obj.idiomId, value, null);
  }
  return (
    <span>
      <select
        value={obj.assigned?.source || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option></option>
        {voices.map((voice, i) => (
          <option key={i}>{voice}</option>
        ))}
      </select>
    </span>
  );
}

export function AssignmentSync({ assigned }) {
  return <span>{assigned?.sync}</span>;
}

export function AssignmentSource({ assigned }) {
  return <span>{assigned?.source}</span>;
}

export function AssignTranscription({ assigned }) {
  const { transcription = '', conjugatedSnippet = '' } = assigned;
  return (
    <HighlightedText text={transcription} highlightedSnippet={conjugatedSnippet} />
  );
}
