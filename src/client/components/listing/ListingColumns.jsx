// idiomColumns.js
import { Assign, AssignmentSync, AssignmentSource, AssignTranscription } from "../editor/Assign";
import { AssignmentAudio } from "../editor/AssignmentForm";

export const ListingColumns = [
  {
    name: "sync",
    label: "Sync",
    render: (row, ctx) => <AssignmentSync assigned={row.assigned} />, // ctx for future extensibility
    sortable: true,
    sorter: (a, b) => (a.assigned?.sync || 0) - (b.assigned?.sync || 0)
  },
  {
    name: "text",
    label: "Text",
    key: "text",
    sortable: true,
  },
  {
    name: "translation",
    label: "Translation",
    key: "translation",
    sortable: true,
  },
  {
    name: "tone",
    label: "Tone",
    key: "tone",
    sortable: true,
  },
  {
    name: "usage",
    label: "Usage",
    key: "usage",
    sortable: true,
  },
  {
    name: "transcription",
    label: "Transcription",
    className: 'w-[65%]',
    render: (row, ctx) => (
      <>
        <AssignmentAudio r={row} /> <AssignTranscription assigned={row.assigned} />
      </>
    ),
  },
  {
    name: "assign",
    label: "Assign",
    render: (row, ctx) => <Assign obj={row} context={ctx} />
  },
  {
    name: "source",
    label: "Source",
    render: (row, ctx) => <AssignmentSource assigned={row.assigned} />, 
  },
];
