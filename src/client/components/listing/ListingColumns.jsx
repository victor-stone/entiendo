// idiomColumns.js
import { Assign, AssignmentSync, AssignmentSource, AssignTranscription,
  AssignPublish
 } from "../editor/Assign";
import { AssignmentAudio } from "../editor/AssignmentForm";

export const ListingColumns = [
  {
    name: "sync",
    label: "Sync",
    render: (row, ctx) => <AssignmentSync assigned={row.homework} />, // ctx for future extensibility
    sortable: true,
    sorter: (a, b) => (a.homework?.sync || 0) - (b.homework?.sync || 0)
  },
  {
    name: "text",
    label: "Text",
    key: "text",
    sortable: true,
    defaultSort: true
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
    className: '', // 'w-[65%]',
    render: (row, ctx) => (
      <>
        <AssignmentAudio r={row} /> <AssignTranscription assigned={row.homework} />
      </>
    ),
  },
  {
    name: "assign",
    label: "Assign",
    render: (row, ctx) => <Assign obj={row} context={ctx} />
  },
  {
    name: "publish",
    label: "Publish",
    render: (row, ctx) => <AssignPublish obj={row} context={ctx} />
  },
  {
    name: "source",
    label: "Source",
    render: (row, ctx) => <AssignmentSource assigned={row.homework} />, 
  },
];
