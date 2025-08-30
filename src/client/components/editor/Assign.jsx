import { Glyph, HighlightedText } from '../ui';
import EditorPicker from '../editor/EditorPicker';

export function AssignPublish({ obj, context }) {
  if( !obj.assigned?.audio?.publicUrl ) {
    return null;
  }
  const { onUpdateRow } = context;
  const onClick = (e) => {
    e.stopPropagation(); // Prevents the <tr> onClick from firing
    const ctx = {
      action: 'publish',
      assigned: obj.assigned
    };
    onUpdateRow(obj, ctx);
  };
  return (
    <button id={obj.idiomId} onClick={onClick}>
      <Glyph name="AcademicCapIcon" />
    </button>
  );
}

export function Assign({ obj, context }) {
  const { onUpdateRow, editors } = context;
  async function onChange(value) {
    onUpdateRow( obj, { 
      source: value || '-unassign',
      action: 'assignSource'
    } );
  }
  return <EditorPicker voices={editors} voice={obj?.assigned?.source} onChange={onChange} ecss='' expanded={false} />
}  

export function AssignmentSync({ assigned }) {
  return <span>{assigned?.sync}</span>;
}

export function AssignmentSource({ assigned }) {
  return <span>{assigned?.source}</span>;
}

export function AssignTranscription({ assigned = {} }) {
  const { transcription = '', conjugatedSnippet = '' } = assigned;
  return (
    <HighlightedText text={transcription} highlightedSnippet={conjugatedSnippet} />
  );
}
