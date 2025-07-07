import CSVtoClipboard from "../admin/CSVtoClipboard";
import IdiomFormPopup from '../admin/IdiomFormPopup';

export const ListingTools = [
  {
    name: "copyToClipboard",
    render: ({ rows }) => <CSVtoClipboard filtered={rows} />,
  },
  {
    name: "newIdiomPopup",
    render: ({ context }) => <IdiomFormPopup context={context} />,
  },
];
